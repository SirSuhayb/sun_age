# Payment & Token Distribution Setup Guide

## Overview

This guide will help you set up the real payment processing and token distribution systems for the surprise-me feature.

## 1. Environment Variables Setup

Add these environment variables to your `.env.local` file:

```bash
# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Farcaster
NEXT_PUBLIC_FARCASTER_HUB_URL=https://hub.farcaster.xyz
NEXT_PUBLIC_FARCASTER_NETWORK=mainnet

# Contract Addresses
NEXT_PUBLIC_SOLAR_PLEDGE_ADDRESS=0x746042147240304098C837563aAEc0F671881B07
NEXT_PUBLIC_USDC_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
NEXT_PUBLIC_SOLAR_TOKEN_ADDRESS=0x746042147240304098C837563aAEc0F671881B07
NEXT_PUBLIC_SOLAR_UTILITY_ADDRESS=0x...
NEXT_PUBLIC_MORPHO_ADDRESS=0x...
NEXT_PUBLIC_TREASURY_ADDRESS=0x...

# Blockchain Configuration
NEXT_PUBLIC_RPC_URL=https://mainnet.base.org
ADMIN_WALLET_PRIVATE_KEY=your_admin_wallet_private_key

# Payment Processing
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 2. Install Dependencies

```bash
# Install Stripe for fiat payments
npm install stripe

# Install ethers for blockchain interactions (if not already installed)
npm install ethers
```

## 3. Database Setup

Run the database schema to create the necessary tables:

```sql
-- Run the purchases_schema.sql file in your database
-- This creates tables for tracking purchases and distributions
```

## 4. Admin Wallet Setup

### 4.1 Create Admin Wallet
1. Generate a new wallet for token distribution
2. Fund it with SOLAR tokens for distributions
3. Add the private key to your environment variables

### 4.2 Verify Setup
```bash
# Test the token distributor
curl -X POST http://localhost:3000/api/tokens/distribute/test
```

## 5. Payment Integration Steps

### 5.1 Stripe Setup
1. Create a Stripe account
2. Get your API keys from the dashboard
3. Add keys to environment variables
4. Test with Stripe's test cards

### 5.2 USDC Integration
1. Ensure USDC contract address is correct
2. Test USDC balance checking
3. Implement proper signature verification

### 5.3 SOLAR Token Integration
1. Ensure SOLAR contract address is correct
2. Test token balance checking
3. Implement proper signature verification

## 6. Testing the Integration

### 6.1 Test Token Distribution
```bash
# Test journal claim
curl -X POST http://localhost:3000/api/journal/claim \
  -H "Content-Type: application/json" \
  -d '{
    "userFid": 123,
    "entryId": "entry-uuid",
    "shareId": "share-uuid", 
    "walletAddress": "0x..."
  }'
```

### 6.2 Test Payment Processing
```bash
# Test Stripe payment
curl -X POST http://localhost:3000/api/payments/stripe \
  -H "Content-Type: application/json" \
  -d '{
    "paymentMethodId": "pm_...",
    "amount": 299,
    "currency": "usd",
    "packageId": "fiat-basic",
    "rolls": 5
  }'
```

## 7. Production Deployment

### 7.1 Environment Variables
- Use production Stripe keys
- Use production RPC endpoints
- Secure admin wallet private key

### 7.2 Database
- Run migrations in production
- Set up proper indexes
- Configure backup strategy

### 7.3 Monitoring
- Set up error tracking
- Monitor transaction success rates
- Track payment conversion rates

## 8. Security Considerations

### 8.1 Signature Verification
Implement proper signature verification for crypto payments:

```typescript
// Example signature verification
async function verifySignature(
  userAddress: string, 
  amount: number, 
  packageId: string, 
  signature: string
): Promise<boolean> {
  const message = `${userAddress}:${amount}:${packageId}`;
  const recoveredAddress = ethers.verifyMessage(message, signature);
  return recoveredAddress.toLowerCase() === userAddress.toLowerCase();
}
```

### 8.2 Rate Limiting
Add rate limiting to prevent abuse:

```typescript
// Example rate limiting
const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // limit each IP to 5 requests per windowMs
};
```

### 8.3 Input Validation
Validate all inputs thoroughly:

```typescript
// Example input validation
function validatePaymentRequest(data: any) {
  if (!data.userAddress || !ethers.isAddress(data.userAddress)) {
    throw new Error('Invalid wallet address');
  }
  if (!data.amount || data.amount <= 0) {
    throw new Error('Invalid amount');
  }
  // ... more validation
}
```

## 9. Troubleshooting

### 9.1 Common Issues

**"Insufficient tokens in admin wallet"**
- Check admin wallet balance
- Ensure admin wallet is funded with SOLAR tokens

**"Payment failed"**
- Check Stripe API keys
- Verify payment method is valid
- Check network connectivity

**"Invalid signature"**
- Implement proper signature verification
- Check message format matches frontend

### 9.2 Debug Mode
Enable debug logging:

```typescript
// Add to your environment variables
DEBUG_PAYMENTS=true
DEBUG_TOKEN_DISTRIBUTION=true
```

## 10. Next Steps

1. **Implement Database Recording**: Connect the purchase and distribution recording to your actual database
2. **Add Error Handling**: Implement comprehensive error handling and user feedback
3. **Add Analytics**: Track payment success rates and user behavior
4. **Optimize Gas**: Implement gas optimization for token distributions
5. **Add Refunds**: Implement refund functionality for failed payments

## 11. Monitoring & Analytics

### 11.1 Key Metrics to Track
- Payment success rate
- Token distribution success rate
- Average transaction time
- User conversion rate
- Revenue per user

### 11.2 Alerts to Set Up
- Failed payment rate > 5%
- Failed token distribution rate > 1%
- Admin wallet balance < 1000 SOLAR
- High error rate in payment APIs

This setup will give you a complete, production-ready payment and token distribution system! 