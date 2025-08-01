import type { DailyRoll } from '../surpriseMe';

export const activities: DailyRoll[] = [
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
        type: 'prompt',
        label: 'Research destination',
        content: 'Research a destination that calls to your wandering soul'
      },
      {
        type: 'prompt',
        label: 'Plan your journey',
        content: 'Create a basic itinerary for your adventure'
      }
    ],
    freeItems: [
      'Travel planning apps and websites'
    ],
    nicheItems: []
  }
];