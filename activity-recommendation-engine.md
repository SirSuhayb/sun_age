# Activity Recommendation Engine Implementation

## Overview
Build an intelligent system that matches users with real-world activities based on their astrological chart, current transits, seasonal cycles, and local availability. This engine will drive engagement by encouraging users to step outside and experience their cosmic insights in the physical world.

## Core Architecture

### 1. Activity Data Structure

```typescript
// src/types/activities.ts
export interface Activity {
  id: string;
  name: string;
  description: string;
  category: ActivityCategory;
  subcategory: string;
  
  // Astrological alignment
  primary_element: 'fire' | 'earth' | 'air' | 'water';
  secondary_elements?: Element[];
  aligned_signs: ZodiacSign[];
  planetary_rulers: Planet[];
  optimal_transits: Transit[];
  lunar_phases: LunarPhase[];
  
  // Practical details
  duration: {
    min: number; // minutes
    max: number;
    typical: number;
  };
  
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  physical_intensity: 1 | 2 | 3 | 4 | 5;
  social_aspect: 'solo' | 'partner' | 'small_group' | 'large_group' | 'community';
  
  // Location requirements
  location_type: 'indoor' | 'outdoor' | 'both';
  specific_locations?: LocationRequirement[];
  weather_dependencies: WeatherRequirement[];
  seasonal_availability: Season[];
  
  // Cost and accessibility
  cost_range: CostRange;
  accessibility_features: AccessibilityFeature[];
  age_suitability: AgeRange;
  
  // Equipment and preparation
  required_equipment: Equipment[];
  optional_equipment: Equipment[];
  preparation_time: number; // minutes
  advance_booking_required: boolean;
  
  // Outcomes and benefits
  primary_benefits: Benefit[];
  astrological_insights: string[];
  skill_development: Skill[];
  
  // Metadata
  popularity_score: number;
  user_ratings: Rating[];
  tags: string[];
  created_at: Date;
  updated_at: Date;
}

export interface ActivityCategory {
  fire_activities: {
    adventure_sports: Activity[];
    competitive_games: Activity[];
    leadership_experiences: Activity[];
    creative_expression: Activity[];
    motivational_events: Activity[];
  };
  
  earth_activities: {
    nature_connection: Activity[];
    craft_making: Activity[];
    culinary_arts: Activity[];
    building_projects: Activity[];
    financial_workshops: Activity[];
  };
  
  air_activities: {
    social_networking: Activity[];
    learning_experiences: Activity[];
    communication_arts: Activity[];
    technology_exploration: Activity[];
    intellectual_discussions: Activity[];
  };
  
  water_activities: {
    mindfulness_practices: Activity[];
    artistic_creation: Activity[];
    emotional_healing: Activity[];
    aquatic_activities: Activity[];
    service_projects: Activity[];
  };
}
```

### 2. Core Recommendation Engine

