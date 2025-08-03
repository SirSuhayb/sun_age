'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, CreditCard, Wallet, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DaimoPayButton } from '@daimo/pay';
import { useAccount, useReadContract, useConnect } from 'wagmi';
import { formatUnits } from 'viem';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { StripePaymentForm } from '~/components/Soldash/StripePaymentForm';
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
const REQUIRED_SOLAR_AMOUNT = 500_000_000; // 500M tokens

const features = [
  { icon: '✨', text: 'Personal power phrases for your cosmic trinity' },
  { icon: '🌟', text: 'Deep synthesis of Sun, Moon & Rising combinations' },
  { icon: '📅', text: 'Life phase timing and breakthrough predictions' },
  { icon: '🧭', text: 'Daily integration practices and rituals' },
  { icon: '🏛️', text: 'Equal House system comparison' },
];

export default function PaymentPage() {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'daimo'>('stripe');
  const [hasFreeTier, setHasFreeTier] = useState(false);
  const [isCheckingTokens, setIsCheckingTokens] = useState(true);
  const router = useRouter();

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
    // Check if already has access
    const subscription = checkSubscriptionStatus();
    if (subscription.hasAccess) {
      router.push('/soldash/you/expand/details');
      return;
    }

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
          // Redirect to details if they qualify
          router.push('/soldash/you/expand/details');
        }
      } catch (error) {
        console.error('Error parsing SOLAR balance:', error);
        setHasFreeTier(false);
      }
      setIsCheckingTokens(false);
    }
  }, [solarBalance, isLoadingBalance, address, isConnected, router]);

  const plans = {
    monthly: {
      price: 7.77,
      period: 'month',
      total: '$7.77/month',
      description: 'Monthly access to Sol Codex Pro',
      // Daimo requires $10 minimum, so we'll only show yearly for crypto
      daimoPrice: 10
    },
    yearly: {
      price: 77,
      period: 'year', 
      total: '$77/year',
      description: 'Save $16.24 with annual access',
      daimoPrice: 77
    }
  };

  const handlePaymentSuccess = () => {
    saveSubscriptionData(selectedPlan);
    router.push('/soldash/you/expand/details');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="min-h-screen bg-[#FEFDF8] p-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-md mx-auto">
        {/* Header */}
        <motion.div className="flex items-center mb-6" variants={itemVariants}>
          <Link href="/soldash/you/expand/chart" className="mr-4">
            <ArrowLeft className="w-6 h-6 text-[#888]" />
          </Link>
          <h1 className="text-xl font-serif font-semibold">Sol Codex Pro</h1>
        </motion.div>

        {/* Main Content */}
        <motion.div 
          className="bg-white border border-[#D7D7D7] p-6"
          variants={itemVariants}
        >
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">✨</div>
            <h2 className="text-2xl font-serif font-bold mb-2">Unlock Deeper Insights</h2>
            <p className="text-sm text-[#666]">
              Go beyond the basics with advanced cosmic analysis
            </p>
          </div>

          {/* Features */}
          <div className="mb-6 space-y-2">
            {features.map((feature, idx) => (
              <motion.div 
                key={idx}
                className="flex items-start text-sm"
                variants={itemVariants}
              >
                <span className="mr-2">{feature.icon}</span>
                <span className="text-[#444]">{feature.text}</span>
              </motion.div>
            ))}
          </div>

          {/* Loading state */}
          {isCheckingTokens && isConnected && (
            <motion.div 
              className="text-center py-6"
              variants={itemVariants}
            >
              <div className="w-8 h-8 border-2 border-[#E6B13A] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm text-[#666]">Checking SOLAR balance...</p>
            </motion.div>
          )}

          {/* Payment Options */}
          {!isCheckingTokens && !hasFreeTier && (
            <>
              {/* Plan Selection */}
              <motion.div className="mb-6" variants={itemVariants}>
                <h3 className="text-sm font-mono uppercase text-[#666] mb-3">Choose Plan</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSelectedPlan('monthly')}
                    className={`p-3 border-2 transition-all text-center ${
                      selectedPlan === 'monthly'
                        ? 'border-[#E6B13A] bg-[#FCF6E5]'
                        : 'border-[#E5E1D8] hover:border-[#D7D7D7]'
                    }`}
                  >
                    <div className="text-lg font-bold">$7.77</div>
                    <div className="text-xs text-[#666]">per month</div>
                  </button>
                  <button
                    onClick={() => setSelectedPlan('yearly')}
                    className={`p-3 border-2 transition-all text-center relative ${
                      selectedPlan === 'yearly'
                        ? 'border-[#E6B13A] bg-[#FCF6E5]'
                        : 'border-[#E5E1D8] hover:border-[#D7D7D7]'
                    }`}
                  >
                    <div className="text-lg font-bold">$77</div>
                    <div className="text-xs text-[#666]">per year</div>
                    <div className="absolute -top-2 -right-2 bg-[#E6B13A] text-black text-xs px-2 py-0.5 font-bold">
                      SAVE $16
                    </div>
                  </button>
                </div>
              </motion.div>

              {/* Payment Method */}
              <motion.div className="mb-6" variants={itemVariants}>
                <h3 className="text-sm font-mono uppercase text-[#666] mb-3">Payment Method</h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => setPaymentMethod('stripe')}
                    className={`flex-1 p-3 border-2 transition-all flex items-center justify-center ${
                      paymentMethod === 'stripe'
                        ? 'border-[#E6B13A] bg-[#FCF6E5]'
                        : 'border-[#E5E1D8] hover:border-[#D7D7D7]'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    <span className="text-sm">Card</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('daimo')}
                    className={`flex-1 p-3 border-2 transition-all flex items-center justify-center ${
                      paymentMethod === 'daimo'
                        ? 'border-[#E6B13A] bg-[#FCF6E5]'
                        : 'border-[#E5E1D8] hover:border-[#D7D7D7]'
                    }`}
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    <span className="text-sm">Crypto</span>
                  </button>
                </div>
              </motion.div>

              {/* Daimo minimum warning */}
              {paymentMethod === 'daimo' && selectedPlan === 'monthly' && (
                <motion.div 
                  className="mb-4 p-3 bg-amber-50 border border-amber-200 text-xs"
                  variants={itemVariants}
                >
                  <p className="text-amber-800">
                    <strong>Note:</strong> Due to Daimo&apos;s $10 minimum, monthly crypto payments are charged at $10 (you get the extra $2.23 as credit).
                  </p>
                </motion.div>
              )}

              {/* Payment Form */}
              <motion.div variants={itemVariants}>
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
                    toUnits={plans[selectedPlan].daimoPrice.toString()}
                    intent={`Sol Codex ${selectedPlan} subscription`}
                    onPaymentCompleted={handlePaymentSuccess}
                  >
                    {({ show }) => (
                      <button
                        onClick={show}
                        className="w-full py-3 bg-[#E6B13A] hover:bg-[#D4A02A] text-black font-mono text-sm uppercase tracking-wide transition-colors"
                      >
                        Pay with Crypto
                      </button>
                    )}
                  </DaimoPayButton.Custom>
                )}
              </motion.div>

              {/* Connect wallet option */}
              {!isConnected && (
                <motion.div 
                  className="mt-4 p-3 bg-[#FCF6E5] border border-[#E5E1D8] text-center"
                  variants={itemVariants}
                >
                  <p className="text-xs text-[#666] mb-2">
                    Have 500M+ SOLAR tokens?
                  </p>
                  <button
                    onClick={() => {
                      if (connectors && connectors.length > 0) {
                        const connector = connectors.find(c => c.ready) || connectors[0];
                        connect({ connector });
                      } else {
                        // Fallback to manual wallet connection
                        window.open('https://app.uniswap.org/swap?outputCurrency=0x746042147240304098C837563aAEc0F671881B07&chain=base', '_blank');
                      }
                    }}
                    className="text-sm text-[#E6B13A] hover:text-[#D4A02A] font-mono"
                  >
                    Connect Wallet for Free Access
                  </button>
                </motion.div>
              )}
            </>
          )}

          {/* SOLAR token info for connected users without enough tokens */}
          {isConnected && !isCheckingTokens && !hasFreeTier && solarBalance !== undefined && (
            <motion.div 
              className="mt-4 p-3 bg-[#FCF6E5] border border-[#E5E1D8] text-center"
              variants={itemVariants}
            >
              <p className="text-xs text-[#666] mb-2">
                You have {Math.floor(Number(formatUnits(solarBalance as bigint, 18)) / 1_000_000)}M SOLAR tokens
              </p>
              <p className="text-xs text-[#666] mb-3">
                Need 500M+ for free access (currently ~$183 USD)
              </p>
              <a
                href="https://app.uniswap.org/swap?outputCurrency=0x746042147240304098C837563aAEc0F671881B07&chain=base"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-[#E6B13A] hover:text-[#D4A02A] font-mono"
              >
                Swap for SOLAR on Uniswap →
              </a>
            </motion.div>
          )}
        </motion.div>

        {/* Back Link */}
        <motion.div className="text-center mt-6" variants={itemVariants}>
          <Link href="/soldash/you/expand/chart" className="text-[#888] font-mono text-sm hover:text-[#666]">
            ← Back to Your Chart
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}