# Cosmic Codex Payment Integration Plan

## Overview
This document outlines the implementation of a seamless dual payment system for the cosmic codex unlock feature in your Solara application. The system will:

1. **Farcaster Mini App Users**: Direct USDC payment via native wallet
2. **Web/Mobile Web Users**: Choice between crypto (USDC) or fiat (Stripe) payments

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Cosmic Codex Unlock                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐                    │
│  │  Farcaster      │    │  Web/Mobile     │                    │
│  │  Mini App       │    │  Web            │                    │
│  └─────────────────┘    └─────────────────┘                    │
│         │                       │                               │
│         │                       │                               │
│         ▼                       ▼                               │
│  ┌─────────────────┐    ┌─────────────────┐                    │
│  │  USDC Payment   │    │  Payment Choice │                    │
│  │  (Direct)       │    │  Modal          │                    │
│  └─────────────────┘    └─────────────────┘                    │
│                                 │                               │
│                                 │                               │
│                          ┌──────┴──────┐                       │
│                          │             │                       │
│                          ▼             ▼                       │
│                   ┌─────────────┐ ┌─────────────┐              │
│                   │ Crypto      │ │ Fiat        │              │
│                   │ (USDC)      │ │ (Stripe)    │              │
│                   └─────────────┘ └─────────────┘              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Implementation Steps

### 1. Add Cosmic Codex Tab to BookmarkCard

First, we'll add a new tab to the existing soldash page:

```typescript
// In src/components/SunCycleAge.tsx - BookmarkCard component
const [tab, setTab] = useState<'sol age' | 'sol vows' | 'journal' | 'sol sign' | 'cosmic codex'>(initialTab || 'sol age');

// Update tab rendering
{['sol age', 'sol vows', 'journal', 'sol sign', 'cosmic codex'].map((tabName) => (
  <button
    key={tabName}
    onClick={() => setTab(tabName as any)}
    className={`flex-1 min-w-[100px] py-3 px-2 text-xs font-mono uppercase tracking-widest transition-colors duration-200 ${
      tab === tabName 
        ? 'border-b-2 border-black font-bold' 
        : 'text-gray-600 hover:text-black'
    }`}
  >
    {tabName.toUpperCase()}
  </button>
))}
```

### 2. Create Cosmic Codex Payment Component

Create a new component for handling the cosmic codex unlock:

