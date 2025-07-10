/**
 * Offline Data Manager for Solara PWA
 * Handles caching and retrieval of critical data for offline functionality
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  version: string;
}

interface DailyPrompt {
  type: string;
  text: string;
  author: string;
  id: string;
}

interface DailyContent {
  date: string;
  primary: DailyPrompt;
  secondary: DailyPrompt[];
}

export class OfflineDataManager {
  private static instance: OfflineDataManager;
  private readonly CACHE_VERSION = '1.0.0';
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  private readonly CACHE_KEYS = {
    milestones: 'solara_milestones_cache',
    dailyPrompts: 'solara_daily_prompts_cache',
    surpriseActivities: 'solara_surprise_activities_cache',
    userPreferences: 'solara_user_preferences',
    numberUtils: 'solara_number_utils_cache'
  };

  static getInstance(): OfflineDataManager {
    if (!OfflineDataManager.instance) {
      OfflineDataManager.instance = new OfflineDataManager();
    }
    return OfflineDataManager.instance;
  }

  // ===== MILESTONE DATA CACHING =====

  /**
   * Cache milestone calculation data for offline use
   */
  async cacheMilestoneData(): Promise<void> {
    try {
      // Import milestone data (this should work offline as it's in the bundle)
      const milestonesModule = await import('./milestones');
      const numberUtilsModule = await import('./numberUtils');

      const milestoneCache = {
        milestones: milestonesModule.MILESTONES,
        // Cache the function logic as data for offline calculation
        calculationMethods: {
          palindromeCheck: 'isPalindrome',
          interestingNumberCheck: 'isInterestingNumber'
        }
      };

      this.setCache(this.CACHE_KEYS.milestones, milestoneCache);
      console.log('📊 Milestone data cached for offline use');
    } catch (error) {
      console.error('❌ Failed to cache milestone data:', error);
    }
  }

  /**
   * Get cached milestone data for offline calculations
   */
  getCachedMilestones(): any | null {
    return this.getCache(this.CACHE_KEYS.milestones);
  }

  // ===== DAILY PROMPTS CACHING =====

  /**
   * Cache daily prompts for offline journaling
   */
  async cacheDailyPrompts(): Promise<void> {
    try {
      // Try to fetch fresh prompts when online
      const response = await fetch('/api/prompts/today');
      if (response.ok) {
        const data = await response.json();
        this.setCache(this.CACHE_KEYS.dailyPrompts, data);
        console.log('📝 Daily prompts cached for offline use');
      }
    } catch (error) {
      console.warn('⚠️ Could not fetch fresh prompts, using cached version');
    }
  }

  /**
   * Get cached daily prompts for offline use
   */
  getCachedDailyPrompts(): DailyContent | null {
    const cached = this.getCache(this.CACHE_KEYS.dailyPrompts);
    if (cached) {
      return (cached as any).content || cached;
    }
    
    // Fallback prompts for offline use
    return {
      date: new Date().toISOString().split('T')[0],
      primary: {
        type: 'reflection',
        text: 'What cosmic insights have you gained during your current sol cycle?',
        author: 'Solara Wisdom',
        id: 'offline-fallback-1'
      },
      secondary: [
        {
          type: 'gratitude',
          text: 'What three things in your solar system are you grateful for today?',
          author: 'Cosmic Gratitude',
          id: 'offline-fallback-2'
        },
        {
          type: 'intention',
          text: 'How will you honor your cosmic journey in the remaining rotations of this cycle?',
          author: 'Solar Intention',
          id: 'offline-fallback-3'
        }
      ]
    };
  }

  // ===== SURPRISE ME ACTIVITIES CACHING =====

  /**
   * Cache surprise me activities for offline cosmic guidance
   */
  async cacheSurpriseActivities(): Promise<void> {
    try {
      const { SurpriseMeFramework } = await import('./surpriseMe');
      const framework = SurpriseMeFramework.getInstance();
      
      // Cache all archetype activities
      const activitiesCache = {
        archetypes: ['Sol Traveler', 'Sol Sage', 'Sol Innovator', 'Sol Artist', 'Sol Builder'],
        activities: {
          'Sol Traveler': framework.getArchetypeActivities('Sol Traveler'),
          'Sol Sage': framework.getArchetypeActivities('Sol Sage'), 
          'Sol Innovator': framework.getArchetypeActivities('Sol Innovator'),
          'Sol Artist': framework.getArchetypeActivities('Sol Artist'),
          'Sol Builder': framework.getArchetypeActivities('Sol Builder')
        }
      };

      this.setCache(this.CACHE_KEYS.surpriseActivities, activitiesCache);
      console.log('🎯 Surprise me activities cached for offline use');
    } catch (error) {
      console.error('❌ Failed to cache surprise activities:', error);
    }
  }

  /**
   * Get cached surprise activities for offline use
   */
  getCachedSurpriseActivities(): any | null {
    return this.getCache(this.CACHE_KEYS.surpriseActivities);
  }

  // ===== USER PREFERENCES CONSOLIDATION =====

  /**
   * Consolidate user preferences from various localStorage keys
   */
  consolidateUserPreferences(): void {
    try {
      const preferences = {
        // Collect from various existing keys
        sunCycleBookmark: localStorage.getItem('sunCycleBookmark'),
        surpriseMeExplanationSeen: localStorage.getItem('surpriseMeExplanationSeen'),
        solarEarnings: localStorage.getItem('solarEarnings'),
        sunCycleAnonId: localStorage.getItem('sunCycleAnonId'),
        latestSolageShare: localStorage.getItem('latest_solage_share'),
        
        // App preferences
        notificationsEnabled: this.getNotificationPreference(),
        preferredArchetype: this.getPreferredArchetype(),
        
        // Timestamps
        lastConsolidation: Date.now()
      };

      this.setCache(this.CACHE_KEYS.userPreferences, preferences);
      console.log('⚙️ User preferences consolidated for offline use');
    } catch (error) {
      console.error('❌ Failed to consolidate user preferences:', error);
    }
  }

  // ===== HELPER METHODS =====

  /**
   * Set data in cache with timestamp and version
   */
  private setCache<T>(key: string, data: T): void {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      version: this.CACHE_VERSION
    };

    try {
      localStorage.setItem(key, JSON.stringify(cacheItem));
    } catch (error) {
      console.error(`Failed to cache data for key ${key}:`, error);
    }
  }

  /**
   * Get data from cache, checking freshness and version
   */
  private getCache<T>(key: string): T | null {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const cacheItem: CacheItem<T> = JSON.parse(cached);
      
      // Check if cache is still fresh
      const isExpired = Date.now() - cacheItem.timestamp > this.CACHE_DURATION;
      if (isExpired) {
        console.log(`Cache expired for ${key}, removing...`);
        localStorage.removeItem(key);
        return null;
      }

      // Check version compatibility
      if (cacheItem.version !== this.CACHE_VERSION) {
        console.log(`Cache version mismatch for ${key}, removing...`);
        localStorage.removeItem(key);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.error(`Failed to retrieve cache for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Initialize all offline caches
   */
  async initializeOfflineCache(): Promise<void> {
    console.log('🌙 Initializing Solara offline cache...');
    
    await Promise.allSettled([
      this.cacheMilestoneData(),
      this.cacheDailyPrompts(),
      this.cacheSurpriseActivities()
    ]);

    this.consolidateUserPreferences();
    console.log('✅ Offline cache initialization complete');
  }

  /**
   * Check if we're online and update caches
   */
  async syncWhenOnline(): Promise<void> {
    if (navigator.onLine) {
      console.log('🌐 Online detected, syncing caches...');
      await this.initializeOfflineCache();
    }
  }

  /**
   * Get cache status for debugging
   */
  getCacheStatus(): Record<string, boolean> {
    return {
      milestones: !!this.getCache(this.CACHE_KEYS.milestones),
      dailyPrompts: !!this.getCache(this.CACHE_KEYS.dailyPrompts),
      surpriseActivities: !!this.getCache(this.CACHE_KEYS.surpriseActivities),
      userPreferences: !!this.getCache(this.CACHE_KEYS.userPreferences)
    };
  }

  /**
   * Clear all offline caches (for debugging/reset)
   */
  clearAllCaches(): void {
    Object.values(this.CACHE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    console.log('🗑️ All offline caches cleared');
  }

  // ===== PRIVATE HELPER METHODS =====

  private getNotificationPreference(): boolean {
    return Notification.permission === 'granted';
  }

  private getPreferredArchetype(): string | null {
    // Try to extract from existing data
    const bookmark = localStorage.getItem('sunCycleBookmark');
    if (bookmark) {
      try {
        const data = JSON.parse(bookmark);
        return data.archetype || null;
      } catch {
        return null;
      }
    }
    return null;
  }
}