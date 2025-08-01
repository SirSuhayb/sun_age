# Sol Codex Environment Variables Setup

## Required Environment Variables

### Stripe Configuration

1. **STRIPE_SECRET_KEY**
   - Your Stripe secret key
   - Test mode: `sk_test_...`
   - Production: `sk_live_...`
   - Required for: Preview, Production

2. **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY**
   - Your Stripe publishable key (for client-side)
   - Test mode: `pk_test_...`
   - Production: `pk_live_...`
   - Required for: Preview, Production

3. **STRIPE_SOL_CODEX_MONTHLY_PRICE_ID**
   - The Stripe Price ID for monthly subscription ($7.77/month)
   - Format: `price_...`
   - Required for: Preview, Production

4. **STRIPE_SOL_CODEX_YEARLY_PRICE_ID**
   - The Stripe Price ID for yearly subscription ($77.00/year)
   - Format: `price_...`
   - Required for: Preview, Production

### Other Configuration

5. **NEXT_PUBLIC_TREASURY_ADDRESS** (Optional)
   - Your wallet address for receiving Daimo payments
   - Default: `0x11BA1632fd6Cc120D309158298e3a0df3B7ba283`
   - Required for: Preview, Production

6. **NEXT_PUBLIC_BASE_URL** (Optional)
   - Your deployment URL (e.g., `https://yourdomain.com`)
   - Used for Stripe redirect URLs
   - If not set, uses request origin automatically

## Setting Up Stripe Products

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to "Products"
3. Click "Add product"
4. Create product:
   - Name: "Sol Codex"
   - Description: "Expand your understanding with complete natal chart analysis"
   - Upload image: `/public/you/solChart.svg`

5. Add prices:
   - **Monthly Price**:
     - Price: $7.77
     - Billing period: Monthly
     - Copy the price ID (starts with `price_`)
   
   - **Yearly Price**:
     - Price: $77.00
     - Billing period: Yearly
     - Copy the price ID (starts with `price_`)

6. Add the price IDs to your Vercel environment variables

## Free Trial Configuration

The 7-day free trial is configured in the code (`trial_period_days: 7`). Stripe will:
- Collect payment method during checkout
- Not charge for 7 days
- Automatically start billing after trial ends
- Send trial ending reminders (configure in Stripe settings)

## SOLAR Token Free Access

Users with 500M+ SOLAR tokens get 1 year free access. This bypasses Stripe entirely and redirects directly to the data collection page.