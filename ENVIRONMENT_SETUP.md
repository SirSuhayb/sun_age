# Environment Variables Setup Guide

## Step-by-Step Setup

### 1. Create/Update Your `.env.local` File

Add these environment variables to your `.env.local` file:

```bash
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
ADMIN_WALLET_PRIVATE_KEY=0x9f82806c65b2518811e903adcf28a3744dfd07f462ace8d5c50fdb30535a168f

# =============================================================================
# PAYMENT PROCESSING
# =============================================================================
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# =============================================================================
# APP CONFIGURATION
# =============================================================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step-by-Step Instructions

### Step 1: Database Variables
Replace these with your actual Supabase credentials:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

**How to get these:**
1. Go to your Supabase dashboard
2. Click on your project
3. Go to Settings → API
4. Copy the Project URL and anon/public key

### Step 2: Stripe Keys
Replace these with your actual Stripe keys:
```bash
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

**How to get these:**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Go to Developers → API keys
3. Copy the publishable key and secret key
4. Use test keys for development, live keys for production

### Step 3: Admin Wallet (Already Generated)
The admin wallet has been generated for you:
```bash
ADMIN_WALLET_PRIVATE_KEY=0x9f82806c65b2518811e903adcf28a3744dfd07f462ace8d5c50fdb30535a168f
NEXT_PUBLIC_TREASURY_ADDRESS=0x9EeF19328828d918693Befe278dD052799B6A7AF
```

### Step 4: Fund the Admin Wallet
Send SOLAR tokens to: `0x9EeF19328828d918693Befe278dD052799B6A7AF`

**Recommended amount:** 10,000+ SOLAR tokens for distributions

## Verification Steps

### 1. Test Database Connection
```bash
# Check if your database is accessible
curl -X GET "https://your-project.supabase.co/rest/v1/" \
  -H "apikey: your_anon_key"
```

### 2. Test Stripe Connection
```bash
# Test Stripe API (replace with your actual key)
curl -X GET "https://api.stripe.com/v1/account" \
  -H "Authorization: Bearer sk_test_your_key"
```

### 3. Test Admin Wallet
```bash
# Run the wallet test script
node scripts/test-admin-wallet.js
```

## Security Checklist

- [ ] Private key is not committed to version control
- [ ] `.env.local` is in `.gitignore`
- [ ] Admin wallet is funded with SOLAR tokens
- [ ] Stripe keys are correct (test/live)
- [ ] Database credentials are correct
- [ ] RPC URL is correct for your network

## Troubleshooting

### Common Issues:

1. **"Invalid Supabase URL"**
   - Check your Supabase project URL
   - Ensure you're using the correct project

2. **"Stripe API error"**
   - Verify your Stripe keys are correct
   - Check if you're using test vs live keys

3. **"Insufficient tokens in admin wallet"**
   - Fund the admin wallet with SOLAR tokens
   - Check the wallet balance

4. **"Invalid RPC URL"**
   - Verify the Base mainnet RPC URL
   - Check network connectivity

## Next Steps

1. **Add all variables to `.env.local`**
2. **Fund the admin wallet with SOLAR tokens**
3. **Test the payment system**
4. **Deploy to production with live keys**

## Production Deployment

For production, you'll need to:
1. Use live Stripe keys instead of test keys
2. Use production RPC endpoints
3. Fund the admin wallet with more SOLAR tokens
4. Set up monitoring and alerts 