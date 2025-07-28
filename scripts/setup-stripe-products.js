const stripe = require('stripe');
require('dotenv').config({ path: '.env.local' });

console.log('🛍️  Stripe Products Setup Helper');
console.log('================================\n');

// Check if Stripe key is available
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.log('❌ STRIPE_SECRET_KEY not found in environment variables');
  console.log('Please add your Stripe secret key to .env.local first');
  console.log('\nExample:');
  console.log('STRIPE_SECRET_KEY=sk_test_your_secret_key_here');
  process.exit(1);
}

const stripeInstance = stripe(stripeSecretKey);

// Product configurations
const products = [
  {
    name: '5 Extra Rolls',
    description: 'Get 5 additional rolls for your surprise-me feature',
    price: 500, // $5.00 in cents
    rolls: 5
  },
  {
    name: '15 Extra Rolls',
    description: 'Get 15 additional rolls for your surprise-me feature',
    price: 1200, // $12.00 in cents
    rolls: 15
  },
  {
    name: '50 Extra Rolls',
    description: 'Get 50 additional rolls for your surprise-me feature',
    price: 3500, // $35.00 in cents
    rolls: 50
  }
];

async function createProducts() {
  console.log('📦 Creating Stripe Products...\n');

  const createdProducts = [];

  for (const product of products) {
    try {
      console.log(`Creating: ${product.name} - $${(product.price / 100).toFixed(2)}`);
      
      // Create the product
      const stripeProduct = await stripeInstance.products.create({
        name: product.name,
        description: product.description,
        metadata: {
          rolls: product.rolls.toString(),
          type: 'extra_rolls'
        }
      });

      // Create the price for the product
      const price = await stripeInstance.prices.create({
        product: stripeProduct.id,
        unit_amount: product.price,
        currency: 'usd',
        metadata: {
          rolls: product.rolls.toString()
        }
      });

      createdProducts.push({
        name: product.name,
        productId: stripeProduct.id,
        priceId: price.id,
        price: product.price,
        rolls: product.rolls
      });

      console.log(`✅ Created: ${product.name}`);
      console.log(`   Product ID: ${stripeProduct.id}`);
      console.log(`   Price ID: ${price.id}`);
      console.log(`   Price: $${(product.price / 100).toFixed(2)} USD\n`);

    } catch (error) {
      console.log(`❌ Failed to create ${product.name}: ${error.message}\n`);
    }
  }

  return createdProducts;
}

async function listExistingProducts() {
  console.log('🔍 Checking for existing products...\n');

  try {
    const products = await stripeInstance.products.list({
      limit: 100,
      active: true
    });

    const extraRollsProducts = products.data.filter(product => 
      product.metadata?.type === 'extra_rolls'
    );

    if (extraRollsProducts.length > 0) {
      console.log('📋 Found existing extra rolls products:\n');
      
      for (const product of extraRollsProducts) {
        console.log(`Product: ${product.name}`);
        console.log(`ID: ${product.id}`);
        console.log(`Description: ${product.description}`);
        console.log(`Rolls: ${product.metadata.rolls}\n`);
      }
    } else {
      console.log('No existing extra rolls products found.\n');
    }

    return extraRollsProducts;
  } catch (error) {
    console.log(`❌ Error listing products: ${error.message}\n`);
    return [];
  }
}

async function generateEnvTemplate(products) {
  console.log('📝 Environment Variables Template:\n');
  
  console.log('# Stripe Product IDs');
  console.log('# Add these to your .env.local file\n');
  
  for (const product of products) {
    const envVarName = `STRIPE_PRODUCT_${product.rolls}_ROLLS`;
    console.log(`${envVarName}=${product.productId}`);
  }
  
  console.log('\n# Stripe Price IDs (if needed)');
  for (const product of products) {
    const envVarName = `STRIPE_PRICE_${product.rolls}_ROLLS`;
    console.log(`${envVarName}=${product.priceId}`);
  }
}

async function main() {
  console.log('🎯 Stripe Products Setup');
  console.log('========================\n');

  // Check existing products first
  const existingProducts = await listExistingProducts();

  if (existingProducts.length > 0) {
    console.log('✅ Found existing products!');
    console.log('You can use these existing product IDs or create new ones.\n');
    
    const useExisting = process.argv.includes('--use-existing');
    
    if (useExisting) {
      console.log('Using existing products...\n');
      await generateEnvTemplate(existingProducts);
      return;
    }
  }

  // Create new products
  console.log('Creating new products...\n');
  const createdProducts = await createProducts();

  if (createdProducts.length > 0) {
    console.log('🎉 Products created successfully!\n');
    await generateEnvTemplate(createdProducts);
    
    console.log('\n📋 NEXT STEPS:');
    console.log('==============');
    console.log('1. Copy the environment variables above to your .env.local file');
    console.log('2. Test the payment system with these products');
    console.log('3. Monitor the Stripe dashboard for payments');
    console.log('\n🔗 Useful Links:');
    console.log('================');
    console.log('• Stripe Dashboard: https://dashboard.stripe.com/products');
    console.log('• Test Cards: https://stripe.com/docs/testing#cards');
    console.log('• Webhook Setup: https://dashboard.stripe.com/webhooks');
  } else {
    console.log('❌ No products were created. Check your Stripe configuration.');
  }
}

// Run the script
main().catch(console.error); 