# Bridge.xyz Integration Setup Guide

## Overview
This guide will help you set up the automatic Stripe to Bridge.xyz to USDC conversion for your Morpho treasury management.

## Prerequisites

1. **Stripe Account** - Already set up for your cosmic codex payments
2. **Bridge.xyz Account** - Sign up at [bridge.xyz](https://bridge.xyz)
3. **Morpho Treasury Wallet** - Your treasury wallet address on Base network
4. **Bank Account** - Connected to Bridge.xyz for ACH transfers

## Step 1: Bridge.xyz Account Setup

### 1.1 Create Bridge Account
1. Go to [bridge.xyz](https://bridge.xyz) and sign up
2. Complete KYC verification for your business
3. Connect your business bank account for ACH transfers
4. Get your API key from the Bridge dashboard

### 1.2 Test the Integration
Use Bridge's sandbox environment to test the flow:
```bash
# Test with Bridge sandbox
curl -X POST https://api.bridge.xyz/v0/transfers \
  -H "Api-Key: your_sandbox_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": "50.00",
    "source": {"payment_rail": "ach", "currency": "usd"},
    "destination": {
      "payment_rail": "base",
      "currency": "usdc", 
      "to_address": "0x742d35Cc6634C0532925a3b8D400544DAEa6ad44"
    }
  }'
```

## Step 2: Environment Variables

Add these to your `.env.local` file:

```env
# Existing Stripe variables
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Bridge.xyz Integration
BRIDGE_API_KEY=your_bridge_api_key
MORPHO_TREASURY_ADDRESS=0x742d35Cc6634C0532925a3b8D400544DAEa6ad44

# Optional: Conversion settings
USDC_CONVERSION_PERCENTAGE=50  # Default: 50% of fiat payments
```

## Step 3: Webhook Configuration

### 3.1 Stripe Webhook Setup
1. Go to your Stripe Dashboard → Webhooks
2. Add endpoint: `https://yourdomain.com/api/stripe/webhook`
3. Select these events:
   - `payment_intent.succeeded`
   - `checkout.session.completed`
   - `invoice.payment_succeeded`

### 3.2 Webhook Testing
Test your webhook locally:
```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Trigger a test payment
stripe trigger payment_intent.succeeded
```

## Step 4: Update Cosmic Codex Payment Integration

Update your cosmic codex payment intent creation to include metadata:

```typescript
// In your payment intent creation
const paymentIntent = await stripe.paymentIntents.create({
  amount: 999, // $9.99 in cents
  currency: 'usd',
  description: 'Cosmic Codex Unlock',
  metadata: {
    product: 'cosmic_codex',
    auto_convert_usdc: 'true',
    treasury_percentage: '50',
  },
});
```

## Step 5: Revenue Flow Tracking

The system will automatically:

1. **Detect Cosmic Codex payments** via metadata/description
2. **Convert 50% to USDC** using Bridge.xyz
3. **Send to Morpho treasury** on Base network
4. **Log all transactions** for accounting

### Example Flow:
```
Customer pays $9.99 → Stripe webhook fires → 
Bridge converts $4.99 to USDC → 
USDC sent to Morpho treasury → 
Earn yield on treasury reserves
```

## Step 6: Monitoring and Logging

### Treasury Transaction Logs
All conversions are logged with:
- Original payment amount
- Conversion amount
- Bridge transfer ID
- Morpho treasury address
- Timestamp and metadata

### Error Handling
- Payment success is never blocked by conversion failures
- Failed conversions are logged for manual retry
- Idempotency keys prevent duplicate conversions

## Step 7: Production Checklist

- [ ] Bridge.xyz account verified and live API key obtained
- [ ] Bank account connected to Bridge for ACH transfers
- [ ] Morpho treasury wallet address configured
- [ ] Stripe webhook endpoint configured with correct events
- [ ] Environment variables set in production
- [ ] Test payment flow end-to-end
- [ ] Monitor logs for successful conversions

## API Endpoints

### Bridge.xyz API
- **Base URL**: `https://api.bridge.xyz/v0`
- **Rate Limits**: 100 requests/minute
- **Documentation**: [docs.bridge.xyz](https://docs.bridge.xyz)

### Webhook URL
- **Endpoint**: `/api/stripe/webhook`
- **Method**: `POST`
- **Authentication**: Stripe signature verification

## Treasury Management

### Expected Conversion Times
- **ACH to Bridge**: 1-3 business days
- **USDC transfer**: 5-15 minutes
- **Morpho deposit**: Immediate

### Fees
- **Bridge conversion**: ~0.5-1% 
- **Base network gas**: ~$0.01-0.10
- **Total cost**: Usually under 1% of converted amount

## Troubleshooting

### Common Issues

1. **Bridge API errors**: Check API key and account status
2. **Webhook failures**: Verify endpoint URL and signature
3. **ACH delays**: Normal 1-3 business day processing
4. **Gas failures**: Ensure treasury wallet has ETH for gas

### Support
- **Bridge.xyz**: support@bridge.xyz
- **Integration help**: Check logs in `/api/stripe/webhook`

## Next Steps

1. **Set up monitoring** for conversion success rates
2. **Configure alerts** for failed conversions
3. **Integrate with accounting** system for revenue tracking
4. **Consider yield strategies** for USDC treasury reserves

This integration provides automated DeFi treasury management while maintaining the familiar Stripe payment experience for your users!