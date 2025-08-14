import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '~/utils/supabase/server';

export async function POST(req: NextRequest) {
  try {
    console.log('[API] POST /api/invites called');
    
    const body = await req.json();
    console.log('[API] Request body:', body);
    
    const { inviter_unified_user_id, invitee_email, invitee_farcaster_fid } = body;
    
    // Validate required fields
    if (!inviter_unified_user_id) {
      return NextResponse.json(
        { error: 'Inviter unified user ID is required' },
        { status: 400 }
      );
    }

    if (!invitee_email && !invitee_farcaster_fid) {
      return NextResponse.json(
        { error: 'Either invitee email or Farcaster FID is required' },
        { status: 400 }
      );
    }
    
    // Validate email format if provided
    if (invitee_email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(invitee_email)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        );
      }
    }
    
    const supabase = createServiceRoleClient();
    
    // Check if inviter has privacy setting that allows invites
    const { data: privacySettings, error: privacyError } = await supabase
      .from('user_privacy_settings')
      .select('allow_friend_invites')
      .eq('unified_user_id', inviter_unified_user_id)
      .single();
      
    if (privacyError && privacyError.code !== 'PGRST116') {
      console.error('[API] Error checking privacy settings:', privacyError);
      return NextResponse.json(
        { error: 'Failed to check privacy settings' },
        { status: 500 }
      );
    }
    
    if (privacySettings && !privacySettings.allow_friend_invites) {
      return NextResponse.json(
        { error: 'User has disabled friend invites' },
        { status: 403 }
      );
    }
    
    // Check if there's already a pending invite to this invitee
    let existingInviteQuery = supabase
      .from('invites')
      .select('id, status')
      .eq('inviter_unified_user_id', inviter_unified_user_id)
      .eq('status', 'pending');
      
    if (invitee_email) {
      existingInviteQuery = existingInviteQuery.eq('invitee_email', invitee_email);
    } else {
      existingInviteQuery = existingInviteQuery.eq('invitee_farcaster_fid', invitee_farcaster_fid);
    }
    
    const { data: existingInvite, error: checkError } = await existingInviteQuery.single();
    
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('[API] Error checking existing invite:', checkError);
      return NextResponse.json(
        { error: 'Failed to check existing invites' },
        { status: 500 }
      );
    }
    
    if (existingInvite) {
      return NextResponse.json(
        { error: 'Pending invite already exists for this recipient' },
        { status: 409 }
      );
    }
    
    // Create new invite using the database function
    const { data: inviteCode, error: createError } = await supabase
      .rpc('create_invite', {
        p_inviter_unified_user_id: inviter_unified_user_id,
        p_invitee_email: invitee_email || null,
        p_invitee_farcaster_fid: invitee_farcaster_fid || null
      });
      
    if (createError) {
      console.error('[API] Error creating invite:', createError);
      return NextResponse.json(
        { error: 'Failed to create invite' },
        { status: 500 }
      );
    }
    
    // Get the created invite details
    const { data: newInvite, error: fetchError } = await supabase
      .from('invites')
      .select('*')
      .eq('invite_code', inviteCode)
      .single();
      
    if (fetchError) {
      console.error('[API] Error fetching created invite:', fetchError);
      return NextResponse.json(
        { error: 'Invite created but failed to retrieve details' },
        { status: 500 }
      );
    }

    console.log('[API] Invite created successfully:', {
      inviteCode,
      inviter: inviter_unified_user_id,
      invitee_email: invitee_email,
      invitee_farcaster_fid: invitee_farcaster_fid
    });
    
    return NextResponse.json({
      success: true,
      invite: {
        invite_code: inviteCode,
        expires_at: newInvite.expires_at,
        invitee_email: newInvite.invitee_email,
        invitee_farcaster_fid: newInvite.invitee_farcaster_fid,
        created_at: newInvite.created_at
      }
    });
    
  } catch (error) {
    console.error('[API] Error in invite creation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    console.log('[API] GET /api/invites called');
    
    const unified_user_id = req.nextUrl.searchParams.get('unified_user_id');
    const invite_code = req.nextUrl.searchParams.get('invite_code');
    
    if (!unified_user_id && !invite_code) {
      return NextResponse.json(
        { error: 'unified_user_id or invite_code parameter required' },
        { status: 400 }
      );
    }
    
    const supabase = createServiceRoleClient();
    
    if (invite_code) {
      // Get specific invite by code
      const { data: invite, error } = await supabase
        .from('invites')
        .select('*')
        .eq('invite_code', invite_code)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          return NextResponse.json(
            { error: 'Invite not found' },
            { status: 404 }
          );
        }
        console.error('[API] Error fetching invite:', error);
        return NextResponse.json(
          { error: 'Failed to fetch invite' },
          { status: 500 }
        );
      }
      
      return NextResponse.json({ invite });
    } else {
      // Get all invites for a user (sent and received)
      const { data: sentInvites, error: sentError } = await supabase
        .from('invites')
        .select('*')
        .eq('inviter_unified_user_id', unified_user_id)
        .order('created_at', { ascending: false });
        
      if (sentError) {
        console.error('[API] Error fetching sent invites:', sentError);
        return NextResponse.json(
          { error: 'Failed to fetch sent invites' },
          { status: 500 }
        );
      }
      
      // Get received invites (by email or farcaster)
      // First get user's identifiers to find their email/farcaster
      const { data: userIdentifiers, error: idError } = await supabase
        .from('user_identifiers')
        .select('*')
        .eq('unified_user_id', unified_user_id);
        
      if (idError) {
        console.error('[API] Error fetching user identifiers:', idError);
        return NextResponse.json(
          { error: 'Failed to fetch user identifiers' },
          { status: 500 }
        );
      }
      
      let receivedInvites = [];
      
      for (const identifier of userIdentifiers) {
        if (identifier.identifier_type === 'account_id') {
          // Get user account to find email
          const { data: userAccount, error: accountError } = await supabase
            .from('user_accounts')
            .select('email, farcaster_fid')
            .eq('id', identifier.identifier_value)
            .single();
            
          if (!accountError && userAccount) {
            // Get invites by email
            if (userAccount.email) {
              const { data: emailInvites, error: emailError } = await supabase
                .from('invites')
                .select('*')
                .eq('invitee_email', userAccount.email)
                .neq('inviter_unified_user_id', unified_user_id);
                
              if (!emailError && emailInvites) {
                receivedInvites.push(...emailInvites);
              }
            }
            
            // Get invites by farcaster FID
            if (userAccount.farcaster_fid) {
              const { data: farcasterInvites, error: farcasterError } = await supabase
                .from('invites')
                .select('*')
                .eq('invitee_farcaster_fid', userAccount.farcaster_fid)
                .neq('inviter_unified_user_id', unified_user_id);
                
              if (!farcasterError && farcasterInvites) {
                receivedInvites.push(...farcasterInvites);
              }
            }
          }
        }
      }
      
      // Remove duplicates and sort
      const uniqueReceivedInvites = receivedInvites.filter((invite, index, self) => 
        index === self.findIndex(i => i.id === invite.id)
      ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      return NextResponse.json({ 
        sentInvites, 
        receivedInvites: uniqueReceivedInvites 
      });
    }
    
  } catch (error) {
    console.error('[API] Error in invite lookup:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}