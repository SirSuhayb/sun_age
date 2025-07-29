import { createServiceRoleClient } from '~/utils/supabase/server';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServiceRoleClient();
    
    // First get the share and entry
    const { data: share, error } = await supabase
      .from('journal_shares')
      .select(`*, journal_entries(*)`)
      .eq('id', id)
      .single();

    if (error || !share || !share.journal_entries) {
      return new Response(JSON.stringify({ error: 'Entry not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Then get the author's profile information
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('fid, username, display_name')
      .eq('fid', share.user_fid)
      .single();

    return new Response(JSON.stringify({
      id: share.id,
      entry: share.journal_entries,
      authorFid: share.user_fid,
      authorUsername: profile?.username || null,
      authorDisplayName: profile?.display_name || null
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching shared journal entry:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 