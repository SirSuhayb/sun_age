'use client';

import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { motion } from 'framer-motion';
import { CreditCard } from 'lucide-react';

interface StripePaymentFormProps {
  selectedPlan: 'monthly' | 'yearly';
  planPrice: string;
  onSuccess: () => void;
}

export const StripePaymentForm: React.FC<StripePaymentFormProps> = ({ 
  selectedPlan, 
  planPrice,
  onSuccess 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!stripe || !elements || !email) {
      setError('Please fill in all fields');
      return;
    }

    setProcessing(true);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error('Card element not found');

      // Create payment method
      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          email: email,
        },
      });

      if (pmError || !paymentMethod) {
        throw pmError || new Error('Failed to create payment method');
      }

      // Create subscription
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: selectedPlan,
          paymentMethodId: paymentMethod.id,
          email: email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create subscription');
      }

      // Handle successful subscription
      console.log('Subscription created:', data);
      onSuccess();

    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-mono uppercase tracking-wide text-[#666] mb-2">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 border border-[#E5E1D8] bg-white focus:outline-none focus:border-[#E6B13A] transition-colors"
          placeholder="your@email.com"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-mono uppercase tracking-wide text-[#666] mb-2">
          Card Details
        </label>
        <div className="p-4 border border-[#E5E1D8] bg-white">
          <CardElement 
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
              hidePostalCode: true,
            }}
          />
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <div className="text-sm text-[#666] space-y-1">
        <p>• 7-day free trial - cancel anytime</p>
        <p>• You won&apos;t be charged until after your trial ends</p>
        <p>• Secure payment powered by Stripe</p>
      </div>

      <motion.button
        type="submit"
        disabled={!stripe || processing}
        className={`w-full py-4 ${
          processing || !stripe
            ? 'bg-[#D7D7D7] cursor-not-allowed' 
            : 'bg-[#E6B13A] hover:bg-[#D4A02A]'
        } text-black font-mono text-lg tracking-widest uppercase border-none transition-colors flex items-center justify-center space-x-2`}
        whileHover={!processing && stripe ? { scale: 1.02 } : {}}
        whileTap={!processing && stripe ? { scale: 0.98 } : {}}
      >
        {processing ? (
          <>
            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
            <span>Processing...</span>
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            <span>Start Free Trial - {planPrice}</span>
          </>
        )}
      </motion.button>
    </form>
  );
};