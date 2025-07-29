import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceRoleClient } from '~/utils/supabase/server';

// Helper function to get unified user ID for database queries
async function getUnifiedUserIdForQuery(supabase: any, userFid?: number, userAccountId?: string): Promise<{ userFid: number, unifiedUserId?: string }> {
  if (userFid) {
    // For Farcaster users, try to get unified ID but fallback to userFid for backward compatibility
    const { data: unifiedId } = await supabase
      .rpc('get_unified_user_id_from_fid', { farcaster_fid: userFid });
    return { userFid, unifiedUserId: unifiedId };
  } else if (userAccountId) {
    // For non-Farcaster users, get unified ID and use 0 as userFid
    const { data: unifiedId } = await supabase
      .rpc('get_unified_user_id_from_account', { account_id: userAccountId });
    return { userFid: 0, unifiedUserId: unifiedId };
  }
  throw new Error('No user identification provided');
}

export async function GET(req: NextRequest) {
  console.log('[API] GET /api/journal/entries called');
  console.log('[API] Request URL:', req.url);
  console.log('[API] Request headers:', Object.fromEntries(req.headers.entries()));
  
  // Use service role client since Farcaster users aren't authenticated with Supabase
  const supabase = createServiceRoleClient();
  console.log('[API] Service role client created');
  
  // Get user identification from query params
  const userFidParam = req.nextUrl.searchParams.get('userFid');
  const userAccountIdParam = req.nextUrl.searchParams.get('userAccountId');
  console.log('[API] UserFid from params:', userFidParam, 'UserAccountId from params:', userAccountIdParam);
  
  let userFid: number | null = null;
  let userAccountId: string | null = null;
  
  if (userFidParam) {
    userFid = parseInt(userFidParam, 10);
    if (isNaN(userFid)) {
      console.log('[API] Invalid userFid:', userFidParam);
      return NextResponse.json({ error: 'Invalid userFid' }, { status: 400 });
    }
    console.log('[API] Using user FID:', userFid);
  } else if (userAccountIdParam) {
    userAccountId = userAccountIdParam;
    console.log('[API] Using user account ID:', userAccountId);
  } else {
    console.log('[API] No user identification provided, returning 400');
    return NextResponse.json({ error: 'userFid or userAccountId parameter required' }, { status: 400 });
  }

  // Get user identification for query
  const userQuery = await getUnifiedUserIdForQuery(supabase, userFid, userAccountId);
  
  const { data: entries, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_fid', userQuery.userFid)
    .order('created_at', { ascending: false });

  console.log('[API] Database query result:', { 
    entriesCount: entries?.length || 0, 
    error: error?.message || null 
  });

  if (error) {
    console.error('[API] Error fetching journal entries:', error);
    return NextResponse.json({ error: 'Failed to fetch journal entries' }, { status: 500 });
  }

  console.log('[API] Returning entries:', entries?.length || 0);
  return NextResponse.json({ entries: entries || [] });
}

export async function POST(req: NextRequest) {
    try {
        console.log('[API] Journal entries POST request received');
        console.log('[API] Request URL:', req.url);
        console.log('[API] Request method:', req.method);
        console.log('[API] Request headers:', Object.fromEntries(req.headers.entries()));
        
        // Check content length
        const contentLength = req.headers.get('content-length');
        console.log('[API] Content length:', contentLength);
        
        // Try to read the raw body first
        const rawBody = await req.text();
        console.log('[API] Raw request body:', rawBody);
        console.log('[API] Raw body length:', rawBody.length);
        console.log('[API] Raw body type:', typeof rawBody);
        
        let body;
        try {
            body = JSON.parse(rawBody);
        } catch (parseError) {
            console.error('[API] JSON parse error:', parseError);
            return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
        }
        
        console.log('[API] Parsed request body:', body);
        console.log('[API] Request body type:', typeof body);
        console.log('[API] Request body keys:', Object.keys(body));
        
        const { content, sol_day, userFid, userAccountId, parent_entry_id, parent_share_id } = body;

        console.log('[API] Extracted fields:', { 
            content: !!content, 
            contentLength: content?.length,
            sol_day, 
            userFid, 
            userAccountId,
            userFidType: typeof userFid 
        });

        // Validate content
        if (!content || typeof content !== 'string') {
            console.error('[API] Invalid content:', { content, contentType: typeof content });
            return NextResponse.json({ error: 'Invalid content field' }, { status: 400 });
        }

        if (!sol_day || typeof sol_day !== 'number') {
            console.error('[API] Invalid sol_day:', { sol_day, solDayType: typeof sol_day });
            return NextResponse.json({ error: 'Invalid sol_day field' }, { status: 400 });
        }

        // Always use service role client since Farcaster users aren't authenticated with Supabase
        console.log('[API] Using service role client');
        const supabase = createServiceRoleClient();
        
        // Get user identification from request body
        let finalUserFid: number;
        let finalUserAccountId: string | undefined;
        
        if (userFid) {
          // Use provided userFid for Farcaster users
          const parsedUserFid = typeof userFid === 'string' ? parseInt(userFid, 10) : userFid;
          if (isNaN(parsedUserFid)) {
            console.error('[API] Invalid userFid:', userFid);
            return NextResponse.json({ error: 'Invalid userFid' }, { status: 400 });
          }
          finalUserFid = parsedUserFid;
          console.log('[API] Using provided userFid:', finalUserFid);
        } else if (userAccountId) {
          // Use provided userAccountId for non-Farcaster users
          finalUserAccountId = userAccountId;
          finalUserFid = 0; // Use 0 for non-Farcaster users
          console.log('[API] Using provided userAccountId:', finalUserAccountId);
        } else {
          // Try to get from authenticated user (fallback)
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            console.error('[API] No user identification provided and no authenticated user found');
            return NextResponse.json({ error: 'userFid or userAccountId required, or user must be authenticated' }, { status: 400 });
          }
          finalUserFid = parseInt(user.id);
          console.log('[API] Using authenticated user FID:', finalUserFid);
        }

        const newEntry = {
            user_fid: finalUserFid,
            content,
            sol_day,
            word_count: content.trim().split(/\s+/).length,
            preservation_status: (userFid || userAccountId) ? 'synced' : 'local',
        };

        console.log('[API] Creating new entry:', newEntry);

        const { data: entry, error } = await supabase
            .from('journal_entries')
            .insert(newEntry)
            .select()
            .single();

        if (error) {
            console.error('[API] Error creating journal entry:', error);
            return NextResponse.json({ error: 'Failed to create journal entry' }, { status: 500 });
        }

        console.log('[API] Entry created successfully:', entry);
        
        // Create parent-child relationship if this was inspired by another entry
        if (parent_entry_id && entry) {
            console.log('[API] Creating parent-child relationship:', { parent_entry_id, child_entry_id: entry.id, parent_share_id });
            
            const { error: relationshipError } = await supabase
                .from('journal_entry_relationships')
                .insert({
                    parent_entry_id,
                    child_entry_id: entry.id,
                    parent_share_id,
                    relationship_type: 'inspired_by',
                    interaction_source: 'shared_entry_cta',
                    time_to_reflection_minutes: 0 // Could calculate this if we track view time
                });
                
            if (relationshipError) {
                console.error('[API] Error creating relationship:', relationshipError);
                // Don't fail the whole request, just log the error
            } else {
                console.log('[API] Parent-child relationship created successfully');
                
                // Update the view session if we have a parent_share_id
                if (parent_share_id) {
                    const { error: sessionUpdateError } = await supabase
                        .from('journal_entry_view_sessions')
                        .update({ 
                            resulting_entry_id: entry.id,
                            resulted_in_reflection: true
                        })
                        .eq('viewer_fid', finalUserFid)
                        .eq('entry_id', parent_entry_id)
                        .order('session_start', { ascending: false })
                        .limit(1);
                        
                    if (sessionUpdateError) {
                        console.error('[API] Error updating view session:', sessionUpdateError);
                    }
                }
            }
        }
        
        return NextResponse.json({ entry });

    } catch (error) {
        console.error('[API] Error parsing request body:', error);
        console.error('[API] Error details:', {
            name: error instanceof Error ? error.name : 'Unknown',
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
} 