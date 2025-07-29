import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe lazily to avoid build-time errors
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-06-30.basil',
  });
}

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe(); // Initialize Stripe here
    const body = await request.json();
    const { paymentMethodId, amount, currency, packageId, rolls, stripeProductId } = body;

    // Validate required fields
    if (!paymentMethodId || !amount || !packageId || !rolls) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create a PaymentIntent with the payment method
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method: paymentMethodId,
      confirm: true,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/surprise-me/more-rolls?success=true`,
      metadata: {
        packageId,
        rolls: rolls.toString(),
        productId: stripeProductId || 'unknown'
      }
    });

    if (paymentIntent.status === 'succeeded') {
      // Record the purchase in database
      await recordPurchase({
        packageId,
        rolls,
        amount: amount / 100, // Convert from cents
        currency,
        paymentIntentId: paymentIntent.id,
        status: 'succeeded',
        paymentMethod: 'stripe'
      });

      return NextResponse.json({
        success: true,
        paymentIntentId: paymentIntent.id,
        status: 'succeeded',
        rollsAdded: rolls
      });
    } else {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Stripe payment error:', error);
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    );
  }
}

// Helper function to record purchase in database
async function recordPurchase(data: {
  packageId: string;
  rolls: number;
  amount: number;
  currency: string;
  paymentIntentId: string;
  status: string;
  paymentMethod: string;
}) {
  // TODO: Implement database recording
  // This would typically save to your database
  console.log('Recording purchase:', data);
} 