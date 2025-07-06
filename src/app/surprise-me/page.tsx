'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSolarArchetype } from '~/lib/solarIdentity';
import { surpriseMeFramework, DailyRoll } from '~/lib/surpriseMe';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export default function SurpriseMePage() {
  const router = useRouter();
  const [userArchetype, setUserArchetype] = useState<string | null>(null);
  const [dailyRolls, setDailyRolls] = useState<number>(3);
  const [hasRolledToday, setHasRolledToday] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [currentRoll, setCurrentRoll] = useState<DailyRoll | null>(null);
  const [showReveal, setShowReveal] = useState(false);
  const [rollHistory, setRollHistory] = useState<DailyRoll[]>([]);
  const [showGameExplanation, setShowGameExplanation] = useState(false);
  const [hasSeenExplanation, setHasSeenExplanation] = useState(false);

  useEffect(() => {
    // Get user's archetype from saved data
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sunCycleBookmark');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.birthDate) {
            const archetype = getSolarArchetype(parsed.birthDate);
            setUserArchetype(archetype);
          }
        } catch {}
      }

      // Check if user has seen the explanation before
      const seenExplanation = localStorage.getItem('surpriseMeExplanationSeen');
      setHasSeenExplanation(!!seenExplanation);
    }

    // Check daily rolls status
    const today = new Date().toDateString();
    const rollData = localStorage.getItem(`dailyRolls_${today}`);
    if (rollData) {
      const parsed = JSON.parse(rollData);
      setDailyRolls(parsed.remaining);
      setRollHistory(parsed.history || []);
      setHasRolledToday(parsed.history?.length > 0);
    }
  }, []);

  const handleRollClick = () => {
    if (!hasSeenExplanation) {
      setShowGameExplanation(true);
      return;
    }
    
    handleRoll();
  };

  const handleStartGame = () => {
    setShowGameExplanation(false);
    setHasSeenExplanation(true);
    localStorage.setItem('surpriseMeExplanationSeen', 'true');
    handleRoll();
  };

  const handleRoll = async () => {
    if (dailyRolls <= 0 || isRolling) return;

    setIsRolling(true);
    setShowReveal(false);

    // Simulate rolling animation delay
    setTimeout(() => {
      if (!userArchetype) return;
      
      // Create user profile for the framework
      const userProfile = (() => {
        const saved = localStorage.getItem('sunCycleBookmark');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            return surpriseMeFramework.getUserProfile(parsed.birthDate || '1990-01-01');
          } catch {}
        }
        return surpriseMeFramework.getUserProfile('1990-01-01');
      })();
      
      // Add current history to profile
      userProfile.history = rollHistory;
      
      const roll = surpriseMeFramework.generatePersonalizedRoll(userProfile);
      
      setCurrentRoll(roll);
      setShowReveal(true);
      setIsRolling(false);

      // Update daily rolls count
      const newCount = dailyRolls - 1;
      setDailyRolls(newCount);
      
      const newHistory = [...rollHistory, roll];
      setRollHistory(newHistory);
      setHasRolledToday(true);

      // Save to localStorage
      const today = new Date().toDateString();
      localStorage.setItem(`dailyRolls_${today}`, JSON.stringify({
        remaining: newCount,
        history: newHistory
      }));
    }, 2000);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600';
      case 'rare': return 'text-purple-600';
      case 'legendary': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-300';
      case 'rare': return 'border-purple-300';
      case 'legendary': return 'border-yellow-300';
      default: return 'border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Game Explanation Modal */}
      <AnimatePresence>
        {showGameExplanation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            {/* Sunrise gradient overlay */}
            <div className="absolute inset-0 bg-solara-sunrise" style={{ opacity: 0.6 }} />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative z-10 backdrop-blur-md bg-[#FFFCF2]/50 border border-gray-200 p-6 max-w-[360px] w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-3">
                <div className="text-xl font-serif font-bold" style={{ letterSpacing: '-0.06em' }}>
                  Cosmic Guidance Awaits
                </div>
                <button
                  onClick={() => setShowGameExplanation(false)}
                  aria-label="Close"
                  className="text-gray-500 hover:text-gray-800 text-xl font-bold"
                >
                  ×
                </button>
              </div>
              
              <div className="text-xs font-mono text-gray-500 mb-5 tracking-widest uppercase text-center">
                How the Surprise Me game works
              </div>

              <div className="space-y-4 text-sm text-gray-700">
                <div className="flex items-start gap-3">
                  <div className="text-xl flex-shrink-0">🌟</div>
                  <div>
                    <div className="font-semibold text-black mb-1">Personalized for Your Archetype</div>
                    <div>Every activity is tailored to your {userArchetype || 'Sol'} energy and cosmic blueprint.</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="text-xl flex-shrink-0">🎯</div>
                  <div>
                    <div className="font-semibold text-black mb-1">Three Types of Guidance</div>
                    <div>Receive <strong>activities</strong> to do, <strong>items</strong> to explore, or <strong>experiences</strong> to seek.</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="text-xl flex-shrink-0">✨</div>
                  <div>
                    <div className="font-semibold text-black mb-1">Rarity & Magic</div>
                    <div>Most guidance is <span className="text-gray-600">common</span>, some is <span className="text-purple-600">rare</span>, and occasionally you'll receive <span className="text-yellow-600">legendary</span> cosmic wisdom.</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="text-xl flex-shrink-0">🚀</div>
                  <div>
                    <div className="font-semibold text-black mb-1">Actionable Steps</div>
                    <div>Each revelation comes with specific ways to take action - links, searches, prompts, and more.</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="text-xl flex-shrink-0">🌙</div>
                  <div>
                    <div className="font-semibold text-black mb-1">Daily Renewal</div>
                    <div>You get <strong>3 free rolls daily</strong>. Each dawn brings fresh cosmic possibilities.</div>
                  </div>
                </div>

                {/* Premium Teaser */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="bg-gradient-to-r from-purple-50 to-amber-50 rounded-none p-3 border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-lg">🔮</div>
                      <div className="font-semibold text-purple-800 text-sm">Coming Soon: Solara+</div>
                    </div>
                    <div className="text-xs text-purple-700">
                      Unlock unlimited rolls, astrocartography travel guidance, and precision birth chart insights.
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowGameExplanation(false)}
                  className="flex-1 px-4 py-2 border border-gray-400 bg-gray-100 text-gray-700 rounded-none uppercase tracking-widest font-mono text-sm hover:bg-gray-200 transition-colors"
                >
                  Maybe Later
                </button>
                <button
                  onClick={handleStartGame}
                  className="flex-1 px-4 py-2 bg-[#d4af37] text-black font-mono uppercase tracking-widest text-sm rounded-none hover:bg-[#e6c75a] transition-colors"
                >
                  🎲 Start Rolling
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="w-full bg-white border-b border-amber-200 px-4 py-6">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-amber-700 hover:text-amber-800 transition-colors"
          >
            <span>←</span>
            <span className="font-mono text-sm uppercase tracking-wide">Back</span>
          </button>
          <div className="text-center">
            <h1 className="font-serif font-bold text-xl text-amber-800">Surprise Me</h1>
            <p className="font-mono text-xs uppercase text-amber-600 tracking-wide">Daily Cosmic Guidance</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-amber-700">🎲</span>
            <span className="font-mono text-sm text-amber-700">{dailyRolls}</span>
            {!hasSeenExplanation && (
              <button
                onClick={() => setShowGameExplanation(true)}
                className="ml-2 text-amber-600 hover:text-amber-700 text-xs"
                title="How it works"
              >
                ❓
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-8">
        {/* User Info */}
        {userArchetype && (
          <div className="bg-white rounded-lg border border-amber-200 p-4 mb-6">
            <div className="text-center">
              <div className="text-2xl mb-2">☀️</div>
              <div className="font-serif font-bold text-lg text-amber-800">{userArchetype}</div>
              <div className="font-mono text-sm text-amber-600 uppercase tracking-wide">
                Your cosmic guidance is personalized
              </div>
            </div>
          </div>
        )}

        {/* How It Works - for first time users */}
        {!hasSeenExplanation && !hasRolledToday && (
          <div className="bg-gradient-to-r from-purple-50 to-amber-50 rounded-lg border border-purple-200 p-4 mb-6">
            <div className="text-center">
              <div className="text-2xl mb-2">✨</div>
              <div className="font-serif font-bold text-lg text-purple-800 mb-2">New to Surprise Me?</div>
              <div className="text-sm text-purple-700 mb-3">
                Get personalized cosmic guidance tailored to your {userArchetype} energy.
              </div>
              <button
                onClick={() => setShowGameExplanation(true)}
                className="text-purple-700 hover:text-purple-800 underline font-mono text-xs uppercase tracking-wide"
              >
                Learn How It Works
              </button>
            </div>
          </div>
        )}

        {/* Roll Button */}
        <div className="text-center mb-8">
          <motion.button
            onClick={handleRollClick}
            disabled={dailyRolls <= 0 || isRolling}
            className={`relative overflow-hidden px-8 py-4 rounded-full font-serif font-bold text-lg transition-all duration-200 ${
              dailyRolls <= 0 || isRolling
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-amber-400 text-amber-900 hover:bg-amber-500 active:scale-95 shadow-lg hover:shadow-xl'
            }`}
            whileHover={dailyRolls > 0 && !isRolling ? { scale: 1.05 } : {}}
            whileTap={dailyRolls > 0 && !isRolling ? { scale: 0.95 } : {}}
          >
            {isRolling ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
                className="inline-block"
              >
                🎲
              </motion.div>
            ) : (
              '🎲'
            )}
            <span className="ml-2">
              {isRolling ? 'Rolling...' : dailyRolls > 0 ? 'Roll for Guidance' : 'No Rolls Left'}
            </span>
          </motion.button>
          
          {dailyRolls <= 0 && (
            <div className="mt-4">
              <button
                onClick={() => router.push('/surprise-me/more-rolls')}
                className="text-amber-700 hover:text-amber-800 underline font-mono text-sm uppercase tracking-wide"
              >
                Get More Rolls
              </button>
            </div>
          )}
        </div>

        {/* Roll Animation */}
        <AnimatePresence>
          {isRolling && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center py-8"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360] 
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="text-6xl mb-4"
              >
                ✨
              </motion.div>
              <div className="font-mono text-amber-700 uppercase tracking-wide">
                The cosmos is deciding...
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reveal */}
        <AnimatePresence>
          {showReveal && currentRoll && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <div className={`bg-white rounded-lg border-2 p-6 shadow-lg ${currentRoll.color} ${getRarityBorder(currentRoll.rarity)}`}>
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">{currentRoll.icon}</div>
                  <div className={`font-mono text-xs uppercase tracking-wide mb-1 ${getRarityColor(currentRoll.rarity)}`}>
                    {currentRoll.rarity} {currentRoll.type}
                  </div>
                  <div className="font-serif font-bold text-xl text-gray-800 mb-2">
                    {currentRoll.title}
                  </div>
                </div>
                <div className="text-gray-700 text-center leading-relaxed mb-6">
                  {currentRoll.description}
                </div>
                
                {/* Actionable Steps */}
                {currentRoll.actionableSteps && currentRoll.actionableSteps.length > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="font-serif font-bold text-lg text-gray-800 mb-3 text-center">
                      🎯 Ready to Take Action?
                    </h4>
                    <div className="space-y-3">
                      {currentRoll.actionableSteps.map((step, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <div className="flex items-start gap-3">
                            <div className="text-sm flex-shrink-0">
                              {step.type === 'link' && '🔗'}
                              {step.type === 'search' && '🔍'}
                              {step.type === 'prompt' && '💭'}
                              {step.type === 'list' && '📋'}
                              {step.type === 'booking' && '🏨'}
                              {step.type === 'product' && '🛍️'}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <div className="font-semibold text-gray-800 text-sm mb-1">
                                    {step.label}
                                    {step.affiliate && (
                                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                        💰 {step.affiliate.commission}
                                      </span>
                                    )}
                                  </div>
                                  {(step.type === 'link' || step.type === 'booking' || step.type === 'product') && step.url ? (
                                    <div>
                                      <div className="text-gray-600 text-sm mb-2">{step.content}</div>
                                      {step.price && (
                                        <div className="text-lg font-bold text-green-600 mb-2">{step.price}</div>
                                      )}
                                      <a
                                        href={step.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-amber-900 px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200"
                                      >
                                        {step.type === 'booking' ? 'Book Now' : 
                                         step.type === 'product' ? 'Buy Now' :
                                         step.price ? 'Buy Now' : 'Visit Link'} ↗
                                      </a>
                                      {step.affiliate && (
                                        <div className="text-xs text-gray-500 mt-2">
                                          📈 Commission: {step.affiliate.commission} via {step.affiliate.program}
                                        </div>
                                      )}
                                    </div>
                                  ) : step.type === 'search' ? (
                                    <div>
                                      <div className="text-gray-600 text-sm mb-2">Search for:</div>
                                      <div className="bg-white rounded border p-2 text-xs font-mono text-gray-700 mb-2 cursor-pointer" 
                                           onClick={() => navigator.clipboard?.writeText(step.content)}>
                                        {step.content}
                                        <div className="text-xs text-gray-500 mt-1">↑ Click to copy search terms</div>
                                      </div>
                                      <a
                                        href={`https://google.com/search?q=${encodeURIComponent(step.content)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-amber-900 px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200"
                                      >
                                        Google Search ↗
                                      </a>
                                    </div>
                                  ) : step.type === 'list' ? (
                                    <div className="text-gray-600 text-sm whitespace-pre-line">
                                      {step.content}
                                    </div>
                                  ) : (
                                    <div className="text-gray-600 text-sm">
                                      {step.content}
                                    </div>
                                  )}
                                </div>
                                {/* Product Image */}
                                {step.productImage && (
                                  <div className="flex-shrink-0 w-20 h-20">
                                    <img
                                      src={step.productImage}
                                      alt={step.label}
                                      className="w-full h-full object-cover rounded-lg border border-gray-200 shadow-sm"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Affiliate Disclosure */}
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="text-xs text-amber-800">
                        <strong>⚖️ Disclosure:</strong> This post contains affiliate links. We may earn a commission when you purchase through these links at no additional cost to you. This helps support our cosmic guidance mission while bringing you carefully curated recommendations.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Roll History */}
        {rollHistory.length > 0 && (
          <div className="mt-8">
            <h3 className="font-serif font-bold text-lg text-amber-800 mb-4 text-center">
              Today's Guidance
            </h3>
            <div className="space-y-3">
              {rollHistory.map((roll, index) => (
                <div key={roll.id} className={`bg-white rounded-lg border p-4 ${roll.color} opacity-75`}>
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{roll.icon}</div>
                    <div>
                      <div className="font-serif font-bold text-sm text-gray-800">{roll.title}</div>
                      <div className={`font-mono text-xs uppercase tracking-wide ${getRarityColor(roll.rarity)}`}>
                        {roll.rarity} {roll.type}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}