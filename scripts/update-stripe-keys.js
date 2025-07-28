const fs = require('fs');
const path = require('path');

console.log('🔑 Stripe Keys Update Helper');
console.log('============================\n');

console.log('⚠️  IMPORTANT: You currently have LIVE Stripe keys in your .env.local file!');
console.log('For development and testing, you should use TEST keys to avoid real charges.\n');

console.log('📋 CURRENT KEYS:');
console.log('================');
console.log('• Secret Key: sk_live_... (LIVE - will charge real money)');
console.log('• Publishable Key: pk_live_... (LIVE - will charge real money)\n');

console.log('🔄 TO SWITCH TO TEST KEYS:');
console.log('==========================');
console.log('1. Go to: https://dashboard.stripe.com/');
console.log('2. Click the toggle in the top right to switch to "Test mode"');
console.log('3. Go to: Developers → API keys');
console.log('4. Copy the TEST keys (they start with sk_test_ and pk_test_)');
console.log('5. Update your .env.local file\n');

console.log('📝 EXAMPLE TEST KEYS:');
console.log('=====================');
console.log('STRIPE_SECRET_KEY=sk_test_... (your test secret key)');
console.log('STRIPE_PUBLISHABLE_KEY=pk_test_... (your test publishable key)\n');

console.log('🧪 TEST CARD NUMBERS:');
console.log('=====================');
console.log('• Success: 4242424242424242');
console.log('• Decline: 4000000000000002');
console.log('• Insufficient funds: 4000000000009995');
console.log('• Expired card: 4000000000000069\n');

console.log('✅ BENEFITS OF TEST KEYS:');
console.log('========================');
console.log('• No real charges to customers');
console.log('• Safe for development and testing');
console.log('• Can test all payment scenarios');
console.log('• No risk of accidental charges\n');

console.log('🚀 AFTER UPDATING TO TEST KEYS:');
console.log('===============================');
console.log('1. Run: node scripts/setup-stripe-products.js');
console.log('2. This will create test products in your Stripe account');
console.log('3. Test payments will appear in your Stripe dashboard');
console.log('4. No real money will be charged\n');

console.log('📞 NEED HELP?');
console.log('=============');
console.log('• Stripe Dashboard: https://dashboard.stripe.com/');
console.log('• Test Mode Toggle: Look for the toggle in the top right');
console.log('• API Keys: Developers → API keys');
console.log('• Test Cards: https://stripe.com/docs/testing#cards');

console.log('\n🔒 Your current keys are backed up to .env.local.backup');
console.log('Update your .env.local file with test keys, then run the setup script!'); 