```typescript
// src/components/CosmicCodex/CosmicCodexUnlock.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useFrameSDK } from '~/hooks/useFrameSDK';
import { useAccount } from 'wagmi';
import { useSolarPledge } from '~/hooks/useSolarPledge';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { CryptoPayment } from './CryptoPayment';
import { FiatPayment } from './FiatPayment';

interface CosmicCodexUnlockProps {
  solAge: number;
  userName?: string;
}

export default function CosmicCodexUnlock({ solAge, userName }: CosmicCodexUnlockProps) {
  const { isInFrame, context } = useFrameSDK();
  const { address } = useAccount();
  const [hasUnlocked, setHasUnlocked] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'crypto' | 'fiat' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Check if user has already unlocked cosmic codex
  useEffect(() => {
    const checkUnlockStatus = async () => {
      // Check local storage or API for unlock status
      const unlockStatus = localStorage.getItem(`cosmic-codex-${address}`);
      if (unlockStatus) {
        setHasUnlocked(true);
      }
    };
    
    if (address) {
      checkUnlockStatus();
    }
  }, [address]);

  // Auto-select payment method based on user type
  useEffect(() => {
    if (isInFrame && context?.user?.fid) {
      // Farcaster user - auto-select crypto
      setPaymentMethod('crypto');
    }
  }, [isInFrame, context]);

  const handlePaymentSuccess = () => {
    setHasUnlocked(true);
    localStorage.setItem(`cosmic-codex-${address}`, 'true');
  };

  if (hasUnlocked) {
    return <UnlockedCosmicCodex solAge={solAge} userName={userName} />;
  }

  return (
    <div className="w-full text-sm font-mono space-y-4">
      <div className="text-center space-y-3">
        <div className="text-4xl">📜</div>
        <h2 className="text-xl font-bold">Cosmic Codex</h2>
        <p className="text-gray-600">
          Unlock your personalized cosmic wisdom based on your {solAge} Sol Age rotations
        </p>
      </div>

      <div className="border border-gray-300 rounded p-4 bg-gray-50">
        <h3 className="font-bold mb-2">What you'll unlock:</h3>
        <ul className="text-sm space-y-1 text-gray-700">
          <li>• Personalized cosmic readings</li>
          <li>• Sol Age milestone predictions</li>
          <li>• Astrological insights</li>
          <li>• Exclusive celestial content</li>
        </ul>
      </div>

      {!paymentMethod && !isInFrame && (
        <PaymentMethodSelector onSelect={setPaymentMethod} />
      )}

      {paymentMethod === 'crypto' && (
        <CryptoPayment 
          onSuccess={handlePaymentSuccess}
          isProcessing={isProcessing}
          setIsProcessing={setIsProcessing}
          isFarcasterUser={isInFrame && !!context?.user?.fid}
        />
      )}

      {paymentMethod === 'fiat' && (
        <FiatPayment 
          onSuccess={handlePaymentSuccess}
          isProcessing={isProcessing}
          setIsProcessing={setIsProcessing}
          amount={9.99} // $9.99 for cosmic codex
        />
      )}
    </div>
  );
}

function UnlockedCosmicCodex({ solAge, userName }: { solAge: number; userName?: string }) {
  return (
    <div className="w-full text-sm font-mono space-y-4">
      <div className="text-center space-y-3">
        <div className="text-4xl">✨</div>
        <h2 className="text-xl font-bold text-green-600">Cosmic Codex Unlocked!</h2>
        <p className="text-gray-600">
          Welcome to your personalized cosmic journey, {userName || 'Traveler'}
        </p>
      </div>

      <div className="space-y-4">
        <div className="border border-green-200 rounded p-4 bg-green-50">
          <h3 className="font-bold text-green-800 mb-2">Your Cosmic Profile</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Sol Age:</span>
              <span className="font-bold">{solAge.toLocaleString()} rotations</span>
            </div>
            <div className="flex justify-between">
              <span>Cosmic Phase:</span>
              <span className="font-bold">{getCosmicPhase(solAge)}</span>
            </div>
            <div className="flex justify-between">
              <span>Next Celestial Event:</span>
              <span className="font-bold">{getNextCelestialEvent(solAge)}</span>
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded p-4">
          <h3 className="font-bold mb-2">Cosmic Wisdom</h3>
          <p className="text-sm text-gray-700 italic">
            {getCosmicWisdom(solAge)}
          </p>
        </div>
      </div>
    </div>
  );
}

function getCosmicPhase(solAge: number): string {
  if (solAge < 1000) return "Stellar Initiate";
  if (solAge < 5000) return "Cosmic Wanderer";
  if (solAge < 10000) return "Solar Sage";
  if (solAge < 25000) return "Celestial Master";
  return "Cosmic Elder";
}

function getNextCelestialEvent(solAge: number): string {
  const nextThousand = Math.ceil(solAge / 1000) * 1000;
  const daysUntil = nextThousand - solAge;
  return `${daysUntil} days until ${nextThousand} rotation milestone`;
}

function getCosmicWisdom(solAge: number): string {
  const wisdoms = [
    "The cosmos whispers secrets to those who listen with their solar heart.",
    "Each rotation brings you closer to your celestial destiny.",
    "Your journey through the stars is unique and magnificent.",
    "The universe celebrates every day you've orbited our golden star.",
    "Time is not linear in the cosmic realm - embrace each moment."
  ];
  return wisdoms[solAge % wisdoms.length];
}
```

### 3. Payment Method Selector Component

```typescript
// src/components/CosmicCodex/PaymentMethodSelector.tsx
'use client';

import React from 'react';

interface PaymentMethodSelectorProps {
  onSelect: (method: 'crypto' | 'fiat') => void;
}

export function PaymentMethodSelector({ onSelect }: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-bold text-center">Choose Payment Method</h3>
      
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onSelect('crypto')}
          className="border border-gray-300 rounded p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="text-2xl mb-2">₿</div>
          <div className="font-bold text-sm">Crypto</div>
          <div className="text-xs text-gray-600">Pay with USDC</div>
          <div className="text-xs text-green-600 mt-1">$7.99</div>
        </button>
        
        <button
          onClick={() => onSelect('fiat')}
          className="border border-gray-300 rounded p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="text-2xl mb-2">💳</div>
          <div className="font-bold text-sm">Credit Card</div>
          <div className="text-xs text-gray-600">Pay with card</div>
          <div className="text-xs text-blue-600 mt-1">$9.99</div>
        </button>
      </div>
      
      <div className="text-xs text-gray-500 text-center">
        Crypto payment is discounted for early adopters
      </div>
    </div>
  );
}
```

