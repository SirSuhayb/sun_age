import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '~/utils/supabase/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userFid = searchParams.get('userFid');
  
  if (!userFid) {
    return NextResponse.json({ error: 'userFid parameter required' }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  
  const { data: shares, error } = await supabase
    .from('journal_shares')
    .select('*')
    .eq('user_fid', parseInt(userFid, 10))
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch shares' }, { status: 500 });
  }

  return NextResponse.json(shares || []);
}

export async function POST(req: NextRequest) {
  const { entryId, userFid } = await req.json();
  
  console.log('[API] POST /api/journal/share called with:', { entryId, userFid });
  
  // Use service role client since Farcaster users aren't authenticated with Supabase
  const supabase = createServiceRoleClient();
  
  if (!userFid) {
    return NextResponse.json({ error: 'userFid required' }, { status: 400 });
  }
  
  const finalUserFid = parseInt(userFid, 10);
  if (isNaN(finalUserFid)) {
    return NextResponse.json({ error: 'Invalid userFid' }, { status: 400 });
  }
  
  console.log('[API] Using user FID:', finalUserFid);

  // Check if this is a local entry (starts with 'local_')
  if (entryId.startsWith('local_')) {
    return NextResponse.json({ 
      error: 'Cannot share local entries. Please migrate your entry to the database first.' 
    }, { status: 400 });
  }

  // Validate entry exists and belongs to user
  const { data: entry, error: entryError } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('id', entryId)
    .eq('user_fid', finalUserFid)
    .single();

  if (entryError || !entry) {
    return NextResponse.json({ error: 'Entry not found or not owned by user' }, { status: 404 });
  }

  // Check if share record already exists
  const { data: existingShare, error: existingShareError } = await supabase
    .from('journal_shares')
    .select('*')
    .eq('entry_id', entryId)
    .eq('user_fid', finalUserFid)
    .single();

  if (existingShare && !existingShareError) {
    // Share already exists, return it
    return NextResponse.json({
      shareId: existingShare.id,
      shareUrl: existingShare.share_url || `/journal/shared?id=${existingShare.id}`
    });
  }

  // Create share record
  const { data: share, error: shareError } = await supabase
    .from('journal_shares')
    .insert({
      entry_id: entryId,
      user_fid: finalUserFid,
      share_url: '' // We'll update this after getting the share ID
    })
    .select()
    .single();

  if (shareError) {
    console.error('[API] Share creation error:', shareError);
    return NextResponse.json({ error: `Could not create share: ${shareError.message}` }, { status: 500 });
  }

  // Update the share URL with the actual share ID
  const shareUrl = `/journal/shared/${share.id}`;
  const { error: updateError } = await supabase
    .from('journal_shares')
    .update({ share_url: shareUrl })
    .eq('id', share.id);

  if (updateError) {
    console.error('[API] Share URL update error:', updateError);
    return NextResponse.json({ error: `Could not update share URL: ${updateError.message}` }, { status: 500 });
  }

  console.log('[API] Share created successfully:', { shareId: share.id, shareUrl });
  return NextResponse.json({
    shareId: share.id,
    shareUrl: shareUrl
  });
}