```typescript
// src/lib/activityRecommendation.ts
import { astrologyService } from './astrology';
import { locationService } from './location';
import { weatherService } from './weather';

export class ActivityRecommendationEngine {
  private activities: Activity[] = [];
  private userPreferences: Map<string, UserPreferences> = new Map();
  
  constructor() {
    this.loadActivities();
  }

  public async generateRecommendations(
    user: User,
    timeframe: 'today' | 'weekend' | 'week' | 'month' = 'week',
    filters?: RecommendationFilters
  ): Promise<ActivityRecommendation[]> {
    
    // Step 1: Analyze user's astrological profile
    const astroProfile = await this.analyzeAstrologicalProfile(user);
    
    // Step 2: Consider current cosmic conditions
    const cosmicConditions = await this.getCurrentCosmicConditions(user.chart);
    
    // Step 3: Factor in seasonal and temporal context
    const temporalContext = this.getTemporalContext(timeframe);
    
    // Step 4: Check local availability and weather
    const localContext = await this.getLocalContext(user.location, timeframe);
    
    // Step 5: Apply user preferences and history
    const userContext = this.getUserContext(user);
    
    // Step 6: Generate scored recommendations
    const candidates = this.findCandidateActivities(filters);
    const scoredRecommendations = await this.scoreRecommendations(
      candidates,
      astroProfile,
      cosmicConditions,
      temporalContext,
      localContext,
      userContext
    );
    
    // Step 7: Diversify and optimize final selection
    return this.optimizeRecommendations(scoredRecommendations, timeframe);
  }

  private async analyzeAstrologicalProfile(user: User): Promise<AstrologicalProfile> {
    const chart = user.chart;
    
    return {
      dominant_element: this.calculateDominantElement(chart),
      active_houses: this.getActiveHouses(chart),
      planetary_emphases: this.getPlanetaryEmphases(chart),
      natural_inclinations: this.calculateNaturalInclinations(chart),
      energy_patterns: this.analyzeEnergyPatterns(chart),
      social_preferences: this.deriveSocialPreferences(chart),
      physical_preferences: this.derivePhysicalPreferences(chart)
    };
  }

  private async getCurrentCosmicConditions(chart: NatalChart): Promise<CosmicConditions> {
    const currentDate = new Date();
    
    const activeTransits = astrologyService.calculateCurrentTransits(chart, currentDate);
    const lunarPhase = astrologyService.getCurrentLunarPhase(currentDate);
    const seasonalEnergy = this.calculateSeasonalEnergy(currentDate);
    const planetaryWeather = astrologyService.getPlanetaryWeather(currentDate);
    
    return {
      active_transits: activeTransits,
      lunar_phase: lunarPhase,
      seasonal_energy: seasonalEnergy,
      planetary_weather: planetaryWeather,
      energy_level: this.calculateCosmicEnergyLevel(activeTransits, lunarPhase),
      recommended_focus: this.deriveRecommendedFocus(activeTransits, lunarPhase)
    };
  }

  private async scoreRecommendations(
    candidates: Activity[],
    astroProfile: AstrologicalProfile,
    cosmicConditions: CosmicConditions,
    temporalContext: TemporalContext,
    localContext: LocalContext,
    userContext: UserContext
  ): Promise<ScoredRecommendation[]> {
    
    const scoredRecommendations: ScoredRecommendation[] = [];
    
    for (const activity of candidates) {
      const score = await this.calculateActivityScore(
        activity,
        astroProfile,
        cosmicConditions,
        temporalContext,
        localContext,
        userContext
      );
      
      if (score.total_score > 0.3) { // Minimum threshold
        scoredRecommendations.push({
          activity,
          score,
          reasoning: this.generateRecommendationReasoning(activity, score),
          optimal_timing: this.calculateOptimalTiming(activity, cosmicConditions),
          confidence_level: this.calculateConfidenceLevel(score)
        });
      }
    }
    
    return scoredRecommendations.sort((a, b) => b.score.total_score - a.score.total_score);
  }

  private async calculateActivityScore(
    activity: Activity,
    astroProfile: AstrologicalProfile,
    cosmicConditions: CosmicConditions,
    temporalContext: TemporalContext,
    localContext: LocalContext,
    userContext: UserContext
  ): Promise<ActivityScore> {
    
    // Astrological alignment scoring (40% weight)
    const astrologicalScore = this.scoreAstrologicalAlignment(activity, astroProfile, cosmicConditions);
    
    // Practical feasibility scoring (25% weight)
    const feasibilityScore = this.scoreFeasibility(activity, temporalContext, localContext);
    
    // Personal preference scoring (20% weight)
    const preferenceScore = this.scorePersonalPreferences(activity, userContext);
    
    // Novelty and discovery scoring (10% weight)
    const noveltyScore = this.scoreNovelty(activity, userContext);
    
    // Social alignment scoring (5% weight)
    const socialScore = this.scoreSocialAlignment(activity, astroProfile, userContext);
    
    const weightedScore = 
      (astrologicalScore * 0.40) +
      (feasibilityScore * 0.25) +
      (preferenceScore * 0.20) +
      (noveltyScore * 0.10) +
      (socialScore * 0.05);
    
    return {
      total_score: weightedScore,
      astrological_score: astrologicalScore,
      feasibility_score: feasibilityScore,
      preference_score: preferenceScore,
      novelty_score: noveltyScore,
      social_score: socialScore,
      breakdown: this.generateScoreBreakdown(activity, astroProfile, cosmicConditions)
    };
  }

  private scoreAstrologicalAlignment(
    activity: Activity,
    profile: AstrologicalProfile,
    conditions: CosmicConditions
  ): number {
    let score = 0;
    
    // Element alignment (most important factor)
    const elementAlignment = this.calculateElementAlignment(
      activity.primary_element,
      profile.dominant_element,
      conditions.seasonal_energy
    );
    score += elementAlignment * 0.4;
    
    // Sign alignment
    const signAlignment = this.calculateSignAlignment(activity.aligned_signs, profile);
    score += signAlignment * 0.3;
    
    // Planetary alignment
    const planetaryAlignment = this.calculatePlanetaryAlignment(
      activity.planetary_rulers,
      profile.planetary_emphases,
      conditions.active_transits
    );
    score += planetaryAlignment * 0.2;
    
    // Lunar phase alignment
    const lunarAlignment = this.calculateLunarAlignment(
      activity.lunar_phases,
      conditions.lunar_phase
    );
    score += lunarAlignment * 0.1;
    
    return Math.min(score, 1.0);
  }

  private generateRecommendationReasoning(
    activity: Activity,
    score: ActivityScore
  ): RecommendationReasoning {
    const reasons = [];
    
    if (score.astrological_score > 0.7) {
      reasons.push({
        type: 'astrological',
        message: `This ${activity.primary_element} element activity aligns perfectly with your current cosmic energy`,
        confidence: 'high'
      });
    }
    
    if (score.feasibility_score > 0.8) {
      reasons.push({
        type: 'practical',
        message: 'Great weather and local availability make this perfect timing',
        confidence: 'high'
      });
    }
    
    if (score.novelty_score > 0.6) {
      reasons.push({
        type: 'growth',
        message: 'This new experience will expand your horizons in meaningful ways',
        confidence: 'medium'
      });
    }
    
    return {
      primary_reason: reasons[0]?.message || 'A well-rounded match for your profile',
      supporting_reasons: reasons.slice(1).map(r => r.message),
      astrological_insight: this.generateAstrologicalInsight(activity, score),
      expected_benefits: this.predictActivityBenefits(activity, score)
    };
  }
}
```

