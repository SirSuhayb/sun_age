import { getSolarArchetype } from './solarIdentity';
import { getCachedArchetypeActivities } from './activities';

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
  quote?: string;
  journalPrompt?: string;
  archetype: string;
  rarity: 'common' | 'rare' | 'legendary';
  icon: string;
  color: string;
  tags: string[];
  duration?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'anytime';
  actionableSteps: ActionableStep[];
  freeItems?: string[];
  nicheItems?: ActionableStep[];
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
  private activitiesCache: Record<string, DailyRoll[]> = {};

  private constructor() {
    // No longer need to initialize heavy data upfront
  }

  static getInstance(): SurpriseMeFramework {
    if (!SurpriseMeFramework.instance) {
      SurpriseMeFramework.instance = new SurpriseMeFramework();
    }
    return SurpriseMeFramework.instance;
  }

  async getArchetypeActivities(archetype: string): Promise<DailyRoll[]> {
    // Use the cached version from the activities module
    return await getCachedArchetypeActivities(archetype);
  }

  getUserProfile(birthDate: string): UserProfile {
    const archetype = getSolarArchetype(birthDate);
    return {
      birthDate,
      archetype,
      history: []
    };
  }

  async generatePersonalizedRoll(userProfile: UserProfile): Promise<DailyRoll> {
    const archetypeActivities = await this.getArchetypeActivities(userProfile.archetype);
    const availableActivities = archetypeActivities.filter(activity => 
      !userProfile.history.some(pastActivity => pastActivity.id === activity.id)
    );

    const finalActivities = availableActivities.length > 0 ? availableActivities : archetypeActivities;

    // Determine rarity based on weighted random selection
    const rarityWeights = { common: 0.6, rare: 0.3, legendary: 0.1 };
    const rarityRoll = Math.random();
    let targetRarity: 'common' | 'rare' | 'legendary' = 'common';
    
    if (rarityRoll > 0.9) {
      targetRarity = 'legendary';
    } else if (rarityRoll > 0.6) {
      targetRarity = 'rare';
    }

    // Filter by rarity, fallback to any if none available
    const filteredByRarity = finalActivities.filter(activity => activity.rarity === targetRarity);
    const selectedActivities = filteredByRarity.length > 0 ? filteredByRarity : finalActivities;

    // Random selection from filtered activities
    const randomIndex = Math.floor(Math.random() * selectedActivities.length);
    return selectedActivities[randomIndex];
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

export { SurpriseMeFramework };
export const surpriseMeFramework = SurpriseMeFramework.getInstance();