import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '~/utils/supabase/server';

export async function POST(req: NextRequest) {
  try {
    console.log('[API] POST /api/user-account/link-anon called');
    
    const body = await req.json();
    console.log('[API] Request body:', body);
    
    const { userAccountId, anonId } = body;
    
    // Validate required fields
    if (!userAccountId || !anonId) {
      return NextResponse.json(
        { error: 'userAccountId and anonId are required' },
        { status: 400 }
      );
    }
    
    const supabase = createServiceRoleClient();
    
    // Verify user account exists
    const { data: account, error: accountError } = await supabase
      .from('user_accounts')
      .select('id, email')
      .eq('id', userAccountId)
      .single();
      
    if (accountError || !account) {
      console.error('[API] User account not found:', accountError);
      return NextResponse.json(
        { error: 'User account not found' },
        { status: 404 }
      );
    }
    
    // Link anon_id to user account in user_notification_details
    const { data: updated, error: updateError } = await supabase
      .from('user_notification_details')
      .update({ 
        user_account_id: userAccountId,
        linked_at: new Date().toISOString() 
      })
      .eq('anon_id', anonId)
      .select();
      
    if (updateError) {
      console.error('[API] Error linking anon_id:', updateError);
      return NextResponse.json(
        { error: 'Failed to link anon_id to account' },
        { status: 500 }
      );
    }
    
    console.log('[API] Successfully linked anon_id to account:', {
      userAccountId,
      anonId,
      updated: updated?.length || 0
    });
    
    // Get Sol Age data from linked notification details if available
    let solAgeData: { hasBookmark: boolean; linkedAt: any } | null = null;
    if (updated && updated.length > 0) {
      const linkedData = updated[0];
      
      // Try to extract Sol Age from the bookmark system
      // This would be stored in the notification details or we can enhance it
      solAgeData = {
        hasBookmark: true,
        linkedAt: linkedData.linked_at
      };
    }
    
    return NextResponse.json({
      success: true,
      linked: true,
      userAccountId,
      anonId,
      solAgeData
    });
    
  } catch (error) {
    console.error('[API] Error in anon_id linking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}