import { getSolarArchetype } from './solarIdentity';

export interface DailyRoll {
  id: string;
  type: 'activity' | 'item' | 'experience';
  title: string;
  description: string;
  archetype: string;
  rarity: 'common' | 'rare' | 'legendary';
  icon: string;
  color: string;
  tags: string[];
  duration?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'anytime';
}

export interface UserProfile {
  birthDate: string;
  archetype: string;
  preferences?: {
    activityTypes: string[];
    difficulty: 'easy' | 'medium' | 'hard';
    timePreference: 'morning' | 'afternoon' | 'evening' | 'anytime';
  };
  history: DailyRoll[];
}

export class SurpriseMeFramework {
  private static instance: SurpriseMeFramework;
  private activityDatabase: Record<string, DailyRoll[]> = {};

  private constructor() {
    this.initializeActivityDatabase();
  }

  public static getInstance(): SurpriseMeFramework {
    if (!SurpriseMeFramework.instance) {
      SurpriseMeFramework.instance = new SurpriseMeFramework();
    }
    return SurpriseMeFramework.instance;
  }

  private initializeActivityDatabase(): void {
    this.activityDatabase = {
      'Sol Innovator': [
        // Common Activities
        {
          id: 'inn-1',
          type: 'activity',
          title: 'Prototype Something New',
          description: 'Spend 30 minutes creating a rough prototype or sketch of an idea that excites you.',
          archetype: 'Sol Innovator',
          rarity: 'common',
          icon: '🔧',
          color: 'bg-blue-100 border-blue-300',
          tags: ['creativity', 'innovation', 'hands-on'],
          duration: '30 minutes',
          difficulty: 'medium',
          timeOfDay: 'anytime'
        },
        {
          id: 'inn-2',
          type: 'activity',
          title: 'Tech Trend Research',
          description: 'Dive deep into an emerging technology you\'ve been curious about. Take notes on its potential impact.',
          archetype: 'Sol Innovator',
          rarity: 'common',
          icon: '🔬',
          color: 'bg-blue-100 border-blue-300',
          tags: ['research', 'technology', 'learning'],
          duration: '45 minutes',
          difficulty: 'easy',
          timeOfDay: 'anytime'
        },
        // Rare Activities
        {
          id: 'inn-3',
          type: 'experience',
          title: 'Future Visioning Session',
          description: 'Write down 5 technologies or innovations you believe will exist in 10 years. Detail how they might change society.',
          archetype: 'Sol Innovator',
          rarity: 'rare',
          icon: '🚀',
          color: 'bg-purple-100 border-purple-300',
          tags: ['visioning', 'future', 'strategy'],
          duration: '60 minutes',
          difficulty: 'hard',
          timeOfDay: 'evening'
        },
        {
          id: 'inn-4',
          type: 'experience',
          title: 'Innovation Challenge',
          description: 'Identify a problem in your daily life and brainstorm 10 different solutions. Pick one to test tomorrow.',
          archetype: 'Sol Innovator',
          rarity: 'rare',
          icon: '💡',
          color: 'bg-purple-100 border-purple-300',
          tags: ['problem-solving', 'creativity', 'practical'],
          duration: '45 minutes',
          difficulty: 'medium',
          timeOfDay: 'afternoon'
        },
        // Legendary Activities
        {
          id: 'inn-5',
          type: 'item',
          title: 'Innovation Catalyst',
          description: 'A book, tool, or resource that could spark your next breakthrough idea. Something that challenges your current thinking.',
          archetype: 'Sol Innovator',
          rarity: 'legendary',
          icon: '🌟',
          color: 'bg-yellow-100 border-yellow-300',
          tags: ['inspiration', 'breakthrough', 'learning'],
          duration: 'variable',
          difficulty: 'hard',
          timeOfDay: 'anytime'
        }
      ],
      'Sol Nurturer': [
        // Common Activities
        {
          id: 'nur-1',
          type: 'activity',
          title: 'Tend to Something Growing',
          description: 'Water a plant, start seeds, or care for something that needs nurturing attention. Notice how it responds to your care.',
          archetype: 'Sol Nurturer',
          rarity: 'common',
          icon: '🌱',
          color: 'bg-green-100 border-green-300',
          tags: ['nurturing', 'growth', 'patience'],
          duration: '20 minutes',
          difficulty: 'easy',
          timeOfDay: 'morning'
        },
        {
          id: 'nur-2',
          type: 'activity',
          title: 'Prepare a Healing Meal',
          description: 'Cook something nourishing with intention. Focus on how each ingredient contributes to wellbeing.',
          archetype: 'Sol Nurturer',
          rarity: 'common',
          icon: '🥗',
          color: 'bg-green-100 border-green-300',
          tags: ['nourishment', 'intention', 'care'],
          duration: '45 minutes',
          difficulty: 'medium',
          timeOfDay: 'afternoon'
        },
        // Rare Activities
        {
          id: 'nur-3',
          type: 'experience',
          title: 'Acts of Service',
          description: 'Perform three small acts of kindness for people in your life without expecting anything back. Notice the ripple effects.',
          archetype: 'Sol Nurturer',
          rarity: 'rare',
          icon: '🤝',
          color: 'bg-pink-100 border-pink-300',
          tags: ['service', 'kindness', 'community'],
          duration: '2 hours',
          difficulty: 'medium',
          timeOfDay: 'anytime'
        },
        {
          id: 'nur-4',
          type: 'experience',
          title: 'Healing Circle Creation',
          description: 'Create a safe space for someone to share what they\'re struggling with. Practice deep listening without trying to fix.',
          archetype: 'Sol Nurturer',
          rarity: 'rare',
          icon: '🫂',
          color: 'bg-pink-100 border-pink-300',
          tags: ['healing', 'listening', 'support'],
          duration: '60 minutes',
          difficulty: 'hard',
          timeOfDay: 'evening'
        },
        // Legendary Activities
        {
          id: 'nur-5',
          type: 'item',
          title: 'Sacred Space Creator',
          description: 'Something to make your environment more nurturing and healing for yourself and others. A tool for creating sanctuary.',
          archetype: 'Sol Nurturer',
          rarity: 'legendary',
          icon: '🏡',
          color: 'bg-amber-100 border-amber-300',
          tags: ['sanctuary', 'healing', 'environment'],
          duration: 'ongoing',
          difficulty: 'medium',
          timeOfDay: 'anytime'
        }
      ],
      'Sol Alchemist': [
        // Common Activities
        {
          id: 'alc-1',
          type: 'activity',
          title: 'Transform a Challenge',
          description: 'Take one current difficulty and reframe it as a growth opportunity. Write about the lesson it offers.',
          archetype: 'Sol Alchemist',
          rarity: 'common',
          icon: '⚗️',
          color: 'bg-indigo-100 border-indigo-300',
          tags: ['transformation', 'growth', 'wisdom'],
          duration: '30 minutes',
          difficulty: 'medium',
          timeOfDay: 'evening'
        },
        {
          id: 'alc-2',
          type: 'activity',
          title: 'Energy Transmutation',
          description: 'Notice when you feel negative emotion today. Practice transforming it into curiosity about what it\'s teaching you.',
          archetype: 'Sol Alchemist',
          rarity: 'common',
          icon: '🔄',
          color: 'bg-indigo-100 border-indigo-300',
          tags: ['emotion', 'transformation', 'awareness'],
          duration: 'ongoing',
          difficulty: 'hard',
          timeOfDay: 'anytime'
        },
        // Rare Activities
        {
          id: 'alc-3',
          type: 'experience',
          title: 'Shadow Work Session',
          description: 'Spend time examining and integrating an aspect of yourself you usually avoid. Journal about what you discover.',
          archetype: 'Sol Alchemist',
          rarity: 'rare',
          icon: '🌙',
          color: 'bg-slate-100 border-slate-300',
          tags: ['shadow work', 'integration', 'self-discovery'],
          duration: '60 minutes',
          difficulty: 'hard',
          timeOfDay: 'evening'
        },
        {
          id: 'alc-4',
          type: 'experience',
          title: 'Polarity Integration',
          description: 'Choose two opposing forces in your life. Explore how they might actually complement each other.',
          archetype: 'Sol Alchemist',
          rarity: 'rare',
          icon: '☯️',
          color: 'bg-slate-100 border-slate-300',
          tags: ['polarity', 'integration', 'balance'],
          duration: '45 minutes',
          difficulty: 'hard',
          timeOfDay: 'afternoon'
        },
        // Legendary Activities
        {
          id: 'alc-5',
          type: 'item',
          title: 'Transmutation Tool',
          description: 'A resource, practice, or object that helps you transform negative energy into wisdom. Your personal philosopher\'s stone.',
          archetype: 'Sol Alchemist',
          rarity: 'legendary',
          icon: '🔮',
          color: 'bg-violet-100 border-violet-300',
          tags: ['transmutation', 'wisdom', 'mastery'],
          duration: 'ongoing',
          difficulty: 'hard',
          timeOfDay: 'anytime'
        }
      ],
      'Sol Sage': [
        // Common Activities
        {
          id: 'sag-1',
          type: 'activity',
          title: 'Seek Ancient Wisdom',
          description: 'Read or listen to teachings from a philosopher, mystic, or wisdom tradition new to you. Take notes on key insights.',
          archetype: 'Sol Sage',
          rarity: 'common',
          icon: '📚',
          color: 'bg-orange-100 border-orange-300',
          tags: ['wisdom', 'learning', 'philosophy'],
          duration: '45 minutes',
          difficulty: 'medium',
          timeOfDay: 'morning'
        },
        {
          id: 'sag-2',
          type: 'activity',
          title: 'Question Everything',
          description: 'Choose a belief you hold strongly. Spend time examining it from multiple angles. What assumptions are you making?',
          archetype: 'Sol Sage',
          rarity: 'common',
          icon: '🤔',
          color: 'bg-orange-100 border-orange-300',
          tags: ['questioning', 'beliefs', 'critical thinking'],
          duration: '30 minutes',
          difficulty: 'hard',
          timeOfDay: 'afternoon'
        },
        // Rare Activities
        {
          id: 'sag-3',
          type: 'experience',
          title: 'Consciousness Expansion',
          description: 'Try a new meditation technique, breathwork practice, or contemplative exercise. Notice what shifts in your awareness.',
          archetype: 'Sol Sage',
          rarity: 'rare',
          icon: '🧘',
          color: 'bg-teal-100 border-teal-300',
          tags: ['consciousness', 'meditation', 'awareness'],
          duration: '60 minutes',
          difficulty: 'medium',
          timeOfDay: 'morning'
        },
        {
          id: 'sag-4',
          type: 'experience',
          title: 'Wisdom Teaching',
          description: 'Share a piece of wisdom you\'ve learned with someone who could benefit from it. Focus on planting seeds, not forcing growth.',
          archetype: 'Sol Sage',
          rarity: 'rare',
          icon: '🌰',
          color: 'bg-teal-100 border-teal-300',
          tags: ['teaching', 'wisdom', 'sharing'],
          duration: '30 minutes',
          difficulty: 'hard',
          timeOfDay: 'anytime'
        },
        // Legendary Activities
        {
          id: 'sag-5',
          type: 'item',
          title: 'Wisdom Keeper',
          description: 'A text, teacher, or practice that could deepen your understanding of life\'s mysteries. Your next level of awakening.',
          archetype: 'Sol Sage',
          rarity: 'legendary',
          icon: '🦉',
          color: 'bg-emerald-100 border-emerald-300',
          tags: ['wisdom', 'mystery', 'awakening'],
          duration: 'ongoing',
          difficulty: 'hard',
          timeOfDay: 'anytime'
        }
      ],
      'Sol Builder': [
        // Common Activities
        {
          id: 'bui-1',
          type: 'activity',
          title: 'Build Something Lasting',
          description: 'Create or improve something that will have positive impact beyond today. Focus on quality over speed.',
          archetype: 'Sol Builder',
          rarity: 'common',
          icon: '🏗️',
          color: 'bg-stone-100 border-stone-300',
          tags: ['building', 'impact', 'legacy'],
          duration: '60 minutes',
          difficulty: 'medium',
          timeOfDay: 'morning'
        },
        {
          id: 'bui-2',
          type: 'activity',
          title: 'System Optimization',
          description: 'Choose one system in your life (morning routine, workspace, finances) and make it 10% more efficient.',
          archetype: 'Sol Builder',
          rarity: 'common',
          icon: '⚙️',
          color: 'bg-stone-100 border-stone-300',
          tags: ['systems', 'efficiency', 'optimization'],
          duration: '45 minutes',
          difficulty: 'medium',
          timeOfDay: 'afternoon'
        },
        // Rare Activities
        {
          id: 'bui-3',
          type: 'experience',
          title: 'Foundation Assessment',
          description: 'Review the foundations of your life - relationships, health, finances, purpose. Choose one area to strengthen.',
          archetype: 'Sol Builder',
          rarity: 'rare',
          icon: '🏛️',
          color: 'bg-gray-100 border-gray-300',
          tags: ['foundation', 'assessment', 'strengthening'],
          duration: '90 minutes',
          difficulty: 'hard',
          timeOfDay: 'evening'
        },
        {
          id: 'bui-4',
          type: 'experience',
          title: 'Legacy Planning',
          description: 'Write about what you want to be remembered for. What are you building that will outlast you?',
          archetype: 'Sol Builder',
          rarity: 'rare',
          icon: '📜',
          color: 'bg-gray-100 border-gray-300',
          tags: ['legacy', 'purpose', 'meaning'],
          duration: '60 minutes',
          difficulty: 'hard',
          timeOfDay: 'evening'
        },
        // Legendary Activities
        {
          id: 'bui-5',
          type: 'item',
          title: 'Master Builder\'s Tool',
          description: 'A skill, resource, or connection that could help you build something truly meaningful. Your next level of mastery.',
          archetype: 'Sol Builder',
          rarity: 'legendary',
          icon: '🔨',
          color: 'bg-red-100 border-red-300',
          tags: ['mastery', 'skill', 'tools'],
          duration: 'ongoing',
          difficulty: 'hard',
          timeOfDay: 'anytime'
        }
      ],
      'Sol Artist': [
        // Common Activities
        {
          id: 'art-1',
          type: 'activity',
          title: 'Create Beauty',
          description: 'Spend time creating something beautiful - art, music, writing, or any form of expression that moves you.',
          archetype: 'Sol Artist',
          rarity: 'common',
          icon: '🎨',
          color: 'bg-rose-100 border-rose-300',
          tags: ['creativity', 'beauty', 'expression'],
          duration: '45 minutes',
          difficulty: 'medium',
          timeOfDay: 'afternoon'
        },
        {
          id: 'art-2',
          type: 'activity',
          title: 'Harmony Practice',
          description: 'Arrange something in your space to create more visual or energetic harmony. Notice how it affects your mood.',
          archetype: 'Sol Artist',
          rarity: 'common',
          icon: '🎭',
          color: 'bg-rose-100 border-rose-300',
          tags: ['harmony', 'space', 'energy'],
          duration: '30 minutes',
          difficulty: 'easy',
          timeOfDay: 'anytime'
        },
        // Rare Activities
        {
          id: 'art-3',
          type: 'experience',
          title: 'Aesthetic Immersion',
          description: 'Immerse yourself in beauty - visit a gallery, watch a sunset, or create a beautiful space. Let it fill your senses.',
          archetype: 'Sol Artist',
          rarity: 'rare',
          icon: '🌅',
          color: 'bg-cyan-100 border-cyan-300',
          tags: ['beauty', 'immersion', 'senses'],
          duration: '90 minutes',
          difficulty: 'easy',
          timeOfDay: 'evening'
        },
        {
          id: 'art-4',
          type: 'experience',
          title: 'Emotional Alchemy',
          description: 'Transform a difficult emotion into a creative work. Let art be your way of processing and healing.',
          archetype: 'Sol Artist',
          rarity: 'rare',
          icon: '🎪',
          color: 'bg-cyan-100 border-cyan-300',
          tags: ['emotion', 'healing', 'transformation'],
          duration: '60 minutes',
          difficulty: 'hard',
          timeOfDay: 'evening'
        },
        // Legendary Activities
        {
          id: 'art-5',
          type: 'item',
          title: 'Muse\'s Gift',
          description: 'Something that could inspire your creative expression or bring more beauty into your life. Your next artistic breakthrough.',
          archetype: 'Sol Artist',
          rarity: 'legendary',
          icon: '🎭',
          color: 'bg-fuchsia-100 border-fuchsia-300',
          tags: ['inspiration', 'creativity', 'breakthrough'],
          duration: 'ongoing',
          difficulty: 'medium',
          timeOfDay: 'anytime'
        }
      ],
      'Sol Traveler': [
        // Common Activities
        {
          id: 'tra-1',
          type: 'activity',
          title: 'Explore the Unknown',
          description: 'Try something you\'ve never done before, however small. Step outside your comfort zone with curiosity.',
          archetype: 'Sol Traveler',
          rarity: 'common',
          icon: '🧭',
          color: 'bg-sky-100 border-sky-300',
          tags: ['exploration', 'unknown', 'courage'],
          duration: '30 minutes',
          difficulty: 'medium',
          timeOfDay: 'anytime'
        },
        {
          id: 'tra-2',
          type: 'activity',
          title: 'Path Discovery',
          description: 'Take a walk without a destination. Let your intuition guide you. Notice what you discover about yourself.',
          archetype: 'Sol Traveler',
          rarity: 'common',
          icon: '🚶',
          color: 'bg-sky-100 border-sky-300',
          tags: ['intuition', 'discovery', 'walking'],
          duration: '45 minutes',
          difficulty: 'easy',
          timeOfDay: 'morning'
        },
        // Rare Activities
        {
          id: 'tra-3',
          type: 'experience',
          title: 'Cosmic Contemplation',
          description: 'Spend time under the stars or looking at space imagery, contemplating your place in the universe.',
          archetype: 'Sol Traveler',
          rarity: 'rare',
          icon: '🌌',
          color: 'bg-indigo-100 border-indigo-300',
          tags: ['cosmos', 'contemplation', 'perspective'],
          duration: '60 minutes',
          difficulty: 'medium',
          timeOfDay: 'evening'
        },
        {
          id: 'tra-4',
          type: 'experience',
          title: 'Inner Journey',
          description: 'Close your eyes and take a journey within. What landscapes, colors, or symbols do you encounter?',
          archetype: 'Sol Traveler',
          rarity: 'rare',
          icon: '🗺️',
          color: 'bg-indigo-100 border-indigo-300',
          tags: ['inner journey', 'symbols', 'imagination'],
          duration: '45 minutes',
          difficulty: 'hard',
          timeOfDay: 'evening'
        },
        // Legendary Activities
        {
          id: 'tra-5',
          type: 'item',
          title: 'Cosmic Compass',
          description: 'A tool, insight, or connection that could guide you on your journey of self-discovery. Your next direction.',
          archetype: 'Sol Traveler',
          rarity: 'legendary',
          icon: '⭐',
          color: 'bg-yellow-100 border-yellow-300',
          tags: ['guidance', 'discovery', 'direction'],
          duration: 'ongoing',
          difficulty: 'medium',
          timeOfDay: 'anytime'
        }
      ]
    };
  }

