#!/usr/bin/env node

/**
 * Script to create Sol Codex products and prices in Stripe
 * 
 * Usage:
 * 1. Set your STRIPE_SECRET_KEY environment variable
 * 2. Run: node scripts/setup-stripe-products.js
 * 
 * This will create:
 * - Sol Codex product
 * - Monthly price ($7.77)
 * - Yearly price ($77.00)
 * 
 * The script will output the price IDs to add to your environment variables
 */

const Stripe = require('stripe');

async function setupStripeProducts() {
  // Check for Stripe key
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    console.error('❌ Error: STRIPE_SECRET_KEY environment variable is required');
    console.log('Set it with: export STRIPE_SECRET_KEY=sk_test_...');
    process.exit(1);
  }

  const stripe = new Stripe(stripeKey);

  try {
    console.log('🚀 Setting up Sol Codex products in Stripe...\n');

    // Check if product already exists
    const existingProducts = await stripe.products.search({
      query: 'name:"Sol Codex"',
    });

    let product;
    if (existingProducts.data.length > 0) {
      product = existingProducts.data[0];
      console.log(`✅ Found existing product: ${product.id}`);
    } else {
      // Create the product
      product = await stripe.products.create({
        name: 'Sol Codex',
        description: 'Expand your understanding with complete natal chart analysis',
        metadata: {
          feature: 'sol-codex',
        },
      });
      console.log(`✅ Created product: ${product.id}`);
    }

    // Check for existing prices
    const existingPrices = await stripe.prices.list({
      product: product.id,
      active: true,
    });

    let monthlyPrice = existingPrices.data.find(
      p => p.recurring?.interval === 'month' && p.unit_amount === 777
    );
    let yearlyPrice = existingPrices.data.find(
      p => p.recurring?.interval === 'year' && p.unit_amount === 7700
    );

    // Create monthly price if it doesn't exist
    if (!monthlyPrice) {
      monthlyPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: 777, // $7.77
        currency: 'usd',
        recurring: {
          interval: 'month',
        },
        metadata: {
          plan: 'monthly',
        },
      });
      console.log(`✅ Created monthly price: ${monthlyPrice.id}`);
    } else {
      console.log(`✅ Found existing monthly price: ${monthlyPrice.id}`);
    }

    // Create yearly price if it doesn't exist
    if (!yearlyPrice) {
      yearlyPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: 7700, // $77.00
        currency: 'usd',
        recurring: {
          interval: 'year',
        },
        metadata: {
          plan: 'yearly',
        },
      });
      console.log(`✅ Created yearly price: ${yearlyPrice.id}`);
    } else {
      console.log(`✅ Found existing yearly price: ${yearlyPrice.id}`);
    }

    // Output the environment variables
    console.log('\n📋 Add these to your Vercel environment variables:\n');
    console.log(`STRIPE_SOL_CODEX_MONTHLY_PRICE_ID=${monthlyPrice.id}`);
    console.log(`STRIPE_SOL_CODEX_YEARLY_PRICE_ID=${yearlyPrice.id}`);
    
    console.log('\n✨ Setup complete! Your Sol Codex products are ready.');
    console.log('\nNext steps:');
    console.log('1. Copy the price IDs above');
    console.log('2. Go to Vercel project settings > Environment Variables');
    console.log('3. Add both variables for Preview and Production environments');

  } catch (error) {
    console.error('❌ Error setting up products:', error.message);
    if (error.code === 'api_key_invalid') {
      console.log('\nMake sure your STRIPE_SECRET_KEY is valid and starts with sk_test_ or sk_live_');
    }
    process.exit(1);
  }
}

// Run the setup
setupStripeProducts(); 