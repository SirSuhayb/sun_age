// SOLAR Token Earning System with Daily Streak Multipliers

export interface SolarEarnings {
  totalEarned: number;
  dailyStreak: number;
  lastRollDate: string;
  streakStartDate: string;
  earningsHistory: {
    date: string;
    amount: number;
    reason: string;
    streak: number;
  }[];
}

export interface RollEarnings {
  baseAmount: number;
  streakMultiplier: number;
  totalEarned: number;
  newStreak: number;
  streakBroken: boolean;
}

export class SolarEarningsManager {
  private static instance: SolarEarningsManager;
  private storageKey = 'solarEarnings';

  private constructor() {}

  static getInstance(): SolarEarningsManager {
    if (!SolarEarningsManager.instance) {
      SolarEarningsManager.instance = new SolarEarningsManager();
    }
    return SolarEarningsManager.instance;
  }

  // Base earnings per rarity
  private getBaseEarnings(rarity: string): number {
    switch (rarity) {
      case 'common': return 10;
      case 'rare': return 25;
      case 'legendary': return 50;
      default: return 10;
    }
  }

  // Calculate streak multiplier (1.0x to 5.0x)
  private getStreakMultiplier(streak: number): number {
    if (streak <= 1) return 1.0;
    if (streak <= 3) return 1.2;
    if (streak <= 7) return 1.5;
    if (streak <= 14) return 2.0;
    if (streak <= 30) return 3.0;
    return 5.0; // Max multiplier for 30+ day streaks
  }

  // Get current earnings data
  getEarnings(): SolarEarnings {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) {
      return {
        totalEarned: 0,
        dailyStreak: 0,
        lastRollDate: '',
        streakStartDate: '',
        earningsHistory: []
      };
    }
    return JSON.parse(stored);
  }

  // Calculate earnings for a roll
  calculateRollEarnings(rarity: string): RollEarnings {
    const earnings = this.getEarnings();
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
    
    // Check if streak continues or breaks
    let newStreak = 1;
    let streakBroken = false;
    
    if (earnings.lastRollDate === yesterday) {
      // Streak continues
      newStreak = earnings.dailyStreak + 1;
    } else if (earnings.lastRollDate === today) {
      // Already rolled today, maintain streak
      newStreak = earnings.dailyStreak;
    } else if (earnings.lastRollDate && earnings.lastRollDate !== yesterday) {
      // Streak broken
      newStreak = 1;
      streakBroken = true;
    }

    const baseAmount = this.getBaseEarnings(rarity);
    const streakMultiplier = this.getStreakMultiplier(newStreak);
    const totalEarned = Math.floor(baseAmount * streakMultiplier);

    return {
      baseAmount,
      streakMultiplier,
      totalEarned,
      newStreak,
      streakBroken
    };
  }

  // Award SOLAR for a roll
  awardSolar(rarity: string, rollTitle: string): RollEarnings {
    const earnings = this.getEarnings();
    const rollEarnings = this.calculateRollEarnings(rarity);
    const today = new Date().toDateString();

    // Don't award if already rolled today (this check should be handled upstream)
    if (earnings.lastRollDate === today) {
      return rollEarnings;
    }

    // Update earnings
    const newEarnings: SolarEarnings = {
      totalEarned: earnings.totalEarned + rollEarnings.totalEarned,
      dailyStreak: rollEarnings.newStreak,
      lastRollDate: today,
      streakStartDate: rollEarnings.streakBroken || !earnings.streakStartDate ? today : earnings.streakStartDate,
      earningsHistory: [
        ...earnings.earningsHistory,
        {
          date: today,
          amount: rollEarnings.totalEarned,
          reason: `${rarity} roll: "${rollTitle}"`,
          streak: rollEarnings.newStreak
        }
      ]
    };

    // Keep only last 30 days of history
    newEarnings.earningsHistory = newEarnings.earningsHistory.slice(-30);

    localStorage.setItem(this.storageKey, JSON.stringify(newEarnings));
    return rollEarnings;
  }

  // Get streak info for display
  getStreakInfo(): {
    current: number;
    multiplier: number;
    nextMultiplier: number;
    daysToNext: number;
  } {
    const earnings = this.getEarnings();
    const current = earnings.dailyStreak;
    const multiplier = this.getStreakMultiplier(current);
    
    // Calculate next milestone
    let nextMilestone = 3;
    if (current >= 3) nextMilestone = 7;
    if (current >= 7) nextMilestone = 14;
    if (current >= 14) nextMilestone = 30;
    if (current >= 30) nextMilestone = current + 1; // Already at max
    
    const nextMultiplier = this.getStreakMultiplier(nextMilestone);
    const daysToNext = Math.max(0, nextMilestone - current);

    return {
      current,
      multiplier,
      nextMultiplier,
      daysToNext
    };
  }

  // Get earnings summary for display
  getEarningsSummary(): {
    totalEarned: number;
    todayEarned: number;
    streakDays: number;
    streakMultiplier: number;
  } {
    const earnings = this.getEarnings();
    const today = new Date().toDateString();
    const todayHistory = earnings.earningsHistory.filter(h => h.date === today);
    const todayEarned = todayHistory.reduce((sum, h) => sum + h.amount, 0);

    return {
      totalEarned: earnings.totalEarned,
      todayEarned,
      streakDays: earnings.dailyStreak,
      streakMultiplier: this.getStreakMultiplier(earnings.dailyStreak)
    };
  }

  // Reset earnings (for testing/admin)
  resetEarnings(): void {
    localStorage.removeItem(this.storageKey);
  }
}

// Singleton instance
export const solarEarningsManager = SolarEarningsManager.getInstance();