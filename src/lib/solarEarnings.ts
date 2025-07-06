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
    bonusType?: 'roll' | 'weekly' | 'monthly' | 'referral' | 'achievement' | 'event';
  }[];
  achievements: {
    firstRoll: boolean;
    firstRare: boolean;
    firstLegendary: boolean;
    streak7: boolean;
    streak30: boolean;
    streak100: boolean;
    rolls10: boolean;
    rolls50: boolean;
    rolls100: boolean;
    earner10k: boolean;
    earner100k: boolean;
    earner1m: boolean;
    referrer: boolean;
    socialSharer: boolean;
  };
  referralStats: {
    referralCode: string;
    referredUsers: string[];
    totalReferralEarnings: number;
  };
  weeklyBonuses: {
    lastWeeklyBonus: string; // ISO date string
    weeklyBonusCount: number;
  };
  monthlyBonuses: {
    lastMonthlyBonus: string; // ISO date string  
    monthlyBonusCount: number;
  };
  specialEvents: {
    cosmicConvergence2024: boolean;
    solarEclipse2024: boolean;
    // Add more events as needed
  };
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

  // Base earnings per rarity (scaled for 100M+ token supply)
  private getBaseEarnings(rarity: string): number {
    switch (rarity) {
      case 'common': return 1000;      // 1K SOLAR
      case 'rare': return 2500;       // 2.5K SOLAR  
      case 'legendary': return 5000;  // 5K SOLAR
      default: return 1000;
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

  // Generate unique referral code
  private generateReferralCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'SOL';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
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
        earningsHistory: [],
        achievements: {
          firstRoll: false,
          firstRare: false,
          firstLegendary: false,
          streak7: false,
          streak30: false,
          streak100: false,
          rolls10: false,
          rolls50: false,
          rolls100: false,
          earner10k: false,
          earner100k: false,
          earner1m: false,
          referrer: false,
          socialSharer: false,
        },
        referralStats: {
          referralCode: this.generateReferralCode(),
          referredUsers: [],
          totalReferralEarnings: 0,
        },
        weeklyBonuses: {
          lastWeeklyBonus: '',
          weeklyBonusCount: 0,
        },
        monthlyBonuses: {
          lastMonthlyBonus: '',
          monthlyBonusCount: 0,
        },
        specialEvents: {
          cosmicConvergence2024: false,
          solarEclipse2024: false,
        }
      };
    }
    
    const parsed = JSON.parse(stored);
    // Ensure backward compatibility by adding missing properties
    return {
      ...parsed,
      achievements: parsed.achievements || {
        firstRoll: false,
        firstRare: false,
        firstLegendary: false,
        streak7: false,
        streak30: false,
        streak100: false,
        rolls10: false,
        rolls50: false,
        rolls100: false,
        earner10k: false,
        earner100k: false,
        earner1m: false,
        referrer: false,
        socialSharer: false,
      },
      referralStats: parsed.referralStats || {
        referralCode: this.generateReferralCode(),
        referredUsers: [],
        totalReferralEarnings: 0,
      },
      weeklyBonuses: parsed.weeklyBonuses || {
        lastWeeklyBonus: '',
        weeklyBonusCount: 0,
      },
      monthlyBonuses: parsed.monthlyBonuses || {
        lastMonthlyBonus: '',
        monthlyBonusCount: 0,
      },
      specialEvents: parsed.specialEvents || {
        cosmicConvergence2024: false,
        solarEclipse2024: false,
      }
    };
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

  // Award SOLAR for a roll with all bonuses
  awardSolar(rarity: string, rollTitle: string): RollEarnings & {
    achievements: { unlocked: string[]; bonusEarned: number };
    bonuses: { weeklyBonus: number; monthlyBonus: number };
    eventMultiplier: number;
    totalBonusEarned: number;
  } {
    const earnings = this.getEarnings();
    const rollEarnings = this.calculateRollEarnings(rarity);
    const today = new Date().toDateString();

    // Don't award if already rolled today (this check should be handled upstream)
    if (earnings.lastRollDate === today) {
      return {
        ...rollEarnings,
        achievements: { unlocked: [], bonusEarned: 0 },
        bonuses: { weeklyBonus: 0, monthlyBonus: 0 },
        eventMultiplier: 1.0,
        totalBonusEarned: 0
      };
    }

    // Check for special event multipliers
    const eventMultiplier = this.getEventMultiplier();
    const eventBonusEarnings = eventMultiplier > 1.0 ? 
      Math.floor(rollEarnings.totalEarned * (eventMultiplier - 1.0)) : 0;

    // Check achievements BEFORE updating earnings
    const achievementResult = this.checkAchievements(rarity);

    // Check weekly/monthly bonuses
    const bonusResult = this.checkBonuses();

    // Calculate total earnings including all bonuses
    const totalRollEarnings = rollEarnings.totalEarned + eventBonusEarnings;
    const totalBonusEarned = achievementResult.bonusEarned + bonusResult.weeklyBonus + bonusResult.monthlyBonus;
    const grandTotal = totalRollEarnings + totalBonusEarned;

    // Update earnings with all bonuses
    const updatedEarnings = this.getEarnings(); // Get fresh data after bonus checks
    updatedEarnings.totalEarned += grandTotal;
    updatedEarnings.dailyStreak = rollEarnings.newStreak;
    updatedEarnings.lastRollDate = today;
    updatedEarnings.streakStartDate = rollEarnings.streakBroken || !updatedEarnings.streakStartDate ? today : updatedEarnings.streakStartDate;

    // Add roll to history
    updatedEarnings.earningsHistory.push({
      date: today,
      amount: totalRollEarnings,
      reason: `${rarity} roll: "${rollTitle}"${eventMultiplier > 1.0 ? ` (${eventMultiplier}x event bonus)` : ''}`,
      streak: rollEarnings.newStreak,
      bonusType: 'roll'
    });

    // Add achievement bonuses to history
    if (achievementResult.bonusEarned > 0) {
      updatedEarnings.earningsHistory.push({
        date: today,
        amount: achievementResult.bonusEarned,
        reason: `Achievement bonuses: ${achievementResult.unlocked.join(', ')}`,
        streak: rollEarnings.newStreak,
        bonusType: 'achievement'
      });
    }

    // Add weekly bonus to history
    if (bonusResult.weeklyBonus > 0) {
      updatedEarnings.earningsHistory.push({
        date: today,
        amount: bonusResult.weeklyBonus,
        reason: '7-Day Streak Weekly Bonus',
        streak: rollEarnings.newStreak,
        bonusType: 'weekly'
      });
    }

    // Add monthly bonus to history
    if (bonusResult.monthlyBonus > 0) {
      updatedEarnings.earningsHistory.push({
        date: today,
        amount: bonusResult.monthlyBonus,
        reason: '30-Day Streak Monthly Bonus',
        streak: rollEarnings.newStreak,
        bonusType: 'monthly'
      });
    }

    // Keep only last 30 days of history
    updatedEarnings.earningsHistory = updatedEarnings.earningsHistory.slice(-30);

    localStorage.setItem(this.storageKey, JSON.stringify(updatedEarnings));

    return {
      ...rollEarnings,
      totalEarned: totalRollEarnings, // Update to include event bonus
      achievements: achievementResult,
      bonuses: bonusResult,
      eventMultiplier,
      totalBonusEarned
    };
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

  // Check and award achievements
  checkAchievements(rollRarity: string): { unlocked: string[]; bonusEarned: number } {
    const earnings = this.getEarnings();
    const unlockedAchievements: string[] = [];
    let bonusEarned = 0;

    const totalRolls = earnings.earningsHistory.filter(h => h.bonusType === 'roll').length;
    
    // First roll achievement
    if (!earnings.achievements.firstRoll && totalRolls === 1) {
      earnings.achievements.firstRoll = true;
      unlockedAchievements.push('🎲 First Roll');
      bonusEarned += 500;
    }

    // Rarity achievements
    if (!earnings.achievements.firstRare && rollRarity === 'rare') {
      earnings.achievements.firstRare = true;
      unlockedAchievements.push('💎 First Rare');
      bonusEarned += 1000;
    }

    if (!earnings.achievements.firstLegendary && rollRarity === 'legendary') {
      earnings.achievements.firstLegendary = true;
      unlockedAchievements.push('🌟 First Legendary');
      bonusEarned += 2500;
    }

    // Streak achievements
    if (!earnings.achievements.streak7 && earnings.dailyStreak >= 7) {
      earnings.achievements.streak7 = true;
      unlockedAchievements.push('🔥 7-Day Streak');
      bonusEarned += 5000;
    }

    if (!earnings.achievements.streak30 && earnings.dailyStreak >= 30) {
      earnings.achievements.streak30 = true;
      unlockedAchievements.push('🌟 30-Day Streak');
      bonusEarned += 25000;
    }

    if (!earnings.achievements.streak100 && earnings.dailyStreak >= 100) {
      earnings.achievements.streak100 = true;
      unlockedAchievements.push('🌟 100-Day Streak');
      bonusEarned += 100000;
    }

    // Roll count achievements
    if (!earnings.achievements.rolls10 && totalRolls >= 10) {
      earnings.achievements.rolls10 = true;
      unlockedAchievements.push('🎯 10 Rolls');
      bonusEarned += 2000;
    }

    if (!earnings.achievements.rolls50 && totalRolls >= 50) {
      earnings.achievements.rolls50 = true;
      unlockedAchievements.push('🎯 50 Rolls');
      bonusEarned += 10000;
    }

    if (!earnings.achievements.rolls100 && totalRolls >= 100) {
      earnings.achievements.rolls100 = true;
      unlockedAchievements.push('🎯 100 Rolls');
      bonusEarned += 25000;
    }

    // Earning milestones
    if (!earnings.achievements.earner10k && earnings.totalEarned >= 10000) {
      earnings.achievements.earner10k = true;
      unlockedAchievements.push('💰 10K Earner');
      bonusEarned += 5000;
    }

    if (!earnings.achievements.earner100k && earnings.totalEarned >= 100000) {
      earnings.achievements.earner100k = true;
      unlockedAchievements.push('💰 100K Earner');
      bonusEarned += 25000;
    }

    if (!earnings.achievements.earner1m && earnings.totalEarned >= 1000000) {
      earnings.achievements.earner1m = true;
      unlockedAchievements.push('💰 1M Earner');
      bonusEarned += 100000;
    }

    // Save achievements if any were unlocked
    if (unlockedAchievements.length > 0) {
      localStorage.setItem(this.storageKey, JSON.stringify(earnings));
    }

    return { unlocked: unlockedAchievements, bonusEarned };
  }

  // Check and award weekly/monthly bonuses
  checkBonuses(): { weeklyBonus: number; monthlyBonus: number } {
    const earnings = this.getEarnings();
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    let weeklyBonus = 0;
    let monthlyBonus = 0;

    // Check weekly bonus (every 7 days)
    if (earnings.dailyStreak >= 7) {
      const lastWeekly = earnings.weeklyBonuses.lastWeeklyBonus;
      const weeksSinceLastBonus = lastWeekly ? 
        Math.floor((today.getTime() - new Date(lastWeekly).getTime()) / (7 * 24 * 60 * 60 * 1000)) : 1;
      
      if (weeksSinceLastBonus >= 1) {
        weeklyBonus = 10000;
        earnings.weeklyBonuses.lastWeeklyBonus = todayStr;
        earnings.weeklyBonuses.weeklyBonusCount++;
      }
    }

    // Check monthly bonus (every 30 days)
    if (earnings.dailyStreak >= 30) {
      const lastMonthly = earnings.monthlyBonuses.lastMonthlyBonus;
      const monthsSinceLastBonus = lastMonthly ? 
        Math.floor((today.getTime() - new Date(lastMonthly).getTime()) / (30 * 24 * 60 * 60 * 1000)) : 1;
      
      if (monthsSinceLastBonus >= 1) {
        monthlyBonus = 50000;
        earnings.monthlyBonuses.lastMonthlyBonus = todayStr;
        earnings.monthlyBonuses.monthlyBonusCount++;
      }
    }

    // Save bonuses if any were awarded
    if (weeklyBonus > 0 || monthlyBonus > 0) {
      localStorage.setItem(this.storageKey, JSON.stringify(earnings));
    }

    return { weeklyBonus, monthlyBonus };
  }

  // Award referral bonus
  awardReferralBonus(referredUserId: string): boolean {
    const earnings = this.getEarnings();
    
    // Check if user already referred
    if (earnings.referralStats.referredUsers.includes(referredUserId)) {
      return false;
    }

    // Award bonus
    const referralBonus = 5000;
    earnings.referralStats.referredUsers.push(referredUserId);
    earnings.referralStats.totalReferralEarnings += referralBonus;
    earnings.totalEarned += referralBonus;
    
    // Mark as referrer achievement
    if (!earnings.achievements.referrer) {
      earnings.achievements.referrer = true;
    }

    // Add to history
    earnings.earningsHistory.push({
      date: new Date().toDateString(),
      amount: referralBonus,
      reason: `Referral bonus for ${referredUserId}`,
      streak: earnings.dailyStreak,
      bonusType: 'referral'
    });

    localStorage.setItem(this.storageKey, JSON.stringify(earnings));
    return true;
  }

  // Get special event multiplier
  getEventMultiplier(): number {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    
    // Cosmic Convergence (December 21 - Winter Solstice)
    if (month === 12 && day === 21) {
      return 2.0;
    }
    
    // Solar Eclipse events (add specific dates)
    if (month === 4 && day === 8) { // April 8, 2024
      return 3.0;
    }
    
    // Full moon bonuses (approximate - could use lunar calendar API)
    if (day === 15) {
      return 1.5;
    }
    
    return 1.0;
  }

  // Mark social sharing achievement
  markSocialShare(): void {
    const earnings = this.getEarnings();
    if (!earnings.achievements.socialSharer) {
      earnings.achievements.socialSharer = true;
      earnings.totalEarned += 1000;
      earnings.earningsHistory.push({
        date: new Date().toDateString(),
        amount: 1000,
        reason: 'First social share',
        streak: earnings.dailyStreak,
        bonusType: 'achievement'
      });
      localStorage.setItem(this.storageKey, JSON.stringify(earnings));
    }
  }

  // Get referral code
  getReferralCode(): string {
    const earnings = this.getEarnings();
    return earnings.referralStats.referralCode;
  }

  // Get achievement progress
  getAchievementProgress(): {
    completed: number;
    total: number;
    unlockedAchievements: string[];
    nextAchievements: string[];
  } {
    const earnings = this.getEarnings();
    const totalRolls = earnings.earningsHistory.filter(h => h.bonusType === 'roll').length;
    
    const achievements = earnings.achievements;
    const unlockedAchievements: string[] = [];
    const nextAchievements: string[] = [];

    // Check all achievements
    if (achievements.firstRoll) unlockedAchievements.push('🎲 First Roll');
    else nextAchievements.push('🎲 First Roll');

    if (achievements.firstRare) unlockedAchievements.push('💎 First Rare');
    else nextAchievements.push('💎 First Rare');

    if (achievements.firstLegendary) unlockedAchievements.push('🌟 First Legendary');
    else nextAchievements.push('🌟 First Legendary');

    if (achievements.streak7) unlockedAchievements.push('🔥 7-Day Streak');
    else if (earnings.dailyStreak < 7) nextAchievements.push(`🔥 7-Day Streak (${earnings.dailyStreak}/7)`);

    if (achievements.streak30) unlockedAchievements.push('🌟 30-Day Streak');
    else if (earnings.dailyStreak < 30) nextAchievements.push(`🌟 30-Day Streak (${earnings.dailyStreak}/30)`);

    if (achievements.streak100) unlockedAchievements.push('🌟 100-Day Streak');
    else if (earnings.dailyStreak < 100) nextAchievements.push(`🌟 100-Day Streak (${earnings.dailyStreak}/100)`);

    if (achievements.rolls10) unlockedAchievements.push('🎯 10 Rolls');
    else if (totalRolls < 10) nextAchievements.push(`🎯 10 Rolls (${totalRolls}/10)`);

    if (achievements.rolls50) unlockedAchievements.push('🎯 50 Rolls');
    else if (totalRolls < 50) nextAchievements.push(`🎯 50 Rolls (${totalRolls}/50)`);

    if (achievements.rolls100) unlockedAchievements.push('🎯 100 Rolls');
    else if (totalRolls < 100) nextAchievements.push(`🎯 100 Rolls (${totalRolls}/100)`);

    if (achievements.earner10k) unlockedAchievements.push('💰 10K Earner');
    else if (earnings.totalEarned < 10000) nextAchievements.push(`💰 10K Earner (${earnings.totalEarned.toLocaleString()}/10,000)`);

    if (achievements.earner100k) unlockedAchievements.push('💰 100K Earner');
    else if (earnings.totalEarned < 100000) nextAchievements.push(`💰 100K Earner (${earnings.totalEarned.toLocaleString()}/100,000)`);

    if (achievements.earner1m) unlockedAchievements.push('💰 1M Earner');
    else if (earnings.totalEarned < 1000000) nextAchievements.push(`💰 1M Earner (${earnings.totalEarned.toLocaleString()}/1,000,000)`);

    if (achievements.referrer) unlockedAchievements.push('👥 Referrer');
    else nextAchievements.push('👥 Referrer (invite a friend)');

    if (achievements.socialSharer) unlockedAchievements.push('📱 Social Sharer');
    else nextAchievements.push('📱 Social Sharer (share your first roll)');

    const totalAchievements = 13;
    const completedAchievements = unlockedAchievements.length;

    return {
      completed: completedAchievements,
      total: totalAchievements,
      unlockedAchievements,
      nextAchievements: nextAchievements.slice(0, 3) // Show top 3 next achievements
    };
  }
}

// Singleton instance
export const solarEarningsManager = SolarEarningsManager.getInstance();