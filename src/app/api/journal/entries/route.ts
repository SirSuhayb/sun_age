import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceRoleClient } from '~/utils/supabase/server';

export async function GET(req: NextRequest) {
  console.log('[API] GET /api/journal/entries called');
  console.log('[API] Request URL:', req.url);
  console.log('[API] Request headers:', Object.fromEntries(req.headers.entries()));
  
  // Use service role client since Farcaster users aren't authenticated with Supabase
  const supabase = createServiceRoleClient();
  console.log('[API] Service role client created');
  
  // Get userFid from query params (for now, we'll need to pass this from the client)
  const userFidParam = req.nextUrl.searchParams.get('userFid');
  console.log('[API] UserFid from params:', userFidParam);
  
  if (!userFidParam) {
    console.log('[API] No userFid provided, returning 400');
    return NextResponse.json({ error: 'userFid parameter required' }, { status: 400 });
  }
  
  const userFid = parseInt(userFidParam, 10);
  if (isNaN(userFid)) {
    console.log('[API] Invalid userFid:', userFidParam);
    return NextResponse.json({ error: 'Invalid userFid' }, { status: 400 });
  }
  
  console.log('[API] Using user FID:', userFid);

  const { data: entries, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_fid', userFid)
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
        
        const { content, sol_day, userFid, guidance_id, guidance_title, guidance_prompt } = body;

        console.log('[API] Extracted fields:', { 
            content: !!content, 
            contentLength: content?.length,
            sol_day, 
            userFid, 
            userFidType: typeof userFid,
            guidance_id,
            guidance_title,
            guidance_prompt
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
        
        // Get userFid from request body or use authenticated user if available
        let finalUserFid: number;
        
        if (userFid) {
          // Use provided userFid for migration
          const parsedUserFid = typeof userFid === 'string' ? parseInt(userFid, 10) : userFid;
          if (isNaN(parsedUserFid)) {
            console.error('[API] Invalid userFid:', userFid);
            return NextResponse.json({ error: 'Invalid userFid' }, { status: 400 });
          }
          finalUserFid = parsedUserFid;
          console.log('[API] Using provided userFid:', finalUserFid);
        } else {
          // Try to get from authenticated user (fallback)
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            console.error('[API] No userFid provided and no authenticated user found');
            return NextResponse.json({ error: 'userFid required or user must be authenticated' }, { status: 400 });
          }
          finalUserFid = parseInt(user.id);
          console.log('[API] Using authenticated user FID:', finalUserFid);
        }

        const newEntry = {
            user_fid: finalUserFid,
            content,
            sol_day,
            word_count: content.trim().split(/\s+/).length,
            preservation_status: userFid ? 'synced' : 'local',
            // Include guidance metadata if provided
            ...(guidance_id && { guidance_id }),
            ...(guidance_title && { guidance_title }),
            ...(guidance_prompt && { guidance_prompt }),
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