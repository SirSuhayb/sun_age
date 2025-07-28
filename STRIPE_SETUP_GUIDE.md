# 💳 Stripe Setup Guide for SOLAR Token Distribution

## 🎯 Overview

Your app supports three payment methods:
1. **Fiat Payments** (USD via Stripe)
2. **USDC Payments** (crypto via Stripe)
3. **SOLAR Token Payments** (direct blockchain)

## 📋 Step-by-Step Stripe Setup

### Step 1: Create Stripe Account

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Sign up for a new account or log in
3. Complete account verification (business details, bank account)

### Step 2: Get Your API Keys

1. In Stripe Dashboard, go to **Developers** → **API keys**
2. You'll see two keys:
   - **Publishable key** (starts with `pk_test_` or `pk_live_`)
   - **Secret key** (starts with `sk_test_` or `sk_live_`)

3. **For Development**: Use test keys (start with `pk_test_` and `sk_test_`)
4. **For Production**: Use live keys (start with `pk_live_` and `sk_live_`)

### Step 3: Configure Payment Methods

#### A. Enable Fiat Payments (USD)

1. Go to **Settings** → **Payment methods**
2. Enable **Credit and debit cards**
3. Enable **Digital wallets** (Apple Pay, Google Pay)
4. Configure your supported currencies (USD)

#### B. Enable USDC Payments

1. Go to **Settings** → **Payment methods**
2. Enable **Crypto payments**
3. Add **USDC** as a supported cryptocurrency
4. Configure USDC settings:
   - Network: Base (Ethereum L2)
   - Contract: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`

### Step 4: Configure Webhooks

1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Set endpoint URL: `https://your-domain.com/api/payments/stripe/webhook`
4. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.succeeded`
   - `charge.failed`

### Step 5: Set Up Products in Stripe

Create products for your extra rolls:

1. Go to **Products** → **Add product**
2. Create products for different roll packages:

#### Product 1: Small Roll Package
- **Name**: "5 Extra Rolls"
- **Price**: $5.00 USD
- **Description**: "Get 5 additional rolls for your surprise-me feature"

#### Product 2: Medium Roll Package
- **Name**: "15 Extra Rolls"
- **Price**: $12.00 USD
- **Description**: "Get 15 additional rolls for your surprise-me feature"

#### Product 3: Large Roll Package
- **Name**: "50 Extra Rolls"
- **Price**: $35.00 USD
- **Description**: "Get 50 additional rolls for your surprise-me feature"

### Step 6: Configure Environment Variables

Add these to your `.env.local`:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Product IDs (get these from your Stripe dashboard)
STRIPE_PRODUCT_5_ROLLS=prod_your_product_id_here
STRIPE_PRODUCT_15_ROLLS=prod_your_product_id_here
STRIPE_PRODUCT_50_ROLLS=prod_your_product_id_here
```

## 🔧 Advanced Configuration

### A. Test Mode vs Live Mode

**Development (Test Mode)**:
- Use test keys (`pk_test_`, `sk_test_`)
- Use test card numbers
- No real charges
- Perfect for development

**Production (Live Mode)**:
- Use live keys (`pk_live_`, `sk_live_`)
- Real charges
- Requires account verification
- Use only when ready to go live

### B. Test Card Numbers

For testing, use these test card numbers:

**Successful Payments**:
- Visa: `4242424242424242`
- Mastercard: `5555555555554444`
- American Express: `378282246310005`

**Failed Payments**:
- Declined: `4000000000000002`
- Insufficient funds: `4000000000009995`
- Expired card: `4000000000000069`

### C. USDC Payment Testing

For USDC payments, you'll need:
1. A wallet with USDC on Base network
2. Test USDC from a faucet (for testnet)
3. Real USDC for mainnet testing

## 🧪 Testing Your Stripe Integration

### 1. Test Fiat Payments

```bash
# Start your development server
npm run dev
```

1. Go to `/surprise-me/more-rolls`
2. Select "Pay with USD"
3. Use test card number: `4242424242424242`
4. Complete the payment
5. Check if rolls are added to your account

### 2. Test USDC Payments

1. Go to `/surprise-me/more-rolls`
2. Select "Pay with USDC"
3. Connect your wallet
4. Approve the USDC transaction
5. Check if rolls are added to your account

### 3. Test Webhooks

1. Use Stripe CLI to test webhooks locally:
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:3000/api/payments/stripe/webhook
```

## 🚨 Security Best Practices

### 1. Key Management
- **Never commit API keys to version control**
- **Use environment variables**
- **Rotate keys regularly**
- **Use different keys for test/live**

### 2. Webhook Security
- **Verify webhook signatures**
- **Use webhook secrets**
- **Handle webhook failures gracefully**

### 3. Error Handling
- **Log all payment errors**
- **Implement retry logic**
- **Monitor failed payments**
- **Provide clear error messages to users**

## 📊 Monitoring & Analytics

### 1. Stripe Dashboard
- Monitor payment success rates
- Track revenue
- View customer analytics
- Monitor disputes and refunds

### 2. Custom Analytics
- Track which payment methods are most popular
- Monitor conversion rates
- Analyze user behavior

## 🔄 Production Deployment

### 1. Switch to Live Mode
1. Complete Stripe account verification
2. Switch from test to live keys
3. Update webhook endpoints
4. Test with small amounts first

### 2. Compliance
- Ensure PCI compliance
- Follow local payment regulations
- Implement proper refund policies
- Set up customer support

### 3. Monitoring
- Set up alerts for failed payments
- Monitor webhook delivery
- Track chargeback rates
- Monitor system performance

## 🆘 Troubleshooting

### Common Issues:

1. **"Invalid API key"**
   - Check if you're using the right test/live keys
   - Verify the key format

2. **"Webhook signature verification failed"**
   - Check webhook secret
   - Verify webhook endpoint URL

3. **"Payment method not supported"**
   - Enable the payment method in Stripe
   - Check regional restrictions

4. **"USDC payment failed"**
   - Verify USDC contract address
   - Check network configuration
   - Ensure sufficient USDC balance

## 📞 Support Resources

- **Stripe Documentation**: https://stripe.com/docs
- **Stripe Support**: https://support.stripe.com/
- **Stripe Community**: https://community.stripe.com/
- **Base Network**: https://docs.base.org/

## ✅ Checklist

- [ ] Stripe account created and verified
- [ ] API keys obtained (test and live)
- [ ] Payment methods configured
- [ ] Webhooks set up
- [ ] Products created in Stripe
- [ ] Environment variables configured
- [ ] Test payments working
- [ ] Error handling implemented
- [ ] Security measures in place
- [ ] Monitoring set up

**Ready to process real payments! 🚀** 