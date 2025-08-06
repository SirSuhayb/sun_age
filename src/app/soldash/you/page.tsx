'use client';
import { Tooltip } from '~/components/Soldash/Tooltip';
import Image from 'next/image';
import SolProfilePreview from '~/components/Soldash/SolProfilePreview';
import SolEvolution from '~/components/Soldash/SolEvolution';
import ExpandUnderstanding from '~/components/Soldash/ExpandUnderstanding';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { checkSubscriptionStatus } from '~/lib/subscription';
import NatalChartDisplay from '~/components/Soldash/NatalChartDisplay';
import Link from 'next/link';
import { Eye, Download, Share2, Sun, Moon, TrendingUp } from 'lucide-react';

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

// Planetary symbols mapping
const PLANET_SYMBOLS = {
  Sun: '☉',
  Moon: '☽',
  Mercury: '☿',
  Venus: '♀',
  Mars: '♂',
  Jupiter: '♃',
  Saturn: '♄',
  Uranus: '♅',
  Neptune: '♆',
  Pluto: '♇',
  'North Node': '☊',
  'South Node': '☋'
};

// Aspect symbols
const ASPECT_SYMBOLS = {
  conjunction: '☌',
  opposition: '☍',
  trine: '△',
  square: '□',
  sextile: '⚹'
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
                  <NatalChartDisplay chartData={chartData} className="mx-auto" />
                </motion.div>

                {/* Cosmic Trinity */}
                <motion.div variants={itemVariants}>
                  <h3 className="text-center font-serif text-lg mb-4 text-[#444]">Your cosmic trinity</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white border border-[#E5E1D8] p-4 text-center">
                      <div className="text-2xl mb-2">{PLANET_SYMBOLS.Sun}</div>
                      <div className="text-xs text-[#888] font-mono uppercase">Sun</div>
                      <div className="font-serif text-sm text-[#444] mt-1">{chartData.sun?.sign} {Math.round(chartData.sun?.degree)}°</div>
                    </div>
                    <div className="bg-white border border-[#E5E1D8] p-4 text-center">
                      <div className="text-2xl mb-2">{PLANET_SYMBOLS.Moon}</div>
                      <div className="text-xs text-[#888] font-mono uppercase">Moon</div>
                      <div className="font-serif text-sm text-[#444] mt-1">{chartData.moon?.sign} {Math.round(chartData.moon?.degree)}°</div>
                    </div>
                    <div className="bg-white border border-[#E5E1D8] p-4 text-center">
                      <div className="text-2xl mb-2"><TrendingUp className="w-6 h-6 mx-auto" /></div>
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
                              <td className="p-3 text-center text-xl">{PLANET_SYMBOLS[planet.name] || planet.name[0]}</td>
                              <td className="p-3 font-serif text-sm text-[#444]">{planet.name}</td>
                              <td className="p-3 text-center">
                                <span className="font-serif text-sm">{planet.sign}</span>
                                <span className="text-xs text-[#888] ml-1">{Math.round(planet.degree)}°</span>
                              </td>
                              <td className="p-3 font-serif text-sm text-[#444]">{planet.house}</td>
                              <td className="p-3 text-center">
                                {/* Aspect symbols would go here based on actual aspects */}
                                <span className="text-[#E6B13A] text-sm">
                                  {planet.aspects?.map((aspect: string) => ASPECT_SYMBOLS[aspect] || '').join(' ')}
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
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-[#478C5C] flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs">☉</span>
                      </div>
                      <div>
                        <h4 className="font-serif text-sm font-semibold text-[#444] mb-1">
                          {chartData.sun?.sign} Sun drives {
                            chartData.sun?.sign === 'Aries' ? 'pioneering leadership' :
                            chartData.sun?.sign === 'Taurus' ? 'material wisdom' :
                            chartData.sun?.sign === 'Gemini' ? 'intellectual versatility' :
                            chartData.sun?.sign === 'Cancer' ? 'emotional nurturing' :
                            chartData.sun?.sign === 'Leo' ? 'creative expression' :
                            chartData.sun?.sign === 'Virgo' ? 'analytical perfection' :
                            chartData.sun?.sign === 'Libra' ? 'harmonious balance' :
                            chartData.sun?.sign === 'Scorpio' ? 'transformative power' :
                            chartData.sun?.sign === 'Sagittarius' ? 'philosophical expansion' :
                            chartData.sun?.sign === 'Capricorn' ? 'ambitious achievement' :
                            chartData.sun?.sign === 'Aquarius' ? 'innovation and humanitarian ideals' :
                            'intuitive creativity'
                          }
                        </h4>
                        <p className="text-xs text-[#666]">
                          Your solar essence {
                            chartData.sun?.sign === 'Aries' ? 'initiates new beginnings' :
                            chartData.sun?.sign === 'Taurus' ? 'builds lasting foundations' :
                            chartData.sun?.sign === 'Gemini' ? 'connects diverse ideas' :
                            chartData.sun?.sign === 'Cancer' ? 'nurtures emotional bonds' :
                            chartData.sun?.sign === 'Leo' ? 'radiates authentic self-expression' :
                            chartData.sun?.sign === 'Virgo' ? 'refines through careful analysis' :
                            chartData.sun?.sign === 'Libra' ? 'seeks beauty and justice' :
                            chartData.sun?.sign === 'Scorpio' ? 'penetrates to core truths' :
                            chartData.sun?.sign === 'Sagittarius' ? 'expands horizons endlessly' :
                            chartData.sun?.sign === 'Capricorn' ? 'masters through discipline' :
                            chartData.sun?.sign === 'Aquarius' ? 'seeks progress and collective betterment' :
                            'flows with universal rhythms'
                          }
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-[#4682B4] flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs">☽</span>
                      </div>
                      <div>
                        <h4 className="font-serif text-sm font-semibold text-[#444] mb-1">
                          {chartData.moon?.sign} Moon brings {
                            chartData.moon?.sign === 'Aries' ? 'emotional courage and quick instincts' :
                            chartData.moon?.sign === 'Taurus' ? 'emotional stability and comfort' :
                            chartData.moon?.sign === 'Gemini' ? 'mental agility and curiosity' :
                            chartData.moon?.sign === 'Cancer' ? 'deep emotional receptivity' :
                            chartData.moon?.sign === 'Leo' ? 'warm-hearted generosity' :
                            chartData.moon?.sign === 'Virgo' ? 'practical emotional support' :
                            chartData.moon?.sign === 'Libra' ? 'emotional balance and harmony' :
                            chartData.moon?.sign === 'Scorpio' ? 'intense emotional depth' :
                            chartData.moon?.sign === 'Sagittarius' ? 'optimistic emotional freedom' :
                            chartData.moon?.sign === 'Capricorn' ? 'emotional maturity and control' :
                            chartData.moon?.sign === 'Aquarius' ? 'emotional detachment and humanitarian care' :
                            'boundless empathy and intuition'
                          }
                        </h4>
                        <p className="text-xs text-[#666]">
                          Your emotional nature {
                            chartData.moon?.sign === 'Aries' ? 'responds with immediacy' :
                            chartData.moon?.sign === 'Taurus' ? 'seeks security and pleasure' :
                            chartData.moon?.sign === 'Gemini' ? 'processes through communication' :
                            chartData.moon?.sign === 'Cancer' ? 'nurtures and protects deeply' :
                            chartData.moon?.sign === 'Leo' ? 'expresses with dramatic flair' :
                            chartData.moon?.sign === 'Virgo' ? 'analyzes feelings carefully' :
                            chartData.moon?.sign === 'Libra' ? 'seeks emotional equilibrium' :
                            chartData.moon?.sign === 'Scorpio' ? 'transforms through intensity' :
                            chartData.moon?.sign === 'Sagittarius' ? 'needs adventure and meaning' :
                            chartData.moon?.sign === 'Capricorn' ? 'maintains emotional discipline' :
                            chartData.moon?.sign === 'Aquarius' ? 'processes feelings through logic' :
                            'merges with collective consciousness'
                          }
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-[#DC143C] flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs">↗</span>
                      </div>
                      <div>
                        <h4 className="font-serif text-sm font-semibold text-[#444] mb-1">
                          {chartData.rising?.sign} Rising projects {
                            chartData.rising?.sign === 'Aries' ? 'bold confidence and initiative' :
                            chartData.rising?.sign === 'Taurus' ? 'calm stability and reliability' :
                            chartData.rising?.sign === 'Gemini' ? 'adaptable communication skills' :
                            chartData.rising?.sign === 'Cancer' ? 'nurturing protective energy' :
                            chartData.rising?.sign === 'Leo' ? 'natural charisma and warmth' :
                            chartData.rising?.sign === 'Virgo' ? 'refined efficiency and helpfulness' :
                            chartData.rising?.sign === 'Libra' ? 'diplomatic grace and charm' :
                            chartData.rising?.sign === 'Scorpio' ? 'intensity and magnetic mystery' :
                            chartData.rising?.sign === 'Sagittarius' ? 'optimistic adventurous spirit' :
                            chartData.rising?.sign === 'Capricorn' ? 'authority and competence' :
                            chartData.rising?.sign === 'Aquarius' ? 'unique progressive vision' :
                            'compassionate artistic sensitivity'
                          }
                        </h4>
                        <p className="text-xs text-[#666]">
                          Others perceive you as {
                            chartData.rising?.sign === 'Aries' ? 'a natural leader and pioneer' :
                            chartData.rising?.sign === 'Taurus' ? 'grounded and trustworthy' :
                            chartData.rising?.sign === 'Gemini' ? 'witty and intellectually engaging' :
                            chartData.rising?.sign === 'Cancer' ? 'caring and emotionally aware' :
                            chartData.rising?.sign === 'Leo' ? 'confident and entertaining' :
                            chartData.rising?.sign === 'Virgo' ? 'helpful and detail-oriented' :
                            chartData.rising?.sign === 'Libra' ? 'fair and aesthetically refined' :
                            chartData.rising?.sign === 'Scorpio' ? 'deep and transformative' :
                            chartData.rising?.sign === 'Sagittarius' ? 'wise and freedom-loving' :
                            chartData.rising?.sign === 'Capricorn' ? 'responsible and accomplished' :
                            chartData.rising?.sign === 'Aquarius' ? 'innovative and independent' :
                            'dreamy and spiritually attuned'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Unlock Sol Codex Plus */}
                <motion.div 
                  variants={itemVariants}
                  className="bg-gradient-to-br from-[#FCF6E5] to-[#FFF8E7] border-2 border-[#E6B13A] p-8 text-center"
                >
                  <Sun className="w-16 h-16 text-[#E6B13A] mx-auto mb-4" />
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
                    className="inline-block px-8 py-3 bg-[#E6B13A] text-black font-mono text-sm tracking-widest uppercase hover:bg-[#D4A02A] transition-colors"
                  >
                    {hasSubscription ? 'VIEW FULL ANALYSIS' : 'UNLOCK SOLARA PLUS'}
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