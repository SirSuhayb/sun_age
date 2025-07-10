// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '~/utils/supabase/server';

export async function GET(req: NextRequest) {
  const userFidParam = req.nextUrl.searchParams.get('userFid');
  if (!userFidParam) {
    return NextResponse.json({ error: 'userFid required' }, { status: 400 });
  }
  const userFid = parseInt(userFidParam, 10);
  if (isNaN(userFid)) {
    return NextResponse.json({ error: 'invalid userFid' }, { status: 400 });
  }
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from('journal_entry_links')
    .select('parent_id, child_id');

  if (error) {
    console.error('[Links] error', error);
    return NextResponse.json({ error: 'db error' }, { status: 500 });
  }
  return NextResponse.json({ links: data || [] });
}