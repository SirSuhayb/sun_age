'use client';
import { Tooltip } from '~/components/Soldash/Tooltip';
import Image from 'next/image';
import SolProfilePreview from '~/components/Soldash/SolProfilePreview';
import SolEvolution from '~/components/Soldash/SolEvolution';
import ExpandUnderstanding from '~/components/Soldash/ExpandUnderstanding';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { checkSubscriptionStatus } from '~/lib/subscription';
import Link from 'next/link';

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

  // Helper to detect stelliums (3+ planets in same sign)
  const detectStelliums = (planets: any[]) => {
    if (!planets) return [];
    const signCounts: Record<string, { count: number; planets: string[] }> = {};
    
    planets.forEach(planet => {
      if (!signCounts[planet.sign]) {
        signCounts[planet.sign] = { count: 0, planets: [] };
      }
      signCounts[planet.sign].count++;
      signCounts[planet.sign].planets.push(planet.name);
    });
    
    return Object.entries(signCounts)
      .filter(([_, data]) => data.count >= 3)
      .map(([sign, data]) => ({ sign, planets: data.planets }));
  };

  // Helper to detect conjunctions
  const detectConjunctions = (planets: any[]) => {
    if (!planets) return [];
    const conjunctions: any[] = [];
    
    // Check Sun, Moon, Rising combinations
    if (chartData?.sun && chartData?.moon && chartData?.sun.sign === chartData?.moon.sign) {
      conjunctions.push({
        type: 'Double',
        bodies: ['Sun', 'Moon'],
        sign: chartData.sun.sign
      });
    }
    
    if (chartData?.sun && chartData?.rising && chartData?.sun.sign === chartData?.rising.sign) {
      conjunctions.push({
        type: 'Double',
        bodies: ['Sun', 'Rising'],
        sign: chartData.sun.sign
      });
    }
    
    if (chartData?.moon && chartData?.rising && chartData?.moon.sign === chartData?.rising.sign) {
      conjunctions.push({
        type: 'Double',
        bodies: ['Moon', 'Rising'],
        sign: chartData.moon.sign
      });
    }
    
    return conjunctions;
  };

  return (
    <div className="min-h-screen bg-[#FFFCF2]/50 pb-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="py-6">
          <h1 className="text-2xl font-serif text-center text-[#444]">SOLARA</h1>
          <p className="text-xs text-center text-[#888] mt-1">SOL 68, 2025</p>
        </div>

        {/* Tab Navigation */}
        {bookmark && (
          <div className="flex mb-8">
            <button
              onClick={() => setActiveTab('inner-sol')}
              className={`flex-1 py-3 font-mono text-xs uppercase tracking-widest transition-all border-b-2 ${
                activeTab === 'inner-sol'
                  ? 'text-[#E6B13A] border-[#E6B13A] bg-white'
                  : 'text-[#888] border-transparent bg-[#F5F5F5] hover:bg-[#EFEFEF]'
              }`}
            >
              Inner Sol
            </button>
            <button
              onClick={() => setActiveTab('sol-codex')}
              className={`flex-1 py-3 font-mono text-xs uppercase tracking-widest transition-all border-b-2 ${
                activeTab === 'sol-codex'
                  ? 'text-[#E6B13A] border-[#E6B13A] bg-white'
                  : 'text-[#888] border-transparent bg-[#F5F5F5] hover:bg-[#EFEFEF]'
              }`}
            >
              Sol Codex
            </button>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'inner-sol' ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {/* Tooltip at the top */}
            <motion.div variants={itemVariants}>
              <Tooltip
                title="DISCOVER YOUR INNER SOL"
                body={`Go deeper into your ${solarProfile?.archetype || 'Solar'} identity. In time, you'll unlock the layers of your cosmic signature.`}
                bgColor="#FFF8ED"
                borderColor="#F5C16C"
                textColor="#D4A02A"
                storageKey="soldash-you-tooltip"
              />
            </motion.div>
            
            {/* Existing Inner Sol content */}
            <motion.div variants={itemVariants}>
              {bookmark ? (
                <SolProfilePreview bookmark={bookmark} />
              ) : (
                <div className="w-full max-w-xl mx-auto bg-[#FCF6E5] border-t-4 border-[#DBD3BC] border-l border-r border-b border-[#DBD3BC] p-6 text-center font-serif text-lg text-gray-700">
                  No Solar Identity found. Please calculate your Sol Age to unlock your cosmic profile.
                </div>
              )}
            </motion.div>
            <motion.div variants={itemVariants}>
              {bookmark && <SolEvolution bookmark={bookmark} />}
            </motion.div>
            <motion.div variants={itemVariants}>
              {bookmark && <ExpandUnderstanding />}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Sol Codex Tab Content */}
            {chartData ? (
              <>
                {/* Natal Chart */}
                <motion.div 
                  className="bg-white border border-[#E5E1D8] p-8"
                  variants={itemVariants}
                >
                  <div className="flex justify-center">
                    <Image 
                      src="/astrology/codex/natalChart.svg" 
                      alt="Natal Chart" 
                      width={400} 
                      height={400}
                      className="w-full max-w-[400px]"
                    />
                  </div>
                </motion.div>

                {/* Cosmic Trinity */}
                <motion.div variants={itemVariants}>
                  <h3 className="text-center font-serif text-lg mb-4 text-[#444]">Your cosmic trinity</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white border border-[#E5E1D8] p-4 text-center">
                      <div className="text-2xl mb-2">☉</div>
                      <div className="text-xs text-[#888] font-mono uppercase">Sun</div>
                      <div className="font-serif text-sm text-[#444] mt-1">{chartData.sun?.sign} {Math.round(chartData.sun?.degree)}°</div>
                    </div>
                    <div className="bg-white border border-[#E5E1D8] p-4 text-center">
                      <div className="text-2xl mb-2">☽</div>
                      <div className="text-xs text-[#888] font-mono uppercase">Moon</div>
                      <div className="font-serif text-sm text-[#444] mt-1">{chartData.moon?.sign} {Math.round(chartData.moon?.degree)}°</div>
                    </div>
                    <div className="bg-white border border-[#E5E1D8] p-4 text-center">
                      <div className="text-2xl mb-2">↗</div>
                      <div className="text-xs text-[#888] font-mono uppercase">Rising</div>
                      <div className="font-serif text-sm text-[#444] mt-1">{chartData.rising?.sign} {Math.round(chartData.rising?.degree)}°</div>
                    </div>
                  </div>
                </motion.div>

                {/* Planetary Arrangement */}
                <motion.div variants={itemVariants}>
                  <h3 className="text-center font-serif text-lg mb-4 text-[#444]">Your planetary arrangement</h3>
                  <div className="bg-white border border-[#E5E1D8]">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <tbody>
                          {chartData.planets?.map((planet: any, index: number) => (
                            <tr key={planet.name} className={index % 2 === 0 ? 'bg-[#FFFCF2]/30' : 'bg-white'}>
                              <td className="p-3 text-center text-xl">{planet.symbol || '☉'}</td>
                              <td className="p-3 font-serif text-sm text-[#444]">{planet.name}</td>
                              <td className="p-3 text-center">
                                <span className="font-serif text-sm">{planet.sign}</span>
                                <span className="text-xs text-[#888] ml-1">{Math.round(planet.degree)}°</span>
                              </td>
                              <td className="p-3 font-serif text-sm text-[#444]">{planet.house}</td>
                              <td className="p-3 text-center">
                                <span className="text-[#E6B13A] text-sm">
                                  {planet.aspects?.join(' ') || ''}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>

                {/* Special Configurations */}
                {(detectStelliums(chartData.planets).length > 0 || detectConjunctions(chartData.planets).length > 0) && (
                  <motion.div variants={itemVariants} className="space-y-4">
                    {detectStelliums(chartData.planets).map((stellium, index) => (
                      <div key={index} className="bg-[#FCF6E5] border border-[#E6B13A] p-4">
                        <h4 className="font-mono text-xs uppercase text-[#E6B13A] mb-2">STELLIUM IN {stellium.sign}</h4>
                        <p className="text-sm text-[#444]">
                          With {stellium.planets.length} planets in {stellium.sign}, you carry concentrated {stellium.sign.toLowerCase()} energy which enhances your {stellium.sign.toLowerCase()} qualities.
                        </p>
                      </div>
                    ))}
                    
                    {detectConjunctions(chartData.planets).map((conjunction, index) => (
                      <div key={index} className="bg-[#FCF6E5] border border-[#E6B13A] p-4">
                        <h4 className="font-mono text-xs uppercase text-[#E6B13A] mb-2">
                          {conjunction.bodies.join('/')} CONJUNCTION
                        </h4>
                        <p className="text-sm text-[#444]">
                          Your {conjunction.bodies.join(' and ')} in {conjunction.sign} creates a powerful fusion of energies.
                        </p>
                      </div>
                    ))}
                  </motion.div>
                )}

                {/* Key Insights */}
                <motion.div variants={itemVariants} className="bg-white border border-[#E5E1D8] p-6">
                  <h3 className="text-center font-serif text-lg mb-6 text-[#444]">Key Insights</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-[#478C5C] flex-shrink-0"></div>
                      <div>
                        <h4 className="font-serif text-sm italic text-[#444] mb-1">
                          {chartData.sun?.sign} Sun drives innovation and humanitarian ideals
                        </h4>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-[#4682B4] flex-shrink-0"></div>
                      <div>
                        <h4 className="font-serif text-sm italic text-[#444] mb-1">
                          {chartData.moon?.sign} Moon brings emotional detachment and humanitarian care
                        </h4>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-[#DC143C] flex-shrink-0"></div>
                      <div>
                        <h4 className="font-serif text-sm italic text-[#444] mb-1">
                          Scorpio Rising projects intensity and magnetic mystery
                        </h4>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Unlock Sol Codex Plus */}
                <motion.div 
                  variants={itemVariants}
                  className="bg-[#FCF6E5] border border-[#E6B13A] p-8 text-center"
                >
                  <div className="text-6xl mb-4">☉</div>
                  <h3 className="font-serif text-xl text-[#444] mb-2">Unlock Solara Plus</h3>
                  <p className="text-sm text-[#666] mb-6 max-w-md mx-auto">
                    Go beyond the basics with deep cosmic insights tailored to your unique blueprint
                  </p>
                  
                  <div className="space-y-2 mb-6 text-left max-w-sm mx-auto">
                    <div className="flex items-center gap-2">
                      <span className="text-[#E6B13A]">✦</span>
                      <span className="text-sm text-[#444]">Personal power phrases for your cosmic trinity</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#E6B13A]">✦</span>
                      <span className="text-sm text-[#444]">Life phase timing and breakthrough points</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#E6B13A]">✦</span>
                      <span className="text-sm text-[#444]">Deep synthesis of your archetype</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#E6B13A]">✦</span>
                      <span className="text-sm text-[#444]">Integration practices for daily alignment</span>
                    </div>
                  </div>
                  
                  <Link
                    href={hasSubscription ? "/soldash/you/expand/details" : "/soldash/you/expand/payment"}
                    className="inline-block w-full py-4 bg-[#E6B13A] text-black font-mono text-sm tracking-widest uppercase hover:bg-[#D4A02A] transition-colors"
                  >
                    UNLOCK SOLARA PLUS
                  </Link>
                </motion.div>
              </>
            ) : (
              <motion.div 
                className="bg-[#FCF6E5] border border-[#E5E1D8] p-12 text-center"
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
          </motion.div>
        )}
      </div>
    </div>
  );
} 