### 4. Crypto Payment Component

```typescript
// src/components/CosmicCodex/CryptoPayment.tsx
'use client';

import React, { useState } from 'react';
import { useAccount, useWriteContract, useReadContract } from 'wagmi';
import { parseUnits } from 'viem';
import { USDC_ADDRESS, USDC_ABI } from '~/lib/contracts';
import { SpinnerButton } from '~/components/ui/SpinnerButton';

interface CryptoPaymentProps {
  onSuccess: () => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
  isFarcasterUser: boolean;
}

export function CryptoPayment({ 
  onSuccess, 
  isProcessing, 
  setIsProcessing,
  isFarcasterUser 
}: CryptoPaymentProps) {
  const { address } = useAccount();
  const { writeContract } = useWriteContract();
  const [error, setError] = useState<string | null>(null);
  
  const COSMIC_CODEX_PRICE = parseUnits('7.99', 6); // $7.99 USDC
  const TREASURY_ADDRESS = '0x1234567890123456789012345678901234567890'; // Replace with actual treasury

  // Check USDC balance
  const { data: usdcBalance } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: [address ?? '0x0000000000000000000000000000000000000000'],
    query: { enabled: !!address },
  });

  const handlePayment = async () => {
    if (!address) {
      setError('Please connect your wallet');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Check if user has enough USDC
      if (!usdcBalance || usdcBalance < COSMIC_CODEX_PRICE) {
        throw new Error('Insufficient USDC balance');
      }

      // Transfer USDC to treasury
      await writeContract({
        address: USDC_ADDRESS,
        abi: USDC_ABI,
        functionName: 'transfer',
        args: [TREASURY_ADDRESS, COSMIC_CODEX_PRICE],
      });

      // If successful, trigger success callback
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const usdcBalanceFormatted = usdcBalance 
    ? (Number(usdcBalance) / 1_000_000).toFixed(2)
    : '0.00';

  return (
    <div className="space-y-4">
      <div className="border border-gray-300 rounded p-4">
        <h3 className="font-bold mb-2">Crypto Payment</h3>
        <div className="text-sm space-y-2">
          <div className="flex justify-between">
            <span>Price:</span>
            <span className="font-bold">$7.99 USDC</span>
          </div>
          <div className="flex justify-between">
            <span>Your Balance:</span>
            <span className={`font-bold ${Number(usdcBalanceFormatted) >= 7.99 ? 'text-green-600' : 'text-red-600'}`}>
              ${usdcBalanceFormatted} USDC
            </span>
          </div>
        </div>
      </div>

      {isFarcasterUser && (
        <div className="bg-blue-50 border border-blue-200 rounded p-3">
          <div className="text-sm text-blue-800">
            <strong>Farcaster User Detected!</strong> Payment will be processed through your connected wallet.
          </div>
        </div>
      )}

      <SpinnerButton
        onClick={handlePayment}
        disabled={isProcessing || !address || Number(usdcBalanceFormatted) < 7.99}
        className="w-full bg-[#d4af37] text-black font-mono text-base tracking-widest uppercase border border-black rounded-none hover:bg-[#e6c75a] transition-colors disabled:opacity-50"
      >
        {isProcessing ? 'PROCESSING...' : 'UNLOCK WITH USDC'}
      </SpinnerButton>

      {error && (
        <div className="text-red-600 text-sm text-center">
          {error}
        </div>
      )}

      {Number(usdcBalanceFormatted) < 7.99 && (
        <div className="text-sm text-gray-600 text-center">
          You need at least $7.99 USDC to unlock the Cosmic Codex
        </div>
      )}
    </div>
  );
}
```

### 5. Fiat Payment Component with Stripe

