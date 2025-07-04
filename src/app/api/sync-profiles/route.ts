import { createServiceRoleClient } from '~/utils/supabase/server';
import { NeynarAPIClient } from '@neynar/nodejs-sdk';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fid = searchParams.get('fid');
    
    if (!fid) {
      return new Response(JSON.stringify({ error: 'fid parameter is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const fidNumber = parseInt(fid, 10);
    if (isNaN(fidNumber)) {
      return new Response(JSON.stringify({ error: 'Invalid fid parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('[API] sync-profiles GET called for fid:', fidNumber);

    // Check if service role key is configured
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      console.error('[API] sync-profiles: SUPABASE_SERVICE_ROLE_KEY not found');
      return new Response(JSON.stringify({ 
        error: 'SUPABASE_SERVICE_ROLE_KEY environment variable is required' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabase = createServiceRoleClient();
    const neynarApiKey = process.env.NEYNAR_API_KEY;
    
    if (!neynarApiKey) {
      console.error('[API] sync-profiles: NEYNAR_API_KEY not found');
      return new Response(JSON.stringify({ 
        error: 'NEYNAR_API_KEY environment variable is required' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const neynarClient = new NeynarAPIClient({ apiKey: neynarApiKey });

    try {
      // Try to fetch real Farcaster user data
      console.log('[API] sync-profiles: Fetching user data from Neynar for fid:', fidNumber);
      const userResponse = await neynarClient.fetchBulkUsers({ fids: [fidNumber] });
      
      if (userResponse && userResponse.users && userResponse.users.length > 0) {
        const user = userResponse.users[0];
        const username = user.username || `soluser_${fidNumber}`;
        const display_name = user.display_name || user.username || `soluser_${fidNumber}`;
        
        console.log('[API] sync-profiles: Upserting profile with real data for fid:', fidNumber);
        // Upsert profile with real data
        const { error } = await supabase
          .from('profiles')
          .upsert([{ fid: fidNumber, username, display_name }], { onConflict: 'fid' });
        
        if (error) {
          console.error(`[API] sync-profiles: Error upserting profile for fid ${fidNumber}:`, error);
          return new Response(JSON.stringify({ 
            error: `Error upserting profile: ${error.message}`,
            status: 'error'
          }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          });
        } else {
          console.log(`[API] sync-profiles: Successfully synced real profile for fid ${fidNumber}: ${username} (${display_name})`);
          return new Response(JSON.stringify({ 
            status: 'success',
            fid: fidNumber,
            username,
            display_name
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      } else {
        // Fallback to generated username if no real data found
        console.log('[API] sync-profiles: No real data found, using fallback for fid:', fidNumber);
        const username = `soluser_${fidNumber}`;
        const display_name = `soluser_${fidNumber}`;
        
        const { error } = await supabase
          .from('profiles')
          .upsert([{ fid: fidNumber, username, display_name }], { onConflict: 'fid' });
        
        if (error) {
          console.error(`[API] sync-profiles: Error upserting fallback profile for fid ${fidNumber}:`, error);
          return new Response(JSON.stringify({ 
            error: `Error upserting fallback profile: ${error.message}`,
            status: 'error'
          }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          });
        } else {
          console.log(`[API] sync-profiles: Successfully synced fallback profile for fid ${fidNumber}`);
          return new Response(JSON.stringify({ 
            status: 'success_fallback',
            fid: fidNumber,
            username,
            display_name
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      }
    } catch (error) {
      console.error(`[API] sync-profiles: Error fetching Farcaster data for fid ${fidNumber}:`, error);
      
      // Fallback to generated username on error
      const username = `soluser_${fidNumber}`;
      const display_name = `soluser_${fidNumber}`;
      
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert([{ fid: fidNumber, username, display_name }], { onConflict: 'fid' });
      
      if (upsertError) {
        console.error(`[API] sync-profiles: Error upserting fallback profile for fid ${fidNumber}:`, upsertError);
        return new Response(JSON.stringify({ 
          error: `Error upserting fallback profile: ${upsertError.message}`,
          status: 'error'
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        console.log(`[API] sync-profiles: Successfully synced fallback profile for fid ${fidNumber} after API error`);
        return new Response(JSON.stringify({ 
          status: 'success_fallback',
          fid: fidNumber,
          username,
          display_name
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

  } catch (error) {
    console.error('[API] sync-profiles: Error in single profile sync:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST() {
  try {
    console.log('[API] sync-profiles POST called');
    
    // Check if service role key is configured
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      console.error('[API] sync-profiles POST: SUPABASE_SERVICE_ROLE_KEY not found');
      return new Response(JSON.stringify({ 
        error: 'SUPABASE_SERVICE_ROLE_KEY environment variable is required' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const supabase = createServiceRoleClient();
    const neynarApiKey = process.env.NEYNAR_API_KEY;
    
    if (!neynarApiKey) {
      console.error('[API] sync-profiles POST: NEYNAR_API_KEY not found');
      return new Response(JSON.stringify({ 
        error: 'NEYNAR_API_KEY environment variable is required' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const neynarClient = new NeynarAPIClient({ apiKey: neynarApiKey });

    // Get all unique user_fid from journal_entries
    console.log('[API] sync-profiles POST: Fetching journal_entries user_fids');
    const { data: entryFids, error: entryError } = await supabase
      .from('journal_entries')
      .select('user_fid');
    if (entryError) {
      console.error('[API] sync-profiles POST: Error fetching journal_entries:', entryError);
      return new Response(JSON.stringify({ error: `Error fetching journal_entries: ${entryError.message}` }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get all unique user_fid from journal_shares
    console.log('[API] sync-profiles POST: Fetching journal_shares user_fids');
    const { data: shareFids, error: shareError } = await supabase
      .from('journal_shares')
      .select('user_fid');
    if (shareError) {
      console.error('[API] sync-profiles POST: Error fetching journal_shares:', shareError);
      return new Response(JSON.stringify({ error: `Error fetching journal_shares: ${shareError.message}` }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Combine and dedupe
    const allFids = new Set([
      ...entryFids.map(e => e.user_fid),
      ...shareFids.map(s => s.user_fid),
    ].filter(Boolean));

    console.log('[API] sync-profiles POST: Total unique FIDs to sync:', allFids.size);

    const results: Array<{ fid: number; status: string; message?: string; username?: string; display_name?: string }> = [];
    
    // Fetch all users in bulk
    try {
      const fidsArray = Array.from(allFids);
      console.log('[API] sync-profiles POST: Fetching bulk user data from Neynar');
      const userResponse = await neynarClient.fetchBulkUsers({ fids: fidsArray });
      
      if (userResponse && userResponse.users) {
        // Create a map of FID to user data
        const userMap = new Map();
        userResponse.users.forEach(user => {
          if (user.fid) {
            userMap.set(user.fid, user);
          }
        });
        
        console.log('[API] sync-profiles POST: Processing', allFids.size, 'FIDs');
        // Process each FID
        for (const fid of allFids) {
          const user = userMap.get(fid);
          
          if (user) {
            const username = user.username || `soluser_${fid}`;
            const display_name = user.display_name || user.username || `soluser_${fid}`;
            
            // Upsert profile with real data
            const { error } = await supabase
              .from('profiles')
              .upsert([{ fid, username, display_name }], { onConflict: 'fid' });
            
            if (error) {
              console.error(`[API] sync-profiles POST: Error upserting profile for fid ${fid}:`, error);
              results.push({ fid, status: 'error', message: error.message });
            } else {
              console.log(`[API] sync-profiles POST: Successfully synced real profile for fid ${fid}: ${username} (${display_name})`);
              results.push({ fid, status: 'success', username, display_name });
            }
          } else {
            // Fallback to generated username if no real data found
            const username = `soluser_${fid}`;
            const display_name = `soluser_${fid}`;
            
            const { error } = await supabase
              .from('profiles')
              .upsert([{ fid, username, display_name }], { onConflict: 'fid' });
            
            if (error) {
              console.error(`[API] sync-profiles POST: Error upserting fallback profile for fid ${fid}:`, error);
              results.push({ fid, status: 'error', message: error.message });
            } else {
              console.log(`[API] sync-profiles POST: Successfully synced fallback profile for fid ${fid}`);
              results.push({ fid, status: 'success_fallback', username, display_name });
            }
          }
        }
      } else {
        // Fallback to generated usernames if bulk fetch fails
        console.log('[API] sync-profiles POST: Bulk fetch failed, using fallback for all FIDs');
        for (const fid of allFids) {
          const username = `soluser_${fid}`;
          const display_name = `soluser_${fid}`;
          
          const { error } = await supabase
            .from('profiles')
            .upsert([{ fid, username, display_name }], { onConflict: 'fid' });
          
          if (error) {
            console.error(`[API] sync-profiles POST: Error upserting fallback profile for fid ${fid}:`, error);
            results.push({ fid, status: 'error', message: error.message });
          } else {
            console.log(`[API] sync-profiles POST: Successfully synced fallback profile for fid ${fid}`);
            results.push({ fid, status: 'success_fallback', username, display_name });
          }
        }
      }
    } catch (error) {
      console.error('[API] sync-profiles POST: Error fetching Farcaster data:', error);
      
      // Fallback to generated usernames on error
      console.log('[API] sync-profiles POST: Using fallback for all FIDs due to API error');
      for (const fid of allFids) {
        const username = `soluser_${fid}`;
        const display_name = `soluser_${fid}`;
        
        const { error: upsertError } = await supabase
          .from('profiles')
          .upsert([{ fid, username, display_name }], { onConflict: 'fid' });
        
        if (upsertError) {
          console.error(`[API] sync-profiles POST: Error upserting fallback profile for fid ${fid}:`, upsertError);
          results.push({ fid, status: 'error', message: upsertError.message });
        } else {
          console.log(`[API] sync-profiles POST: Successfully synced fallback profile for fid ${fid} after API error`);
          results.push({ fid, status: 'success_fallback', username, display_name });
        }
      }
    }

    console.log('[API] sync-profiles POST: Sync complete. Results:', results);
    return new Response(JSON.stringify({
      message: 'Profile sync complete',
      totalFids: allFids.size,
      results
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[API] sync-profiles POST: Error in profile sync:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 