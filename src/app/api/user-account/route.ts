import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '~/utils/supabase/server';
import type { CreateUserAccountRequest } from '~/types/journal';

export async function POST(req: NextRequest) {
  try {
    console.log('[API] POST /api/user-account called');
    
    const body = await req.json();
    console.log('[API] Request body:', body);
    
    const { email, platform, sol_age, archetype, farcaster_fid, anon_id } = body;
    
    // Validate required fields
    if (!email || !platform) {
      return NextResponse.json(
        { error: 'Email and platform are required' },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    const supabase = createServiceRoleClient();
    
    // Check if email already exists
    const { data: existingAccount, error: checkError } = await supabase
      .from('user_accounts')
      .select('id, email')
      .eq('email', email)
      .single();
      
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('[API] Error checking existing account:', checkError);
      return NextResponse.json(
        { error: 'Failed to check existing account' },
        { status: 500 }
      );
    }
    
    if (existingAccount) {
      console.log('[API] Account already exists for email:', email);
      return NextResponse.json(
        { error: 'Account already exists for this email' },
        { status: 409 }
      );
    }
    
    // Create new user account with unified ID
    const { data: unifiedUserId, error: createError } = await supabase
      .rpc('create_user_account_with_unified_id', {
        p_email: email,
        p_platform: platform,
        p_sol_age: sol_age || null,
        p_archetype: archetype || null,
        p_farcaster_fid: farcaster_fid || null
      });
      
    if (createError) {
      console.error('[API] Error creating user account:', createError);
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      );
    }
    
    // Get the created account details
    const { data: newAccount, error: fetchError } = await supabase
      .from('user_accounts')
      .select('*')
      .eq('email', email)
      .single();
      
    if (fetchError) {
      console.error('[API] Error fetching created account:', fetchError);
      return NextResponse.json(
        { error: 'Account created but failed to retrieve details' },
        { status: 500 }
      );
    }
    
    // Link anon_id if provided (for existing Sol Age data)
    if (anon_id && newAccount.id) {
      try {
        console.log('[API] Linking anon_id to account:', { anon_id, accountId: newAccount.id });
        
        // Update user_notification_details to link anon_id to account
        const { error: linkError } = await supabase
          .from('user_notification_details')
          .update({ 
            user_account_id: newAccount.id,
            linked_at: new Date().toISOString() 
          })
          .eq('anon_id', anon_id);
          
        if (linkError) {
          console.warn('[API] Failed to link anon_id to account:', linkError);
        } else {
          console.log('[API] Successfully linked anon_id to account');
        }
      } catch (linkErr) {
        console.warn('[API] Error linking anon_id:', linkErr);
      }
    }

    console.log('[API] User account created successfully:', {
      accountId: newAccount.id,
      email: newAccount.email,
      unifiedUserId,
      linkedAnonId: anon_id
    });
    
    return NextResponse.json({
      success: true,
      account: {
        id: newAccount.id,
        email: newAccount.email,
        user_type: newAccount.user_type,
        platform: newAccount.platform,
        created_at: newAccount.created_at
      },
      unifiedUserId
    });
    
  } catch (error) {
    console.error('[API] Error in user account creation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    console.log('[API] GET /api/user-account called');
    
    const email = req.nextUrl.searchParams.get('email');
    const accountId = req.nextUrl.searchParams.get('accountId');
    
    if (!email && !accountId) {
      return NextResponse.json(
        { error: 'Email or accountId parameter required' },
        { status: 400 }
      );
    }
    
    const supabase = createServiceRoleClient();
    
    let query = supabase.from('user_accounts').select('*');
    
    if (email) {
      query = query.eq('email', email);
    } else if (accountId) {
      query = query.eq('id', accountId);
    }
    
    const { data: account, error } = await query.single();
    
    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return NextResponse.json(
          { error: 'Account not found' },
          { status: 404 }
        );
      }
      console.error('[API] Error fetching user account:', error);
      return NextResponse.json(
        { error: 'Failed to fetch user account' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ account });
    
  } catch (error) {
    console.error('[API] Error in user account lookup:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}