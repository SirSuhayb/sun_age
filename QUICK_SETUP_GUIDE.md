# 🚀 Quick Setup Guide - SOLAR Token Distribution System

## ✅ What's Already Done

1. **Admin Wallet Created**: `0x9EeF19328828d918693Befe278dD052799B6A7AF`
2. **Scripts Created**: Test and setup scripts are ready
3. **Database Schema**: Purchases and distributions tables ready
4. **Payment System**: Stripe, USDC, and SOLAR payment APIs implemented

## 📝 Next Steps (Required)

### Step 1: Create `.env.local` File

Create a file called `.env.local` in your project root and copy the contents from `env-template.txt`:

```bash
cp env-template.txt .env.local
```

### Step 2: Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click on your project
3. Go to **Settings** → **API**
4. Copy these values to `.env.local`:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

### Step 3: Get Your Stripe Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Go to **Developers** → **API keys**
3. Copy these values to `.env.local`:
   - **Publishable key** → `STRIPE_PUBLISHABLE_KEY`
   - **Secret key** → `STRIPE_SECRET_KEY`
4. **Use test keys for development, live keys for production**

### Step 4: Fund the Admin Wallet

Send SOLAR tokens to: `0x9EeF19328828d918693Befe278dD052799B6A7AF`

**Recommended amount**: 10,000+ SOLAR tokens

**How to fund**:
1. Go to [Base Explorer](https://basescan.org/)
2. Search for SOLAR token: `0x746042147240304098C837563aAEc0F671881B07`
3. Send tokens to the admin wallet address

### Step 5: Test the Setup

Run the test script to verify everything is working:

```bash
node scripts/test-admin-wallet.js
```

## 🔧 Environment Variables Checklist

Make sure your `.env.local` has these values filled in:

- [ ] `NEXT_PUBLIC_SUPABASE_URL` (your Supabase URL)
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` (your Supabase anon key)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (your Supabase service role key)
- [ ] `STRIPE_SECRET_KEY` (your Stripe secret key)
- [ ] `STRIPE_PUBLISHABLE_KEY` (your Stripe publishable key)
- [ ] Admin wallet is funded with SOLAR tokens

## 🧪 Testing the System

### 1. Test Admin Wallet
```bash
node scripts/test-admin-wallet.js
```

### 2. Test Payment System
1. Start your development server: `npm run dev`
2. Go to `/surprise-me/more-rolls`
3. Try purchasing extra rolls with different payment methods

### 3. Test Token Claims
1. Go to `/journal` and create an entry
2. Try claiming SOLAR tokens for your entry
3. Check if tokens are distributed to your wallet

## 🚨 Security Reminders

- **Never commit `.env.local` to version control**
- **Keep your admin wallet private key secure**
- **Use test keys for development**
- **Use live keys only for production**

## 📊 Monitoring

After setup, monitor these metrics:
- Token distribution success rate
- Payment processing success rate
- Admin wallet balance
- User claim activity

## 🆘 Troubleshooting

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

## 🎉 Success!

Once all steps are complete, your SOLAR token distribution system will be fully operational with:
- ✅ Real payment processing (Stripe, USDC, SOLAR)
- ✅ Automated token distributions
- ✅ Secure admin wallet management
- ✅ Database tracking of all transactions

**Ready to launch! 🚀** 