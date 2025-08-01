#!/bin/bash

# Sol Codex Stripe Product Setup Script
# This script creates the required products and prices in Stripe using curl

echo "🚀 Sol Codex Stripe Setup"
echo "========================="
echo ""

# Check if STRIPE_SECRET_KEY is set
if [ -z "$STRIPE_SECRET_KEY" ]; then
    echo "❌ Error: STRIPE_SECRET_KEY environment variable is required"
    echo ""
    echo "Set it with:"
    echo "export STRIPE_SECRET_KEY=sk_test_your_key_here"
    exit 1
fi

echo "Using Stripe key: ${STRIPE_SECRET_KEY:0:15}..."
echo ""

# Create the product
echo "📦 Creating Sol Codex product..."
PRODUCT_RESPONSE=$(curl -s https://api.stripe.com/v1/products \
  -u "$STRIPE_SECRET_KEY:" \
  -d "name=Sol Codex" \
  -d "description=Expand your understanding with complete natal chart analysis" \
  -d "metadata[feature]=sol-codex")

PRODUCT_ID=$(echo $PRODUCT_RESPONSE | grep -o '"id": "[^"]*' | grep -o '[^"]*$' | head -1)

if [ -z "$PRODUCT_ID" ]; then
    echo "❌ Failed to create product. Response:"
    echo $PRODUCT_RESPONSE
    exit 1
fi

echo "✅ Created product: $PRODUCT_ID"
echo ""

# Create monthly price ($7.77)
echo "💰 Creating monthly price ($7.77/month)..."
MONTHLY_RESPONSE=$(curl -s https://api.stripe.com/v1/prices \
  -u "$STRIPE_SECRET_KEY:" \
  -d "product=$PRODUCT_ID" \
  -d "unit_amount=777" \
  -d "currency=usd" \
  -d "recurring[interval]=month" \
  -d "metadata[plan]=monthly")

MONTHLY_PRICE_ID=$(echo $MONTHLY_RESPONSE | grep -o '"id": "[^"]*' | grep -o '[^"]*$' | head -1)

if [ -z "$MONTHLY_PRICE_ID" ]; then
    echo "❌ Failed to create monthly price. Response:"
    echo $MONTHLY_RESPONSE
    exit 1
fi

echo "✅ Created monthly price: $MONTHLY_PRICE_ID"
echo ""

# Create yearly price ($77.00)
echo "💰 Creating yearly price ($77.00/year)..."
YEARLY_RESPONSE=$(curl -s https://api.stripe.com/v1/prices \
  -u "$STRIPE_SECRET_KEY:" \
  -d "product=$PRODUCT_ID" \
  -d "unit_amount=7700" \
  -d "currency=usd" \
  -d "recurring[interval]=year" \
  -d "metadata[plan]=yearly")

YEARLY_PRICE_ID=$(echo $YEARLY_RESPONSE | grep -o '"id": "[^"]*' | grep -o '[^"]*$' | head -1)

if [ -z "$YEARLY_PRICE_ID" ]; then
    echo "❌ Failed to create yearly price. Response:"
    echo $YEARLY_RESPONSE
    exit 1
fi

echo "✅ Created yearly price: $YEARLY_PRICE_ID"
echo ""

# Output the environment variables
echo "📋 Add these to your Vercel environment variables:"
echo "================================================="
echo ""
echo "STRIPE_SOL_CODEX_MONTHLY_PRICE_ID=$MONTHLY_PRICE_ID"
echo "STRIPE_SOL_CODEX_YEARLY_PRICE_ID=$YEARLY_PRICE_ID"
echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Copy the price IDs above"
echo "2. Go to Vercel project settings > Environment Variables"
echo "3. Add both variables for Preview and Production environments"
echo ""
echo "View your products at: https://dashboard.stripe.com/products"