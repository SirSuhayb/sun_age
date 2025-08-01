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
    const { plan, paymentMethodId, email } = await req.json();

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

    // Create or retrieve customer
    let customer;
    const existingCustomers = await stripe.customers.list({
      email: email,
      limit: 1
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: email,
        metadata: {
          feature: 'sol-codex'
        }
      });
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customer.id,
    });

    // Set as default payment method
    await stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: selectedPriceId }],
      expand: ['latest_invoice.payment_intent'],
      trial_period_days: 7, // 7-day free trial
      metadata: {
        plan: plan,
        feature: 'sol-codex'
      }
    });

    return NextResponse.json({
      subscriptionId: subscription.id,
      clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
      status: subscription.status
    });

  } catch (error) {
    console.error('Error creating subscription:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Error creating subscription: ${errorMessage}` },
      { status: 500 }
    );
  }
}