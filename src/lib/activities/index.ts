import type { DailyRoll } from '../surpriseMe';

// Function to dynamically load activities by archetype
export async function getArchetypeActivities(archetype: string): Promise<DailyRoll[]> {
  const archetypeToFile: Record<string, string> = {
    'Sol Innovator': 'sol-innovator',
    'Sol Traveler': 'sol-traveler',
    'Sol Sage': 'sol-sage',
    'Sol Artist': 'sol-artist',
    'Sol Builder': 'sol-builder',
    'Sol Nurturer': 'sol-nurturer',
    'Sol Alchemist': 'sol-alchemist'
  };

  const fileName = archetypeToFile[archetype];
  if (!fileName) {
    // Fallback to Sol Traveler if archetype not found
    const { activities } = await import('./sol-traveler');
    return activities;
  }

  try {
    const activityModule = await import(`./${fileName}`);
    return activityModule.activities;
  } catch (error) {
    console.error(`Failed to load activities for ${archetype}:`, error);
    // Fallback to Sol Traveler
    const { activities } = await import('./sol-traveler');
    return activities;
  }
}

// Cache for loaded activities to avoid re-importing
const activitiesCache: Record<string, DailyRoll[]> = {};

export async function getCachedArchetypeActivities(archetype: string): Promise<DailyRoll[]> {
  if (activitiesCache[archetype]) {
    return activitiesCache[archetype];
  }
  
  const activities = await getArchetypeActivities(archetype);
  activitiesCache[archetype] = activities;
  return activities;
}