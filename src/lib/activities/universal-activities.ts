import type { DailyRoll } from '../surpriseMe';

export const universalActivities: DailyRoll[] = [
  {
    id: 'universal-1',
    type: 'activity',
    title: 'Solar Salutation Sequence',
    description: 'Perform 5 sun salutations facing east during any time of day. Let your body mirror the sun\'s journey across the sky.',
    quote: 'I align my body with the cosmic rhythm of light.',
    journalPrompt: 'How did moving with solar energy change your body\'s relationship to light?',
    archetype: 'Universal',
    rarity: 'common',
    icon: '☀️',
    color: 'bg-yellow-100 border-yellow-300',
    tags: ['movement', 'morning', 'solar', 'universal'],
    duration: '15 minutes',
    difficulty: 'easy',
    timeOfDay: 'anytime',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Find space facing east',
        content: 'Find space facing east (indoors by window works)'
      },
      {
        type: 'prompt',
        label: 'Perform 5 traditional sun salutations',
        content: 'Perform 5 traditional sun salutations'
      },
      {
        type: 'prompt',
        label: 'Focus on breathing with the movement',
        content: 'Focus on breathing with the movement'
      },
      {
        type: 'prompt',
        label: 'End with gratitude for solar energy',
        content: 'End with gratitude for solar energy'
      }
    ],
    freeItems: [
      'Floor space and basic stretching knowledge'
    ],
    nicheItems: [
      {
        type: 'product',
        label: 'Cork Yoga Blocks Set',
        content: 'Sustainable blocks that solar yoga practitioners use for earth connection',
        price: '$34',
        url: 'https://example.com/yoga-blocks',
        productImage: '/products/yoga-blocks.jpg'
      }
    ]
  },
  {
    id: 'universal-2',
    type: 'activity',
    title: 'Cosmic Gratitude Spiral',
    description: 'Write 9 gratitudes in spiral formation, starting with yourself and expanding outward to family, community, planet, universe.',
    quote: 'Gratitude expands like ripples in the cosmic pond.',
    journalPrompt: 'How did expanding gratitude change your sense of cosmic connection?',
    archetype: 'Universal',
    rarity: 'common',
    icon: '🌀',
    color: 'bg-blue-100 border-blue-300',
    tags: ['gratitude', 'writing', 'mindfulness', 'universal'],
    duration: '10 minutes',
    difficulty: 'easy',
    timeOfDay: 'anytime',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Start with gratitude for your body/mind',
        content: 'Start with gratitude for your body/mind'
      },
      {
        type: 'prompt',
        label: 'Expand to family and close relationships',
        content: 'Expand to family and close relationships'
      },
      {
        type: 'prompt',
        label: 'Include community and strangers',
        content: 'Include community and strangers'
      },
      {
        type: 'prompt',
        label: 'End with planet and cosmic forces',
        content: 'End with planet and cosmic forces'
      }
    ],
    freeItems: [
      'Paper and pen in spiral format'
    ],
    nicheItems: []
  },
  {
    id: 'universal-3',
    type: 'activity',
    title: 'Digital Sunset Ritual',
    description: 'Create a 15-minute phone-free ritual at sunset. Watch actual sunset and reflect on the day\'s digital consumption.',
    quote: 'I release digital energy as the earth releases solar light.',
    journalPrompt: 'What did you notice without digital distraction? How does your energy change with natural light cycles?',
    archetype: 'Universal',
    rarity: 'common',
    icon: '🌅',
    color: 'bg-orange-100 border-orange-300',
    tags: ['digital detox', 'sunset', 'mindfulness', 'universal'],
    duration: '15 minutes',
    difficulty: 'easy',
    timeOfDay: 'evening',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Put phone in another room 15 minutes before sunset',
        content: 'Put phone in another room 15 minutes before sunset'
      },
      {
        type: 'prompt',
        label: 'Go outside or to window facing west',
        content: 'Go outside or to window facing west'
      },
      {
        type: 'prompt',
        label: 'Watch actual sunset without documenting it',
        content: 'Watch actual sunset without documenting it'
      },
      {
        type: 'prompt',
        label: 'Reflect on day\'s relationship with technology',
        content: 'Reflect on day\'s relationship with technology'
      }
    ],
    freeItems: [
      'Access to sunset view (even through window)'
    ],
    nicheItems: []
  },
  {
    id: 'universal-4',
    type: 'activity',
    title: 'Stranger Appreciation Practice',
    description: 'Spend 10 minutes genuinely appreciating strangers you encounter. Send silent gratitude without them knowing.',
    quote: 'I see cosmic light reflected in unexpected faces.',
    journalPrompt: 'What did you discover about humanity through appreciation? How did giving secret gratitude change your energy?',
    archetype: 'Universal',
    rarity: 'common',
    icon: '👥',
    color: 'bg-green-100 border-green-300',
    tags: ['compassion', 'social', 'gratitude', 'universal'],
    duration: '10 minutes',
    difficulty: 'easy',
    timeOfDay: 'anytime',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Choose public space with foot traffic',
        content: 'Choose public space with foot traffic'
      },
      {
        type: 'prompt',
        label: 'Spend 10 minutes sending appreciation to strangers',
        content: 'Spend 10 minutes sending appreciation to strangers'
      },
      {
        type: 'prompt',
        label: 'Notice what you appreciate about each person',
        content: 'Notice what you appreciate about each person'
      },
      {
        type: 'prompt',
        label: 'End with gratitude for human diversity',
        content: 'End with gratitude for human diversity'
      }
    ],
    freeItems: [
      'Public space and open heart'
    ],
    nicheItems: []
  },
  {
    id: 'universal-5',
    type: 'activity',
    title: 'Elements Check-In',
    description: 'Spend 3 minutes each connecting with earth, water, fire, and air elements. Notice which element your body needs most today.',
    quote: 'I align with the four cosmic forces that shape all existence.',
    journalPrompt: 'Which element does your body crave most? How do the elements balance your energy?',
    archetype: 'Universal',
    rarity: 'common',
    icon: '🌍',
    color: 'bg-purple-100 border-purple-300',
    tags: ['elements', 'mindfulness', 'balance', 'universal'],
    duration: '12 minutes',
    difficulty: 'easy',
    timeOfDay: 'anytime',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Earth: Touch ground, feel gravity, notice stability',
        content: 'Earth: Touch ground, feel gravity, notice stability'
      },
      {
        type: 'prompt',
        label: 'Water: Drink mindfully, feel fluidity in your body',
        content: 'Water: Drink mindfully, feel fluidity in your body'
      },
      {
        type: 'prompt',
        label: 'Fire: Feel warmth, notice inner fire and passion',
        content: 'Fire: Feel warmth, notice inner fire and passion'
      },
      {
        type: 'prompt',
        label: 'Air: Breathe deeply, feel expansion and movement',
        content: 'Air: Breathe deeply, feel expansion and movement'
      }
    ],
    freeItems: [
      'Access to basic elements (even indoors)'
    ],
    nicheItems: []
  },
  {
    id: 'universal-6',
    type: 'activity',
    title: 'Future Self Letter',
    description: 'Write a 5-minute letter to yourself one year from now. Share current insights, challenges, and hopes.',
    quote: 'I send wisdom across time to the person I\'m becoming.',
    journalPrompt: 'What wisdom did you want to send across time? How does writing to future self change present perspective?',
    archetype: 'Universal',
    rarity: 'common',
    icon: '✉️',
    color: 'bg-indigo-100 border-indigo-300',
    tags: ['writing', 'reflection', 'future', 'universal'],
    duration: '5 minutes',
    difficulty: 'easy',
    timeOfDay: 'anytime',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Set timer for 5 minutes',
        content: 'Set timer for 5 minutes'
      },
      {
        type: 'prompt',
        label: 'Write to yourself exactly one year from today',
        content: 'Write to yourself exactly one year from today'
      },
      {
        type: 'prompt',
        label: 'Include current insights and challenges',
        content: 'Include current insights and challenges'
      },
      {
        type: 'prompt',
        label: 'Add hopes and encouragement for future self',
        content: 'Add hopes and encouragement for future self'
      }
    ],
    freeItems: [
      'Paper/digital note with future date'
    ],
    nicheItems: []
  },
  {
    id: 'universal-7',
    type: 'activity',
    title: 'Micro-Adventure Quest',
    description: 'Take a 15-minute walk to somewhere you\'ve never been, even if it\'s just 3 blocks away. Explore with beginner\'s mind.',
    quote: 'Adventure lives in the smallest shift of perspective.',
    journalPrompt: 'What did you discover in familiar territory? How does micro-adventure change your relationship to home?',
    archetype: 'Universal',
    rarity: 'common',
    icon: '🚶',
    color: 'bg-emerald-100 border-emerald-300',
    tags: ['adventure', 'walking', 'exploration', 'universal'],
    duration: '15 minutes',
    difficulty: 'easy',
    timeOfDay: 'anytime',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Choose direction you rarely walk',
        content: 'Choose direction you rarely walk'
      },
      {
        type: 'prompt',
        label: 'Walk for 7.5 minutes discovering new details',
        content: 'Walk for 7.5 minutes discovering new details'
      },
      {
        type: 'prompt',
        label: 'Find something beautiful you\'ve never noticed',
        content: 'Find something beautiful you\'ve never noticed'
      },
      {
        type: 'prompt',
        label: 'Return home by different route if possible',
        content: 'Return home by different route if possible'
      }
    ],
    freeItems: [
      'Walking ability and curious mind'
    ],
    nicheItems: []
  },
  {
    id: 'universal-8',
    type: 'activity',
    title: 'Energy Archaeology',
    description: 'Sit in a space you inhabit daily and feel its emotional archaeology. What feelings live in the walls?',
    quote: 'I excavate the emotional layers of my lived spaces.',
    journalPrompt: 'What emotional layers did you discover in your space? How does the room hold your feelings?',
    archetype: 'Universal',
    rarity: 'common',
    icon: '🏠',
    color: 'bg-amber-100 border-amber-300',
    tags: ['mindfulness', 'space', 'emotions', 'universal'],
    duration: '10 minutes',
    difficulty: 'easy',
    timeOfDay: 'anytime',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Choose room you spend lots of time in',
        content: 'Choose room you spend lots of time in'
      },
      {
        type: 'prompt',
        label: 'Sit quietly for 10 minutes feeling the space',
        content: 'Sit quietly for 10 minutes feeling the space'
      },
      {
        type: 'prompt',
        label: 'Notice what emotions live in different corners',
        content: 'Notice what emotions live in different corners'
      },
      {
        type: 'prompt',
        label: 'Send gratitude to the space for holding you',
        content: 'Send gratitude to the space for holding you'
      }
    ],
    freeItems: [
      'Familiar space and emotional awareness'
    ],
    nicheItems: []
  },
  {
    id: 'universal-9',
    type: 'activity',
    title: 'Compliment Distribution Mission',
    description: 'Give 3 genuine compliments to different people today. Focus on character traits, not appearance.',
    quote: 'I scatter genuine appreciation like cosmic stardust.',
    journalPrompt: 'How did giving genuine compliments change your interactions? What did you notice about focusing on others\' positive qualities?',
    archetype: 'Universal',
    rarity: 'common',
    icon: '💫',
    color: 'bg-pink-100 border-pink-300',
    tags: ['kindness', 'social', 'appreciation', 'universal'],
    duration: 'Throughout day',
    difficulty: 'easy',
    timeOfDay: 'anytime',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Choose 3 people you\'ll encounter naturally',
        content: 'Choose 3 people you\'ll encounter naturally'
      },
      {
        type: 'prompt',
        label: 'Notice genuine positive qualities about them',
        content: 'Notice genuine positive qualities about them'
      },
      {
        type: 'prompt',
        label: 'Give specific compliment about character/actions',
        content: 'Give specific compliment about character/actions'
      },
      {
        type: 'prompt',
        label: 'Notice how appreciation affects both of you',
        content: 'Notice how appreciation affects both of you'
      }
    ],
    freeItems: [
      'Attention to positive qualities in others'
    ],
    nicheItems: []
  },
  {
    id: 'universal-10',
    type: 'activity',
    title: 'Mindful Consumption Pause',
    description: 'Before eating, drinking, or consuming media today, pause for 30 seconds and ask: "Does this nourish my truest self?"',
    quote: 'I choose consumption that nourishes my cosmic essence.',
    journalPrompt: 'What did conscious consumption reveal about your needs versus wants? How did pausing change your choices?',
    archetype: 'Universal',
    rarity: 'common',
    icon: '⏸️',
    color: 'bg-cyan-100 border-cyan-300',
    tags: ['mindfulness', 'consumption', 'awareness', 'universal'],
    duration: 'Throughout day',
    difficulty: 'medium',
    timeOfDay: 'anytime',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Set intention to pause before consuming anything',
        content: 'Set intention to pause before consuming anything'
      },
      {
        type: 'prompt',
        label: 'Ask: "Does this nourish my truest self?"',
        content: 'Ask: "Does this nourish my truest self?"'
      },
      {
        type: 'prompt',
        label: 'Notice the difference between craving and nourishment',
        content: 'Notice the difference between craving and nourishment'
      },
      {
        type: 'prompt',
        label: 'Make conscious choice either way',
        content: 'Make conscious choice either way'
      }
    ],
    freeItems: [
      'Mindful awareness throughout day'
    ],
    nicheItems: []
  },
  {
    id: 'universal-11',
    type: 'activity',
    title: 'Intergenerational Wisdom Exchange',
    description: 'Have a 15-minute conversation with someone significantly older or younger. Exchange one piece of wisdom with them.',
    quote: 'I bridge time by honoring both ancient wisdom and future possibility.',
    journalPrompt: 'What wisdom crossed generational lines? How did the exchange change your perspective on time and experience?',
    archetype: 'Universal',
    rarity: 'common',
    icon: '🤝',
    color: 'bg-violet-100 border-violet-300',
    tags: ['wisdom', 'social', 'intergenerational', 'universal'],
    duration: '15 minutes',
    difficulty: 'medium',
    timeOfDay: 'anytime',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Find someone 15+ years different in age',
        content: 'Find someone 15+ years different in age'
      },
      {
        type: 'prompt',
        label: 'Ask them for one piece of life wisdom',
        content: 'Ask them for one piece of life wisdom'
      },
      {
        type: 'prompt',
        label: 'Share one insight from your generation/experience',
        content: 'Share one insight from your generation/experience'
      },
      {
        type: 'prompt',
        label: 'End with gratitude for the exchange',
        content: 'End with gratitude for the exchange'
      }
    ],
    freeItems: [
      'Access to different age groups (family, neighbors, coworkers)'
    ],
    nicheItems: []
  },
  {
    id: 'universal-12',
    type: 'activity',
    title: 'Sacred Mundane Transformation',
    description: 'Choose one mundane daily task and perform it as a sacred ritual. Bring full presence and gratitude to the ordinary.',
    quote: 'I transform ordinary tasks into rituals of cosmic connection.',
    journalPrompt: 'How did sacred attention transform mundane activity? What did you discover about ordinary moments?',
    archetype: 'Universal',
    rarity: 'common',
    icon: '✨',
    color: 'bg-teal-100 border-teal-300',
    tags: ['mindfulness', 'ritual', 'daily life', 'universal'],
    duration: '10 minutes',
    difficulty: 'easy',
    timeOfDay: 'anytime',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Choose routine task (washing dishes, brushing teeth, folding laundry)',
        content: 'Choose routine task (washing dishes, brushing teeth, folding laundry)'
      },
      {
        type: 'prompt',
        label: 'Perform with complete attention and gratitude',
        content: 'Perform with complete attention and gratitude'
      },
      {
        type: 'prompt',
        label: 'Notice textures, sensations, and purposes',
        content: 'Notice textures, sensations, and purposes'
      },
      {
        type: 'prompt',
        label: 'End with appreciation for the task\'s role in your life',
        content: 'End with appreciation for the task\'s role in your life'
      }
    ],
    freeItems: [
      'Any daily task and mindful attention'
    ],
    nicheItems: []
  },
  {
    id: 'universal-13',
    type: 'activity',
    title: 'Cosmic Perspective Shift',
    description: 'When feeling stressed or overwhelmed, take 5 minutes to zoom out to increasingly larger perspectives until you reach cosmic scale.',
    quote: 'I zoom out to cosmic scale to find peace in earthly troubles.',
    journalPrompt: 'How did cosmic perspective change your relationship to current challenges? What feels different when viewed from universal scale?',
    archetype: 'Universal',
    rarity: 'common',
    icon: '🌌',
    color: 'bg-slate-100 border-slate-300',
    tags: ['perspective', 'stress relief', 'cosmic', 'universal'],
    duration: '5 minutes',
    difficulty: 'easy',
    timeOfDay: 'anytime',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Start with your immediate concern',
        content: 'Start with your immediate concern'
      },
      {
        type: 'prompt',
        label: 'Zoom out to room, building, neighborhood, city',
        content: 'Zoom out to room, building, neighborhood, city'
      },
      {
        type: 'prompt',
        label: 'Continue to planet, solar system, galaxy, universe',
        content: 'Continue to planet, solar system, galaxy, universe'
      },
      {
        type: 'prompt',
        label: 'Return to your concern with cosmic perspective',
        content: 'Return to your concern with cosmic perspective'
      }
    ],
    freeItems: [
      'Imagination and willingness to shift perspective'
    ],
    nicheItems: []
  },
  {
    id: 'universal-14',
    type: 'activity',
    title: 'Random Act of Cosmic Kindness',
    description: 'Perform one unexpected act of kindness for a stranger today. Focus on actions that require no recognition or reciprocation.',
    quote: 'I plant seeds of kindness that bloom in ways I\'ll never see.',
    journalPrompt: 'How did anonymous kindness affect your energy? What did you notice about giving without recognition?',
    archetype: 'Universal',
    rarity: 'common',
    icon: '💝',
    color: 'bg-rose-100 border-rose-300',
    tags: ['kindness', 'service', 'anonymous', 'universal'],
    duration: '10 minutes',
    difficulty: 'medium',
    timeOfDay: 'anytime',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Notice opportunity for anonymous kindness',
        content: 'Notice opportunity for anonymous kindness'
      },
      {
        type: 'prompt',
        label: 'Act without expectation of thanks or recognition',
        content: 'Act without expectation of thanks or recognition'
      },
      {
        type: 'prompt',
        label: 'Choose action that genuinely helps someone',
        content: 'Choose action that genuinely helps someone'
      },
      {
        type: 'prompt',
        label: 'Leave without making it about you',
        content: 'Leave without making it about you'
      }
    ],
    freeItems: [
      'Attention to others\' needs and generous heart'
    ],
    nicheItems: []
  },
  {
    id: 'universal-15',
    type: 'activity',
    title: 'Daily Miracle Documentation',
    description: 'Document 3 "miracles" from your day - moments of unexpected beauty, synchronicity, or grace that you almost missed.',
    quote: 'I witness the ordinary magic woven through each solar rotation.',
    journalPrompt: 'What everyday miracles did you almost miss? How does documenting wonder change your perception of ordinary days?',
    archetype: 'Universal',
    rarity: 'common',
    icon: '🌟',
    color: 'bg-yellow-50 border-yellow-400',
    tags: ['awareness', 'wonder', 'documentation', 'universal'],
    duration: '15 minutes',
    difficulty: 'easy',
    timeOfDay: 'evening',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Set intention to notice 3 small miracles during your day',
        content: 'Set intention to notice 3 small miracles during your day'
      },
      {
        type: 'prompt',
        label: 'Look for unexpected beauty, helpful synchronicities, moments of grace',
        content: 'Look for unexpected beauty, helpful synchronicities, moments of grace'
      },
      {
        type: 'prompt',
        label: 'Document them with specific details',
        content: 'Document them with specific details'
      },
      {
        type: 'prompt',
        label: 'End day with gratitude for mystery and magic',
        content: 'End day with gratitude for mystery and magic'
      }
    ],
    freeItems: [
      'Attention to wonder and documentation method'
    ],
    nicheItems: []
  }
];