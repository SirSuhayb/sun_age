import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Bridge.xyz API integration
interface BridgeTransferRequest {
  amount: string;
  developer_fee?: string;
  on_behalf_of?: string;
  source: {
    payment_rail: 'ach' | 'wire' | 'card';
    currency: 'usd';
    external_account_id?: string;
  };
  destination: {
    payment_rail: 'ethereum' | 'polygon' | 'base';
    currency: 'usdc';
    to_address: string;
  };
}

async function convertToUSDC(fiatAmount: number, metadata: any = {}) {
  const conversionAmount = (fiatAmount * 0.5) / 100; // 50% of payment, convert cents to dollars
  
  try {
    console.log(`[Bridge] Converting $${conversionAmount} to USDC for Morpho treasury`);
    
    const transferRequest: BridgeTransferRequest = {
      amount: conversionAmount.toFixed(2),
      developer_fee: "0.00", // No additional dev fee
      source: {
        payment_rail: 'ach', // Pull from your connected bank account
        currency: 'usd',
      },
      destination: {
        payment_rail: 'base', // Base network for lower fees
        currency: 'usdc',
        to_address: process.env.MORPHO_TREASURY_ADDRESS!, // Your Morpho treasury wallet
      },
    };

    const response = await fetch('https://api.bridge.xyz/v0/transfers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': process.env.BRIDGE_API_KEY!,
        'Idempotency-Key': `cosmic-codex-${metadata.paymentId}-${Date.now()}`,
      },
      body: JSON.stringify(transferRequest),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Bridge API error: ${response.status} ${errorData}`);
    }

    const bridgeTransfer = await response.json();
    console.log(`[Bridge] Transfer initiated:`, {
      transferId: bridgeTransfer.id,
      amount: conversionAmount,
      state: bridgeTransfer.state,
      toAddress: process.env.MORPHO_TREASURY_ADDRESS,
    });

    // Log for treasury tracking
    await logTreasuryTransaction({
      type: 'fiat_to_usdc_conversion',
      originalPayment: fiatAmount / 100,
      conversionAmount,
      bridgeTransferId: bridgeTransfer.id,
      morphoAddress: process.env.MORPHO_TREASURY_ADDRESS,
      metadata,
    });

    return bridgeTransfer;
  } catch (error) {
    console.error('[Bridge] USDC conversion failed:', error);
    
    // Log failure for manual retry
    await logTreasuryTransaction({
      type: 'conversion_failed',
      originalPayment: fiatAmount / 100,
      conversionAmount,
      error: error instanceof Error ? error.message : 'Unknown error',
      metadata,
    });
    
    throw error;
  }
}

// Treasury transaction logging for accounting
async function logTreasuryTransaction(data: any) {
  try {
    // You can integrate with your database or accounting system here
    console.log('[Treasury] Transaction logged:', data);
    
    // Optional: Store in database for accounting reconciliation
    // await supabase.from('treasury_transactions').insert(data);
    
  } catch (error) {
    console.error('[Treasury] Logging failed:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing Stripe signature' },
        { status: 401 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.error(`Webhook signature verification failed:`, err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    console.log(`[Stripe] Webhook received: ${event.type}`);

    // Handle successful payment events
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      // Check if this is a cosmic codex payment
      const isCosmicCodex = paymentIntent.description?.includes('Cosmic Codex') ||
                           paymentIntent.metadata?.product === 'cosmic_codex';

      if (isCosmicCodex) {
        console.log(`[CosmicCodex] Payment succeeded:`, {
          paymentId: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          customer: paymentIntent.customer,
        });

        // Convert 50% to USDC for Morpho treasury
        try {
          await convertToUSDC(paymentIntent.amount, {
            paymentId: paymentIntent.id,
            customerId: paymentIntent.customer,
            productType: 'cosmic_codex',
            timestamp: new Date().toISOString(),
          });
        } catch (conversionError) {
          // Don't fail the webhook if conversion fails
          // The payment was successful, conversion can be retried manually
          console.error('[CosmicCodex] Auto-conversion failed, manual intervention needed');
        }
      }
    }

    // Handle checkout session completion (for hosted checkout flow)
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      const isCosmicCodex = session.metadata?.product === 'cosmic_codex' ||
                           session.line_items?.data?.some(item => 
                             item.description?.includes('Cosmic Codex')
                           );

      if (isCosmicCodex && session.payment_status === 'paid') {
        console.log(`[CosmicCodex] Checkout completed:`, {
          sessionId: session.id,
          amount: session.amount_total,
          currency: session.currency,
          customer: session.customer,
        });

        try {
          await convertToUSDC(session.amount_total!, {
            sessionId: session.id,
            customerId: session.customer,
            productType: 'cosmic_codex',
            timestamp: new Date().toISOString(),
          });
        } catch (conversionError) {
          console.error('[CosmicCodex] Auto-conversion failed for checkout session');
        }
      }
    }

    // Handle invoice payments (for subscription billing)
    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object as Stripe.Invoice;
      
      const isCosmicCodex = invoice.metadata?.product === 'cosmic_codex' ||
                           invoice.lines.data.some(line => 
                             line.description?.includes('Cosmic Codex')
                           );

      if (isCosmicCodex) {
        console.log(`[CosmicCodex] Invoice paid:`, {
          invoiceId: invoice.id,
          amount: invoice.amount_paid,
          currency: invoice.currency,
          customer: invoice.customer,
        });

        try {
          await convertToUSDC(invoice.amount_paid, {
            invoiceId: invoice.id,
            customerId: invoice.customer,
            productType: 'cosmic_codex',
            timestamp: new Date().toISOString(),
          });
        } catch (conversionError) {
          console.error('[CosmicCodex] Auto-conversion failed for invoice payment');
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}