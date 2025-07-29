'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Star } from 'lucide-react';
import Link from 'next/link';

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

export default function ExpandPaymentPage() {
  const handlePayment = async () => {
    // TODO: Integrate with Stripe checkout
    console.log('Initiating payment...');
    // For now, redirect to data collection page
    window.location.href = '/soldash/you/expand/collect-data';
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
            <div className="text-3xl font-serif font-semibold mb-2">Your Complete Sol Chart</div>
            <div className="text-lg text-[#666] font-mono uppercase tracking-wide">
              Unlock the full depth of your cosmic signature
            </div>
          </div>

          {/* Preview Image */}
          <div className="w-full flex justify-center mb-8">
            <div className="w-full max-w-md border border-[#E5E1D8] bg-[#FCF6E5] p-8 text-center">
              <div className="text-6xl mb-4">🌌</div>
              <div className="text-sm text-[#888] font-mono">Your Personalized Natal Chart</div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mb-8">
            <h3 className="text-xl font-serif font-semibold mb-6 text-center">What You'll Discover</h3>
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

          {/* Pricing */}
          <motion.div 
            className="text-center mb-8 p-6 bg-[#FCF6E5] border border-[#E5E1D8]"
            variants={itemVariants}
          >
            <div className="text-sm text-[#888] font-mono uppercase tracking-wide mb-2">One-time purchase</div>
            <div className="text-4xl font-serif font-bold text-[#444] mb-2">$29</div>
            <div className="text-sm text-[#666]">Complete Sol Chart Analysis</div>
          </motion.div>

          {/* Included Features */}
          <motion.div className="mb-8" variants={itemVariants}>
            <h4 className="font-serif font-semibold text-lg mb-4 text-center">Included in Your Purchase</h4>
            <div className="space-y-3">
              {[
                'Detailed natal chart based on exact birth time & location',
                'Personalized Sol identity analysis',
                'Life phase timing and energy patterns',
                'Annual milestone predictions',
                'Advanced cosmic signature breakdown'
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
            className="w-full py-4 bg-[#E6B13A] text-black font-mono text-lg tracking-widest uppercase border-none hover:bg-[#D4A02A] transition-colors"
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Unlock Your Complete Chart
          </motion.button>

          {/* Security Note */}
          <motion.div 
            className="text-center mt-4 text-sm text-[#888]"
            variants={itemVariants}
          >
            Secure payment powered by Stripe • 30-day satisfaction guarantee
          </motion.div>
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