### 3. Location Integration System

```typescript
// src/lib/locationService.ts
export class LocationService {
  private eventAPIs: EventAPICollection;
  private venueAPIs: VenueAPICollection;
  private weatherAPI: WeatherAPI;
  
  constructor() {
    this.initializeAPIs();
  }

  public async findLocalActivities(
    location: Location,
    activityTypes: string[],
    timeframe: DateRange
  ): Promise<LocalActivity[]> {
    
    const searchPromises = [
      this.searchEventbrite(location, activityTypes, timeframe),
      this.searchMeetup(location, activityTypes, timeframe),
      this.searchFacebookEvents(location, activityTypes, timeframe),
      this.searchLocalVenues(location, activityTypes),
      this.searchParksAndRecreation(location, activityTypes),
      this.searchAstronomicalEvents(location, timeframe)
    ];
    
    const results = await Promise.allSettled(searchPromises);
    const activities = results
      .filter(result => result.status === 'fulfilled')
      .flatMap(result => result.value);
    
    return this.deduplicateAndEnrich(activities);
  }

  private async searchEventbrite(
    location: Location,
    types: string[],
    timeframe: DateRange
  ): Promise<LocalActivity[]> {
    const eventbriteAPI = this.eventAPIs.eventbrite;
    
    const searchParams = {
      'location.latitude': location.latitude,
      'location.longitude': location.longitude,
      'location.within': '25mi',
      'start_date.range_start': timeframe.start.toISOString(),
      'start_date.range_end': timeframe.end.toISOString(),
      'categories': this.mapToEventbriteCategories(types),
      'sort_by': 'relevance'
    };
    
    const events = await eventbriteAPI.searchEvents(searchParams);
    
    return events.map(event => this.convertEventbriteToLocalActivity(event));
  }

  private async searchMeetup(
    location: Location,
    types: string[],
    timeframe: DateRange
  ): Promise<LocalActivity[]> {
    const meetupAPI = this.eventAPIs.meetup;
    
    const groups = await meetupAPI.findGroups({
      lat: location.latitude,
      lon: location.longitude,
      radius: 25,
      category: this.mapToMeetupCategories(types)
    });
    
    const upcomingEvents = [];
    for (const group of groups) {
      const events = await meetupAPI.getGroupEvents(group.id, {
        start: timeframe.start,
        end: timeframe.end
      });
      upcomingEvents.push(...events);
    }
    
    return upcomingEvents.map(event => this.convertMeetupToLocalActivity(event));
  }

  private async searchParksAndRecreation(
    location: Location,
    types: string[]
  ): Promise<LocalActivity[]> {
    // Search for parks, trails, and public recreation facilities
    const parks = await this.findNearbyParks(location, 25); // 25 mile radius
    const trails = await this.findNearbyTrails(location, 25);
    const publicFacilities = await this.findPublicFacilities(location, types);
    
    const activities = [];
    
    // Convert parks to activities
    for (const park of parks) {
      activities.push(...this.generateParkActivities(park, types));
    }
    
    // Convert trails to activities
    for (const trail of trails) {
      activities.push(...this.generateTrailActivities(trail, types));
    }
    
    // Convert facilities to activities
    for (const facility of publicFacilities) {
      activities.push(...this.generateFacilityActivities(facility, types));
    }
    
    return activities;
  }

  private async searchAstronomicalEvents(
    location: Location,
    timeframe: DateRange
  ): Promise<LocalActivity[]> {
    const astronomyAPI = this.eventAPIs.astronomy;
    
    // Find celestial events visible from this location
    const celestialEvents = await astronomyAPI.getCelestialEvents({
      latitude: location.latitude,
      longitude: location.longitude,
      start_date: timeframe.start,
      end_date: timeframe.end,
      event_types: ['meteor_shower', 'planet_conjunction', 'lunar_eclipse', 'solar_eclipse', 'planet_visibility']
    });
    
    const observatories = await this.findNearbyObservatories(location, 50);
    const darkSkyLocations = await this.findDarkSkyLocations(location, 75);
    
    const activities = [];
    
    for (const event of celestialEvents) {
      // Create stargazing activities for each celestial event
      activities.push({
        id: `astro_${event.id}`,
        name: `Stargazing: ${event.name}`,
        description: `Observe ${event.description} from a dark sky location`,
        type: 'astronomical_observation',
        date: event.date,
        locations: [location, ...darkSkyLocations.slice(0, 3)],
        observatories: observatories,
        equipment_recommendations: this.getAstronomyEquipment(event.type),
        astrological_significance: this.getAstrologicalSignificance(event),
        visibility_conditions: event.visibility
      });
    }
    
    return activities.map(a => this.convertAstronomyToLocalActivity(a));
  }

  public async getWeatherSuitability(
    activity: Activity,
    location: Location,
    date: Date
  ): Promise<WeatherSuitability> {
    const forecast = await this.weatherAPI.getForecast(location, date);
    
    const suitability = {
      overall_score: 0,
      temperature_suitability: 0,
      precipitation_suitability: 0,
      wind_suitability: 0,
      visibility_suitability: 0,
      recommendations: [] as string[],
      alternatives: [] as Activity[]
    };
    
    // Check temperature requirements
    if (activity.weather_dependencies?.temperature) {
      const tempReq = activity.weather_dependencies.temperature;
      if (forecast.temperature >= tempReq.min && forecast.temperature <= tempReq.max) {
        suitability.temperature_suitability = 1.0;
      } else {
        suitability.temperature_suitability = this.calculateTemperatureScore(
          forecast.temperature,
          tempReq
        );
      }
    }
    
    // Check precipitation requirements
    if (activity.weather_dependencies?.precipitation) {
      const precipReq = activity.weather_dependencies.precipitation;
      suitability.precipitation_suitability = this.calculatePrecipitationScore(
        forecast.precipitation_probability,
        precipReq
      );
    }
    
    // Calculate overall score
    suitability.overall_score = (
      suitability.temperature_suitability * 0.4 +
      suitability.precipitation_suitability * 0.4 +
      suitability.wind_suitability * 0.1 +
      suitability.visibility_suitability * 0.1
    );
    
    // Generate recommendations
    if (suitability.overall_score < 0.7) {
      suitability.recommendations = this.generateWeatherRecommendations(
        activity,
        forecast,
        suitability
      );
      
      suitability.alternatives = await this.findWeatherAlternatives(
        activity,
        location,
        forecast
      );
    }
    
    return suitability;
  }
}
```

