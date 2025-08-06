'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { checkSubscriptionStatus } from '~/lib/subscription';
import { ChevronRight, Sparkles, Calendar } from 'lucide-react';

const features = [
  { icon: '🎯', label: 'Life Focus' },
  { icon: '⚡', label: 'Energy Rhythms' },
  { icon: '🧩', label: 'Natural Strengths' },
  { icon: '📅', label: 'Annual Resets' },
  { icon: '🌊', label: 'Growth Phases' },
  { icon: '🛑', label: 'Breakthroughs' },
];

const ExpandUnderstanding: React.FC = () => {
  const [hasSubscription, setHasSubscription] = useState(false);
  const [hasChart, setHasChart] = useState(false);
  const [chartData, setChartData] = useState<any>(null);
  const [solData, setSolData] = useState<any>(null);
  
  useEffect(() => {
    const subscription = checkSubscriptionStatus();
    setHasSubscription(subscription.hasAccess);
    setHasChart(!!subscription.chartData);
    
    // Get chart data and sol data for insights
    const savedChartData = localStorage.getItem('chartData');
    if (savedChartData) {
      setChartData(JSON.parse(savedChartData));
      setHasChart(true);
    }
    
    const savedSolData = localStorage.getItem('sunCycleBookmark');
    if (savedSolData) {
      setSolData(JSON.parse(savedSolData));
    }
  }, []);
  
  const handleButtonClick = () => {
    if (hasSubscription && hasChart) {
      // If they have both subscription and chart, go to details
      window.location.href = '/soldash/you/expand/details';
    } else if (hasChart && !hasSubscription) {
      // If they have chart but no subscription, go to payment
      window.location.href = '/soldash/you/expand/payment';
    } else {
      // No chart, go to collect data
      window.location.href = '/soldash/you/expand';
    }
  };
  
  // Show different content based on status
  if (hasSubscription && hasChart && chartData) {
    // User has full access - show daily insights
    return (
      <div className="w-full max-w-xl mx-auto p-8 bg-[#FEFDF8] border border-[#D7D7D7] rounded-none flex flex-col">
        <div className="text-2xl font-serif font-semibold text-center mb-2">Daily Cosmic Alignment</div>
        <div className="text-base font-mono uppercase tracking-wide text-center text-[#888] mb-6">
          Personalized insights based on your Sol Codex
        </div>
        
        <div className="space-y-4 mb-6">
          {/* Today's Planetary Focus */}
          <div className="p-4 bg-[#FCF6E5] border border-[#E5E1D8]">
            <div className="flex items-start mb-2">
              <Calendar className="w-5 h-5 text-[#E6B13A] mr-2 mt-0.5" />
              <div>
                <h4 className="font-serif font-semibold text-[#444] text-sm mb-1">Today&apos;s Planetary Influence</h4>
                <p className="text-xs text-[#666]">
                  The Moon in {['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo'][new Date().getDate() % 6]} activates your {chartData.moon?.house || '4th'} house of {
                    chartData.moon?.house === 4 ? 'home and emotions' : 
                    chartData.moon?.house === 10 ? 'career and public life' : 
                    'personal transformation'
                  }.
                </p>
              </div>
            </div>
          </div>
          
          {/* Personal Power Time */}
          <div className="p-4 bg-[#FCF6E5] border border-[#E5E1D8]">
            <div className="flex items-start mb-2">
              <Sparkles className="w-5 h-5 text-[#E6B13A] mr-2 mt-0.5" />
              <div>
                <h4 className="font-serif font-semibold text-[#444] text-sm mb-1">Your Power Hours Today</h4>
                <p className="text-xs text-[#666]">
                  As a {chartData.sun?.sign} Sun with {chartData.rising?.sign} Rising, your peak creative energy flows between 2-6 PM. 
                  Use this time for important decisions and creative work.
                </p>
              </div>
            </div>
          </div>
          
          {/* Integration Practice */}
          <div className="p-4 bg-gradient-to-r from-[#E6B13A]/10 to-[#FCF6E5] border-l-4 border-[#E6B13A]">
            <h4 className="font-serif font-semibold text-[#444] text-sm mb-2">Today&apos;s Integration Practice</h4>
            <p className="text-xs text-[#666] italic">
              &ldquo;I honor my {chartData.sun?.sign} Sun&apos;s need for {
                chartData.sun?.sign === 'Aries' ? 'bold action' :
                chartData.sun?.sign === 'Taurus' ? 'grounded presence' :
                chartData.sun?.sign === 'Gemini' ? 'intellectual exploration' :
                chartData.sun?.sign === 'Cancer' ? 'emotional depth' :
                chartData.sun?.sign === 'Leo' ? 'creative expression' :
                chartData.sun?.sign === 'Virgo' ? 'refined service' :
                chartData.sun?.sign === 'Libra' ? 'harmonious balance' :
                chartData.sun?.sign === 'Scorpio' ? 'transformative depth' :
                chartData.sun?.sign === 'Sagittarius' ? 'expansive wisdom' :
                chartData.sun?.sign === 'Capricorn' ? 'structured achievement' :
                chartData.sun?.sign === 'Aquarius' ? 'innovative vision' :
                'intuitive flow'
              } while nurturing my {chartData.moon?.sign} Moon&apos;s emotional wisdom.&rdquo;
            </p>
          </div>
        </div>
        
        <button
          className="w-full py-4 bg-[#E6B13A] text-black font-mono text-lg tracking-widest uppercase border-none rounded-none hover:bg-[#D4A02A] transition-colors flex items-center justify-center"
          onClick={handleButtonClick}
        >
          <span>View Full Analysis</span>
          <ChevronRight className="w-5 h-5 ml-2" />
        </button>
      </div>
    );
  }
  
  if (hasChart && !hasSubscription) {
    // User has chart but no subscription - show upsell
    return (
      <div className="w-full max-w-xl mx-auto p-8 bg-[#FEFDF8] border-2 border-[#E6B13A] rounded-none flex flex-col items-center">
        <div className="text-2xl font-serif font-semibold text-center mb-2">Unlock Your Full Potential</div>
        <div className="text-base font-mono uppercase tracking-wide text-center text-[#888] mb-6">
          Your chart is ready - now discover its deeper meanings
        </div>
        <div className="w-full flex justify-center items-center mb-6">
          <div className="relative">
            <Image src="/you/solChart.svg" alt="Sol Chart" width={400} height={300} className="w-full max-w-md border border-[#E5E1D8] bg-[#FCF6E5] p-8" />
            <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent flex items-end justify-center pb-8">
              <div className="text-center">
                <div className="text-4xl mb-2">🔓</div>
                <p className="text-sm font-serif font-semibold text-[#444]">Chart Generated!</p>
              </div>
            </div>
          </div>
        </div>
        <div className="text-[#444] text-lg font-serif text-left w-full mb-6">
          Your natal chart has been calculated. Unlock Sol Codex Pro to access personalized insights, power phrases, and life phase guidance.
        </div>
        <div className="w-full mb-8">
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
            {features.map((f) => (
              <li key={f.label} className="flex items-center text-medium font-serif text-[#444]">
                <span className="text-medium mr-2">{f.icon}</span>
                <span className="font-semibold mr-2">{f.label}</span>
              </li>
            ))}
          </ul>
        </div>
        <button
          className="w-full py-4 bg-[#E6B13A] text-black font-mono text-lg tracking-widest uppercase border-none rounded-none hover:bg-[#D4A02A] transition-colors flex items-center justify-center"
          onClick={handleButtonClick}
        >
          <span>Unlock Advanced Analysis</span>
          <ChevronRight className="w-5 h-5 ml-2" />
        </button>
      </div>
    );
  }
  
  // Default view - no chart yet
  return (
    <div className="w-full max-w-xl mx-auto p-8 bg-[#FEFDF8] border border-[#D7D7D7] rounded-none flex flex-col items-center">
      <div className="text-2xl font-serif font-semibold text-center mb-2">Expand your understanding</div>
      <div className="text-base font-mono uppercase tracking-wide text-center text-[#888] mb-6">
        Add your birth time & location for deeper insights on your inner sol
      </div>
      <div className="w-full flex justify-center items-center mb-6">
        <Image src="/you/solChart.svg" alt="Sol Chart" width={400} height={300} className="w-full max-w-md border border-[#E5E1D8] bg-[#FCF6E5] p-8" />
      </div>
      <div className="text-[#444] text-lg font-serif text-left w-full mb-6">
        Your complete Sol Chart reveals the intricate layers of your cosmic signature, timing, and evolutionary path.
      </div>
      <div className="w-full mb-8">
        <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
          {features.map((f) => (
            <li key={f.label} className="flex items-center text-medium font-serif text-[#444]">
              <span className="text-medium mr-2">{f.icon}</span>
              <span className="font-semibold mr-2">{f.label}</span>
            </li>
          ))}
        </ul>
      </div>
      <button
        className="w-full py-4 bg-[#E6B13A] text-black font-mono text-lg tracking-widest uppercase border-none rounded-none hover:bg-[#D4A02A] transition-colors"
        onClick={handleButtonClick}
      >
        Create Your Sol Codex
      </button>
    </div>
  );
};

export default ExpandUnderstanding; 