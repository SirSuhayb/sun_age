import { getSolarArchetype } from './solarIdentity';

export interface ActionableStep {
  type: 'link' | 'search' | 'prompt' | 'list';
  label: string;
  content: string;
  url?: string;
}

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
  actionableSteps: ActionableStep[];
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
          timeOfDay: 'anytime',
          actionableSteps: [
            {
              type: 'prompt',
              label: 'Quick Idea Spark',
              content: 'Open a notes app and write: "What if [everyday object] could [unexpected action]?" Fill in 5 combinations.'
            },
            {
              type: 'link',
              label: 'Digital Prototyping Tool',
              content: 'Start sketching with Figma (free)',
              url: 'https://figma.com'
            },
            {
              type: 'search',
              label: 'Inspiration Search',
              content: '"rapid prototyping techniques" OR "quick mockup ideas" OR "30 minute build challenge"'
            }
          ]
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
          timeOfDay: 'anytime',
          actionableSteps: [
            {
              type: 'search',
              label: 'Trending Tech Research',
              content: '"emerging technology 2024" OR "breakthrough innovations" OR "future tech trends"'
            },
            {
              type: 'link',
              label: 'MIT Technology Review',
              content: 'Latest breakthroughs and analysis',
              url: 'https://www.technologyreview.com/'
            },
            {
              type: 'prompt',
              label: 'Impact Analysis Framework',
              content: 'For your chosen tech, answer: 1) What problem does it solve? 2) Who benefits? 3) What could go wrong? 4) How might it change daily life in 10 years?'
            }
          ]
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
          timeOfDay: 'evening',
          actionableSteps: [
            {
              type: 'prompt',
              label: 'Future Vision Template',
              content: 'For each innovation, write: Technology Name | Main Function | Target Users | Societal Impact | Timeline to Reality | Potential Obstacles'
            },
            {
              type: 'search',
              label: 'Future Prediction Research',
              content: '"technology predictions 2034" OR "future innovations timeline" OR "emerging tech roadmap"'
            },
            {
              type: 'link',
              label: 'Ray Kurzweil\'s Predictions',
              content: 'Learn from a master futurist',
              url: 'https://www.kurzweilai.net/predictions'
            }
          ]
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
          timeOfDay: 'anytime',
          actionableSteps: [
            {
              type: 'link',
              label: 'Buy: "The Innovator\'s Dilemma" by Clayton Christensen',
              content: 'Revolutionary book on disruptive innovation',
              url: 'https://amazon.com/dp/0062060244'
            },
            {
              type: 'link',
              label: 'Buy: "Zero to One" by Peter Thiel',
              content: 'Building the future through monopoly',
              url: 'https://amazon.com/dp/0804139296'
            },
            {
              type: 'link',
              label: 'Free Tool: Miro Brainstorming',
              content: 'Visual collaboration for breakthrough thinking',
              url: 'https://miro.com'
            },
            {
              type: 'search',
              label: 'Innovation Framework Research',
              content: '"design thinking framework" OR "SCAMPER innovation method" OR "Jobs to be Done theory"'
            }
          ]
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
          timeOfDay: 'morning',
          actionableSteps: [
            {
              type: 'link',
              label: 'Buy: Indoor Herb Garden Kit',
              content: 'Easy-to-grow herbs for beginners',
              url: 'https://amazon.com/s?k=indoor+herb+garden+kit'
            },
            {
              type: 'search',
              label: 'Plant Care Guide',
              content: '"easy houseplants for beginners" OR "how to care for [specific plant]" OR "plant watering schedule"'
            },
            {
              type: 'prompt',
              label: 'Mindful Plant Care',
              content: 'As you tend your plant: 1) Notice its current state 2) Speak or think encouraging words 3) Imagine its growth over time 4) Reflect on what nurturing means to you'
            },
            {
              type: 'link',
              label: 'Free: PlantIn App',
              content: 'Plant identification and care reminders',
              url: 'https://plantin.com'
            }
          ]
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
          timeOfDay: 'anytime',
          actionableSteps: [
            {
              type: 'list',
              label: 'Quick Acts of Service Ideas',
              content: '• Send an encouraging text to someone • Buy coffee for the person behind you • Leave a positive review for a small business • Write a thank-you note • Offer to help with errands • Listen without giving advice'
            },
            {
              type: 'search',
              label: 'Local Volunteering',
              content: '"volunteer opportunities near me" OR "community service [your city]" OR "local food bank volunteer"'
            },
            {
              type: 'prompt',
              label: 'Service Reflection',
              content: 'After each act: 1) How did the person respond? 2) How did it feel to give? 3) What did you learn about service? 4) How might this create positive ripples?'
            },
            {
              type: 'link',
              label: 'Find: JustServe.org',
              content: 'Discover volunteer opportunities',
              url: 'https://justserve.org'
            }
          ]
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
          timeOfDay: 'evening',
          actionableSteps: [
            {
              type: 'prompt',
              label: 'Challenge Transformation Framework',
              content: 'Choose your current challenge and write: 1) What is the difficulty? 2) What skills might this develop? 3) What would my future self thank me for learning? 4) How might this serve others? 5) What\'s the hidden gift in this experience?'
            },
            {
              type: 'search',
              label: 'Growth Mindset Resources',
              content: '"post traumatic growth" OR "resilience building" OR "reframing negative thoughts" OR "finding meaning in suffering"'
            },
            {
              type: 'link',
              label: 'Buy: "Man\'s Search for Meaning" by Viktor Frankl',
              content: 'Finding purpose in the darkest times',
              url: 'https://amazon.com/dp/080701429X'
            }
          ]
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
          timeOfDay: 'evening',
          actionableSteps: [
            {
              type: 'prompt',
              label: 'Shadow Work Questions',
              content: 'What quality do I judge most in others? When do I feel shame or anger? What do I try to hide from others? What would I never want people to know about me? How might these rejected parts actually serve me?'
            },
            {
              type: 'search',
              label: 'Shadow Work Guidance',
              content: '"Carl Jung shadow work" OR "shadow integration exercises" OR "embracing your dark side" OR "shadow work journal prompts"'
            },
            {
              type: 'link',
              label: 'Buy: "Meeting the Shadow" by Connie Zweig',
              content: 'Comprehensive guide to shadow work',
              url: 'https://amazon.com/dp/0874776864'
            }
          ]
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
          timeOfDay: 'morning',
          actionableSteps: [
            {
              type: 'link',
              label: 'Buy: "Meditations" by Marcus Aurelius',
              content: 'Timeless Stoic wisdom from a Roman Emperor',
              url: 'https://amazon.com/dp/0486298043'
            },
            {
              type: 'link',
              label: 'Buy: "The Tao of Physics" by Fritjof Capra',
              content: 'Where ancient wisdom meets modern science',
              url: 'https://amazon.com/dp/1570627681'
            },
            {
              type: 'link',
              label: 'Free: Daily Stoic Archives',
              content: 'Bite-sized daily wisdom',
              url: 'https://dailystoic.com/archives/'
            },
            {
              type: 'search',
              label: 'Wisdom Tradition Exploration',
              content: '"ancient philosophy quotes" OR "Buddhist teachings beginners" OR "Sufi wisdom stories" OR "indigenous wisdom traditions"'
            },
            {
              type: 'prompt',
              label: 'Wisdom Integration Exercise',
              content: 'After reading, ask yourself: 1) What resonated most? 2) How does this apply to my current challenges? 3) What would I tell a friend about this teaching?'
            }
          ]
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
          timeOfDay: 'afternoon',
          actionableSteps: [
            {
              type: 'prompt',
              label: 'Belief Examination Framework',
              content: 'Pick a strong belief and ask: 1) Where did this belief come from? 2) What evidence supports it? 3) What evidence contradicts it? 4) How might someone from a different culture view this? 5) What if the opposite were true?'
            },
            {
              type: 'search',
              label: 'Critical Thinking Resources',
              content: '"cognitive biases list" OR "logical fallacies examples" OR "Socratic questioning method"'
            },
            {
              type: 'link',
              label: 'Buy: "Thinking, Fast and Slow" by Daniel Kahneman',
              content: 'Understand how your mind makes decisions',
              url: 'https://amazon.com/dp/0374533555'
            }
          ]
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
          timeOfDay: 'morning',
          actionableSteps: [
            {
              type: 'link',
              label: 'Free: Insight Timer App',
              content: 'Thousands of guided meditations',
              url: 'https://insighttimer.com'
            },
            {
              type: 'link',
              label: 'Free: Wim Hof Breathing Method',
              content: 'Powerful breathwork technique (YouTube)',
              url: 'https://youtube.com/watch?v=tybOi4hjZFQ'
            },
            {
              type: 'search',
              label: 'Consciousness Practices',
              content: '"vipassana meditation technique" OR "breathwork for beginners" OR "contemplative practices" OR "mindfulness exercises"'
            },
            {
              type: 'prompt',
              label: 'Awareness Tracking',
              content: 'Before starting: Rate your current mental state 1-10. During practice: Notice 3 things that arise. After: Rate again and write one insight.'
            }
          ]
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
          timeOfDay: 'anytime',
          actionableSteps: [
            {
              type: 'link',
              label: 'Buy: "The Power of Now" by Eckhart Tolle',
              content: 'Profound guide to spiritual awakening',
              url: 'https://amazon.com/dp/1577314808'
            },
            {
              type: 'link',
              label: 'Buy: "Sapiens" by Yuval Noah Harari',
              content: 'Mind-expanding view of human consciousness',
              url: 'https://amazon.com/dp/0062316095'
            },
            {
              type: 'link',
              label: 'Free: Ram Dass Lectures',
              content: 'Transformative spiritual teachings',
              url: 'https://www.ramdass.org/audio/'
            },
            {
              type: 'search',
              label: 'Advanced Wisdom Resources',
              content: '"perennial philosophy" OR "consciousness research" OR "enlightenment teachers" OR "spiritual teachers 2024"'
            }
          ]
        }
      ],
      'Sol Builder': [
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
          timeOfDay: 'morning',
          actionableSteps: [
            {
              type: 'list',
              label: 'Build Ideas by Time Investment',
              content: '• 30 min: Organize important files/photos • 1 hr: Create a resource guide for others • 2 hrs: Start a helpful blog post • 4 hrs: Build a simple website • Weekend: Organize a community event'
            },
            {
              type: 'search',
              label: 'Building Resources',
              content: '"no-code website builders" OR "how to start a blog" OR "community organizing tips" OR "legacy project ideas"'
            },
            {
              type: 'link',
              label: 'Free: Notion Templates',
              content: 'Build organized systems',
              url: 'https://notion.so/templates'
            }
          ]
        }
      ],
      'Sol Artist': [
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
          timeOfDay: 'afternoon',
          actionableSteps: [
            {
              type: 'link',
              label: 'Free: Procreate for iPad',
              content: 'Professional digital art creation',
              url: 'https://procreate.art'
            },
            {
              type: 'search',
              label: 'Creative Inspiration',
              content: '"art prompts for beginners" OR "creative writing exercises" OR "photography challenges" OR "music composition tips"'
            },
            {
              type: 'prompt',
              label: 'Beauty Creation Prompt',
              content: 'Choose your medium and create something inspired by: "The feeling of sunlight through trees" or "The sound of rain on windows" or "The color of contentment"'
            },
            {
              type: 'link',
              label: 'Buy: Beginner Art Supply Kit',
              content: 'Everything needed to start creating',
              url: 'https://amazon.com/s?k=beginner+art+supplies+kit'
            }
          ]
        }
      ],
      'Sol Traveler': [
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
          timeOfDay: 'anytime',
          actionableSteps: [
            {
              type: 'list',
              label: 'Quick Exploration Ideas',
              content: '• Try a new cuisine • Take a different route home • Learn 5 words in a new language • Listen to music from another culture • Visit a local place you\'ve never been • Try a new hobby for 30 minutes'
            },
            {
              type: 'search',
              label: 'Local Discovery',
              content: '"things to do near me" OR "hidden gems [your city]" OR "local attractions" OR "new experiences to try"'
            },
            {
              type: 'link',
              label: 'Free: Duolingo Language Learning',
              content: 'Explore new languages',
              url: 'https://duolingo.com'
            },
            {
              type: 'prompt',
              label: 'Exploration Reflection',
              content: 'After your exploration: What surprised me? What did I learn about myself? What assumptions did I challenge? What would I explore next?'
            }
          ]
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