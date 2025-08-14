import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '~/utils/supabase/server';

export async function GET(req: NextRequest) {
  try {
    console.log('[API] GET /api/friends called');
    
    const unified_user_id = req.nextUrl.searchParams.get('unified_user_id');
    
    if (!unified_user_id) {
      return NextResponse.json(
        { error: 'unified_user_id parameter is required' },
        { status: 400 }
      );
    }
    
    const supabase = createServiceRoleClient();
    
    // Use the database function to get friends list with privacy settings applied
    const { data: friends, error: friendsError } = await supabase
      .rpc('get_user_friends', {
        p_unified_user_id: unified_user_id
      });
      
    if (friendsError) {
      console.error('[API] Error fetching friends:', friendsError);
      return NextResponse.json(
        { error: 'Failed to fetch friends list' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ friends });
    
  } catch (error) {
    console.error('[API] Error in friends lookup:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    console.log('[API] DELETE /api/friends called');
    
    const body = await req.json();
    const { user_unified_id, friend_unified_id } = body;
    
    if (!user_unified_id || !friend_unified_id) {
      return NextResponse.json(
        { error: 'Both user_unified_id and friend_unified_id are required' },
        { status: 400 }
      );
    }
    
    const supabase = createServiceRoleClient();
    
    // Delete the friend connection (works regardless of which user is user1 or user2)
    const { error: deleteError } = await supabase
      .from('friend_connections')
      .delete()
      .or(`and(user1_unified_id.eq.${user_unified_id},user2_unified_id.eq.${friend_unified_id}),and(user1_unified_id.eq.${friend_unified_id},user2_unified_id.eq.${user_unified_id})`);
    
    if (deleteError) {
      console.error('[API] Error removing friend connection:', deleteError);
      return NextResponse.json(
        { error: 'Failed to remove friend connection' },
        { status: 500 }
      );
    }
    
    console.log('[API] Friend connection removed successfully:', {
      user: user_unified_id,
      friend: friend_unified_id
    });
    
    return NextResponse.json({
      success: true,
      message: 'Friend connection removed successfully'
    });
    
  } catch (error) {
    console.error('[API] Error in friend removal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}