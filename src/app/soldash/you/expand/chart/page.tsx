'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Share2, Eye, Sparkles } from 'lucide-react';
import Link from 'next/link';
import NatalChartGenerator from '~/components/Soldash/NatalChartGenerator';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// Mock data - this would come from the chart generation API
const mockChartData = {
  sunSign: 'Aquarius',
  moonSign: 'Pisces',
  risingSign: 'Gemini',
  birthInfo: {
    date: 'February 15, 1990',
    time: '2:30 PM',
    location: 'San Francisco, CA, USA'
  },
  keyInsights: [
    'Your Aquarius Sun drives innovation and humanitarian ideals',
    'Pisces Moon brings deep intuition and emotional sensitivity',
    'Gemini Rising makes you adaptable and communicative',
    'Your chart shows strong creative and healing potential'
  ]
};

export default function ChartPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [showChart, setShowChart] = useState(false);
  const [chartData, setChartData] = useState<any>(null);
  const [birthData, setBirthData] = useState<any>(null);

  useEffect(() => {
    // Get birth data from localStorage or URL params
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    // TODO: If sessionId exists, verify Stripe payment
    if (sessionId) {
      console.log('Payment session:', sessionId);
    }

    // For now, simulate getting birth data from localStorage
    const savedBirthData = localStorage.getItem('birthData');
    if (savedBirthData) {
      const data = JSON.parse(savedBirthData);
      setBirthData(data);
      setIsLoading(false);
    } else {
      // Mock birth data for development
      const mockData = {
        date: '1990-02-15',
        time: '14:30',
        location: {
          city: 'San Francisco',
          country: 'USA',
          latitude: 37.7749,
          longitude: -122.4194,
          timezone: 'America/Los_Angeles'
        }
      };
      setBirthData(mockData);
      setIsLoading(false);
    }
  }, []);

  const handleViewAdvancedDetails = () => {
    window.location.href = '/soldash/you/expand/details';
  };

  const handleDownloadChart = () => {
    // TODO: Implement chart download functionality
    console.log('Downloading chart...');
  };

  const handleShareChart = () => {
    // TODO: Implement chart sharing functionality
    console.log('Sharing chart...');
  };

  const handleChartGenerated = (generatedChartData: any) => {
    setChartData(generatedChartData);
    setShowChart(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FEFDF8] flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="text-6xl mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            🌌
          </motion.div>
          <motion.h2 
            className="text-2xl font-serif font-semibold text-[#444] mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Generating Your Sol Chart
          </motion.h2>
          <motion.p 
            className="text-[#666] font-mono"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            Calculating cosmic alignments for your birth moment...
          </motion.p>
          <motion.div 
            className="mt-6 flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <div className="flex space-x-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-[#E6B13A] rounded-full"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity, 
                    delay: i * 0.2 
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-[#FEFDF8] p-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div className="flex items-center justify-between mb-8" variants={itemVariants}>
          <div className="flex items-center">
            <Link href="/soldash/you/expand/collect-data" className="mr-4">
              <ArrowLeft className="w-6 h-6 text-[#888]" />
            </Link>
            <h1 className="text-2xl font-serif font-semibold">Your Complete Sol Chart</h1>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={handleDownloadChart}
              className="p-2 border border-[#D7D7D7] bg-white hover:bg-[#FCF6E5] transition-colors"
            >
              <Download className="w-5 h-5 text-[#666]" />
            </button>
            <button 
              onClick={handleShareChart}
              className="p-2 border border-[#D7D7D7] bg-white hover:bg-[#FCF6E5] transition-colors"
            >
              <Share2 className="w-5 h-5 text-[#666]" />
            </button>
          </div>
        </motion.div>

        {/* Success Message */}
        {showChart && (
          <motion.div 
            className="bg-[#E8F5E8] border border-[#A8D8A8] p-4 mb-8 text-center"
            variants={itemVariants}
          >
            <div className="text-lg font-serif font-semibold text-[#2D5A2D] mb-1">
              🎉 Your Sol Chart is Ready!
            </div>
            <div className="text-sm text-[#3D6A3D]">
              Generated for {birthData?.date} at {birthData?.time} in {birthData?.location.city}, {birthData?.location.country}
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart Visualization */}
          <motion.div 
            className="lg:col-span-2 bg-white border border-[#D7D7D7] p-8"
            variants={itemVariants}
          >
            <h2 className="text-xl font-serif font-semibold mb-6 text-center">Your Natal Chart</h2>
            
            {birthData ? (
              <NatalChartGenerator 
                birthData={birthData}
                onChartGenerated={handleChartGenerated}
                className="w-full max-w-lg mx-auto"
              />
            ) : (
              <div className="w-full max-w-lg mx-auto bg-[#FCF6E5] border border-[#E5E1D8] p-8 text-center">
                <div className="text-6xl mb-4">⏳</div>
                <div className="text-sm text-[#888] font-mono">Loading birth data...</div>
              </div>
            )}

            {chartData && (
              <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-[#FCF6E5] border border-[#E5E1D8]">
                  <div className="text-2xl mb-1">☉</div>
                  <div className="text-sm font-semibold">Sun Sign</div>
                  <div className="text-xs text-[#666]">{chartData.sun.sign}</div>
                  <div className="text-xs text-[#888]">{Math.round(chartData.sun.degree)}°</div>
                </div>
                <div className="p-3 bg-[#FCF6E5] border border-[#E5E1D8]">
                  <div className="text-2xl mb-1">☽</div>
                  <div className="text-sm font-semibold">Moon Sign</div>
                  <div className="text-xs text-[#666]">{chartData.moon.sign}</div>
                  <div className="text-xs text-[#888]">{Math.round(chartData.moon.degree)}°</div>
                </div>
                <div className="p-3 bg-[#FCF6E5] border border-[#E5E1D8]">
                  <div className="text-2xl mb-1">↗</div>
                  <div className="text-sm font-semibold">Rising Sign</div>
                  <div className="text-xs text-[#666]">{chartData.rising.sign}</div>
                  <div className="text-xs text-[#888]">{Math.round(chartData.rising.degree)}°</div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Key Insights */}
          <motion.div className="space-y-6" variants={itemVariants}>
            <div className="bg-white border border-[#D7D7D7] p-6">
              <h3 className="text-lg font-serif font-semibold mb-4">Key Insights</h3>
              <div className="space-y-3">
                {mockChartData.keyInsights.map((insight, index) => (
                  <div key={index} className="flex items-start">
                    <Sparkles className="w-4 h-4 text-[#E6B13A] mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-[#444]">{insight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA for Advanced Details */}
            <motion.div 
              className="bg-gradient-to-br from-[#FCF6E5] to-[#F5F5F5] border border-[#E5E1D8] p-6"
              variants={itemVariants}
            >
              <div className="text-center mb-4">
                <Eye className="w-8 h-8 text-[#E6B13A] mx-auto mb-2" />
                <h3 className="text-lg font-serif font-semibold text-[#444] mb-2">
                  Unlock Advanced Details
                </h3>
                <p className="text-sm text-[#666] mb-4">
                  Dive deeper into your cosmic signature with detailed interpretations, timing insights, and personalized guidance.
                </p>
              </div>
              
              <motion.button
                onClick={handleViewAdvancedDetails}
                className="w-full py-3 bg-[#E6B13A] text-black font-mono text-sm tracking-widest uppercase border-none hover:bg-[#D4A02A] transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                View Advanced Details
              </motion.button>
            </motion.div>
          </motion.div>
        </div>

        {/* Back Link */}
        <motion.div className="text-center mt-8" variants={itemVariants}>
          <Link href="/soldash/you" className="text-[#888] font-mono text-sm hover:text-[#666]">
            ← Back to Your Sol Profile
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}