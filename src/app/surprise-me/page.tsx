'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSolarArchetype } from '~/lib/solarIdentity';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface DailyRoll {
  id: string;
  type: 'activity' | 'item' | 'experience';
  title: string;
  description: string;
  archetype: string;
  rarity: 'common' | 'rare' | 'legendary';
  icon: string;
  color: string;
}

export default function SurpriseMePage() {
  const router = useRouter();
  const [userArchetype, setUserArchetype] = useState<string | null>(null);
  const [dailyRolls, setDailyRolls] = useState<number>(3);
  const [hasRolledToday, setHasRolledToday] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [currentRoll, setCurrentRoll] = useState<DailyRoll | null>(null);
  const [showReveal, setShowReveal] = useState(false);
  const [rollHistory, setRollHistory] = useState<DailyRoll[]>([]);

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

  const handleRoll = async () => {
    if (dailyRolls <= 0 || isRolling) return;

    setIsRolling(true);
    setShowReveal(false);

    // Simulate rolling animation delay
    setTimeout(() => {
      const roll = generatePersonalizedRoll(userArchetype);
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

  const generatePersonalizedRoll = (archetype: string | null): DailyRoll => {
    const archetypeActivities = getArchetypeActivities(archetype);
    const randomActivity = archetypeActivities[Math.floor(Math.random() * archetypeActivities.length)];
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      ...randomActivity,
      archetype: archetype || 'Sol Traveler'
    };
  };

  const getArchetypeActivities = (archetype: string | null) => {
    const activities = {
      'Sol Innovator': [
        {
          type: 'activity' as const,
          title: 'Prototype Something New',
          description: 'Spend 30 minutes creating a rough prototype or sketch of an idea that excites you.',
          rarity: 'common' as const,
          icon: '🔧',
          color: 'bg-blue-100 border-blue-300'
        },
        {
          type: 'experience' as const,
          title: 'Future Visioning Session',
          description: 'Write down 5 technologies or innovations you believe will exist in 10 years.',
          rarity: 'rare' as const,
          icon: '🚀',
          color: 'bg-purple-100 border-purple-300'
        },
        {
          type: 'item' as const,
          title: 'Innovation Catalyst',
          description: 'A book, tool, or resource that could spark your next breakthrough idea.',
          rarity: 'legendary' as const,
          icon: '💡',
          color: 'bg-yellow-100 border-yellow-300'
        }
      ],
      'Sol Nurturer': [
        {
          type: 'activity' as const,
          title: 'Tend to Something Growing',
          description: 'Water a plant, start seeds, or care for something that needs nurturing attention.',
          rarity: 'common' as const,
          icon: '🌱',
          color: 'bg-green-100 border-green-300'
        },
        {
          type: 'experience' as const,
          title: 'Acts of Service',
          description: 'Perform three small acts of kindness for people in your life without expecting anything back.',
          rarity: 'rare' as const,
          icon: '🤝',
          color: 'bg-pink-100 border-pink-300'
        },
        {
          type: 'item' as const,
          title: 'Sacred Space Creator',
          description: 'Something to make your environment more nurturing and healing for yourself and others.',
          rarity: 'legendary' as const,
          icon: '🏡',
          color: 'bg-amber-100 border-amber-300'
        }
      ],
      'Sol Alchemist': [
        {
          type: 'activity' as const,
          title: 'Transform a Challenge',
          description: 'Take one current difficulty and reframe it as a growth opportunity. Write about the lesson.',
          rarity: 'common' as const,
          icon: '⚗️',
          color: 'bg-indigo-100 border-indigo-300'
        },
        {
          type: 'experience' as const,
          title: 'Shadow Work Session',
          description: 'Spend time examining and integrating an aspect of yourself you usually avoid.',
          rarity: 'rare' as const,
          icon: '🌙',
          color: 'bg-slate-100 border-slate-300'
        },
        {
          type: 'item' as const,
          title: 'Transmutation Tool',
          description: 'A resource, practice, or object that helps you transform negative energy into wisdom.',
          rarity: 'legendary' as const,
          icon: '🔮',
          color: 'bg-violet-100 border-violet-300'
        }
      ],
      'Sol Sage': [
        {
          type: 'activity' as const,
          title: 'Seek Ancient Wisdom',
          description: 'Read or listen to teachings from a philosopher, mystic, or wisdom tradition new to you.',
          rarity: 'common' as const,
          icon: '📚',
          color: 'bg-orange-100 border-orange-300'
        },
        {
          type: 'experience' as const,
          title: 'Consciousness Expansion',
          description: 'Try a new meditation technique, breathwork practice, or contemplative exercise.',
          rarity: 'rare' as const,
          icon: '🧘',
          color: 'bg-teal-100 border-teal-300'
        },
        {
          type: 'item' as const,
          title: 'Wisdom Keeper',
          description: 'A text, teacher, or practice that could deepen your understanding of life\'s mysteries.',
          rarity: 'legendary' as const,
          icon: '🦉',
          color: 'bg-emerald-100 border-emerald-300'
        }
      ],
      'Sol Builder': [
        {
          type: 'activity' as const,
          title: 'Build Something Lasting',
          description: 'Create or improve something that will have positive impact beyond today.',
          rarity: 'common' as const,
          icon: '🏗️',
          color: 'bg-stone-100 border-stone-300'
        },
        {
          type: 'experience' as const,
          title: 'Foundation Assessment',
          description: 'Review the foundations of your life - relationships, health, finances. Strengthen one area.',
          rarity: 'rare' as const,
          icon: '🏛️',
          color: 'bg-gray-100 border-gray-300'
        },
        {
          type: 'item' as const,
          title: 'Master Builder\'s Tool',
          description: 'A skill, resource, or connection that could help you build something meaningful.',
          rarity: 'legendary' as const,
          icon: '🔨',
          color: 'bg-red-100 border-red-300'
        }
      ],
      'Sol Artist': [
        {
          type: 'activity' as const,
          title: 'Create Beauty',
          description: 'Spend time creating something beautiful - art, music, writing, or any form of expression.',
          rarity: 'common' as const,
          icon: '🎨',
          color: 'bg-rose-100 border-rose-300'
        },
        {
          type: 'experience' as const,
          title: 'Aesthetic Immersion',
          description: 'Immerse yourself in beauty - visit a gallery, watch a sunset, or create a beautiful space.',
          rarity: 'rare' as const,
          icon: '🌅',
          color: 'bg-cyan-100 border-cyan-300'
        },
        {
          type: 'item' as const,
          title: 'Muse\'s Gift',
          description: 'Something that could inspire your creative expression or bring more beauty into your life.',
          rarity: 'legendary' as const,
          icon: '🎭',
          color: 'bg-fuchsia-100 border-fuchsia-300'
        }
      ],
      'Sol Traveler': [
        {
          type: 'activity' as const,
          title: 'Explore the Unknown',
          description: 'Try something you\'ve never done before, however small. Step outside your comfort zone.',
          rarity: 'common' as const,
          icon: '🧭',
          color: 'bg-sky-100 border-sky-300'
        },
        {
          type: 'experience' as const,
          title: 'Cosmic Contemplation',
          description: 'Spend time under the stars or looking at space imagery, contemplating your place in the universe.',
          rarity: 'rare' as const,
          icon: '🌌',
          color: 'bg-indigo-100 border-indigo-300'
        },
        {
          type: 'item' as const,
          title: 'Cosmic Compass',
          description: 'A tool, insight, or connection that could guide you on your journey of self-discovery.',
          rarity: 'legendary' as const,
          icon: '⭐',
          color: 'bg-yellow-100 border-yellow-300'
        }
      ]
    };

    return activities[archetype as keyof typeof activities] || activities['Sol Traveler'];
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

        {/* Roll Button */}
        <div className="text-center mb-8">
          <motion.button
            onClick={handleRoll}
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
                <div className="text-gray-700 text-center leading-relaxed">
                  {currentRoll.description}
                </div>
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