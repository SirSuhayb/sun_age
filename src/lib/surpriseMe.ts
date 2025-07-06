import { getSolarArchetype } from './solarIdentity';

export interface ActionableStep {
  type: 'link' | 'search' | 'prompt' | 'list' | 'booking' | 'product';
  label: string;
  content: string;
  url?: string;
  affiliate?: {
    program: string;
    commission: string;
    tracking: string;
  };
  productImage?: string;
  price?: string;
  category?: 'accommodation' | 'flights' | 'gear' | 'experiences' | 'insurance' | 'books' | 'tools';
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
  private activities: Record<string, DailyRoll[]> = {};

  private constructor() {
    this.initializeActivities();
  }

  static getInstance(): SurpriseMeFramework {
    if (!SurpriseMeFramework.instance) {
      SurpriseMeFramework.instance = new SurpriseMeFramework();
    }
    return SurpriseMeFramework.instance;
  }

  private initializeActivities() {
    this.activities = {
      'Sol Traveler': [
        // Common Activities
        {
          id: 'trav-1',
          type: 'activity',
          title: 'Plan Your Next Adventure',
          description: 'Research and book a destination that calls to your wandering soul. Let curiosity guide your journey.',
          archetype: 'Sol Traveler',
          rarity: 'common',
          icon: '🌍',
          color: 'bg-emerald-100 border-emerald-300',
          tags: ['travel', 'planning', 'adventure'],
          duration: '2 hours',
          difficulty: 'easy',
          timeOfDay: 'afternoon',
          actionableSteps: [
            {
              type: 'booking',
              label: 'Search Hotels & Stays',
              content: 'Find unique accommodations worldwide with up to 25% commission',
              url: 'https://www.booking.com/searchresults.html?ss=worldwide&aid=yourtag',
              affiliate: {
                program: 'Booking.com',
                commission: 'Up to 25% of commission',
                tracking: 'Session-based'
              },
              productImage: '/api/placeholder/300/200',
              category: 'accommodation'
            },
            {
              type: 'booking',
              label: 'Find Flights',
              content: 'Compare flight prices across 1,200+ airlines worldwide',
              url: 'https://www.skyscanner.com/flights?pid=yourtag',
              affiliate: {
                program: 'Skyscanner',
                commission: 'Up to 20%',
                tracking: '30 days'
              },
              category: 'flights'
            },
            {
              type: 'booking',
              label: 'Book Experiences',
              content: 'Discover unique activities and tours in 2,500+ destinations',
              url: 'https://www.viator.com/tours?pid=yourtag',
              affiliate: {
                program: 'Viator',
                commission: '8%',
                tracking: '30 days'
              },
              category: 'experiences'
            },
            {
              type: 'search',
              label: 'Google Search: "Hidden gems [destination]"',
              content: 'hidden gems [destination] local experiences off beaten path',
              url: 'https://www.google.com/search?q=hidden+gems+destination+local+experiences'
            },
            {
              type: 'product',
              label: 'Travel Insurance',
              content: 'Protect your adventure with comprehensive travel insurance',
              url: 'https://www.worldnomads.com/travel-insurance?affiliate=yourtag',
              affiliate: {
                program: 'World Nomads',
                commission: '10%',
                tracking: '60 days'
              },
              price: 'From $45',
              category: 'insurance'
            }
          ]
        },
        {
          id: 'trav-2',
          type: 'activity',
          title: 'Learn a Local Phrase',
          description: 'Connect with a new culture by learning key phrases in a language you\'ve never spoken.',
          archetype: 'Sol Traveler',
          rarity: 'common',
          icon: '🗣️',
          color: 'bg-emerald-100 border-emerald-300',
          tags: ['language', 'culture', 'connection'],
          duration: '30 minutes',
          difficulty: 'easy',
          timeOfDay: 'anytime',
          actionableSteps: [
            {
              type: 'link',
              label: 'Start Learning on Duolingo',
              content: 'Free language learning app with 40+ languages',
              url: 'https://www.duolingo.com/?pid=yourtag',
              affiliate: {
                program: 'Duolingo Plus',
                commission: '30-day free trial',
                tracking: '30 days'
              }
            },
            {
              type: 'link',
              label: 'Buy: "Lonely Planet Phrasebook"',
              content: 'Essential phrases for travelers',
              url: 'https://amazon.com/dp/B00JVBF8QG?tag=yourtag-20',
              affiliate: {
                program: 'Amazon Associates',
                commission: 'Up to 10%',
                tracking: '24 hours'
              },
              productImage: '/api/placeholder/200/250',
              price: '$12.99',
              category: 'books'
            },
            {
              type: 'prompt',
              label: 'Practice Today',
              content: 'Choose 3 essential phrases: "Hello," "Thank you," and "Where is...?" Practice using them in conversation with yourself or friends.'
            }
          ]
        },
        // Rare Activities
        {
          id: 'trav-3',
          type: 'experience',
          title: 'Digital Nomad Day',
          description: 'Experience the nomadic lifestyle by working from a new location today.',
          archetype: 'Sol Traveler',
          rarity: 'rare',
          icon: '💻',
          color: 'bg-emerald-100 border-emerald-300',
          tags: ['remote work', 'lifestyle', 'flexibility'],
          duration: '8 hours',
          difficulty: 'medium',
          timeOfDay: 'morning',
          actionableSteps: [
            {
              type: 'search',
              label: 'Find Remote Work Spots',
              content: 'coworking spaces near me wifi coffee shops remote work',
              url: 'https://www.google.com/search?q=coworking+spaces+near+me+wifi+coffee+shops'
            },
            {
              type: 'product',
              label: 'Portable Travel Backpack',
              content: 'Professional laptop backpack for digital nomads',
              url: 'https://www.amazon.com/dp/B07MKBZRJH?tag=yourtag-20',
              affiliate: {
                program: 'Amazon Associates',
                commission: 'Up to 8%',
                tracking: '24 hours'
              },
              productImage: '/api/placeholder/200/250',
              price: '$79.99',
              category: 'gear'
            },
            {
              type: 'booking',
              label: 'Book a Day Pass',
              content: 'Access professional coworking spaces worldwide',
              url: 'https://www.wework.com/day-passes?pid=yourtag',
              affiliate: {
                program: 'WeWork',
                commission: 'Varies',
                tracking: '30 days'
              },
              category: 'experiences'
            }
          ]
        },
        // Legendary Activities
        {
          id: 'trav-4',
          type: 'experience',
          title: 'Spontaneous Journey',
          description: 'Book a last-minute trip to somewhere you\'ve never been. Trust the universe to guide your adventure.',
          archetype: 'Sol Traveler',
          rarity: 'legendary',
          icon: '✈️',
          color: 'bg-emerald-100 border-emerald-300',
          tags: ['spontaneous', 'adventure', 'trust'],
          duration: '3-7 days',
          difficulty: 'hard',
          timeOfDay: 'morning',
          actionableSteps: [
            {
              type: 'booking',
              label: 'Last-Minute Flight Deals',
              content: 'Find spontaneous flight deals and save up to 70%',
              url: 'https://www.expedia.com/Last-Minute-Flights?pid=yourtag',
              affiliate: {
                program: 'Expedia',
                commission: 'Up to 4%',
                tracking: '7 days'
              },
              category: 'flights'
            },
            {
              type: 'booking',
              label: 'Same-Day Accommodation',
              content: 'Book hotels with same-day availability',
              url: 'https://www.booking.com/searchresults.html?ss=surprise+me&aid=yourtag',
              affiliate: {
                program: 'Booking.com',
                commission: 'Up to 25% of commission',
                tracking: 'Session-based'
              },
              category: 'accommodation'
            },
            {
              type: 'product',
              label: 'Travel Packing Cubes',
              content: 'Pack efficiently for spontaneous trips',
              url: 'https://www.amazon.com/dp/B07MNBGPZQ?tag=yourtag-20',
              affiliate: {
                program: 'Amazon Associates',
                commission: 'Up to 8%',
                tracking: '24 hours'
              },
              productImage: '/api/placeholder/200/250',
              price: '$24.99',
              category: 'gear'
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
              url: 'https://amazon.com/dp/0486298043?tag=yourtag-20',
              affiliate: {
                program: 'Amazon Associates',
                commission: 'Up to 10%',
                tracking: '24 hours'
              },
              productImage: '/api/placeholder/200/250',
              price: '$8.99',
              category: 'books'
            },
            {
              type: 'search',
              label: 'Google Search: "Daily Stoic practices"',
              content: 'daily stoic practices morning routine wisdom philosophy',
              url: 'https://www.google.com/search?q=daily+stoic+practices+morning+routine+wisdom'
            },
            {
              type: 'link',
              label: 'Free: "Tao Te Ching" (Public Domain)',
              content: 'Ancient Chinese philosophical text on natural harmony',
              url: 'https://www.gutenberg.org/ebooks/216',
              price: 'Free'
            },
            {
              type: 'prompt',
              label: 'Reflection Journal',
              content: 'After reading, write down 3 insights that resonate with your current life situation. How can you apply this wisdom today?'
            }
          ]
        },
        // Continue with other Sol Sage activities...
        {
          id: 'sag-2',
          type: 'experience',
          title: 'Temple or Sacred Space Visit',
          description: 'Visit a place of worship, meditation center, or natural sacred space to connect with deeper wisdom.',
          archetype: 'Sol Sage',
          rarity: 'rare',
          icon: '🏛️',
          color: 'bg-orange-100 border-orange-300',
          tags: ['sacred', 'meditation', 'pilgrimage'],
          duration: '2 hours',
          difficulty: 'easy',
          timeOfDay: 'morning',
          actionableSteps: [
            {
              type: 'search',
              label: 'Find Sacred Spaces Near You',
              content: 'meditation centers temples sacred spaces near me spiritual retreats',
              url: 'https://www.google.com/search?q=meditation+centers+temples+sacred+spaces+near+me'
            },
            {
              type: 'booking',
              label: 'Book Spiritual Experiences',
              content: 'Find meditation retreats and spiritual tours worldwide',
              url: 'https://www.viator.com/tours/Spiritual-Tours/d4-g6045?pid=yourtag',
              affiliate: {
                program: 'Viator',
                commission: '8%',
                tracking: '30 days'
              },
              category: 'experiences'
            },
            {
              type: 'product',
              label: 'Travel Meditation Cushion',
              content: 'Portable meditation cushion for sacred space visits',
              url: 'https://www.amazon.com/dp/B07MXZQXJH?tag=yourtag-20',
              affiliate: {
                program: 'Amazon Associates',
                commission: 'Up to 8%',
                tracking: '24 hours'
              },
              productImage: '/api/placeholder/200/250',
              price: '$39.99',
              category: 'gear'
            }
          ]
        }
      ],
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
          tags: ['creation', 'innovation', 'prototype'],
          duration: '30 minutes',
          difficulty: 'easy',
          timeOfDay: 'afternoon',
          actionableSteps: [
            {
              type: 'link',
              label: 'Free: Design with Figma',
              content: 'Professional design tool with free tier',
              url: 'https://www.figma.com/pricing/?pid=yourtag',
              affiliate: {
                program: 'Figma',
                commission: 'Referral program',
                tracking: 'Varies'
              }
            },
            {
              type: 'product',
              label: 'Moleskine Sketchbook',
              content: 'High-quality sketching notebook for innovators',
              url: 'https://www.amazon.com/dp/B00AZZY8LG?tag=yourtag-20',
              affiliate: {
                program: 'Amazon Associates',
                commission: 'Up to 8%',
                tracking: '24 hours'
              },
              productImage: '/api/placeholder/200/250',
              price: '$18.95',
              category: 'tools'
            },
            {
              type: 'search',
              label: 'Google Search: "Rapid prototyping techniques"',
              content: 'rapid prototyping techniques design thinking innovation methods',
              url: 'https://www.google.com/search?q=rapid+prototyping+techniques+design+thinking'
            },
            {
              type: 'prompt',
              label: 'Innovation Framework',
              content: 'Use the "How Might We..." framework. Pick a problem you\'ve noticed today and ask: "How might we solve this in a completely new way?"'
            }
          ]
        }
      ],
      'Sol Artist': [
        // Common Activities  
        {
          id: 'art-1',
          type: 'activity',
          title: 'Create Beauty',
          description: 'Make something beautiful today - a drawing, photo, poem, or any creative expression that moves you.',
          archetype: 'Sol Artist',
          rarity: 'common',
          icon: '🎨',
          color: 'bg-purple-100 border-purple-300',
          tags: ['creativity', 'beauty', 'expression'],
          duration: '1 hour',
          difficulty: 'easy',
          timeOfDay: 'afternoon',
          actionableSteps: [
            {
              type: 'product',
              label: 'Professional Art Supplies',
              content: 'High-quality art materials for creative expression',
              url: 'https://www.amazon.com/dp/B07QXHZQZV?tag=yourtag-20',
              affiliate: {
                program: 'Amazon Associates',
                commission: 'Up to 8%',
                tracking: '24 hours'
              },
              productImage: '/api/placeholder/200/250',
              price: '$49.99',
              category: 'tools'
            },
            {
              type: 'search',
              label: 'Google Search: "Daily art prompts"',
              content: 'daily art prompts creative exercises inspiration drawing ideas',
              url: 'https://www.google.com/search?q=daily+art+prompts+creative+exercises+inspiration'
            },
            {
              type: 'link',
              label: 'Free: Adobe Creative Cloud Trial',
              content: 'Professional creative software suite',
              url: 'https://www.adobe.com/creativecloud/free-trial.html?pid=yourtag',
              affiliate: {
                program: 'Adobe',
                commission: 'Varies',
                tracking: '30 days'
              },
              price: 'Free trial'
            },
            {
              type: 'prompt',
              label: 'Creative Challenge',
              content: 'Set a timer for 15 minutes and create something without stopping to judge or edit. Focus on the pure joy of creation.'
            }
          ]
        }
      ],
      'Sol Builder': [
        // Common Activities
        {
          id: 'bui-1',
          type: 'activity',
          title: 'Build Your Foundation',
          description: 'Strengthen one area of your life infrastructure - health, finances, relationships, or skills.',
          archetype: 'Sol Builder',
          rarity: 'common',
          icon: '🏗️',
          color: 'bg-yellow-100 border-yellow-300',
          tags: ['foundation', 'stability', 'growth'],
          duration: '1 hour',
          difficulty: 'medium',
          timeOfDay: 'morning',
          actionableSteps: [
            {
              type: 'search',
              label: 'Google Search: "Foundation building habits"',
              content: 'foundation building habits life infrastructure personal development',
              url: 'https://www.google.com/search?q=foundation+building+habits+life+infrastructure'
            },
            {
              type: 'link',
              label: 'Buy: "Atomic Habits" by James Clear',
              content: 'The definitive guide to building good habits',
              url: 'https://amazon.com/dp/0735211299?tag=yourtag-20',
              affiliate: {
                program: 'Amazon Associates',
                commission: 'Up to 10%',
                tracking: '24 hours'
              },
              productImage: '/api/placeholder/200/250',
              price: '$14.99',
              category: 'books'
            },
            {
              type: 'prompt',
              label: 'Foundation Assessment',
              content: 'Rate these areas 1-10: Health, Finances, Relationships, Skills, Home Environment. Pick your lowest score and take one small action to improve it today.'
            }
          ]
        }
      ],
      'Sol Nurturer': [
        // Common Activities
        {
          id: 'nur-1',
          type: 'activity',
          title: 'Nurture Connection',
          description: 'Reach out to someone you care about with genuine intention to support, listen, or simply connect.',
          archetype: 'Sol Nurturer',
          rarity: 'common',
          icon: '🤗',
          color: 'bg-pink-100 border-pink-300',
          tags: ['connection', 'support', 'empathy'],
          duration: '30 minutes',
          difficulty: 'easy',
          timeOfDay: 'afternoon',
          actionableSteps: [
            {
              type: 'prompt',
              label: 'Connection Ritual',
              content: 'Think of 3 people you haven\'t spoken to in a while. Choose one and send them a thoughtful message asking how they\'re really doing.'
            },
            {
              type: 'search',
              label: 'Google Search: "Meaningful conversation starters"',
              content: 'meaningful conversation starters deep questions connection friendship',
              url: 'https://www.google.com/search?q=meaningful+conversation+starters+deep+questions+connection'
            },
            {
              type: 'link',
              label: 'Buy: "The Art of Gathering" by Priya Parker',
              content: 'Transform how you connect with others',
              url: 'https://amazon.com/dp/1594634920?tag=yourtag-20',
              affiliate: {
                program: 'Amazon Associates',
                commission: 'Up to 10%',
                tracking: '24 hours'
              },
              productImage: '/api/placeholder/200/250',
              price: '$16.99',
              category: 'books'
            }
          ]
        }
      ],
      'Sol Alchemist': [
        // Common Activities
        {
          id: 'alc-1',
          type: 'activity',
          title: 'Transform Something',
          description: 'Take something in your life that feels stuck or stagnant and consciously transform it into something better.',
          archetype: 'Sol Alchemist',
          rarity: 'common',
          icon: '⚗️',
          color: 'bg-indigo-100 border-indigo-300',
          tags: ['transformation', 'change', 'growth'],
          duration: '45 minutes',
          difficulty: 'medium',
          timeOfDay: 'evening',
          actionableSteps: [
            {
              type: 'prompt',
              label: 'Transformation Inventory',
              content: 'Identify one area of your life that feels stuck. Write down: What it is now → What you want it to become → One small action you can take today.'
            },
            {
              type: 'search',
              label: 'Google Search: "Personal transformation techniques"',
              content: 'personal transformation techniques change management self improvement',
              url: 'https://www.google.com/search?q=personal+transformation+techniques+change+management'
            },
            {
              type: 'link',
              label: 'Buy: "The Gifts of Imperfection" by Brené Brown',
              content: 'Guide to transformation through vulnerability',
              url: 'https://amazon.com/dp/159285849X?tag=yourtag-20',
              affiliate: {
                program: 'Amazon Associates',
                commission: 'Up to 10%',
                tracking: '24 hours'
              },
              productImage: '/api/placeholder/200/250',
              price: '$15.99',
              category: 'books'
            }
          ]
        }
      ]
    };
  }

  generatePersonalizedRoll(userProfile: UserProfile): DailyRoll {
    const archetypeActivities = this.activities[userProfile.archetype] || this.activities['Sol Traveler'];
    const availableActivities = archetypeActivities.filter(activity => 
      !this.wasRecentlyRolled(activity.id, userProfile.history)
    );

    const finalActivities = availableActivities.length > 0 ? availableActivities : archetypeActivities;
    
    // Weighted random selection based on rarity
    const rarityWeights = { common: 0.6, rare: 0.3, legendary: 0.1 };
    const randomValue = Math.random();
    let targetRarity: 'common' | 'rare' | 'legendary' = 'common';
    
    if (randomValue > 0.6 && randomValue <= 0.9) targetRarity = 'rare';
    else if (randomValue > 0.9) targetRarity = 'legendary';
    
    const filteredByRarity = finalActivities.filter(activity => activity.rarity === targetRarity);
    const selectedActivities = filteredByRarity.length > 0 ? filteredByRarity : finalActivities;
    
    const randomIndex = Math.floor(Math.random() * selectedActivities.length);
    return selectedActivities[randomIndex];
  }

  private wasRecentlyRolled(activityId: string, history: DailyRoll[]): boolean {
    const recentHistory = history.slice(-5); // Check last 5 rolls
    return recentHistory.some(roll => roll.id === activityId);
  }

  getUserProfile(birthDate: string): UserProfile {
    const archetype = getSolarArchetype(birthDate);
    return {
      birthDate,
      archetype,
      history: []
    };
  }

  getArchetypeActivities(archetype: string): DailyRoll[] {
    return this.activities[archetype] || this.activities['Sol Traveler'];
  }

  getDailyRollsCount(): number {
    const today = new Date().toDateString();
    const stored = localStorage.getItem(`dailyRolls_${today}`);
    if (stored) {
      const data = JSON.parse(stored);
      return data.remaining || 3;
    }
    return 3;
  }

  updateDailyRolls(newCount: number, roll: DailyRoll): void {
    const today = new Date().toDateString();
    const stored = localStorage.getItem(`dailyRolls_${today}`);
    const currentData = stored ? JSON.parse(stored) : { remaining: 3, history: [] };
    
    const updatedData = {
      remaining: newCount,
      history: [...currentData.history, roll]
    };
    
    localStorage.setItem(`dailyRolls_${today}`, JSON.stringify(updatedData));
  }
}

export const surpriseMeFramework = SurpriseMeFramework.getInstance();