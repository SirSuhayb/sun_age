const fs = require('fs');
const path = require('path');

console.log('🔧 Environment Variables Setup Helper');
console.log('====================================\n');

// Read the admin wallet info
const adminWalletPath = path.join(__dirname, 'admin-wallet.env');
let adminWalletInfo = '';

if (fs.existsSync(adminWalletPath)) {
  adminWalletInfo = fs.readFileSync(adminWalletPath, 'utf8');
  console.log('✅ Found admin wallet configuration');
} else {
  console.log('❌ Admin wallet file not found. Please run create-admin-wallet.js first.');
  process.exit(1);
}

// Check if .env.local exists
const envLocalPath = path.join(__dirname, '..', '.env.local');
const envLocalExists = fs.existsSync(envLocalPath);

if (envLocalExists) {
  console.log('📁 Found existing .env.local file');
  const currentContent = fs.readFileSync(envLocalPath, 'utf8');
  
  // Check if admin wallet variables are already present
  if (currentContent.includes('ADMIN_WALLET_PRIVATE_KEY')) {
    console.log('⚠️  Admin wallet variables already present in .env.local');
    console.log('Skipping admin wallet configuration...\n');
  } else {
    console.log('➕ Adding admin wallet configuration to .env.local...');
    fs.appendFileSync(envLocalPath, '\n' + adminWalletInfo);
    console.log('✅ Admin wallet configuration added to .env.local\n');
  }
} else {
  console.log('📁 Creating new .env.local file...');
  
  const template = `# =============================================================================
# SOLAR TOKEN DISTRIBUTION SYSTEM - ENVIRONMENT VARIABLES
# =============================================================================

# Copy your existing environment variables here and add the ones below

# =============================================================================
# DATABASE CONFIGURATION
# =============================================================================
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# =============================================================================
# FARCASTER CONFIGURATION
# =============================================================================
NEXT_PUBLIC_FARCASTER_HUB_URL=https://hub.farcaster.xyz
NEXT_PUBLIC_FARCASTER_NETWORK=mainnet

# =============================================================================
# CONTRACT ADDRESSES
# =============================================================================
NEXT_PUBLIC_SOLAR_PLEDGE_ADDRESS=0x746042147240304098C837563aAEc0F671881B07
NEXT_PUBLIC_USDC_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
NEXT_PUBLIC_SOLAR_TOKEN_ADDRESS=0x746042147240304098C837563aAEc0F671881B07
NEXT_PUBLIC_SOLAR_UTILITY_ADDRESS=0x746042147240304098C837563aAEc0F671881B07
NEXT_PUBLIC_MORPHO_ADDRESS=0x746042147240304098C837563aAEc0F671881B07
NEXT_PUBLIC_TREASURY_ADDRESS=0x9EeF19328828d918693Befe278dD052799B6A7AF

# =============================================================================
# BLOCKCHAIN CONFIGURATION
# =============================================================================
NEXT_PUBLIC_RPC_URL=https://mainnet.base.org

# =============================================================================
# PAYMENT PROCESSING
# =============================================================================
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# =============================================================================
# APP CONFIGURATION
# =============================================================================
NEXT_PUBLIC_APP_URL=http://localhost:3000

${adminWalletInfo}
`;

  fs.writeFileSync(envLocalPath, template);
  console.log('✅ Created .env.local file with template\n');
}

console.log('📝 NEXT STEPS:');
console.log('==============');
console.log('1. Edit .env.local and replace placeholder values with your actual credentials');
console.log('2. Get your Supabase credentials from your Supabase dashboard');
console.log('3. Get your Stripe keys from your Stripe dashboard');
console.log('4. Fund the admin wallet with SOLAR tokens');
console.log('5. Run: node scripts/test-admin-wallet.js to verify setup');
console.log('\n📋 REQUIRED CREDENTIALS:');
console.log('========================');
console.log('• Supabase URL and API keys');
console.log('• Stripe publishable and secret keys');
console.log('• SOLAR tokens for the admin wallet');
console.log('\n🔗 USEFUL LINKS:');
console.log('================');
console.log('• Supabase Dashboard: https://supabase.com/dashboard');
console.log('• Stripe Dashboard: https://dashboard.stripe.com/');
console.log('• Base Explorer: https://basescan.org/');
console.log('\n✅ Environment setup helper complete!'); 