'use client';

import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { useAccount, useConnect } from 'wagmi';
import { useFrameSDK } from '~/hooks/useFrameSDK';

import { SolarEarningsManager } from '~/lib/solarEarnings';
import { ConfirmationModal, SimpleModal } from '~/components/ui/ConfirmationModal';
import Image from 'next/image';
import type { RefObject } from 'react';
import { getSolarArchetype } from '~/lib/solarIdentity';
import { surpriseMeFramework, DailyRoll } from '~/lib/surpriseMe';
import { solarEarningsManager } from '~/lib/solarEarnings';
import Link from 'next/link';
import OracleStatusBar from '~/components/ui/OracleStatusBar';
import { useUnifiedShare } from '~/components/UnifiedShareFlow';

export default function SurpriseMePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const birthDate = searchParams.get('birthDate') || '';
  const userArchetype = getSolarArchetype(birthDate);
  
  // Reset all existing user data to start fresh on first visit after production update
  useEffect(() => {
    const resetAllUserData = () => {
      // Check if this is the first visit after production update
      const currentVersion = '2.0.0'; // Increment this when you push to production
      const storedVersion = localStorage.getItem('solara_app_version');
      
      if (storedVersion !== currentVersion) {
        console.log('First visit after production update - resetting user data');
        
        // Clear all daily rolls data
        const todayDate = new Date().toDateString();
        localStorage.removeItem(`dailyRolls_${todayDate}`);
        
        // Clear any other surprise-me related data
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('dailyRolls_') || key.includes('surprise') || key.includes('roll'))) {
            keysToRemove.push(key);
          }
        }
        
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        // Reset solar earnings related to surprise-me
        const earnings = solarEarningsManager.getEarnings();
        
        // Remove any surprise-me related earnings
        earnings.earningsHistory = earnings.earningsHistory.filter(h => 
          !h.bonusType || (h.bonusType !== 'oracle' && h.bonusType !== 'guidance')
        );
        
        // Save the updated earnings
        localStorage.setItem('solarEarnings', JSON.stringify(earnings));
        
        // Store the new version to prevent future resets
        localStorage.setItem('solara_app_version', currentVersion);
        
        console.log('User data has been reset for fresh start');
      }
    };
    
    resetAllUserData();
  }, []);

  const { context, isInFrame, sdk } = useFrameSDK();
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { triggerShare, ShareFlowComponent } = useUnifiedShare();
  const [dailyRolls, setDailyRolls] = useState<number>(3);
  const [hasRolledToday, setHasRolledToday] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [currentRoll, setCurrentRoll] = useState<DailyRoll | null>(null);
  const [showReveal, setShowReveal] = useState(false);
  const [rollHistory, setRollHistory] = useState<DailyRoll[]>([]);
  const [showGameExplanation, setShowGameExplanation] = useState(false);
  const [hasSeenExplanation, setHasSeenExplanation] = useState(false);
  
  // Wallet tooltip state
  const [walletTooltipDismissed, setWalletTooltipDismissed] = useState(false);
  
  // Token distribution state
  const [isDistributingTokens, setIsDistributingTokens] = useState(false);
  const [tokenDistributionResult, setTokenDistributionResult] = useState<any>(null);
  
  // SOLAR earning system state
  const [solarEarnings, setSolarEarnings] = useState({
    totalEarned: 0,
    todayEarned: 0,
    streakDays: 0,
    streakMultiplier: 1.0
  });
  const [lastRollEarnings, setLastRollEarnings] = useState<any | null>(null);
  
  // Sharing state
  const [isSharing, setIsSharing] = useState(false);
  
  // Achievement notifications
  const [achievementNotifications, setAchievementNotifications] = useState<string[]>([]);
  const [showAchievements, setShowAchievements] = useState(false);
  const [availableRolls, setAvailableRolls] = useState<number>(0);

  // --- Responsive Orbit Calculation State ---
  const [dimensions, setDimensions] = useState({ width: 480, height: 280 });
  const containerRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLImageElement>(null);
  // Update dimensions on resize
  const updateDimensions = () => {
    if (bgRef.current) {
      const rect = (bgRef.current as HTMLImageElement).getBoundingClientRect();
      setDimensions({ width: rect.width, height: rect.height });
    }
  };
  useLayoutEffect(() => {
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    // Get user's archetype from saved data
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sunCycleBookmark');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.birthDate) {
            const archetype = getSolarArchetype(parsed.birthDate);
            // Note: userArchetype is already set from the URL params
          }
        } catch {}
      }

      // Check if user has seen the explanation before
      const seenExplanation = localStorage.getItem('surpriseMeExplanationSeen');
      setHasSeenExplanation(!!seenExplanation);
      
      // Check if wallet tooltip has been dismissed
      const tooltipDismissed = localStorage.getItem('walletTooltipDismissed');
      setWalletTooltipDismissed(!!tooltipDismissed);
      
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
      setAvailableRolls(parsed.remaining); // <-- update availableRolls
      setRollHistory(parsed.history || []);
      setHasRolledToday(parsed.history?.length > 0);
    } else {
      setAvailableRolls(3); // default if not found
    }
  }, []);

  // Reset wallet tooltip dismissed state when user connects wallet
  useEffect(() => {
    if (isConnected && walletTooltipDismissed) {
      setWalletTooltipDismissed(false);
      localStorage.removeItem('walletTooltipDismissed');
    }
  }, [isConnected, walletTooltipDismissed]);



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

  // --- Roll Animation Control ---
  // Store the current planet angles so they persist after animation
  const [planetAngles, setPlanetAngles] = useState({
    earth: 305,
    mercury: 160,
    venus: 70,
    mars: 150,
  });
  // When a roll is triggered, animate each planet for one 360º orbit, then update their angles
  const handleRoll = async () => {
    if (dailyRolls <= 0 || isRolling) return;
    setIsRolling(true);
    setShowReveal(false);
    
    // Trigger planet animation by updating angles
    const newAngles = {
      earth: planetAngles.earth + 360,
      mercury: planetAngles.mercury + 360,
      venus: planetAngles.venus + 360,
      mars: planetAngles.mars + 360,
    };
    setPlanetAngles(newAngles);
    
    // Wait for the animation duration (6s)
    setTimeout(async () => {
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
      
      const roll = await surpriseMeFramework.generatePersonalizedRoll(userProfile);
      
      // Award SOLAR tokens for this roll with all bonuses (only once per day)
      const rollEarnings = solarEarningsManager.awardSolar(roll.rarity, roll.title);
      setLastRollEarnings(rollEarnings);
      
      // Debug logging
      console.log('Roll earnings:', rollEarnings);
      console.log('Wallet connected:', isConnected);
      console.log('Wallet address:', address);
      console.log('Total earned:', rollEarnings.totalEarned);
      
      // Additional debugging for earnings history
      const earnings = solarEarningsManager.getEarnings();
      const todayDate = new Date().toDateString();
      const todayOracleRolls = earnings.earningsHistory.filter(h => h.date === todayDate && h.bonusType === 'roll');
      console.log('Today\'s date:', todayDate);
      console.log('Today\'s oracle rolls:', todayOracleRolls);
      console.log('All earnings history:', earnings.earningsHistory);
      
      // Distribute tokens to user's wallet if connected
      if (isConnected && address && rollEarnings.totalEarned > 0) {
        console.log('Attempting token distribution...');
        setIsDistributingTokens(true);
        try {
          const response = await fetch('/api/tokens/roll-earnings', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              walletAddress: address,
              amount: rollEarnings.totalEarned,
              rollTitle: roll.title,
              rarity: roll.rarity
            })
          });
          
          const result = await response.json();
          console.log('API response:', result);
          if (result.success) {
            setTokenDistributionResult(result);
            console.log('Tokens distributed successfully:', result);
          } else {
            console.error('Token distribution failed:', result.error);
          }
        } catch (error) {
          console.error('Error distributing tokens:', error);
        } finally {
          setIsDistributingTokens(false);
        }
      } else {
        console.log('Token distribution skipped:', {
          isConnected,
          hasAddress: !!address,
          totalEarned: rollEarnings.totalEarned
        });
      }
      
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
      setAvailableRolls(newCount); // <-- update availableRolls
      
      const newHistory = [...rollHistory, roll];
      setRollHistory(newHistory);
      setHasRolledToday(true);

      // Save to localStorage
      const today = new Date().toDateString();
      localStorage.setItem(`dailyRolls_${today}`, JSON.stringify({
        remaining: newCount,
        history: newHistory
      }));
    }, 6000); // 6 seconds for the animation
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
      // For Farcaster users, use the existing share flow
      if (isInFrame) {
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
      } else {
        // For non-Farcaster users, use the unified share flow
        const rarityEmoji = currentRoll.rarity === 'legendary' ? '🌟' : currentRoll.rarity === 'rare' ? '💎' : '✨';
        triggerShare({
          content: {
            type: 'roll',
            title: 'My Cosmic Guidance',
            description: `The cosmos has guided me to ${currentRoll.title}`,
            data: {
              title: currentRoll.title,
              description: currentRoll.description,
              archetype: currentRoll.archetype,
              rarity: currentRoll.rarity,
              icon: currentRoll.icon,
              type: currentRoll.type,
              solarEarned,
              streak
            }
          },
          userName,
          onShareComplete: (platform, shareId) => {
            console.log(`Roll shared on ${platform} with ID: ${shareId}`);
            
            // Award social sharing achievement bonus
            solarEarningsManager.markSocialShare();
            
            // Update earnings display
            const updatedEarnings = solarEarningsManager.getEarningsSummary();
            setSolarEarnings(updatedEarnings);
          }
        });
      }
      
    } catch (err) {
      console.error('Error sharing roll:', err);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="relative z-10 min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* OracleStatusBar centered under header */}
      <div className="pt-20 flex justify-center">
        <div className="max-w-md w-full">
          <OracleStatusBar
            solarBalance={solarEarnings.totalEarned}
            achievements={{ unlocked: 0, total: 13 }} // TODO: Replace with real achievement data
            rolls={availableRolls}
            onHowToPlay={() => setShowGameExplanation(true)}
          />
        </div>
      </div>

      {/* Game Explanation Modal */}
      {showGameExplanation && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[2147483647] flex items-center justify-center p-4">
          {/* Sunrise gradient overlay */}
          <div className="absolute inset-0 bg-solara-sunrise" style={{ opacity: 0.6 }} />
          <div className="relative z-10 backdrop-blur-md bg-[#FFFCF2]/50 border border-gray-200 p-6 max-w-[360px] w-full max-h-[90vh] overflow-y-auto">
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
            </div>
          </div>,
          window.document.body
        )}

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
                  className="px-6 py-3 bg-[#d4af37] text-black font-mono uppercase tracking-widest text-sm hover:bg-[#e6c75a] transition-colors"
                >
                  Awesome!
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Token Distribution Notification */}
      {isDistributingTokens && (
        <div className="fixed top-4 right-4 z-50 bg-yellow-100 border border-yellow-300 p-4 rounded-none shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="text-yellow-600">🌞</div>
            <div className="text-sm font-mono text-yellow-800">
              DISTRIBUTING SOLAR TOKENS...
            </div>
          </div>
        </div>
      )}

      {tokenDistributionResult && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-300 p-4 rounded-none shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="text-green-600">✅</div>
            <div className="text-sm font-mono text-green-800">
              {tokenDistributionResult.amount} SOLAR TOKENS SENT!
            </div>
          </div>
          <div className="text-xs font-mono text-green-600 mt-1">
            TX: {tokenDistributionResult.transactionHash?.slice(0, 10)}...
          </div>
        </div>
      )}

      {/* Wallet Connection Prompt - only show for web users who haven't dismissed it */}
      {!isConnected && !isInFrame && !walletTooltipDismissed && (
        <div className="fixed bottom-4 left-4 right-4 z-[60] bg-blue-100 border border-blue-300 p-4 rounded-none shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="text-blue-600">🔗</div>
              <div className="text-sm font-mono text-blue-800">
                CONNECT WALLET TO RECEIVE SOLAR TOKENS
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  // For web users, prefer injected wallet (MetaMask, etc.) over Farcaster frame
                  const webConnector = connectors.find(c => c.id === 'injected' || c.name.toLowerCase().includes('injected')) || connectors[0];
                  console.log('Connecting with connector:', webConnector.name, webConnector.id);
                  connect({ connector: webConnector });
                }}
                className="px-4 py-2 bg-blue-600 text-white font-mono text-xs hover:bg-blue-700 transition-colors"
              >
                CONNECT
              </button>
              <button
                onClick={() => {
                  setWalletTooltipDismissed(true);
                  localStorage.setItem('walletTooltipDismissed', 'true');
                }}
                className="px-2 py-2 text-blue-600 hover:text-blue-800 font-mono text-xs transition-colors"
                aria-label="Dismiss wallet connection prompt"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Title Section */}
      <div className="flex flex-col items-center justify-center mt-8 mb-6">
        <h1 className="font-serif font-bold text-3xl text-black mb-1" style={{ letterSpacing: '-0.04em' }}>
          the sol oracle
        </h1>
        <div className="font-mono text-xs uppercase tracking-widest text-gray-500 mb-3">
          ROLL FOR COSMIC GUIDANCE
        </div>
        <div className="flex flex-row gap-2 mt-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <Image
              key={i}
              src="/sunsun.png"
              alt={i < availableRolls ? 'Available roll' : 'Used roll'}
              width={40}
              height={40}
              style={{ opacity: i < availableRolls ? 1 : 0.3, transition: 'opacity 0.2s' }}
            />
          ))}
        </div>
      </div>

      {/* Cosmic Animation Section with Overlapping Cards */}
      <div ref={containerRef} className="relative flex justify-center items-center w-full mb-0" style={{ minHeight: 340 }}>
        {/* Background SVG */}
        <div className="flex justify-center items-center w-full">
          <Image
            ref={bgRef}
            src="/oracle/space.svg"
            alt="Cosmic Background"
            width={480}
            height={280}
            style={{ maxWidth: '98vw', height: 'auto' }}
            onLoadingComplete={updateDimensions}
          />
        </div>
        
        {/* Animated Planets */}
        {(() => {
          // Center of the SVG in px - ensure it's centered relative to the container
          const cx = dimensions.width / 2;
          const cy = dimensions.height / 2;
          // Orbit radii in px - adjusted to match the actual orbit rings in the SVG
          const orbits = {
            earth: dimensions.width * 0.28,    // inner orbit ring
            mercury: dimensions.width * 0.15,  // second orbit ring
            venus: dimensions.width * 0.22,    // third orbit ring
            mars: dimensions.width * 0.35,     // outer orbit ring
          };
          // Initial angles (in degrees) to match the attached image
          const initialAngles = {
            earth: 305,    // top right
            mercury: 160,  // lower left
            venus: 70,     // lower right
            mars: 150,     // far left
          };
          const duration = 6;

          function AnimatedPlanet({ src, alt, size, radius, initialAngle, angleKey }) {
            // Animate from the current angle to the new angle when a roll is triggered
            const angle = useMotionValue(planetAngles[angleKey]);
            useEffect(() => {
              let controls;
              if (isRolling) {
                // Animate from current angle to new angle (360 degrees)
                const startAngle = angle.get();
                const endAngle = startAngle + 360;
                controls = animate(startAngle, endAngle, {
                  duration: 4,
                  ease: 'linear',
                  onUpdate: v => angle.set(v),
                  onComplete: () => angle.set(endAngle),
                });
              } else {
                // Snap to the current angle
                angle.set(planetAngles[angleKey]);
              }
              return () => controls && controls.stop();
            // eslint-disable-next-line react-hooks/exhaustive-deps
            }, [angle, angleKey]);
            const left = useTransform(angle, a => `${cx + radius * Math.cos((a * Math.PI) / 180)}px`);
            const top = useTransform(angle, a => `${cy + radius * Math.sin((a * Math.PI) / 180)}px`);
            return (
              <motion.div style={{ position: 'absolute', left, top, transform: 'translate(-50%, -50%)' }}>
                <Image src={src} alt={alt} width={size} height={size} style={{ pointerEvents: 'none' }} />
              </motion.div>
            );
          }

          return (
            <>
              <AnimatedPlanet src="/oracle/earth_moon.svg" alt="Earth & Moon" size={44} radius={orbits.earth} initialAngle={initialAngles.earth} angleKey="earth" />
              <AnimatedPlanet src="/oracle/mercury.svg" alt="Mercury" size={28} radius={orbits.mercury} initialAngle={initialAngles.mercury} angleKey="mercury" />
              <AnimatedPlanet src="/oracle/venus.svg" alt="Venus" size={36} radius={orbits.venus} initialAngle={initialAngles.venus} angleKey="venus" />
              <AnimatedPlanet src="/oracle/mars.svg" alt="Mars" size={52} radius={orbits.mars} initialAngle={initialAngles.mars} angleKey="mars" />
            </>
          );
        })()}

        {/* Info Card Section - shown when no rolls - AT BOTTOM */}
        {rollHistory.length === 0 && !isRolling && (
          <div className="absolute bottom-24 left-0 right-0 flex justify-center z-20">
            <div
              className="backdrop-blur-sm border px-6 py-4 max-w-sm w-full text-center"
              style={{ borderRadius: 0, borderColor: '#E0D09D', background: 'rgba(255,255,255,0.5)' }}
            >
              <div
                className="font-serif italic mb-2"
                style={{ color: '#5F5F5F', fontSize: 21, lineHeight: '23px' }}
              >
                Get personalized cosmic guidance tailored to your {userArchetype || 'Solar'} energy.
              </div>
              <button
                className="font-mono text-xs uppercase tracking-widest text-black underline hover:text-black transition-colors"
                style={{ borderRadius: 0 }}
                onClick={() => setShowGameExplanation(true)}
              >
                How it works
              </button>
            </div>
          </div>
        )}

        {/* Roll History Section - shown when user has rolled - PUSHES UP */}
        {rollHistory.length > 0 && !isRolling && (
          <div className="absolute bottom-24 left-0 right-0 flex justify-center z-20">
            <div className="backdrop-blur-sm border px-6 py-4 max-w-sm w-full text-center"
              style={{ borderRadius: 0, borderColor: '#E0D09D', background: 'rgba(255,255,255,0.5)' }}>
              <div className="font-serif italic text-xl text-center mb-3">Today&apos;s Guidance</div>
              {rollHistory.map((roll, idx) => (
                <div key={roll.id} className="flex items-center justify-between border-b border-gray-200 last:border-b-0 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{roll.icon}</span>
                    <div>
                      <div className="font-serif font-bold text-base text-black leading-tight">{roll.title}</div>
                      <div className="font-mono text-xs uppercase tracking-widest text-gray-500 text-left">{roll.rarity} {roll.type}</div>
                    </div>
                  </div>
                  <button
                    className="px-4 py-1 border border-gray-400 text-black font-mono text-xs uppercase tracking-widest bg-white hover:bg-gray-100 transition-colors"
                    style={{ borderRadius: 0 }}
                    onClick={() => { setCurrentRoll(roll); setShowReveal(true); }}
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Roll Button and CTAs */}
      <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-4 pb-8">
        {/* Show roll button when rolls are available and not rolling */}
        {dailyRolls > 0 && !isRolling && (
          <motion.button
            onClick={handleRollClick}
            disabled={isRolling}
            className="relative overflow-hidden px-8 py-4 max-w-sm w-full font-mono text-base transition-all duration-200 border border-black uppercase tracking-normal font-base rounded-none text-center mx-auto bg-[#d4af37] text-black hover:bg-[#e6c75a]"
            whileHover={!isRolling ? { scale: 1.03 } : {}}
            whileTap={!isRolling ? { scale: 0.97 } : {}}
          >
            <span>
              Roll for Guidance
            </span>
          </motion.button>
        )}

        {/* Show "ASKING THE COSMOS..." during roll animation */}
        {dailyRolls > 0 && isRolling && (
          <div className="px-8 py-4 max-w-sm w-full font-mono text-base border border-black uppercase tracking-normal font-base rounded-none text-center mx-auto bg-[#d4af37] text-black">
            <span>
              ASKING THE COSMOS...
            </span>
          </div>
        )}
        
        {/* CTAs when all rolls are used - outside the roll results card */}
        {dailyRolls <= 0 && (
          <div className="flex flex-col gap-3 w-full max-w-sm">
            <button
              className="w-full py-4 bg-gray-300 text-gray-600 font-mono font-bold uppercase border border-gray-300 cursor-not-allowed"
              style={{ borderRadius: 0 }}
              disabled
            >
              NO ROLLS LEFT
            </button>
            <button
              className="w-full py-4 bg-white text-black font-mono font-bold uppercase border border-black hover:bg-gray-100 transition-colors"
              style={{ borderRadius: 0 }}
              onClick={() => router.push('/surprise-me/more-rolls')}
            >
              Get More Guidance
            </button>
          </div>
        )}
      </div>

      {/* Roll Animation */}
      <AnimatePresence>
        {/* Old roll animation removed; only planet orbit animation is active */}
      </AnimatePresence>

      {/* Reveal */}
      <SimpleModal
        isOpen={showReveal && !!currentRoll}
        onClose={() => setShowReveal(false)}
      >
        {currentRoll && (
          <div className="flex flex-col items-center w-full px-1 py-8 max-w-sm mx-auto">
            {/* Lightning bolt icon */}
            <div className="flex justify-center items-center mb-2 mt-0">
              <svg width="20" height="20" viewBox="0 0 32 32" fill="#FFD600" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.5 2L6 18.5H15L13.5 30L27 11.5H18.5L18.5 2Z" />
              </svg>
            </div>
            {/* Rarity/Type */}
            <div className="uppercase font-mono text-xs text-gray-500 tracking-widest mb-1">{currentRoll.rarity} {currentRoll.type}</div>
            {/* Title */}
            <div className="font-serif text-2xl font-bold text-center text-black mb-5" style={{ letterSpacing: '-0.02em' }}>{currentRoll.title}</div>
            {/* Quote */}
            <div className="w-full border border-gray-300 bg-white/50 italic font-serif leading-none text-xl text-[#5F5F5F] px-3 py-5 mb-6 text-center" style={{ borderRadius: 0 }}>
              {'quote' in currentRoll && typeof currentRoll.quote === 'string' && currentRoll.quote
                ? `“${currentRoll.quote}”`
                : '“Let the cosmos guide your next step.”'}
            </div>
            {/* Description */}
            <div className="font-serif text-lg text-[#5F5F5F] text-center leading-tight mb-7" style={{ letterSpacing: '-0.01em' }}>{currentRoll.description}</div>
            {/* Reward Box */}
            <div className="flex items-center justify-center w-xs border border-[#9CA3AF] bg-[#fffbe6] px-4 py-4 mb-8" style={{ borderRadius: 0 }}>
              <span className="text-base mr-2">🌞 </span>
              <span className="font-mono font-base text-base text-gray-900">+{lastRollEarnings?.totalEarned?.toLocaleString() ?? '0'} $SOLAR</span>
            </div>
            {/* CTAs */}
            <button
              className="w-full bg-[#d4af37] text-black font-mono font-base uppercase text-sm py-4 mb-2 border border-[#d4af37] hover:bg-[#e6c75a] transition-colors duration-150"
              style={{ borderRadius: 0 }}
              onClick={() => router.push(`/surprise-me/guidance/${currentRoll.id}`)}
            >
              Start Guidance
            </button>
            <button
              className="w-full bg-white text-black font-mono font-base uppercase text-sm py-4 border border-gray-300 hover:bg-gray-100 transition-colors duration-150"
              style={{ borderRadius: 0 }}
              onClick={() => {
                setShowReveal(false);
                setTimeout(() => {
                  handleRoll();
                }, 200);
              }}
            >
              Roll Again
            </button>
          </div>
        )}
      </SimpleModal>
      
      {/* Unified Share Flow Component */}
      <ShareFlowComponent />
    </div>
  );
}