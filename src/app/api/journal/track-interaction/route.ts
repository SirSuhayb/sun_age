import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '~/utils/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { entry_id, share_id, interaction_type, viewer_fid } = await req.json();
    
    if (!entry_id || !interaction_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();
    
    // Get viewer FID from JWT if not provided
    let finalViewerFid = viewer_fid;
    if (!finalViewerFid) {
      // Try to get from auth context
      const authHeader = req.headers.get('authorization');
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user?.user_metadata?.fid) {
          finalViewerFid = user.user_metadata.fid;
        }
      }
    }
    
    if (!finalViewerFid) {
      return NextResponse.json(
        { error: 'Unable to identify viewer' },
        { status: 401 }
      );
    }

    // Check if there's an existing open session for this viewer and entry
    const { data: existingSession } = await supabase
      .from('journal_entry_view_sessions')
      .select('*')
      .eq('entry_id', entry_id)
      .eq('viewer_fid', finalViewerFid)
      .is('session_end', null)
      .order('session_start', { ascending: false })
      .limit(1)
      .single();

    let sessionId;
    
    if (existingSession) {
      // Update existing session
      sessionId = existingSession.id;
      
      const updates: any = {
        interaction_type,
        updated_at: new Date().toISOString()
      };
      
      // If clicking "add reflection", mark session as resulting in reflection
      if (interaction_type === 'clicked_add_reflection') {
        updates.resulted_in_reflection = true;
        updates.session_end = new Date().toISOString();
      }
      
      const { error: updateError } = await supabase
        .from('journal_entry_view_sessions')
        .update(updates)
        .eq('id', sessionId);
        
      if (updateError) throw updateError;
      
    } else {
      // Create new session
      const newSession = {
        entry_id,
        viewer_fid: finalViewerFid,
        share_id,
        interaction_type,
        resulted_in_reflection: interaction_type === 'clicked_add_reflection',
        referrer_source: req.headers.get('referer')?.includes('farcaster') ? 'farcaster_frame' : 'web',
        device_type: req.headers.get('user-agent')?.includes('Mobile') ? 'mobile' : 'desktop',
        session_start: new Date().toISOString(),
        session_end: interaction_type === 'clicked_add_reflection' ? new Date().toISOString() : null
      };
      
      const { data, error: insertError } = await supabase
        .from('journal_entry_view_sessions')
        .insert(newSession)
        .select()
        .single();
        
      if (insertError) throw insertError;
      sessionId = data.id;
    }
    
    // Trigger metrics update for the entry
    await supabase.rpc('update_influence_metrics', {
      p_entry_id: entry_id
    });
    
    return NextResponse.json({
      success: true,
      session_id: sessionId
    });
    
  } catch (error) {
    console.error('Error tracking interaction:', error);
    return NextResponse.json(
      { error: 'Failed to track interaction' },
      { status: 500 }
    );
  }
}

// Track when a viewing session starts
export async function PUT(req: NextRequest) {
  try {
    const { entry_id, share_id, viewer_fid } = await req.json();
    
    if (!entry_id) {
      return NextResponse.json(
        { error: 'Missing entry_id' },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();
    
    // Get viewer FID from JWT if not provided
    let finalViewerFid = viewer_fid;
    if (!finalViewerFid) {
      const authHeader = req.headers.get('authorization');
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user?.user_metadata?.fid) {
          finalViewerFid = user.user_metadata.fid;
        }
      }
    }
    
    if (!finalViewerFid) {
      return NextResponse.json(
        { error: 'Unable to identify viewer' },
        { status: 401 }
      );
    }
    
    // Create viewing session
    const { data, error } = await supabase
      .from('journal_entry_view_sessions')
      .insert({
        entry_id,
        viewer_fid: finalViewerFid,
        share_id,
        interaction_type: 'viewed',
        referrer_source: req.headers.get('referer')?.includes('farcaster') ? 'farcaster_frame' : 'web',
        device_type: req.headers.get('user-agent')?.includes('Mobile') ? 'mobile' : 'desktop',
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      session_id: data.id
    });
    
  } catch (error) {
    console.error('Error starting view session:', error);
    return NextResponse.json(
      { error: 'Failed to start view session' },
      { status: 500 }
    );
  }
}