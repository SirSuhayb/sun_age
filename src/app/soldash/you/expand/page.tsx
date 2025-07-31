'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Star, CreditCard, Wallet, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useAccount, useReadContract } from 'wagmi';
import { formatUnits } from 'viem';

const features = [
  { icon: '🎯', label: 'Life Focus', description: 'Discover your core life themes and purpose' },
  { icon: '⚡', label: 'Energy Rhythms', description: 'Understand your natural energy cycles' },
  { icon: '🧩', label: 'Natural Strengths', description: 'Unlock your inherent talents and gifts' },
  { icon: '📅', label: 'Annual Resets', description: 'Navigate your yearly transformation periods' },
  { icon: '🌊', label: 'Growth Phases', description: 'Track your evolutionary development' },
  { icon: '🛑', label: 'Breakthroughs', description: 'Anticipate major life shifts and opportunities' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// SOLAR token contract (replace with actual contract address)
const SOLAR_TOKEN_ADDRESS = '0x0000000000000000000000000000000000000001' as const; // TODO: Add actual SOLAR token address
const SOLAR_TOKEN_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function'
  }
] as const;

const REQUIRED_SOLAR_AMOUNT = 500_000_000; // 500M SOLAR tokens

export default function ExpandPaymentPage() {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'daimo'>('stripe');
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasFreeTier, setHasFreeTier] = useState(false);
  const [isCheckingTokens, setIsCheckingTokens] = useState(true);
  
  const { address, isConnected } = useAccount();
  
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
    
    if (!isLoadingBalance) {
      if (solarBalance) {
        const balance = Number(formatUnits(solarBalance, 18)); // Assuming 18 decimals
        setHasFreeTier(balance >= REQUIRED_SOLAR_AMOUNT);
      }
      setIsCheckingTokens(false);
    }
  }, [solarBalance, isLoadingBalance, address, isConnected]);

  const plans = {
    monthly: {
      price: 7.77,
      period: 'month',
      total: '$7.77/month',
      description: 'Monthly access to your Sol Codex',
      savings: false
    },
    yearly: {
      price: 77,
      period: 'year',
      total: '$77/year',
      description: 'Full year access - Save $16.24!',
      savings: true
    }
  };

  const handleStripePayment = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: selectedPlan,
          amount: plans[selectedPlan].price * 100, // Convert to cents
        }),
      });

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Stripe payment failed:', error);
      setIsProcessing(false);
    }
  };

  const handleDaimoPayment = async () => {
    setIsProcessing(true);
    try {
      // TODO: Integrate Daimo payment
      console.log('Processing Daimo payment for', selectedPlan, 'plan');
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirect to data collection
      window.location.href = '/soldash/you/expand/collect-data';
    } catch (error) {
      console.error('Daimo payment failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (paymentMethod === 'stripe') {
      await handleStripePayment();
    } else {
      await handleDaimoPayment();
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-[#FEFDF8] p-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div className="flex items-center mb-8" variants={itemVariants}>
          <Link href="/soldash/you" className="mr-4">
            <ArrowLeft className="w-6 h-6 text-[#888]" />
          </Link>
          <h1 className="text-2xl font-serif font-semibold">Expand Your Understanding</h1>
        </motion.div>

        {/* Main Content */}
        <motion.div 
          className="bg-white border border-[#D7D7D7] p-8 mb-6"
          variants={itemVariants}
        >
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="text-3xl font-serif font-semibold mb-2">Sol Codex</div>
            <div className="text-lg text-[#666] font-mono uppercase tracking-wide">
              Expand your understanding
            </div>
          </div>
          
          {/* Free Tier Banner for SOLAR holders */}
          {hasFreeTier && (
            <motion.div 
              className="mb-8 p-6 bg-gradient-to-r from-[#E6B13A]/20 to-[#FCF6E5] border-2 border-[#E6B13A] rounded"
              variants={itemVariants}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <div className="flex items-center justify-center mb-3">
                <Sparkles className="w-8 h-8 text-[#E6B13A] mr-3" />
                <h3 className="text-2xl font-serif font-bold text-[#444]">SOLAR Holder Benefits</h3>
                <Sparkles className="w-8 h-8 text-[#E6B13A] ml-3" />
              </div>
              <p className="text-center text-[#666] mb-4">
                As a holder of 500M+ SOLAR tokens, you have <strong>free access</strong> to Sol Codex Pro for 1 year!
              </p>
              <motion.button
                onClick={() => window.location.href = '/soldash/you/expand/collect-data'}
                className="w-full py-4 bg-gradient-to-r from-[#E6B13A] to-[#D4A02A] text-black font-mono text-lg tracking-widest uppercase border-none transition-all hover:shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Access Sol Codex Free
              </motion.button>
            </motion.div>
          )}

          {/* Preview Image */}
          <div className="w-full flex justify-center mb-8">
            <div className="w-full max-w-md border border-[#E5E1D8] bg-[#FCF6E5] p-8 text-center">
              <div className="text-6xl mb-4">🌌</div>
              <div className="text-sm text-[#888] font-mono">Your Personalized Natal Chart</div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mb-8">
            <h3 className="text-xl font-serif font-semibold mb-6 text-center">What You&apos;ll Discover</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <motion.div 
                  key={feature.label}
                  className="flex items-start p-4 border border-[#E5E1D8] bg-[#FCF6E5]"
                  variants={itemVariants}
                  transition={{ delay: index * 0.1 }}
                >
                  <span className="text-2xl mr-3 flex-shrink-0">{feature.icon}</span>
                  <div>
                    <div className="font-semibold font-serif text-[#444] mb-1">{feature.label}</div>
                    <div className="text-sm text-[#666]">{feature.description}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Show loading state while checking tokens */}
          {isCheckingTokens && isConnected && (
            <motion.div 
              className="text-center py-8"
              variants={itemVariants}
            >
              <div className="w-8 h-8 border-2 border-[#E6B13A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm text-[#666]">Checking SOLAR token balance...</p>
            </motion.div>
          )}
          
          {/* Plan Selection - Only show if not a free tier holder */}
          {!hasFreeTier && !isCheckingTokens && (
            <>
          <motion.div className="mb-8" variants={itemVariants}>
            <h3 className="text-xl font-serif font-semibold mb-4 text-center">Choose Your Plan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(plans).map(([key, plan]) => (
                <button
                  key={key}
                  onClick={() => setSelectedPlan(key as 'monthly' | 'yearly')}
                  className={`p-6 border-2 transition-all ${
                    selectedPlan === key
                      ? 'border-[#E6B13A] bg-[#FCF6E5]'
                      : 'border-[#E5E1D8] bg-white hover:border-[#D7D7D7]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-2xl font-serif font-bold text-[#444]">
                      ${plan.price}
                    </div>
                    {plan.savings && (
                      <div className="bg-[#E6B13A] text-black text-xs font-bold px-2 py-1 rounded">
                        SAVE $16
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-[#666] mb-2">per {plan.period}</div>
                  <div className="text-sm text-[#444]">{plan.description}</div>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Payment Method Selection */}
          <motion.div className="mb-8" variants={itemVariants}>
            <h3 className="text-xl font-serif font-semibold mb-4 text-center">Payment Method</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setPaymentMethod('stripe')}
                className={`p-4 border-2 transition-all flex items-center ${
                  paymentMethod === 'stripe'
                    ? 'border-[#E6B13A] bg-[#FCF6E5]'
                    : 'border-[#E5E1D8] bg-white hover:border-[#D7D7D7]'
                }`}
              >
                <CreditCard className="w-6 h-6 mr-3" />
                <div>
                  <div className="font-semibold">Credit Card</div>
                  <div className="text-sm text-[#666]">Via Stripe</div>
                </div>
              </button>
              <button
                onClick={() => setPaymentMethod('daimo')}
                className={`p-4 border-2 transition-all flex items-center ${
                  paymentMethod === 'daimo'
                    ? 'border-[#E6B13A] bg-[#FCF6E5]'
                    : 'border-[#E5E1D8] bg-white hover:border-[#D7D7D7]'
                }`}
              >
                <Wallet className="w-6 h-6 mr-3" />
                <div>
                  <div className="font-semibold">Crypto</div>
                  <div className="text-sm text-[#666]">Via Daimo</div>
                </div>
              </button>
            </div>
          </motion.div>

          {/* Included Features */}
          <motion.div className="mb-8" variants={itemVariants}>
            <h4 className="font-serif font-semibold text-lg mb-4 text-center">Included in Your Subscription</h4>
            <div className="space-y-3">
              {[
                'Detailed natal chart based on exact birth time & location',
                'Personalized Sol identity analysis with archetype integration',
                'Life phase timing and energy patterns',
                'Annual milestone predictions and breakthrough timing',
                'Advanced cosmic signature breakdown',
                'Monthly codex updates and insights',
                'Access to premium Sol Codex features'
              ].map((item, index) => (
                <div key={index} className="flex items-center">
                  <Check className="w-5 h-5 text-[#E6B13A] mr-3 flex-shrink-0" />
                  <span className="text-[#444]">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.button
            onClick={handlePayment}
            disabled={isProcessing}
            className={`w-full py-4 ${
              isProcessing 
                ? 'bg-[#D7D7D7] cursor-not-allowed' 
                : 'bg-[#E6B13A] hover:bg-[#D4A02A]'
            } text-black font-mono text-lg tracking-widest uppercase border-none transition-colors flex items-center justify-center space-x-2`}
            variants={itemVariants}
            whileHover={!isProcessing ? { scale: 1.02 } : {}}
            whileTap={!isProcessing ? { scale: 0.98 } : {}}
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                {paymentMethod === 'stripe' ? <CreditCard className="w-5 h-5" /> : <Wallet className="w-5 h-5" />}
                <span>Subscribe for {plans[selectedPlan].total}</span>
              </>
            )}
          </motion.button>

          {/* Security Note */}
          <motion.div 
            className="text-center mt-4 text-sm text-[#888]"
            variants={itemVariants}
          >
            Secure payment • Cancel anytime • 7-day free trial
          </motion.div>
          </>
          )}
          
          {/* Connect wallet prompt for non-connected users */}
          {!isConnected && !isCheckingTokens && (
            <motion.div 
              className="text-center p-6 bg-[#FCF6E5] border border-[#E5E1D8] rounded"
              variants={itemVariants}
            >
              <Wallet className="w-12 h-12 text-[#E6B13A] mx-auto mb-4" />
              <h3 className="text-lg font-serif font-semibold mb-2">Connect Your Wallet</h3>
              <p className="text-sm text-[#666] mb-4">
                Connect your wallet to check if you qualify for free access with SOLAR tokens
              </p>
              <p className="text-xs text-[#888]">
                Holders of 500M+ SOLAR tokens get 1 year free access
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Back Link */}
        <motion.div className="text-center" variants={itemVariants}>
          <Link href="/soldash/you" className="text-[#888] font-mono text-sm hover:text-[#666]">
            ← Back to Your Sol Profile
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}