  public generatePersonalizedRoll(birthDate: string, userHistory: DailyRoll[] = []): DailyRoll {
    const archetype = getSolarArchetype(birthDate);
    const activities = this.activityDatabase[archetype] || this.activityDatabase['Sol Traveler'];
    
    // Filter out recently rolled activities to avoid repetition
    const recentIds = userHistory.slice(-10).map(roll => roll.id);
    const availableActivities = activities.filter(activity => !recentIds.includes(activity.id));
    
    // Weighted random selection based on rarity
    const weightedActivities = this.createWeightedArray(availableActivities);
    const randomActivity = weightedActivities[Math.floor(Math.random() * weightedActivities.length)];
    
    return {
      ...randomActivity,
      id: `${randomActivity.id}-${Date.now()}` // Ensure uniqueness
    };
  }

  private createWeightedArray(activities: DailyRoll[]): DailyRoll[] {
    const weighted: DailyRoll[] = [];
    
    activities.forEach(activity => {
      let weight = 1;
      switch (activity.rarity) {
        case 'common': weight = 60; break;
        case 'rare': weight = 30; break;
        case 'legendary': weight = 10; break;
      }
      
      for (let i = 0; i < weight; i++) {
        weighted.push(activity);
      }
    });
    
    return weighted;
  }

