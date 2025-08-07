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
import { Sun, Moon, TrendingUp } from 'lucide-react';

// Planet symbols mapping with Unicode characters
const PLANET_SYMBOLS: Record<string, string> = {
  'Sun': '☉',
  'Moon': '☽', 
  'Mercury': '☿',
  'Venus': '♀',
  'Mars': '♂',
  'Jupiter': '♃',
  'Saturn': '♄',
  'Uranus': '♅',
  'Neptune': '♆',
  'Pluto': '♇',
  'North Node': '☊',
  'South Node': '☋',
  'Chiron': '⚷',
  'Rising': '↗',
  'Ascendant': 'Asc',
  'Midheaven': 'MC'
};

// Aspect symbols
const ASPECT_SYMBOLS: Record<string, string> = {
  'conjunction': '☌',
  'opposition': '☍',
  'trine': '△',
  'square': '□',
  'sextile': '⚹',
  'quincunx': '⚻'
};

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
    
    // Check for Mars-Jupiter conjunction as shown in mockup
    const mars = planets.find(p => p.name === 'Mars');
    const jupiter = planets.find(p => p.name === 'Jupiter');
    
    if (mars && jupiter && mars.sign === jupiter.sign && mars.house === jupiter.house) {
      conjunctions.push({
        type: 'Conjunction',
        bodies: ['Mars', 'Jupiter'],
        sign: mars.sign,
        house: mars.house
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
                    <div className="bg-white border border-[#E5E1D8] p-6 text-center">
                      <div className="w-10 h-10 bg-[#FF9500] rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-white text-xl font-geist-mono">{PLANET_SYMBOLS['Sun'] || <Sun className="w-5 h-5" />}</span>
                      </div>
                      <div className="text-xs text-[#888] font-mono uppercase tracking-wider">Sun</div>
                      <div className="font-serif text-sm text-[#444] mt-1">{chartData.sun?.sign} {Math.round(chartData.sun?.degree)}°</div>
                    </div>
                    <div className="bg-white border border-[#E5E1D8] p-6 text-center">
                      <div className="w-10 h-10 bg-[#B8C5D6] rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-white text-xl font-geist-mono">{PLANET_SYMBOLS['Moon'] || <Moon className="w-5 h-5" />}</span>
                      </div>
                      <div className="text-xs text-[#888] font-mono uppercase tracking-wider">Moon</div>
                      <div className="font-serif text-sm text-[#444] mt-1">{chartData.moon?.sign} {Math.round(chartData.moon?.degree)}°</div>
                    </div>
                    <div className="bg-white border border-[#E5E1D8] p-6 text-center">
                      <div className="w-10 h-10 bg-[#FF9500] rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-white text-xl font-geist-mono">{PLANET_SYMBOLS['Rising'] || <TrendingUp className="w-5 h-5" />}</span>
                      </div>
                      <div className="text-xs text-[#888] font-mono uppercase tracking-wider">Rising</div>
                      <div className="font-serif text-sm text-[#444] mt-1">{chartData.rising?.sign} {Math.round(chartData.rising?.degree)}°</div>
                    </div>
                  </div>
                </motion.div>

                {/* Planetary Arrangement */}
                <motion.div variants={itemVariants}>
                  <h3 className="text-center font-serif text-lg mb-4 text-[#444]">Your planetary arrangement</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {/* Sun */}
                    <div className="bg-white border border-[#E5E1D8] p-6">
                      <div className="flex items-start justify-between mb-2">
                        <div className="w-10 h-10 bg-[#FF9500] rounded-full flex items-center justify-center">
                          <span className="text-white text-xl font-geist-mono">{PLANET_SYMBOLS['Sun']}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[#E6B13A] text-lg">✦</span>
                          <span className="text-[#444] font-mono text-sm">3</span>
                        </div>
                      </div>
                      <div className="font-serif text-sm text-[#444] font-semibold">Sun</div>
                      <div className="text-xs text-[#888] mt-1">{chartData.sun?.sign} {Math.round(chartData.sun?.degree)}°</div>
                    </div>

                    {/* Moon */}
                    <div className="bg-white border border-[#E5E1D8] p-6">
                      <div className="flex items-start justify-between mb-2">
                        <div className="w-10 h-10 bg-[#B8C5D6] rounded-full flex items-center justify-center">
                          <span className="text-white text-xl font-geist-mono">{PLANET_SYMBOLS['Moon']}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[#E6B13A] text-lg">✦</span>
                          <span className="text-[#444] font-mono text-sm">3</span>
                        </div>
                      </div>
                      <div className="font-serif text-sm text-[#444] font-semibold">Moon</div>
                      <div className="text-xs text-[#888] mt-1">{chartData.moon?.sign} {Math.round(chartData.moon?.degree)}°</div>
                    </div>

                    {/* Rising */}
                    <div className="bg-white border border-[#E5E1D8] p-6">
                      <div className="flex items-start justify-between mb-2">
                        <div className="w-10 h-10 bg-[#FF9500] rounded-full flex items-center justify-center">
                          <span className="text-white text-xl font-geist-mono">{PLANET_SYMBOLS['Rising']}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[#E6B13A] text-lg">✦</span>
                          <span className="text-[#444] font-mono text-sm">1</span>
                        </div>
                      </div>
                      <div className="font-serif text-sm text-[#444] font-semibold">Rising</div>
                      <div className="text-xs text-[#888] mt-1">{chartData.rising?.sign} {Math.round(chartData.rising?.degree)}°</div>
                    </div>

                    {/* Other planets */}
                    {chartData.planets?.slice(0, 6).map((planet: any) => (
                      <div key={planet.name} className="bg-white border border-[#E5E1D8] p-6">
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-[#FF9500] text-2xl font-geist-mono">
                            {PLANET_SYMBOLS[planet.name] || planet.symbol || PLANET_SYMBOLS['Sun']}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[#E6B13A] text-lg">✦</span>
                            <span className="text-[#444] font-mono text-sm">{planet.house || '4'}</span>
                          </div>
                        </div>
                        <div className="font-serif text-sm text-[#444] font-semibold">{planet.name}</div>
                        <div className="text-xs text-[#888] mt-1">{planet.sign} {Math.round(planet.degree)}°</div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Special Configurations */}
                {(detectStelliums(chartData.planets).length > 0 || detectConjunctions(chartData.planets).length > 0) && (
                  <motion.div variants={itemVariants} className="space-y-4">
                    {detectStelliums(chartData.planets).map((stellium, index) => (
                      <div key={index} className="bg-[#FFFCF2] border-2 border-[#E6B13A] p-6 relative">
                        <div className="absolute -top-3 -left-3">
                          <span className="text-[#E6B13A] text-2xl">✦</span>
                        </div>
                        <h4 className="font-serif text-base text-[#E6B13A] mb-2 italic">
                          STELLIUM IN {stellium.sign.toUpperCase()}:
                        </h4>
                        <p className="text-sm text-[#444] leading-relaxed">
                          With {stellium.planets.length} planets in {stellium.sign}, you carry concentrated revolutionary vision and collective consciousness.
                        </p>
                      </div>
                    ))}
                    
                    {detectConjunctions(chartData.planets).map((conjunction, index) => (
                      <div key={index} className="bg-[#FFF5E6] border-2 border-[#FF9500] p-6 relative">
                        <div className="absolute -top-3 -left-3">
                          <span className="text-[#FF9500] text-2xl">{PLANET_SYMBOLS['Mars'] || '♂'}</span>
                        </div>
                        <h4 className="font-serif text-base text-[#FF9500] mb-2 italic">
                          {conjunction.bodies.join('-').toUpperCase()} CONJUNCTION:
                        </h4>
                        <p className="text-sm text-[#444] leading-relaxed">
                          Your {conjunction.house} house contains {conjunction.bodies.join(' and ')} in {conjunction.sign} granting you revolutionary creative power.
                        </p>
                      </div>
                    ))}
                  </motion.div>
                )}

                {/* Key Insights */}
                <motion.div variants={itemVariants} className="bg-white border border-[#E5E1D8] p-8">
                  <div className="flex items-center justify-center gap-6 mb-6">
                    <Image src="/you/little_nova.png" alt="Sun" width={60} height={60} />
                    <h3 className="text-center font-serif text-xl text-[#444]">Key Insights</h3>
                    <Image src="/you/little_nova.png" alt="Sun" width={60} height={60} />
                  </div>
                  <div className="space-y-6 max-w-2xl mx-auto">
                    <div className="bg-[#FFFCF2] border border-[#E5E1D8] p-4 flex items-start gap-4">
                      <div className="w-8 h-8 bg-[#478C5C] flex-shrink-0 rounded"></div>
                      <p className="font-serif text-sm text-[#444] italic leading-relaxed">
                        {chartData.sun?.sign} Sun drives innovation and humanitarian ideals
                      </p>
                    </div>
                    
                    <div className="bg-[#FFFCF2] border border-[#E5E1D8] p-4 flex items-start gap-4">
                      <div className="w-8 h-8 bg-[#7BA7E7] flex-shrink-0 rounded"></div>
                      <p className="font-serif text-sm text-[#444] italic leading-relaxed">
                        {chartData.moon?.sign} Moon brings emotional detachment and humanitarian care
                      </p>
                    </div>
                    
                    <div className="bg-[#FFFCF2] border border-[#E5E1D8] p-4 flex items-start gap-4">
                      <div className="w-8 h-8 bg-[#B8860B] flex-shrink-0 rounded"></div>
                      <p className="font-serif text-sm text-[#444] italic leading-relaxed">
                        Scorpio Rising projects intensity and magnetic mystery
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Unlock Sol Codex Plus */}
                <motion.div 
                  variants={itemVariants}
                  className="bg-gradient-to-b from-[#FFFCF2] to-[#FFF8E6] border-2 border-[#E6B13A] p-12 text-center"
                >
                  <Image 
                    src="/you/little_light.svg" 
                    alt="Solara Plus" 
                    width={120} 
                    height={120} 
                    className="mx-auto mb-6"
                  />
                  <h3 className="font-serif text-2xl text-[#444] mb-3">Unlock Solara Plus</h3>
                  <p className="text-xs font-mono uppercase tracking-widest text-[#888] mb-6">
                    GO BEYOND THE BASICS WITH DEEP COSMIC<br />
                    INSIGHTS TAILORED TO YOUR UNIQUE BLUEPRINT
                  </p>
                  
                  <div className="space-y-3 mb-8 text-left max-w-md mx-auto">
                    <div className="flex items-center gap-3">
                      <span className="text-[#E6B13A] text-xl">☉</span>
                      <span className="text-sm text-[#444]">Personal power phrases for your cosmic trinity</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[#E6B13A] text-xl">☉</span>
                      <span className="text-sm text-[#444]">Life phase timing and breakthrough points</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[#E6B13A] text-xl">☉</span>
                      <span className="text-sm text-[#444]">Deep synthesis of your archetype</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[#E6B13A] text-xl">☉</span>
                      <span className="text-sm text-[#444]">Integration practices for daily alignment</span>
                    </div>
                  </div>
                  
                  <Link
                    href={hasSubscription ? "/soldash/you/expand/details" : "/soldash/you/expand/payment"}
                    className="inline-block w-full max-w-sm py-4 bg-[#E6B13A] text-black font-mono text-sm tracking-widest uppercase hover:bg-[#D4A02A] transition-colors"
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