# Expand Understanding Payment Flow

This document outlines the implementation of the payment flow for the "Expand Your Understanding" feature in the YOU tab of Sol Dash.

## Overview

The Expand Understanding feature allows users to upgrade from their basic birth date-only Sol profile to a complete natal chart analysis by providing their birth time and location. This premium feature is monetized through a one-time payment.

## User Journey

1. **Discovery** - User sees the "Expand Understanding" card in their YOU tab
2. **Payment** - User clicks "Unlock Your Chart" and is taken to the payment page
3. **Data Collection** - After payment, user provides birth time and location
4. **Chart Generation** - System generates the complete natal chart
5. **Chart Display** - User sees their rendered chart with basic insights
6. **Advanced Details** - User can view detailed analysis and interpretations

## File Structure

```
src/app/soldash/you/expand/
├── page.tsx                 # Payment page
├── collect-data/
│   └── page.tsx            # Birth data collection form
├── chart/
│   └── page.tsx            # Chart display with CTA
└── details/
    └── page.tsx            # Advanced analysis details
```

## Components

### 1. Payment Page (`/soldash/you/expand`)
- **Purpose**: Showcase the features and handle payment
- **Features**:
  - Feature list with descriptions
  - Pricing display ($29 one-time)
  - Payment button (TODO: Stripe integration)
  - Security messaging
- **Next**: Redirects to data collection after payment

### 2. Data Collection Page (`/soldash/you/expand/collect-data`)
- **Purpose**: Collect birth time and location
- **Features**:
  - Form validation
  - Progress indicator
  - Privacy notice
  - Auto-advance after submission
- **Data Collected**:
  - Birth date (pre-filled if available)
  - Birth time (required)
  - Birth location (city, state/province, country)
- **Next**: Redirects to chart generation

### 3. Chart Display Page (`/soldash/you/expand/chart`)
- **Purpose**: Show the generated natal chart
- **Features**:
  - Loading animation during chart generation
  - Visual chart representation (placeholder)
  - Key insights summary
  - Download and share options
  - CTA to view advanced details
- **Chart Elements**:
  - Sun, Moon, Rising signs
  - Zodiac wheel visualization
  - Basic interpretations
- **Next**: Links to advanced details

### 4. Advanced Details Page (`/soldash/you/expand/details`)
- **Purpose**: Provide in-depth analysis and insights
- **Features**:
  - Expandable sections for different life areas
  - Personalized interpretations
  - Actionable insights
  - Integration recommendations
- **Sections**:
  - Life Focus & Purpose
  - Energy Rhythms & Cycles
  - Natural Strengths & Talents
  - Annual Reset Periods
  - Life Growth Phases
  - Relationship Patterns

## Payment Integration (TODO)

The payment system is currently scaffolded with placeholder functionality. To implement actual payments:

1. **Stripe Setup**:
   ```javascript
   // In payment page
   const handlePayment = async () => {
     const response = await fetch('/api/create-checkout-session', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         product: 'expand-understanding',
         amount: 2900, // $29.00 in cents
       }),
     });
     
     const { sessionId } = await response.json();
     const stripe = await getStripe();
     stripe.redirectToCheckout({ sessionId });
   };
   ```

2. **API Route** (`/api/create-checkout-session`):
   ```javascript
   import Stripe from 'stripe';
   
   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
   
   export default async function handler(req, res) {
     const session = await stripe.checkout.sessions.create({
       payment_method_types: ['card'],
       line_items: [{
         price_data: {
           currency: 'usd',
           product_data: { name: 'Expand Your Understanding' },
           unit_amount: 2900,
         },
         quantity: 1,
       }],
       mode: 'payment',
       success_url: `${req.headers.origin}/soldash/you/expand/collect-data`,
       cancel_url: `${req.headers.origin}/soldash/you/expand`,
     });
     
     res.json({ sessionId: session.id });
   }
   ```

3. **Environment Variables**:
   ```bash
   STRIPE_PUBLISHABLE_KEY=pk_...
   STRIPE_SECRET_KEY=sk_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

## Chart Generation (TODO)

The natal chart generation is currently mocked. To implement actual chart calculation:

1. **Astrology API Integration**:
   - Consider using services like AstroSeek API or Kerykeion
   - Calculate planetary positions based on birth data
   - Generate house placements and aspects

2. **Chart Visualization**:
   - Use libraries like D3.js or Canvas for chart rendering
   - Create responsive SVG-based zodiac wheels
   - Display planetary symbols and degree markers

3. **Interpretation Engine**:
   - Build rule-based system for generating interpretations
   - Combine planetary positions, houses, and aspects
   - Create personalized insights based on chart patterns

## Data Storage

Consider storing the following data for paid users:

```javascript
// User birth data (encrypted)
{
  userId: string,
  birthDate: Date,
  birthTime: string,
  birthLocation: {
    city: string,
    country: string,
    latitude: number,
    longitude: number,
    timezone: string
  },
  paymentStatus: 'completed' | 'pending' | 'failed',
  chartData: {
    // Generated chart information
    planets: Array,
    houses: Array,
    aspects: Array,
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Security Considerations

1. **Data Encryption**: Encrypt birth data at rest
2. **Payment Security**: Use Stripe's secure checkout
3. **Access Control**: Verify payment before showing chart
4. **Privacy**: Clear data retention and usage policies

## Testing

1. **Payment Flow**: Test with Stripe test cards
2. **Form Validation**: Ensure all required fields are validated
3. **Chart Generation**: Test with various birth data combinations
4. **Mobile Responsiveness**: Ensure all pages work on mobile devices

## Future Enhancements

1. **Multiple Chart Types**: Offer different chart styles
2. **PDF Export**: Generate downloadable chart reports
3. **Sharing Features**: Allow users to share charts with friends
4. **Subscription Model**: Consider ongoing analysis updates
5. **AI Insights**: Enhance interpretations with AI-generated content

## Maintenance

- Monitor payment success rates
- Track user drop-off points in the funnel
- Gather feedback on chart accuracy and insights
- Update interpretations based on user feedback
- Maintain astrology calculation accuracy