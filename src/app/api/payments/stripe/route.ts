import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe only if the secret key is available
const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is required');
  }
  return new Stripe(secretKey, {
    apiVersion: '2025-06-30.basil',
  });
};

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 503 }
      );
    }

    const stripe = getStripe();
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