  public getActivitiesByArchetype(archetype: string): DailyRoll[] {
    return this.activityDatabase[archetype] || this.activityDatabase['Sol Traveler'];
  }

  public getActivitiesByType(type: 'activity' | 'item' | 'experience'): DailyRoll[] {
    const allActivities = Object.values(this.activityDatabase).flat();
    return allActivities.filter(activity => activity.type === type);
  }

  public getActivitiesByRarity(rarity: 'common' | 'rare' | 'legendary'): DailyRoll[] {
    const allActivities = Object.values(this.activityDatabase).flat();
    return allActivities.filter(activity => activity.rarity === rarity);
  }

  public getTodaysRollCount(): number {
    const today = new Date().toDateString();
    const rollData = localStorage.getItem(`dailyRolls_${today}`);
    if (rollData) {
      const parsed = JSON.parse(rollData);
      return parsed.remaining || 0;
    }
    return 3; // Default daily rolls
  }

  public updateDailyRolls(count: number): void {
    const today = new Date().toDateString();
    const rollData = localStorage.getItem(`dailyRolls_${today}`);
    let data = rollData ? JSON.parse(rollData) : { remaining: 3, history: [] };
    
    data.remaining = count;
    localStorage.setItem(`dailyRolls_${today}`, JSON.stringify(data));
  }

  public addRollToHistory(roll: DailyRoll): void {
    const today = new Date().toDateString();
    const rollData = localStorage.getItem(`dailyRolls_${today}`);
    let data = rollData ? JSON.parse(rollData) : { remaining: 3, history: [] };
    
    data.history.push(roll);
    localStorage.setItem(`dailyRolls_${today}`, JSON.stringify(data));
  }

  public getTodaysHistory(): DailyRoll[] {
    const today = new Date().toDateString();
    const rollData = localStorage.getItem(`dailyRolls_${today}`);
    if (rollData) {
      const parsed = JSON.parse(rollData);
      return parsed.history || [];
    }
    return [];
  }
}

// Export singleton instance
export const surpriseMeFramework = SurpriseMeFramework.getInstance();