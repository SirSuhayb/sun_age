import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '~/utils/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { parentEntryId, shareId } = await req.json();

    if (!parentEntryId) {
      return NextResponse.json({ error: 'parentEntryId required' }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    const insertData: Record<string, any> = {
      parent_entry_id: parentEntryId,
      share_id: shareId ?? null,
      user_agent: req.headers.get('user-agent') || null,
      ip_address: req.headers.get('x-forwarded-for') || null
    };

    const { error } = await supabase.from('journal_entry_clicks').insert(insertData);

    if (error) {
      console.error('[Analytics] Insertion error:', error);
      return NextResponse.json({ error: 'failed to record click' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Analytics] Unexpected error:', err);
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
}