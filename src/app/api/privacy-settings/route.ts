import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '~/utils/supabase/server';

export async function GET(req: NextRequest) {
  try {
    console.log('[API] GET /api/privacy-settings called');
    
    const unified_user_id = req.nextUrl.searchParams.get('unified_user_id');
    
    if (!unified_user_id) {
      return NextResponse.json(
        { error: 'unified_user_id parameter is required' },
        { status: 400 }
      );
    }
    
    const supabase = createServiceRoleClient();
    
    // Get user's privacy settings
    const { data: privacySettings, error } = await supabase
      .from('user_privacy_settings')
      .select('*')
      .eq('unified_user_id', unified_user_id)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        // Create default privacy settings
        const { data: newSettings, error: createError } = await supabase
          .from('user_privacy_settings')
          .insert({ unified_user_id })
          .select('*')
          .single();
          
        if (createError) {
          console.error('[API] Error creating default privacy settings:', createError);
          return NextResponse.json(
            { error: 'Failed to create privacy settings' },
            { status: 500 }
          );
        }
        
        return NextResponse.json({ privacySettings: newSettings });
      }
      
      console.error('[API] Error fetching privacy settings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch privacy settings' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ privacySettings });
    
  } catch (error) {
    console.error('[API] Error in privacy settings lookup:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    console.log('[API] PUT /api/privacy-settings called');
    
    const body = await req.json();
    const { 
      unified_user_id, 
      share_sol_age_with_friends,
      share_archetype_with_friends,
      share_journal_entries_with_friends,
      share_milestones_with_friends,
      allow_friend_invites,
      discoverable_by_phone,
      discoverable_by_farcaster
    } = body;
    
    if (!unified_user_id) {
      return NextResponse.json(
        { error: 'unified_user_id is required' },
        { status: 400 }
      );
    }
    
    const supabase = createServiceRoleClient();
    
    // Prepare update object with only provided fields
    const updateData: any = { updated_at: new Date().toISOString() };
    
    if (typeof share_sol_age_with_friends === 'boolean') {
      updateData.share_sol_age_with_friends = share_sol_age_with_friends;
    }
    if (typeof share_archetype_with_friends === 'boolean') {
      updateData.share_archetype_with_friends = share_archetype_with_friends;
    }
    if (typeof share_journal_entries_with_friends === 'boolean') {
      updateData.share_journal_entries_with_friends = share_journal_entries_with_friends;
    }
    if (typeof share_milestones_with_friends === 'boolean') {
      updateData.share_milestones_with_friends = share_milestones_with_friends;
    }
    if (typeof allow_friend_invites === 'boolean') {
      updateData.allow_friend_invites = allow_friend_invites;
    }
    if (typeof discoverable_by_phone === 'boolean') {
      updateData.discoverable_by_phone = discoverable_by_phone;
    }
    if (typeof discoverable_by_farcaster === 'boolean') {
      updateData.discoverable_by_farcaster = discoverable_by_farcaster;
    }
    
    // Update privacy settings (upsert in case they don't exist)
    const { data: updatedSettings, error: updateError } = await supabase
      .from('user_privacy_settings')
      .upsert({ unified_user_id, ...updateData })
      .select('*')
      .single();
      
    if (updateError) {
      console.error('[API] Error updating privacy settings:', updateError);
      return NextResponse.json(
        { error: 'Failed to update privacy settings' },
        { status: 500 }
      );
    }
    
    console.log('[API] Privacy settings updated successfully:', {
      userId: unified_user_id,
      updatedFields: Object.keys(updateData)
    });
    
    return NextResponse.json({
      success: true,
      privacySettings: updatedSettings
    });
    
  } catch (error) {
    console.error('[API] Error in privacy settings update:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}