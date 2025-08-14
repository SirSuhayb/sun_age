import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '~/utils/supabase/server';

export async function POST(req: NextRequest) {
  try {
    console.log('[API] POST /api/invites/accept called');
    
    const body = await req.json();
    console.log('[API] Request body:', body);
    
    const { invite_code, accepting_unified_user_id } = body;
    
    // Validate required fields
    if (!invite_code || !accepting_unified_user_id) {
      return NextResponse.json(
        { error: 'Invite code and accepting user ID are required' },
        { status: 400 }
      );
    }
    
    const supabase = createServiceRoleClient();
    
    // Check if the invite exists and is valid
    const { data: invite, error: inviteError } = await supabase
      .from('invites')
      .select('*')
      .eq('invite_code', invite_code)
      .single();
      
    if (inviteError) {
      if (inviteError.code === 'PGRST116') { // No rows returned
        return NextResponse.json(
          { error: 'Invite not found' },
          { status: 404 }
        );
      }
      console.error('[API] Error fetching invite:', inviteError);
      return NextResponse.json(
        { error: 'Failed to fetch invite' },
        { status: 500 }
      );
    }
    
    // Check if invite is still valid
    if (invite.status !== 'pending') {
      return NextResponse.json(
        { error: 'Invite is no longer pending' },
        { status: 400 }
      );
    }
    
    if (new Date(invite.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Invite has expired' },
        { status: 400 }
      );
    }
    
    // Check if accepting user is the same as inviter (can't accept your own invite)
    if (invite.inviter_unified_user_id === accepting_unified_user_id) {
      return NextResponse.json(
        { error: 'Cannot accept your own invite' },
        { status: 400 }
      );
    }
    
    // Verify that the accepting user is the intended recipient
    // Get accepting user's account details
    const { data: userIdentifiers, error: idError } = await supabase
      .from('user_identifiers')
      .select('*')
      .eq('unified_user_id', accepting_unified_user_id);
      
    if (idError) {
      console.error('[API] Error fetching user identifiers:', idError);
      return NextResponse.json(
        { error: 'Failed to verify user identity' },
        { status: 500 }
      );
    }
    
    let canAcceptInvite = false;
    
    // Check if this user can accept this invite
    for (const identifier of userIdentifiers) {
      if (identifier.identifier_type === 'account_id') {
        const { data: userAccount, error: accountError } = await supabase
          .from('user_accounts')
          .select('email, farcaster_fid')
          .eq('id', identifier.identifier_value)
          .single();
          
        if (!accountError && userAccount) {
          // Check if invite is for this email or farcaster FID
          if ((invite.invitee_email && userAccount.email === invite.invitee_email) ||
              (invite.invitee_farcaster_fid && userAccount.farcaster_fid === invite.invitee_farcaster_fid)) {
            canAcceptInvite = true;
            break;
          }
        }
      }
    }
    
    if (!canAcceptInvite) {
      return NextResponse.json(
        { error: 'You are not the intended recipient of this invite' },
        { status: 403 }
      );
    }
    
    // Use the database function to accept the invite
    const { data: acceptResult, error: acceptError } = await supabase
      .rpc('accept_invite', {
        p_invite_code: invite_code,
        p_accepting_unified_user_id: accepting_unified_user_id
      });
      
    if (acceptError) {
      console.error('[API] Error accepting invite:', acceptError);
      return NextResponse.json(
        { error: 'Failed to accept invite' },
        { status: 500 }
      );
    }
    
    if (!acceptResult) {
      return NextResponse.json(
        { error: 'Invite could not be accepted (may already be accepted or expired)' },
        { status: 400 }
      );
    }
    
    // Get the updated invite and new friend connection
    const { data: updatedInvite, error: fetchError } = await supabase
      .from('invites')
      .select('*')
      .eq('invite_code', invite_code)
      .single();
      
    if (fetchError) {
      console.error('[API] Error fetching updated invite:', fetchError);
    }
    
    // Get the new friend connection
    const { data: friendConnection, error: connectionError } = await supabase
      .from('friend_connections')
      .select('*')
      .or(`user1_unified_id.eq.${invite.inviter_unified_user_id},user2_unified_id.eq.${invite.inviter_unified_user_id}`)
      .or(`user1_unified_id.eq.${accepting_unified_user_id},user2_unified_id.eq.${accepting_unified_user_id}`)
      .single();
      
    if (connectionError) {
      console.error('[API] Error fetching friend connection:', connectionError);
    }

    console.log('[API] Invite accepted successfully:', {
      inviteCode: invite_code,
      inviter: invite.inviter_unified_user_id,
      accepter: accepting_unified_user_id
    });
    
    return NextResponse.json({
      success: true,
      message: 'Invite accepted successfully',
      invite: updatedInvite,
      friendConnection: friendConnection
    });
    
  } catch (error) {
    console.error('[API] Error in invite acceptance:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}