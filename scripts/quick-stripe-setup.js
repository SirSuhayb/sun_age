const fs = require('fs');
const path = require('path');

console.log('💳 Quick Stripe Setup Guide');
console.log('===========================\n');

console.log('🎯 ESSENTIAL STEPS TO SET UP STRIPE:\n');

console.log('1️⃣  CREATE STRIPE ACCOUNT');
console.log('   • Go to: https://dashboard.stripe.com/');
console.log('   • Sign up or log in');
console.log('   • Complete account verification\n');

console.log('2️⃣  GET YOUR API KEYS');
console.log('   • Go to: Developers → API keys');
console.log('   • Copy your publishable key (starts with pk_test_)');
console.log('   • Copy your secret key (starts with sk_test_)');
console.log('   • Add them to your .env.local file\n');

console.log('3️⃣  ENABLE PAYMENT METHODS');
console.log('   • Go to: Settings → Payment methods');
console.log('   • Enable "Credit and debit cards"');
console.log('   • Enable "Crypto payments" for USDC\n');

console.log('4️⃣  CREATE PRODUCTS');
console.log('   • Run: node scripts/setup-stripe-products.js');
console.log('   • This will create products for 5, 15, and 50 rolls');
console.log('   • Copy the product IDs to your .env.local file\n');

console.log('5️⃣  SET UP WEBHOOKS (Optional for testing)');
console.log('   • Go to: Developers → Webhooks');
console.log('   • Add endpoint: https://your-domain.com/api/payments/stripe/webhook');
console.log('   • Select events: payment_intent.succeeded, payment_intent.payment_failed\n');

console.log('6️⃣  TEST THE INTEGRATION');
console.log('   • Start your dev server: npm run dev');
console.log('   • Go to: /surprise-me/more-rolls');
console.log('   • Try a test payment with card: 4242424242424242\n');

console.log('📋 ENVIRONMENT VARIABLES NEEDED:\n');

const envTemplate = `# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# Stripe Product IDs (run setup-stripe-products.js to get these)
STRIPE_PRODUCT_5_ROLLS=prod_your_product_id_here
STRIPE_PRODUCT_15_ROLLS=prod_your_product_id_here
STRIPE_PRODUCT_50_ROLLS=prod_your_product_id_here

# Webhook Secret (optional for testing)
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
`;

console.log(envTemplate);

console.log('🧪 TESTING CHECKLIST:\n');

const testChecklist = [
  '✅ Stripe account created and verified',
  '✅ API keys added to .env.local',
  '✅ Payment methods enabled',
  '✅ Products created with setup script',
  '✅ Product IDs added to .env.local',
  '✅ Test payment with 4242424242424242',
  '✅ Payment appears in Stripe dashboard',
  '✅ Rolls added to user account after payment'
];

testChecklist.forEach(item => {
  console.log(item);
});

console.log('\n🔗 USEFUL LINKS:');
console.log('================');
console.log('• Stripe Dashboard: https://dashboard.stripe.com/');
console.log('• Test Cards: https://stripe.com/docs/testing#cards');
console.log('• Webhook Testing: https://dashboard.stripe.com/webhooks');
console.log('• Documentation: https://stripe.com/docs');

console.log('\n🚀 READY TO START!');
console.log('Run: node scripts/setup-stripe-products.js to create your products'); 