```typescript
// src/components/CosmicCodex/FiatPayment.tsx
'use client';

import React, { useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { CheckoutForm } from './CheckoutForm';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface FiatPaymentProps {
  onSuccess: () => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
  amount: number;
}

export function FiatPayment({ 
  onSuccess, 
  isProcessing, 
  setIsProcessing,
  amount 
}: FiatPaymentProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreatePaymentIntent = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount * 100, // Convert to cents
          currency: 'usd',
          description: 'Cosmic Codex Unlock',
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment intent');
      }

      setClientSecret(data.clientSecret);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#d4af37',
      colorBackground: '#ffffff',
      colorText: '#000000',
      fontFamily: 'monospace',
    },
  };

  if (!clientSecret) {
    return (
      <div className="space-y-4">
        <div className="border border-gray-300 rounded p-4">
          <h3 className="font-bold mb-2">Credit Card Payment</h3>
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span>Cosmic Codex Unlock:</span>
              <span className="font-bold">${amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Processing Fee:</span>
              <span>$0.00</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold">
              <span>Total:</span>
              <span>${amount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleCreatePaymentIntent}
          disabled={isProcessing}
          className="w-full bg-[#d4af37] text-black font-mono text-base tracking-widest uppercase border border-black rounded-none hover:bg-[#e6c75a] transition-colors disabled:opacity-50"
        >
          {isProcessing ? 'PREPARING...' : 'CONTINUE TO PAYMENT'}
        </button>

        {error && (
          <div className="text-red-600 text-sm text-center">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border border-gray-300 rounded p-4">
        <h3 className="font-bold mb-2">Complete Payment</h3>
        <div className="text-sm">
          <div className="flex justify-between font-bold">
            <span>Total:</span>
            <span>${amount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <Elements 
        stripe={stripePromise} 
        options={{ 
          clientSecret, 
          appearance 
        }}
      >
        <CheckoutForm 
          onSuccess={onSuccess}
          onError={setError}
          isProcessing={isProcessing}
          setIsProcessing={setIsProcessing}
        />
      </Elements>

      {error && (
        <div className="text-red-600 text-sm text-center">
          {error}
        </div>
      )}
    </div>
  );
}
```

### 6. Stripe Checkout Form

```typescript
// src/components/CosmicCodex/CheckoutForm.tsx
'use client';

import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { SpinnerButton } from '~/components/ui/SpinnerButton';

interface CheckoutFormProps {
  onSuccess: () => void;
  onError: (error: string) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

export function CheckoutForm({ 
  onSuccess, 
  onError, 
  isProcessing, 
  setIsProcessing 
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const result = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (result.error) {
        onError(result.error.message || 'Payment failed');
      } else if (result.paymentIntent.status === 'succeeded') {
        onSuccess();
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      
      <SpinnerButton
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-[#d4af37] text-black font-mono text-base tracking-widest uppercase border border-black rounded-none hover:bg-[#e6c75a] transition-colors disabled:opacity-50"
      >
        {isProcessing ? 'PROCESSING...' : 'UNLOCK COSMIC CODEX'}
      </SpinnerButton>
    </form>
  );
}
```

### 7. Stripe API Route

```typescript
// src/app/api/stripe/create-payment-intent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = 'usd', description } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Amount in cents
      currency,
      description,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
```

### 8. Integration with BookmarkCard

Update the BookmarkCard component to include the cosmic codex tab:

```typescript
// In src/components/SunCycleAge.tsx - BookmarkCard component
import CosmicCodexUnlock from '../CosmicCodex/CosmicCodexUnlock';

// Add cosmic codex tab content
{tab === 'cosmic codex' && (
  <div className="w-full text-sm font-mono space-y-3">
    <CosmicCodexUnlock 
      solAge={bookmark.days} 
      userName={bookmark.userName || 'Traveler'} 
    />
  </div>
)}
```

### 9. Environment Variables

Add these to your `.env.local`:

```env
# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_SECRET_KEY=sk_test_your_secret_key

# Treasury wallet for USDC payments
COSMIC_CODEX_TREASURY_ADDRESS=0x1234567890123456789012345678901234567890
```

## Key Features

1. **Automatic Payment Method Selection**: Farcaster users see crypto payment directly, web users get a choice
2. **Discounted Crypto Pricing**: $7.99 USDC vs $9.99 fiat to incentivize crypto adoption
3. **Seamless UX**: Native wallet integration for Farcaster, Stripe Elements for web
4. **Unlock Persistence**: Local storage tracks unlock status
5. **Rich Content**: Personalized cosmic content based on Sol Age
6. **Error Handling**: Comprehensive error states and user feedback

## Next Steps

1. Deploy the components to your codebase
2. Set up Stripe account and get API keys
3. Configure treasury wallet address
4. Test with both Farcaster and web users
5. Add webhook handling for payment confirmations
6. Consider adding premium tiers or subscription model

This implementation provides a seamless experience for both user types while maintaining the cosmic theme of your application.