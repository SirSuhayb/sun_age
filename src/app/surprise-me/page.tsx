'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSolarArchetype } from '~/lib/solarIdentity';
import { surpriseMeFramework, DailyRoll } from '~/lib/surpriseMe';
import { solarEarningsManager } from '~/lib/solarEarnings';
import { useFrameSDK } from '~/hooks/useFrameSDK';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import type { RollEarnings } from '~/lib/solarEarnings';

export default function SurpriseMePage() {
  const router = useRouter();
  const { context, isInFrame, sdk } = useFrameSDK();
  const [userArchetype, setUserArchetype] = useState<string | null>(null);
  const [dailyRolls, setDailyRolls] = useState<number>(3);
  const [hasRolledToday, setHasRolledToday] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [currentRoll, setCurrentRoll] = useState<DailyRoll | null>(null);
  const [showReveal, setShowReveal] = useState(false);
  const [rollHistory, setRollHistory] = useState<DailyRoll[]>([]);
  const [showGameExplanation, setShowGameExplanation] = useState(false);
  const [hasSeenExplanation, setHasSeenExplanation] = useState(false);
  
  // SOLAR earning system state
  const [solarEarnings, setSolarEarnings] = useState({
    totalEarned: 0,
    todayEarned: 0,
    streakDays: 0,
    streakMultiplier: 1.0
  });
  const [lastRollEarnings, setLastRollEarnings] = useState<RollEarnings | null>(null);
  
  // Sharing state
  const [isSharing, setIsSharing] = useState(false);
  
  // Achievement notifications
  const [achievementNotifications, setAchievementNotifications] = useState<string[]>([]);
  const [showAchievements, setShowAchievements] = useState(false);

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
      
      // Initialize SOLAR earnings
      const earnings = solarEarningsManager.getEarningsSummary();
      setSolarEarnings(earnings);
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
      
      // Award SOLAR tokens for this roll with all bonuses
      const rollEarnings = solarEarningsManager.awardSolar(roll.rarity, roll.title);
      setLastRollEarnings(rollEarnings);
      
      // Show achievement notifications if any were unlocked
      if (rollEarnings.achievements.unlocked.length > 0) {
        setAchievementNotifications(rollEarnings.achievements.unlocked);
        setShowAchievements(true);
        // Auto-hide after 5 seconds
        setTimeout(() => setShowAchievements(false), 5000);
      }
      
      // Update earnings display
      const updatedEarnings = solarEarningsManager.getEarningsSummary();
      setSolarEarnings(updatedEarnings);
      
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

  const handleShare = async () => {
    if (!currentRoll || isSharing) return;
    
    setIsSharing(true);
    const userName = context?.user?.displayName || 'TRAVELLER';
    const solarEarned = lastRollEarnings?.totalEarned;
    const streak = solarEarnings.streakDays;
    
    try {
      const { shareRoll } = await import('~/lib/sharing');
      await shareRoll(
        {
          title: currentRoll.title,
          description: currentRoll.description,
          archetype: currentRoll.archetype,
          rarity: currentRoll.rarity,
          icon: currentRoll.icon,
          type: currentRoll.type,
        },
        userName,
        solarEarned,
        streak,
        sdk,
        isInFrame
      );
      
      // Award social sharing achievement bonus
      solarEarningsManager.markSocialShare();
      
      // Update earnings display
      const updatedEarnings = solarEarningsManager.getEarningsSummary();
      setSolarEarnings(updatedEarnings);
      
    } catch (err) {
      console.error('Error sharing roll:', err);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="min-h-screen relative z-10" style={{ background: '#FFFCF2' }}>
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
                    <div>Most guidance is <span className="text-gray-600">common</span>, some is <span className="text-purple-600">rare</span>, and occasionally you&apos;ll receive <span className="text-yellow-600">legendary</span> cosmic wisdom.</div>
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

      {/* Achievement Notifications */}
      <AnimatePresence>
        {showAchievements && achievementNotifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-4 right-4 z-40 max-w-md mx-auto"
          >
                         <div className="backdrop-blur-md bg-[#FFFCF2]/50 border border-gray-200 p-6 shadow-lg">
               <div className="text-center">
                 <div className="text-3xl mb-2">🏆</div>
                 <div className="text-xl font-serif font-bold mb-2" style={{ letterSpacing: '-0.06em' }}>
                   Achievement{achievementNotifications.length > 1 ? 's' : ''} Unlocked!
                 </div>
                 <div className="space-y-1 mb-4">
                   {achievementNotifications.map((achievement, index) => (
                     <div key={index} className="font-mono text-sm text-gray-700 bg-white border border-gray-200 px-2 py-1">
                       {achievement}
                     </div>
                   ))}
                 </div>
                 <button
                   onClick={() => setShowAchievements(false)}
                   className="px-6 py-3 bg-[#d4af37] text-black font-mono uppercase tracking-widest text-sm hover:bg-[#e6c75a] transition-colors border border-black"
                 >
                   Awesome!
                 </button>
               </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="w-full bg-white border-b border-amber-200 px-4 py-6 relative z-20">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-700 hover:text-black transition-colors"
          >
            <span>←</span>
            <span className="font-mono text-sm uppercase tracking-widest">Back</span>
          </button>
          <div className="text-center">
            <h1 className="font-serif font-bold text-xl text-black" style={{ letterSpacing: '-0.06em' }}>Surprise Me</h1>
            <p className="font-mono text-xs uppercase text-gray-500 tracking-widest">Daily Cosmic Guidance</p>
          </div>
                      <div className="flex items-center gap-2">
              <span className="text-gray-700">🎲</span>
              <span className="font-mono text-sm text-gray-700">{dailyRolls}</span>
              {!hasSeenExplanation && (
                <button
                  onClick={() => setShowGameExplanation(true)}
                  className="ml-2 text-gray-600 hover:text-gray-700 text-xs"
                  title="How it works"
                >
                  ❓
                </button>
              )}
            </div>
        </div>
      </div>

      {/* SOLAR Earnings Display */}
      <div className="w-full bg-white border-b border-gray-200 px-4 py-3 relative z-20">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-sm font-mono font-bold text-black">
                {solarEarnings.totalEarned.toLocaleString()} $SOLAR
              </div>
              <div className="text-xs font-mono text-gray-500 uppercase tracking-widest">
                Total Earned
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-mono font-bold text-black flex items-center gap-1">
                {solarEarnings.streakDays} {solarEarnings.streakDays > 1 ? '🔥' : ''}
              </div>
              <div className="text-xs font-mono text-gray-500 uppercase tracking-widest">
                Day Streak
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-mono font-bold text-black">
              {solarEarnings.streakMultiplier.toFixed(1)}x
            </div>
            <div className="text-xs font-mono text-gray-500 uppercase tracking-widest">
              Multiplier
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-8 relative z-20">
        {/* User Info */}
        {userArchetype && (
          <div className="bg-white border border-gray-200 p-4 mb-6">
            <div className="text-center">
              <div className="text-2xl mb-2">☀️</div>
              <div className="font-serif font-bold text-lg text-black" style={{ letterSpacing: '-0.06em' }}>{userArchetype}</div>
              <div className="font-mono text-xs text-gray-500 uppercase tracking-widest">
                Your cosmic guidance is personalized
              </div>
            </div>
          </div>
        )}

        {/* Achievement Progress */}
        {(() => {
          const progress = solarEarningsManager.getAchievementProgress();
          return (
            <div className="bg-white border border-gray-200 p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="font-serif font-bold text-lg text-black" style={{ letterSpacing: '-0.06em' }}>Achievements</div>
                <div className="font-mono text-sm text-gray-700">
                  {progress.completed}/{progress.total}
                </div>
              </div>
              <div className="w-full bg-gray-200 h-2 mb-3">
                <div 
                  className="bg-[#d4af37] h-2 transition-all duration-300"
                  style={{ width: `${(progress.completed / progress.total) * 100}%` }}
                />
              </div>
              {progress.nextAchievements.length > 0 && (
                <div>
                  <div className="font-mono text-xs text-gray-500 uppercase tracking-widest mb-2">
                    Next Goals:
                  </div>
                  <div className="space-y-1">
                    {progress.nextAchievements.slice(0, 2).map((achievement, index) => (
                      <div key={index} className="text-xs font-mono text-gray-700 bg-gray-50 border border-gray-200 px-2 py-1">
                        {achievement}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* How It Works - for first time users */}
        {!hasSeenExplanation && !hasRolledToday && (
          <div className="bg-white border border-gray-200 p-4 mb-6">
            <div className="text-center">
              <div className="text-2xl mb-2">✨</div>
              <div className="font-serif font-bold text-lg text-black mb-2" style={{ letterSpacing: '-0.06em' }}>New to Surprise Me?</div>
              <div className="text-sm text-gray-700 mb-3">
                Get personalized cosmic guidance tailored to your {userArchetype} energy.
              </div>
              <button
                onClick={() => setShowGameExplanation(true)}
                className="text-gray-700 hover:text-black underline font-mono text-xs uppercase tracking-widest"
              >
                Learn How It Works
              </button>
            </div>
          </div>
        )}

        {/* Special Event Notification */}
        {(() => {
          const eventMultiplier = solarEarningsManager.getEventMultiplier();
          if (eventMultiplier > 1.0) {
            return (
              <div className="bg-white border-2 border-[#d4af37] p-4 mb-6">
                <div className="text-center">
                  <div className="text-3xl mb-2">🌟</div>
                  <div className="font-serif font-bold text-lg text-black mb-2" style={{ letterSpacing: '-0.06em' }}>
                    Cosmic Event Active!
                  </div>
                  <div className="font-mono text-sm text-gray-700">
                    {eventMultiplier.toFixed(1)}x SOLAR bonus for all rolls today!
                  </div>
                  {eventMultiplier === 3.0 && (
                    <div className="text-xs font-mono text-gray-500 mt-1 uppercase tracking-widest">
                      🌒 Solar Eclipse Energy
                    </div>
                  )}
                  {eventMultiplier === 2.0 && (
                    <div className="text-xs font-mono text-gray-500 mt-1 uppercase tracking-widest">
                      ❄️ Winter Solstice - Cosmic Convergence
                    </div>
                  )}
                  {eventMultiplier === 1.5 && (
                    <div className="text-xs font-mono text-gray-500 mt-1 uppercase tracking-widest">
                      🌕 Full Moon Power
                    </div>
                  )}
                </div>
              </div>
            );
          }
          return null;
        })()}

        {/* Roll Button */}
        <div className="text-center mb-8">
          <motion.button
            onClick={handleRollClick}
            disabled={dailyRolls <= 0 || isRolling}
            className={`relative overflow-hidden px-8 py-4 font-mono font-bold text-lg transition-all duration-200 border border-black uppercase tracking-widest ${
              dailyRolls <= 0 || isRolling
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-[#d4af37] text-black hover:bg-[#e6c75a]'
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
                className="text-gray-700 hover:text-black underline font-mono text-sm uppercase tracking-widest"
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
              <div className="font-mono text-gray-500 uppercase tracking-widest">
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
              <div className={`bg-white border-2 p-6 ${currentRoll.color} ${getRarityBorder(currentRoll.rarity)}`}>
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">{currentRoll.icon}</div>
                                      <div className={`font-mono text-xs uppercase tracking-widest mb-1 ${getRarityColor(currentRoll.rarity)}`}>
                      {currentRoll.rarity} {currentRoll.type}
                    </div>
                  <div className="font-serif font-bold text-xl text-gray-800 mb-2">
                    {currentRoll.title}
                  </div>
                </div>
                <div className="text-gray-700 text-center leading-relaxed mb-6">
                  {currentRoll.description}
                </div>

                {/* SOLAR Earnings Celebration */}
                {lastRollEarnings && (
                  <div className="bg-white border border-[#d4af37] p-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl mb-2">🎉</div>
                      <div className="font-mono font-bold text-black text-lg uppercase tracking-widest">
                        +{lastRollEarnings.totalEarned} $SOLAR EARNED!
                      </div>
                      <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mt-1">
                        Base: {lastRollEarnings.baseAmount} • Streak: {lastRollEarnings.streakMultiplier.toFixed(1)}x
                        {lastRollEarnings.eventMultiplier > 1.0 && (
                          <span> • Event: {lastRollEarnings.eventMultiplier.toFixed(1)}x</span>
                        )}
                      </div>
                      
                      {/* Bonus Earnings */}
                      {lastRollEarnings.totalBonusEarned > 0 && (
                        <div className="bg-white border border-gray-200 p-3 mt-3">
                          <div className="font-mono font-bold text-black uppercase tracking-widest">
                            +{lastRollEarnings.totalBonusEarned} BONUS $SOLAR!
                          </div>
                          <div className="text-xs text-gray-500 mt-1 uppercase tracking-widest">
                            {lastRollEarnings.achievements.bonusEarned > 0 && (
                              <div>🏆 Achievements: +{lastRollEarnings.achievements.bonusEarned}</div>
                            )}
                            {lastRollEarnings.bonuses.weeklyBonus > 0 && (
                              <div>📅 Weekly Bonus: +{lastRollEarnings.bonuses.weeklyBonus}</div>
                            )}
                            {lastRollEarnings.bonuses.monthlyBonus > 0 && (
                              <div>🗓️ Monthly Bonus: +{lastRollEarnings.bonuses.monthlyBonus}</div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {lastRollEarnings.newStreak > 1 && (
                        <div className="text-sm font-mono text-gray-700 mt-2">
                          🔥 {lastRollEarnings.newStreak} day streak! Keep rolling daily for higher multipliers!
                        </div>
                      )}
                      {lastRollEarnings.streakBroken && (
                        <div className="text-sm font-mono text-gray-600 mt-2">
                          💔 Your streak was broken. Start fresh today!
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Share Button */}
                <div className="flex justify-center mb-6">
                  <button
                    onClick={handleShare}
                    disabled={isSharing}
                    className="flex items-center gap-2 px-6 py-3 bg-[#d4af37] text-black font-mono uppercase tracking-widest text-sm rounded-none hover:bg-[#e6c75a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-black"
                  >
                    {isSharing ? (
                      <>
                        <span>Sharing...</span>
                        <div className="animate-spin">🌟</div>
                      </>
                    ) : (
                      <>
                        <span>Share Roll</span>
                        <span>📤</span>
                      </>
                    )}
                  </button>
                </div>
                
                {/* Actionable Steps */}
                {currentRoll.actionableSteps && currentRoll.actionableSteps.length > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="font-serif font-bold text-lg text-gray-800 mb-3 text-center">
                      🎯 Ready to Take Action?
                    </h4>
                    <div className="space-y-3">
                      {currentRoll.actionableSteps.map((step, index) => (
                        <div key={index} className="bg-gray-50 p-3 border border-gray-200">
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
                                        className="inline-flex items-center gap-2 bg-[#d4af37] hover:bg-[#e6c75a] text-black px-3 py-1 text-xs font-mono uppercase tracking-widest transition-colors duration-200 border border-black"
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
                                        className="inline-flex items-center gap-2 bg-[#d4af37] hover:bg-[#e6c75a] text-black px-3 py-1 text-xs font-mono uppercase tracking-widest transition-colors duration-200 border border-black"
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
                                    <Image
                                      src={step.productImage}
                                      alt={step.label}
                                      width={80}
                                      height={80}
                                      className="w-full h-full object-cover border border-gray-200"
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
                    <div className="mt-4 p-3 bg-gray-50 border border-gray-200">
                      <div className="text-xs text-gray-700">
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
            <h3 className="font-serif font-bold text-lg text-black mb-4 text-center" style={{ letterSpacing: '-0.06em' }}>
              Today&apos;s Guidance
            </h3>
            <div className="space-y-3">
              {rollHistory.map((roll, index) => (
                <div key={roll.id} className={`bg-white border p-4 ${roll.color} opacity-75`}>
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{roll.icon}</div>
                    <div>
                      <div className="font-serif font-bold text-sm text-gray-800">{roll.title}</div>
                      <div className={`font-mono text-xs uppercase tracking-widest ${getRarityColor(roll.rarity)}`}>
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