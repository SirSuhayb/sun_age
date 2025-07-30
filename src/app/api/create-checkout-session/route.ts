import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export async function POST(req: NextRequest) {
  try {
    const { plan, amount } = await req.json();

    // Price configurations
    const priceData = {
      monthly: {
        unit_amount: 777, // $7.77 in cents
        recurring: { interval: 'month' as const }
      },
      yearly: {
        unit_amount: 7700, // $77.00 in cents
        recurring: { interval: 'year' as const }
      }
    };

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Sol Chart Pro',
              description: 'Complete natal chart analysis with advanced insights',
              images: [
                `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/you/solChart.svg`
              ],
            },
            unit_amount: priceData[plan as keyof typeof priceData].unit_amount,
            recurring: priceData[plan as keyof typeof priceData].recurring,
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/soldash/you/expand/collect-data?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/soldash/you/expand`,
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

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Error creating checkout session' },
      { status: 500 }
    );
  }
}