### 4. Seasonal Activity Cycles

```typescript
// src/lib/seasonalActivities.ts
export class SeasonalActivityManager {
  private seasonalCycles: Map<Season, SeasonalCycle> = new Map();
  
  constructor() {
    this.initializeSeasonalCycles();
  }

  private initializeSeasonalCycles(): void {
    // Spring Equinox Cycle (March 20 - June 20)
    this.seasonalCycles.set('spring', {
      name: 'Spring Awakening',
      element_emphasis: 'fire', // New beginnings, growth energy
      themes: [
        'renewal_and_rebirth',
        'goal_setting',
        'creative_expression',
        'community_building',
        'outdoor_exploration'
      ],
      
      early_spring: {
        focus: 'Planning and Preparation',
        activities: [
          {
            name: 'Garden Planning Workshop',
            element: 'earth',
            description: 'Plan your cosmic garden aligned with lunar cycles',
            optimal_timing: 'new_moon',
            duration: 120,
            products: ['garden_planning_books', 'seed_starting_supplies', 'moon_calendar']
          },
          {
            name: 'Vision Board Creation',
            element: 'air',
            description: 'Manifest your solar year goals through visual creation',
            optimal_timing: 'waxing_moon',
            duration: 90,
            products: ['vision_board_supplies', 'goal_setting_journals', 'manifestation_books']
          },
          {
            name: 'Spring Cleaning Ritual',
            element: 'fire',
            description: 'Clear energetic space for new growth',
            optimal_timing: 'full_moon',
            duration: 180,
            products: ['sage_bundles', 'organization_tools', 'cleaning_supplies']
          }
        ]
      },
      
      mid_spring: {
        focus: 'Active Implementation',
        activities: [
          {
            name: 'Outdoor Hiking Groups',
            element: 'fire',
            description: 'Explore nature trails with astrologically compatible groups',
            optimal_timing: 'any',
            duration: 240,
            products: ['hiking_gear', 'trail_maps', 'outdoor_clothing']
          },
          {
            name: 'Community Garden Participation',
            element: 'earth',
            description: 'Connect with earth energy through collaborative growing',
            optimal_timing: 'waxing_moon',
            duration: 120,
            products: ['gardening_tools', 'organic_seeds', 'plant_care_books']
          }
        ]
      },
      
      late_spring: {
        focus: 'Celebration and Sharing',
        activities: [
          {
            name: 'Outdoor Art Festivals',
            element: 'air',
            description: 'Express creativity in community settings',
            optimal_timing: 'full_moon',
            duration: 360,
            products: ['art_supplies', 'festival_gear', 'creative_books']
          }
        ]
      }
    });

    // Summer Solstice Cycle (June 21 - September 22)
    this.seasonalCycles.set('summer', {
      name: 'Solar Maximum',
      element_emphasis: 'fire',
      themes: [
        'peak_energy',
        'adventure',
        'social_connection',
        'creative_expression',
        'celebration'
      ],
      
      early_summer: {
        focus: 'High Energy Adventures',
        activities: [
          {
            name: 'Sunrise Yoga Sessions',
            element: 'fire',
            description: 'Greet the sun at its most powerful time',
            optimal_timing: 'sunrise',
            duration: 75,
            products: ['yoga_mats', 'sunrise_alarm_clocks', 'meditation_books']
          },
          {
            name: 'Water Sports Adventures',
            element: 'water',
            description: 'Balance fire energy with cooling water activities',
            optimal_timing: 'afternoon',
            duration: 180,
            products: ['water_sports_gear', 'sun_protection', 'hydration_supplies']
          }
        ]
      },
      
      mid_summer: {
        focus: 'Community and Celebration',
        activities: [
          {
            name: 'Outdoor Music Festivals',
            element: 'air',
            description: 'Connect through sound and shared experiences',
            optimal_timing: 'any',
            duration: 480,
            products: ['festival_gear', 'portable_chairs', 'sun_protection']
          },
          {
            name: 'Beach Volleyball Leagues',
            element: 'fire',
            description: 'Channel competitive fire energy in team sports',
            optimal_timing: 'evening',
            duration: 120,
            products: ['volleyball_equipment', 'beach_gear', 'sports_clothing']
          }
        ]
      }
    });

    // Fall Equinox Cycle (September 23 - December 20)
    this.seasonalCycles.set('fall', {
      name: 'Harvest Wisdom',
      element_emphasis: 'earth',
      themes: [
        'gratitude',
        'reflection',
        'skill_building',
        'preparation',
        'knowledge_gathering'
      ],
      
      early_fall: {
        focus: 'Harvest and Gratitude',
        activities: [
          {
            name: 'Apple Picking Expeditions',
            element: 'earth',
            description: 'Connect with harvest energy and earth abundance',
            optimal_timing: 'morning',
            duration: 180,
            products: ['harvest_baskets', 'preserving_supplies', 'recipe_books']
          },
          {
            name: 'Gratitude Journaling Workshops',
            element: 'water',
            description: 'Reflect on growth and lessons from the solar year',
            optimal_timing: 'full_moon',
            duration: 90,
            products: ['gratitude_journals', 'writing_tools', 'reflection_books']
          }
        ]
      },
      
      mid_fall: {
        focus: 'Skill Development',
        activities: [
          {
            name: 'Craft-Making Workshops',
            element: 'earth',
            description: 'Learn practical skills for winter preparation',
            optimal_timing: 'waning_moon',
            duration: 150,
            products: ['craft_supplies', 'instructional_books', 'storage_solutions']
          },
          {
            name: 'Financial Planning Sessions',
            element: 'earth',
            description: 'Prepare resources for the coming cycle',
            optimal_timing: 'new_moon',
            duration: 120,
            products: ['financial_planning_books', 'budgeting_tools', 'investment_guides']
          }
        ]
      }
    });

    // Winter Solstice Cycle (December 21 - March 19)
    this.seasonalCycles.set('winter', {
      name: 'Inner Wisdom',
      element_emphasis: 'water',
      themes: [
        'introspection',
        'rest_and_restoration',
        'inner_work',
        'planning',
        'wisdom_gathering'
      ],
      
      early_winter: {
        focus: 'Turning Inward',
        activities: [
          {
            name: 'Meditation Retreats',
            element: 'water',
            description: 'Deepen inner practice during the darkest time',
            optimal_timing: 'new_moon',
            duration: 360,
            products: ['meditation_cushions', 'retreat_supplies', 'mindfulness_books']
          },
          {
            name: 'Winter Solstice Ceremonies',
            element: 'fire',
            description: 'Celebrate the return of light with community',
            optimal_timing: 'winter_solstice',
            duration: 120,
            products: ['candles', 'ceremony_supplies', 'ritual_books']
          }
        ]
      },
      
      mid_winter: {
        focus: 'Knowledge and Planning',
        activities: [
          {
            name: 'Book Clubs and Study Groups',
            element: 'air',
            description: 'Expand knowledge during reflective time',
            optimal_timing: 'evening',
            duration: 120,
            products: ['books', 'reading_accessories', 'study_supplies']
          },
          {
            name: 'Vision Planning Workshops',
            element: 'air',
            description: 'Plan for the coming solar year',
            optimal_timing: 'waxing_moon',
            duration: 150,
            products: ['planning_supplies', 'vision_books', 'goal_setting_tools']
          }
        ]
      }
    });
  }

  public getSeasonalRecommendations(
    currentDate: Date,
    userChart: NatalChart,
    location: Location
  ): SeasonalRecommendations {
    const currentSeason = this.getCurrentSeason(currentDate);
    const seasonalCycle = this.seasonalCycles.get(currentSeason)!;
    const subSeason = this.getCurrentSubSeason(currentDate, currentSeason);
    
    const recommendations = {
      season: currentSeason,
      theme: seasonalCycle.name,
      element_focus: seasonalCycle.element_emphasis,
      current_phase: subSeason,
      activities: this.filterActivitiesByChart(
        seasonalCycle[subSeason].activities,
        userChart
      ),
      upcoming_transitions: this.getUpcomingTransitions(currentDate),
      seasonal_products: this.getSeasonalProducts(currentSeason, subSeason)
    };
    
    return recommendations;
  }

  private filterActivitiesByChart(
    activities: SeasonalActivity[],
    chart: NatalChart
  ): ScoredSeasonalActivity[] {
    return activities.map(activity => {
      const elementAlignment = this.calculateElementAlignment(
        activity.element,
        this.getDominantElement(chart)
      );
      
      const lunarAlignment = this.calculateLunarAlignment(
        activity.optimal_timing,
        this.getCurrentLunarPhase()
      );
      
      const overallScore = (elementAlignment * 0.6) + (lunarAlignment * 0.4);
      
      return {
        ...activity,
        alignment_score: overallScore,
        personalized_reasoning: this.generateSeasonalReasoning(activity, chart),
        optimal_dates: this.calculateOptimalDates(activity, chart)
      };
    }).sort((a, b) => b.alignment_score - a.alignment_score);
  }
}
```

