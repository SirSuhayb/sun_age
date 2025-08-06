'use client';
import { Tooltip } from '~/components/Soldash/Tooltip';
import Image from 'next/image';
import SolProfilePreview from '~/components/Soldash/SolProfilePreview';
import SolEvolution from '~/components/Soldash/SolEvolution';
import ExpandUnderstanding from '~/components/Soldash/ExpandUnderstanding';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { checkSubscriptionStatus } from '~/lib/subscription';
import NatalChartGenerator from '~/components/Soldash/NatalChartGenerator';
import Link from 'next/link';
import { Eye, Download, Share2 } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function YouPage() {
  const [bookmark, setBookmark] = useState<any>(null);
  const [solarProfile, setSolarProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'inner-sol' | 'sol-codex'>('inner-sol');
  const [chartData, setChartData] = useState<any>(null);
  const [birthData, setBirthData] = useState<any>(null);
  const [hasSubscription, setHasSubscription] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sunCycleBookmark');
      if (saved) {
        try {
          const parsedBookmark = JSON.parse(saved);
          setBookmark(parsedBookmark);
          
          // Extract solar profile data from bookmark
          if (parsedBookmark.birthDate) {
            setSolarProfile({
              archetype: parsedBookmark.archetype || 'Solar',
              foundation: parsedBookmark.foundation,
              depth: parsedBookmark.depth,
              agePhase: parsedBookmark.agePhase
            });
          }
        } catch {
          // Handle parse error gracefully
        }
      }
      
      // Check for chart data
      const savedChartData = localStorage.getItem('chartData');
      if (savedChartData) {
        setChartData(JSON.parse(savedChartData));
      }
      
      // Check for birth data
      const savedBirthData = localStorage.getItem('birthData');
      if (savedBirthData) {
        setBirthData(JSON.parse(savedBirthData));
      }
      
      // Check subscription status
      const subscription = checkSubscriptionStatus();
      setHasSubscription(subscription.hasAccess);
    }
  }, []);

  return (
    <motion.div 
      className="space-y-4 pb-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Tooltip at the top */}
      <motion.div className="mt-10" variants={itemVariants}>
        <Tooltip
          title="DISCOVER YOUR INNER SOL"
          body={`Go deeper into your ${solarProfile?.archetype || 'Solar'} identity. In time, you'll unlock the layers of your cosmic signature.`}
          bgColor="#FFF8ED"
          borderColor="#F5C16C"
          textColor="#D4A02A"
          storageKey="soldash-you-tooltip"
        />
      </motion.div>

      {/* Tab Navigation */}
      {bookmark && (
        <motion.div className="max-w-xl mx-auto mb-6" variants={itemVariants}>
          <div className="flex border-b border-[#E5E1D8]">
            <button
              onClick={() => setActiveTab('inner-sol')}
              className={`flex-1 py-3 font-mono text-sm uppercase tracking-wide transition-all ${
                activeTab === 'inner-sol'
                  ? 'text-[#E6B13A] border-b-2 border-[#E6B13A]'
                  : 'text-[#888] hover:text-[#666]'
              }`}
            >
              Inner Sol
            </button>
            <button
              onClick={() => setActiveTab('sol-codex')}
              className={`flex-1 py-3 font-mono text-sm uppercase tracking-wide transition-all ${
                activeTab === 'sol-codex'
                  ? 'text-[#E6B13A] border-b-2 border-[#E6B13A]'
                  : 'text-[#888] hover:text-[#666]'
              }`}
            >
              Sol Codex
            </button>
          </div>
        </motion.div>
      )}

      {/* Tab Content */}
      {activeTab === 'inner-sol' ? (
        <>
          {/* Archetype Card (Preview) */}
          <motion.div className="mt-10" variants={itemVariants}>
            {bookmark ? (
              <SolProfilePreview bookmark={bookmark} />
            ) : (
              <div className="w-full max-w-xl mx-auto bg-[#FCF6E5] border-t-4 border-[#DBD3BC] border-l border-r border-b border-[#DBD3BC] p-6 text-center font-serif text-lg text-gray-700" style={{ borderRadius: 0 }}>
                No Solar Identity found. Please calculate your Sol Age to unlock your cosmic profile.
              </div>
            )}
          </motion.div>
          {/* Sol Evolution Card */}
          <motion.div className="mt-10" variants={itemVariants}>
            {bookmark && <SolEvolution bookmark={bookmark} />}
          </motion.div>
          {/* Expand Understanding Card */}
          <motion.div className="mt-10" variants={itemVariants}>
            {bookmark && <ExpandUnderstanding />}
          </motion.div>
        </>
      ) : (
        <>
          {/* Sol Codex Tab Content */}
          {chartData ? (
            <>
              {/* Chart Display */}
              <motion.div 
                className="max-w-4xl mx-auto bg-white border border-[#D7D7D7] p-8"
                variants={itemVariants}
              >
                <h2 className="text-xl font-serif font-semibold mb-6 text-center">Your Natal Chart</h2>
                
                {birthData && (
                  <NatalChartGenerator 
                    birthData={birthData}
                    onChartGenerated={() => {}}
                    className="w-full max-w-lg mx-auto"
                  />
                )}

                {/* Basic Chart Info */}
                <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-[#FCF6E5] border border-[#E5E1D8]">
                    <div className="text-2xl mb-1">☉</div>
                    <div className="text-sm font-semibold">Sun Sign</div>
                    <div className="text-xs text-[#666]">{chartData.sun?.sign}</div>
                  </div>
                  <div className="p-3 bg-[#FCF6E5] border border-[#E5E1D8]">
                    <div className="text-2xl mb-1">☽</div>
                    <div className="text-sm font-semibold">Moon Sign</div>
                    <div className="text-xs text-[#666]">{chartData.moon?.sign}</div>
                  </div>
                  <div className="p-3 bg-[#FCF6E5] border border-[#E5E1D8]">
                    <div className="text-2xl mb-1">↗</div>
                    <div className="text-sm font-semibold">Rising Sign</div>
                    <div className="text-xs text-[#666]">{chartData.rising?.sign}</div>
                  </div>
                </div>

                {/* Chart Actions */}
                <div className="mt-6 flex justify-center space-x-4">
                  <button className="p-2 border border-[#D7D7D7] bg-white hover:bg-[#FCF6E5] transition-colors">
                    <Download className="w-5 h-5 text-[#666]" />
                  </button>
                  <button className="p-2 border border-[#D7D7D7] bg-white hover:bg-[#FCF6E5] transition-colors">
                    <Share2 className="w-5 h-5 text-[#666]" />
                  </button>
                </div>

                {/* View Full Chart Link */}
                <div className="mt-6 text-center">
                  <Link 
                    href="/soldash/you/expand/chart" 
                    className="text-[#E6B13A] hover:text-[#D4A02A] font-mono text-sm"
                  >
                    View Full Chart Analysis →
                  </Link>
                </div>
              </motion.div>

              {/* Advanced Analysis Upsell or Content */}
              <motion.div 
                className="max-w-xl mx-auto mt-6"
                variants={itemVariants}
              >
                {hasSubscription ? (
                  <div className="bg-gradient-to-br from-[#FCF6E5] to-[#F5F5F5] border-2 border-[#E6B13A] p-6">
                    <div className="text-center mb-4">
                      <Eye className="w-8 h-8 text-[#E6B13A] mx-auto mb-2" />
                      <h3 className="text-lg font-serif font-semibold text-[#444] mb-2">
                        Your Sol Codex Pro Insights
                      </h3>
                    </div>
                    <div className="space-y-3 mb-6">
                      <div className="p-3 bg-white/50 border border-[#E5E1D8]">
                        <h4 className="font-serif font-semibold text-sm text-[#444] mb-1">Today&apos;s Focus</h4>
                        <p className="text-xs text-[#666]">
                          With your {chartData.moon?.sign} Moon, today&apos;s energy supports deep emotional work and intuitive breakthroughs.
                        </p>
                      </div>
                      <div className="p-3 bg-white/50 border border-[#E5E1D8]">
                        <h4 className="font-serif font-semibold text-sm text-[#444] mb-1">Power Phase</h4>
                        <p className="text-xs text-[#666]">
                          You&apos;re in a {solarProfile?.agePhase || 'Growth'} phase, amplifying your {chartData.sun?.sign} Sun&apos;s natural leadership abilities.
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/soldash/you/expand/details"
                      className="block w-full py-3 bg-[#E6B13A] text-black font-mono text-sm tracking-widest uppercase text-center hover:bg-[#D4A02A] transition-colors"
                    >
                      View Full Analysis →
                    </Link>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-[#FCF6E5] to-[#F5F5F5] border-2 border-[#E6B13A] p-6">
                    <div className="text-center mb-4">
                      <Eye className="w-8 h-8 text-[#E6B13A] mx-auto mb-2" />
                      <h3 className="text-lg font-serif font-semibold text-[#444] mb-2">
                        Unlock Sol Codex Pro
                      </h3>
                      <p className="text-sm text-[#666] mb-4">
                        Go beyond the basics with deep cosmic insights tailored to your unique blueprint.
                      </p>
                    </div>
                    
                    <ul className="text-sm space-y-2 mb-6">
                      <li className="flex items-start">
                        <span className="text-[#E6B13A] mr-2">✦</span>
                        <span>Personal power phrases for Sun, Moon & Rising</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#E6B13A] mr-2">✦</span>
                        <span>Life phase timing and breakthrough predictions</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#E6B13A] mr-2">✦</span>
                        <span>Deep cosmic synthesis of your trinity</span>
                      </li>
                    </ul>
                    
                    <Link
                      href="/soldash/you/expand/payment"
                      className="block w-full py-3 bg-[#E6B13A] text-black font-mono text-sm tracking-widest uppercase text-center hover:bg-[#D4A02A] transition-colors"
                    >
                      Unlock Advanced Analysis →
                    </Link>
                  </div>
                )}
              </motion.div>
            </>
          ) : (
            <motion.div 
              className="max-w-xl mx-auto bg-[#FCF6E5] border border-[#E5E1D8] p-8 text-center"
              variants={itemVariants}
            >
              <div className="text-6xl mb-4">🌌</div>
              <h3 className="text-xl font-serif font-semibold text-[#444] mb-2">
                No Sol Codex Generated Yet
              </h3>
              <p className="text-sm text-[#666] mb-6">
                Add your birth time and location to generate your complete natal chart and unlock cosmic insights.
              </p>
              <Link
                href="/soldash/you/expand"
                className="inline-block px-6 py-3 bg-[#E6B13A] text-black font-mono text-sm tracking-widest uppercase hover:bg-[#D4A02A] transition-colors"
              >
                Create Your Sol Codex
              </Link>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
} 