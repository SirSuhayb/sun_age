'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Check, Sparkles, CreditCard, Wallet } from 'lucide-react';
import { DaimoPayButton } from '@daimo/pay';
import { useAccount, useReadContract, useConnect } from 'wagmi';
import { formatUnits } from 'viem';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { StripePaymentForm } from './StripePaymentForm';
import { checkSubscriptionStatus, saveSubscriptionData } from '~/lib/subscription';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// SOLAR token configuration
const SOLAR_TOKEN_ADDRESS = '0x746042147240304098C837563aAEc0F671881B07' as `0x${string}`;
const SOLAR_TOKEN_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;
const REQUIRED_SOLAR_AMOUNT = 500_000_000;

const features = [
  {
    id: 'power-phrases',
    icon: '✨',
    title: 'Personal Power Phrases',
    description: 'Unique affirmations for your Sun, Moon & Rising signs',
    preview: [
      'Sun: "I channel future frequencies to liberate humanity"',
      'Moon: "I desire freedom from limitations and space to innovate"',
      'Rising: "I walk as a harbinger of progressive change"'
    ]
  },
  {
    id: 'cosmic-trinity',
    icon: '🌟',
    title: 'Cosmic Trinity Synthesis',
    description: 'Deep analysis of your Sun, Moon & Rising combination',
    preview: [
      'Special configurations (double/triple signs)',
      'Stellium analysis and concentrations',
      'Element balance and soul purpose',
      'Evolutionary path integration'
    ]
  },
  {
    id: 'life-phases',
    icon: '📅',
    title: 'Life Phase Timing',
    description: 'Navigate your cosmic cycles with precision',
    preview: [
      'Saturn return insights',
      'Jupiter expansion cycles',
      'Progressed moon phases',
      'Breakthrough timing predictions'
    ]
  },
  {
    id: 'integration',
    icon: '🧭',
    title: 'Daily Integration Practices',
    description: 'Align your daily life with cosmic rhythms',
    preview: [
      'Morning alignment rituals',
      'Planetary day guidance',
      'Monthly moon practices',
      'Seasonal transformations'
    ]
  },
  {
    id: 'equal-house',
    icon: '🏛️',
    title: 'Equal House System',
    description: 'Compare both house systems for deeper insight',
    preview: [
      'Toggle between Whole Sign and Equal House',
      'See how placements shift between systems',
      'Understand different interpretive lenses',
      'Professional-level chart analysis'
    ]
  }
];

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentModal({ isOpen, onClose, onSuccess }: PaymentModalProps) {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'daimo'>('stripe');
  const [hasFreeTier, setHasFreeTier] = useState(false);
  const [isCheckingTokens, setIsCheckingTokens] = useState(true);
  const [showPayment, setShowPayment] = useState(false);

  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();

  // Check SOLAR token balance
  const { data: solarBalance, isLoading: isLoadingBalance } = useReadContract({
    address: SOLAR_TOKEN_ADDRESS,
    abi: SOLAR_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined
  });

  useEffect(() => {
    if (!address || !isConnected) {
      setIsCheckingTokens(false);
      setHasFreeTier(false);
      return;
    }
    
    if (!isLoadingBalance && solarBalance !== undefined && solarBalance !== null) {
      try {
        const balanceInWei = solarBalance as bigint;
        const balance = Number(formatUnits(balanceInWei, 18));
        const qualifiesForFreeTier = balance >= REQUIRED_SOLAR_AMOUNT;
        setHasFreeTier(qualifiesForFreeTier);
        
        if (qualifiesForFreeTier) {
          saveSubscriptionData('solar');
        }
      } catch (error) {
        console.error('Error parsing SOLAR balance:', error);
        setHasFreeTier(false);
      }
      setIsCheckingTokens(false);
    }
  }, [solarBalance, isLoadingBalance, address, isConnected]);

  const plans = {
    monthly: {
      price: 7.77,
      period: 'month',
      total: '$7.77/month',
      description: 'Monthly access to Sol Codex Pro'
    },
    yearly: {
      price: 77,
      period: 'year', 
      total: '$77/year',
      description: 'Save $16.24 with annual access'
    }
  };

  const handlePaymentSuccess = () => {
    saveSubscriptionData(selectedPlan);
    onSuccess();
  };

  const nextFeature = () => {
    setCurrentFeature((prev) => (prev + 1) % features.length);
  };

  const prevFeature = () => {
    setCurrentFeature((prev) => (prev - 1 + features.length) % features.length);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-2xl bg-white border-2 border-[#E6B13A] shadow-xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-[#FCF6E5] transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {hasFreeTier ? (
              /* Free tier access */
              <div className="p-8 text-center">
                <Sparkles className="w-16 h-16 text-[#E6B13A] mx-auto mb-4" />
                <h2 className="text-3xl font-serif font-bold mb-4">SOLAR Holder Benefits</h2>
                <p className="text-lg text-[#666] mb-6">
                  As a holder of 500M+ SOLAR tokens, you have free access to Sol Codex Pro!
                </p>
                <button
                  onClick={handlePaymentSuccess}
                  className="px-8 py-3 bg-[#E6B13A] hover:bg-[#D4A02A] text-black font-mono uppercase tracking-wide transition-colors"
                >
                  Activate Free Access
                </button>
              </div>
            ) : !showPayment ? (
              /* Feature carousel */
              <div className="p-8">
                <h2 className="text-2xl font-serif font-bold text-center mb-2">Sol Codex Pro</h2>
                <p className="text-center text-[#666] mb-8">Unlock deeper cosmic insights</p>

                {/* Feature display */}
                <div className="relative h-64 mb-8">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentFeature}
                      className="absolute inset-0"
                      initial={{ opacity: 0, x: 100 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="text-center">
                        <div className="text-6xl mb-4">{features[currentFeature].icon}</div>
                        <h3 className="text-xl font-serif font-semibold mb-2">
                          {features[currentFeature].title}
                        </h3>
                        <p className="text-[#666] mb-4">{features[currentFeature].description}</p>
                        <ul className="text-sm text-left max-w-md mx-auto space-y-2">
                          {features[currentFeature].preview.map((item, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-[#E6B13A] mr-2">✦</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between mb-8">
                  <button
                    onClick={prevFeature}
                    className="p-2 hover:bg-[#FCF6E5] transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  
                  <div className="flex space-x-2">
                    {features.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentFeature(idx)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          idx === currentFeature ? 'bg-[#E6B13A]' : 'bg-[#DDD]'
                        }`}
                      />
                    ))}
                  </div>
                  
                  <button
                    onClick={nextFeature}
                    className="p-2 hover:bg-[#FCF6E5] transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>

                {/* CTA */}
                <button
                  onClick={() => setShowPayment(true)}
                  className="w-full py-3 bg-[#E6B13A] hover:bg-[#D4A02A] text-black font-mono uppercase tracking-wide transition-colors"
                >
                  Unlock Sol Codex Pro
                </button>
              </div>
            ) : (
              /* Payment options */
              <div className="p-8">
                <button
                  onClick={() => setShowPayment(false)}
                  className="flex items-center text-[#666] hover:text-[#444] mb-4"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back to features
                </button>

                <h2 className="text-2xl font-serif font-bold text-center mb-8">Choose Your Plan</h2>

                {/* Plan selection */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {Object.entries(plans).map(([key, plan]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedPlan(key as 'monthly' | 'yearly')}
                      className={`p-4 border-2 transition-all ${
                        selectedPlan === key
                          ? 'border-[#E6B13A] bg-[#FCF6E5]'
                          : 'border-[#E5E1D8] hover:border-[#D7D7D7]'
                      }`}
                    >
                      <div className="text-2xl font-bold">{plan.total}</div>
                      <div className="text-sm text-[#666]">{plan.description}</div>
                      {key === 'yearly' && (
                        <div className="text-xs bg-[#E6B13A] text-black px-2 py-1 mt-2 inline-block">
                          SAVE $16
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Payment method selection */}
                <div className="flex gap-4 mb-8">
                  <button
                    onClick={() => setPaymentMethod('stripe')}
                    className={`flex-1 p-3 border-2 transition-all flex items-center justify-center ${
                      paymentMethod === 'stripe'
                        ? 'border-[#E6B13A] bg-[#FCF6E5]'
                        : 'border-[#E5E1D8] hover:border-[#D7D7D7]'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 mr-2" />
                    Card
                  </button>
                  <button
                    onClick={() => setPaymentMethod('daimo')}
                    className={`flex-1 p-3 border-2 transition-all flex items-center justify-center ${
                      paymentMethod === 'daimo'
                        ? 'border-[#E6B13A] bg-[#FCF6E5]'
                        : 'border-[#E5E1D8] hover:border-[#D7D7D7]'
                    }`}
                  >
                    <Wallet className="w-5 h-5 mr-2" />
                    Crypto
                  </button>
                </div>

                {/* Payment form */}
                {paymentMethod === 'stripe' ? (
                  <Elements stripe={stripePromise}>
                    <StripePaymentForm
                      selectedPlan={selectedPlan}
                      planPrice={plans[selectedPlan].total}
                      onSuccess={handlePaymentSuccess}
                    />
                  </Elements>
                ) : (
                  <DaimoPayButton.Custom
                    appId="pay-demo"
                    toAddress={process.env.NEXT_PUBLIC_TREASURY_ADDRESS as `0x${string}` || '0x11BA1632fd6Cc120D309158298e3a0df3B7ba283'}
                    toChain={8453}
                    toToken="0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
                    toUnits={plans[selectedPlan].price.toString()}
                    intent={`Sol Codex ${selectedPlan} subscription`}
                    onPaymentCompleted={handlePaymentSuccess}
                  >
                    {({ show }) => (
                      <button
                        onClick={show}
                        className="w-full py-3 bg-[#E6B13A] hover:bg-[#D4A02A] text-black font-mono uppercase tracking-wide transition-colors"
                      >
                        Pay with Crypto
                      </button>
                    )}
                  </DaimoPayButton.Custom>
                )}

                {/* Connect wallet option */}
                {!isConnected && (
                  <div className="mt-4 p-4 bg-[#FCF6E5] border border-[#E5E1D8] text-center">
                    <p className="text-sm text-[#666] mb-2">
                      Have 500M+ SOLAR tokens? Get free access!
                    </p>
                    <button
                      onClick={() => connectors[0] && connect({ connector: connectors[0] })}
                      className="text-sm text-[#E6B13A] hover:text-[#D4A02A] font-mono"
                    >
                      Connect Wallet
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}