### 5. Real-Time Activity Integration

```typescript
// src/components/ActivityRecommendations.tsx
import React, { useState, useEffect } from 'react';
import { ActivityRecommendationEngine } from '~/lib/activityRecommendation';
import { LocationService } from '~/lib/locationService';

interface ActivityRecommendationsProps {
  user: User;
  timeframe: 'today' | 'weekend' | 'week' | 'month';
}

export function ActivityRecommendations({ user, timeframe }: ActivityRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<ActivityRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<RecommendationFilter>('all');
  const [location, setLocation] = useState<Location | null>(null);

  const activityEngine = new ActivityRecommendationEngine();
  const locationService = new LocationService();

  useEffect(() => {
    loadRecommendations();
  }, [user, timeframe, filter, location]);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      // Get user's location (with permission)
      const userLocation = await getUserLocation();
      setLocation(userLocation);

      // Generate recommendations
      const recs = await activityEngine.generateRecommendations(
        user,
        timeframe,
        { filter, location: userLocation }
      );

      setRecommendations(recs);
    } catch (error) {
      console.error('Error loading activity recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivityClick = async (recommendation: ActivityRecommendation) => {
    // Track engagement
    await trackActivityInteraction(user, recommendation, 'clicked');
    
    // Show detailed view
    setSelectedActivity(recommendation);
  };

  const handleBookActivity = async (recommendation: ActivityRecommendation) => {
    // Track booking attempt
    await trackActivityInteraction(user, recommendation, 'booking_attempted');
    
    // Open booking flow
    if (recommendation.activity.booking_url) {
      window.open(recommendation.activity.booking_url, '_blank');
    } else {
      // Show local booking information
      showBookingInfo(recommendation);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-2xl mb-2">🌟</div>
          <div className="font-mono text-sm text-gray-600">
            Finding cosmic activities aligned with your energy...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <div className="flex flex-wrap gap-2 mb-4">
        {['all', 'outdoor', 'indoor', 'social', 'solo', 'creative', 'physical'].map((filterType) => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType as RecommendationFilter)}
            className={`px-3 py-1 text-xs font-mono uppercase border ${
              filter === filterType 
                ? 'bg-[#d4af37] text-black border-black' 
                : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
            }`}
          >
            {filterType}
          </button>
        ))}
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <ActivityRecommendationCard
            key={rec.activity.id}
            recommendation={rec}
            index={index}
            onActivityClick={handleActivityClick}
            onBookActivity={handleBookActivity}
            user={user}
          />
        ))}
      </div>

      {/* Load More Button */}
      {recommendations.length > 0 && (
        <div className="text-center">
          <button
            onClick={() => loadMoreRecommendations()}
            className="px-6 py-2 bg-white border border-gray-300 text-gray-700 font-mono text-sm uppercase hover:border-gray-400"
          >
            Discover More Activities
          </button>
        </div>
      )}
    </div>
  );
}

function ActivityRecommendationCard({ 
  recommendation, 
  index, 
  onActivityClick, 
  onBookActivity,
  user 
}: {
  recommendation: ActivityRecommendation;
  index: number;
  onActivityClick: (rec: ActivityRecommendation) => void;
  onBookActivity: (rec: ActivityRecommendation) => void;
  user: User;
}) {
  const activity = recommendation.activity;
  const score = recommendation.score;

  return (
    <div className="border border-gray-300 p-4 bg-white hover:bg-gray-50 transition-colors">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg font-serif font-bold">{activity.name}</span>
            <ElementBadge element={activity.primary_element} />
            <ConfidenceBadge level={recommendation.confidence_level} />
          </div>
          <div className="text-sm font-mono text-gray-600 uppercase tracking-wide">
            {activity.category} • {activity.difficulty} • {activity.duration.typical}min
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-mono text-gray-500">
            #{index + 1} MATCH
          </div>
          <div className="text-xs font-mono text-[#d4af37]">
            {Math.round(score.total_score * 100)}% ALIGNED
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="text-sm text-gray-700 mb-3">
        {activity.description}
      </div>

      {/* Astrological Reasoning */}
      <div className="bg-[#fffcf2] border border-[#d4af37] p-3 mb-3">
        <div className="text-xs font-mono text-[#b8860b] uppercase tracking-wider mb-1">
          Cosmic Alignment
        </div>
        <div className="text-sm text-gray-700">
          {recommendation.reasoning.primary_reason}
        </div>
      </div>

      {/* Practical Details */}
      <div className="grid grid-cols-2 gap-4 text-xs font-mono text-gray-600 mb-3">
        <div>
          <span className="font-bold">Duration:</span> {activity.duration.typical}min
        </div>
        <div>
          <span className="font-bold">Social:</span> {activity.social_aspect}
        </div>
        <div>
          <span className="font-bold">Cost:</span> {activity.cost_range}
        </div>
        <div>
          <span className="font-bold">Location:</span> {activity.location_type}
        </div>
      </div>

      {/* Optimal Timing */}
      {recommendation.optimal_timing && (
        <div className="text-xs font-mono text-gray-600 mb-3">
          <span className="font-bold">Optimal Timing:</span>{' '}
          {recommendation.optimal_timing.map(t => t.description).join(', ')}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => onActivityClick(recommendation)}
          className="flex-1 py-2 bg-[#d4af37] text-black font-mono text-sm uppercase border border-black hover:bg-[#e6c75a] transition-colors"
        >
          Learn More
        </button>
        
        {activity.booking_url && (
          <button
            onClick={() => onBookActivity(recommendation)}
            className="flex-1 py-2 bg-white text-black font-mono text-sm uppercase border border-black hover:bg-gray-50 transition-colors"
          >
            Book Now
          </button>
        )}
        
        <ActivityWishlistButton 
          activity={activity} 
          user={user}
          className="px-4 py-2 bg-white text-gray-600 font-mono text-sm border border-gray-300 hover:border-gray-400"
        />
      </div>

      {/* Related Products Preview */}
      {activity.related_products && activity.related_products.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">
            Recommended Gear
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {activity.related_products.slice(0, 3).map((product, idx) => (
              <ProductPreviewCard 
                key={idx} 
                product={product} 
                size="small"
                reason={`Perfect for ${activity.name.toLowerCase()}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

This activity recommendation engine creates a comprehensive system that:

1. **Matches activities to astrological profiles** using element, sign, and planetary alignments
2. **Integrates with real-world APIs** to find local events, venues, and opportunities
3. **Considers practical factors** like weather, location, and timing
4. **Provides seasonal cycles** that keep users engaged year-round
5. **Generates personalized reasoning** for each recommendation
6. **Includes product recommendations** for each activity
7. **Tracks engagement** to improve future recommendations

The system encourages users to step outside, experience their cosmic insights in the physical world, and creates natural opportunities for affiliate product recommendations that enhance their activities.