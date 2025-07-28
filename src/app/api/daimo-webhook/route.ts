import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();

  // TODO: Verify webhook signature for security (see Daimo docs)
  // Example: if (request.headers.get('authorization') !== process.env.DAIMO_WEBHOOK_SECRET) { ... }

  // Handle payment completed event
  if (body.eventType === 'Payment Completed') {
    // Extract user info, amount, etc. from body
    // Credit rolls to user in your database
    // Example: await creditRolls(body.user, body.amount, body.externalId)
    console.log('Daimo payment completed:', body);
  }

  return NextResponse.json({ ok: true });
} 