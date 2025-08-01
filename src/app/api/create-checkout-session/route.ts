import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  try {
    // Initialize Stripe inside the function to avoid build-time errors
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      console.error('STRIPE_SECRET_KEY is not set');
      return NextResponse.json(
        { error: 'Payment service not configured' },
        { status: 500 }
      );
    }
    
    const stripe = new Stripe(stripeKey);
    const { plan } = await req.json();

    // Get price IDs from environment variables
    const priceIds = {
      monthly: process.env.STRIPE_SOL_CODEX_MONTHLY_PRICE_ID,
      yearly: process.env.STRIPE_SOL_CODEX_YEARLY_PRICE_ID
    };

    const selectedPriceId = priceIds[plan as keyof typeof priceIds];
    
    if (!selectedPriceId) {
      console.error(`Price ID not configured for plan: ${plan}`);
      return NextResponse.json(
        { error: 'Selected plan not configured' },
        { status: 400 }
      );
    }

    console.log('Creating checkout session for plan:', plan, 'with price ID:', selectedPriceId);
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: selectedPriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/soldash/you/expand/collect-data?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/soldash/you/expand`,
      subscription_data: {
        trial_period_days: 7, // 7-day free trial
        metadata: {
          plan: plan,
          feature: 'sol-chart-pro'
        }
      },
      metadata: {
        plan: plan,
        feature: 'sol-chart-pro'
      },
      customer_creation: 'always',
      billing_address_collection: 'required',
    });

    console.log('Checkout session created:', {
      id: session.id,
      url: session.url,
      status: session.status
    });
    
    if (!session.url) {
      console.error('No checkout URL in session:', session);
      return NextResponse.json(
        { error: 'Failed to generate checkout URL' },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Error creating checkout session: ${errorMessage}` },
      { status: 500 }
    );
  }
}