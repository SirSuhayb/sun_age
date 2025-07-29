import type { DailyRoll } from '../surpriseMe';

export const activities: DailyRoll[] = [
  // Common Activities (70% probability)
  {
    id: 'sage-1',
    type: 'activity',
    title: 'Solstice Knowledge Quest',
    description: 'Time your learning to cosmic events. Study ancient wisdom traditions during solstices, practical philosophy during equinoxes. Let celestial timing guide your curriculum.',
    quote: 'I align my learning with the cosmic calendar of wisdom.',
    journalPrompt: 'How did cosmic timing enhance your wisdom gathering?',
    archetype: 'Sol Sage',
    rarity: 'common',
    icon: '☀️',
    color: 'bg-indigo-100 border-indigo-300',
    tags: ['wisdom', 'cosmic', 'learning'],
    duration: '2 hours',
    difficulty: 'easy',
    timeOfDay: 'anytime',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Check next solstice/equinox date and meaning',
        content: 'Check next solstice/equinox date and meaning'
      },
      {
        type: 'prompt',
        label: 'Choose wisdom tradition that aligns with the season',
        content: 'Choose wisdom tradition that aligns with the season'
      },
      {
        type: 'prompt',
        label: 'Study outside during the actual cosmic event',
        content: 'Study outside during the actual cosmic event'
      },
      {
        type: 'prompt',
        label: 'Document insights that emerge from cosmic timing',
        content: 'Document insights that emerge from cosmic timing'
      }
    ],
    freeItems: [
      'Access to sunrise/sunset times',
      'Basic knowledge of solstices and equinoxes'
    ],
    nicheItems: [
      {
        type: 'product',
        label: 'The Old Farmer\'s Almanac Astronomy Calendar',
        content: 'Charts celestial events that indigenous cultures used for wisdom timing',
        url: 'https://amazon.com/dp/B00B1ZJ8YQ?tag=solara02-20',
        affiliate: {
          program: 'Amazon Associates',
          commission: 'Up to 10%',
          tracking: '24 hours'
        },
        productImage: '/api/placeholder/200/200',
        price: '$12',
        category: 'books'
      },
      {
        type: 'product',
        label: 'The Art of Possibility by Rosamund Stone Zander',
        content: 'Transformational book that wisdom seekers use to unlock new perspectives',
        url: 'https://amazon.com/dp/0142001104?tag=solara02-20',
        affiliate: {
          program: 'Amazon Associates',
          commission: 'Up to 10%',
          tracking: '24 hours'
        },
        productImage: '/api/placeholder/200/200',
        price: '$15',
        category: 'books'
      }
    ]
  },
  {
    id: 'sage-2',
    type: 'activity',
    title: 'Intergenerational Wisdom Bridge',
    description: 'Find someone 20+ years older who\'s lived something you\'re facing. Extract their wisdom, then teach something you know to someone 20+ years younger.',
    quote: 'I bridge time by honoring both ancient wisdom and future possibility.',
    journalPrompt: 'What wisdom crossed generational lines? How did the exchange change your perspective?',
    archetype: 'Sol Sage',
    rarity: 'common',
    icon: '🌉',
    color: 'bg-indigo-100 border-indigo-300',
    tags: ['wisdom', 'generations', 'teaching'],
    duration: '1 hour',
    difficulty: 'medium',
    timeOfDay: 'anytime',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Identify current life challenge or decision',
        content: 'Identify current life challenge or decision'
      },
      {
        type: 'prompt',
        label: 'Find elder who navigated similar experience',
        content: 'Find elder who navigated similar experience'
      },
      {
        type: 'prompt',
        label: 'Conduct wisdom extraction interview',
        content: 'Conduct wisdom extraction interview'
      },
      {
        type: 'prompt',
        label: 'Find younger person to teach your knowledge to',
        content: 'Find younger person to teach your knowledge to'
      }
    ],
    freeItems: [
      'Access to different age groups (family, neighbors, coworkers)',
      'Open mind for wisdom exchange'
    ],
    nicheItems: [
      {
        type: 'product',
        label: 'Rocketbook Flip',
        content: 'Reversible notebook where one side captures wisdom received, other side records wisdom given',
        url: 'https://amazon.com/dp/B07DGR98VQ?tag=solara02-20',
        affiliate: {
          program: 'Amazon Associates',
          commission: 'Up to 10%',
          tracking: '24 hours'
        },
        productImage: '/api/placeholder/200/200',
        price: '$34',
        category: 'tools'
      }
    ]
  },
  {
    id: 'sage-3',
    type: 'activity',
    title: 'Question Everything Audit',
    description: 'Choose one belief you\'ve held for years and question it from multiple perspectives. Research it like a detective seeking truth, not confirmation.',
    quote: 'I seek truth beyond the comfort of my own assumptions.',
    journalPrompt: 'What belief did you question? How did it change your understanding?',
    archetype: 'Sol Sage',
    rarity: 'common',
    icon: '🔍',
    color: 'bg-indigo-100 border-indigo-300',
    tags: ['questioning', 'research', 'truth'],
    duration: '2 hours',
    difficulty: 'medium',
    timeOfDay: 'anytime',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'List 5 beliefs you\'ve never questioned',
        content: 'List 5 beliefs you\'ve never questioned'
      },
      {
        type: 'prompt',
        label: 'Choose the most foundational one',
        content: 'Choose the most foundational one'
      },
      {
        type: 'prompt',
        label: 'Research opposing viewpoints with genuine curiosity',
        content: 'Research opposing viewpoints with genuine curiosity'
      },
      {
        type: 'prompt',
        label: 'Document how your understanding evolved',
        content: 'Document how your understanding evolved'
      }
    ],
    freeItems: [
      'Internet access for research',
      'Open mind for challenging assumptions'
    ],
    nicheItems: [
      {
        type: 'product',
        label: 'Devil\'s Advocate: A Handbook of Chatbot Prompts',
        content: 'Curated questions that philosophers use to challenge their own assumptions',
        url: 'https://amazon.com/dp/B00B1ZJ8YQ?tag=solara02-20',
        affiliate: {
          program: 'Amazon Associates',
          commission: 'Up to 10%',
          tracking: '24 hours'
        },
        productImage: '/api/placeholder/200/200',
        price: '$19',
        category: 'books'
      }
    ]
  },
  {
    id: 'sage-5',
    type: 'activity',
    title: 'Wisdom Mapping Expedition',
    description: 'Create a physical map of your knowledge gaps. Use different colored pins for different types of wisdom you seek. Plan expeditions to fill each gap.',
    quote: 'I chart the unknown territories of my own understanding.',
    journalPrompt: 'What knowledge gaps did you discover? How will you navigate to fill them?',
    archetype: 'Sol Sage',
    rarity: 'common',
    icon: '🗺️',
    color: 'bg-indigo-100 border-indigo-300',
    tags: ['mapping', 'knowledge', 'planning'],
    duration: '3 hours',
    difficulty: 'medium',
    timeOfDay: 'anytime',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'List 10 areas where you feel knowledge gaps exist',
        content: 'List 10 areas where you feel knowledge gaps exist'
      },
      {
        type: 'prompt',
        label: 'Categorize gaps by type: practical, philosophical, creative, technical',
        content: 'Categorize gaps by type: practical, philosophical, creative, technical'
      },
      {
        type: 'prompt',
        label: 'For each gap, identify 3 specific resources or people who could help',
        content: 'For each gap, identify 3 specific resources or people who could help'
      }
    ],
    freeItems: [
      'Large paper or whiteboard for mapping',
      'Colored markers or pins',
      'Research tools (internet, library access)'
    ],
    nicheItems: [
      {
        type: 'product',
        label: 'Mind Mapping Notebook',
        content: 'Specialized notebook for wisdom mapping with guided prompts',
        url: 'https://amazon.com/dp/B08N5WRWNW?tag=solara02-20',
        affiliate: {
          program: 'Amazon Associates',
          commission: 'Up to 10%',
          tracking: '24 hours'
        },
        productImage: '/api/placeholder/200/200',
        price: '$18',
        category: 'books'
      }
    ]
  },
  // Rare Activities (25% probability)
  {
    id: 'sage-4',
    type: 'activity',
    title: 'Philosophy Fight Club',
    description: 'Organize monthly debates where participants must argue for positions they personally disagree with. Rotate topics monthly based on lunar cycles.',
    quote: 'I find wisdom in the collision of opposing truths.',
    journalPrompt: 'How did arguing against your beliefs change your perspective?',
    archetype: 'Sol Sage',
    rarity: 'rare',
    icon: '🥊',
    color: 'bg-indigo-100 border-indigo-300',
    tags: ['debate', 'philosophy', 'community'],
    duration: '2 hours',
    difficulty: 'hard',
    timeOfDay: 'evening',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Recruit 6-8 diverse thinkers from different backgrounds',
        content: 'Recruit 6-8 diverse thinkers from different backgrounds'
      },
      {
        type: 'prompt',
        label: 'Choose controversial topic with clear opposing sides',
        content: 'Choose controversial topic with clear opposing sides'
      },
      {
        type: 'prompt',
        label: 'Assign people to argue against their personal beliefs',
        content: 'Assign people to argue against their personal beliefs'
      },
      {
        type: 'prompt',
        label: 'Meet outdoors where ideas can breathe freely',
        content: 'Meet outdoors where ideas can breathe freely'
      }
    ],
    freeItems: [
      'Outdoor meeting space',
      'Diverse group of thinkers'
    ],
    nicheItems: [
      {
        type: 'product',
        label: 'Tibetan Singing Bowl 7-inch',
        content: 'Sacred sound instrument that debate moderators use to maintain respectful discourse',
        url: 'https://amazon.com/dp/B00B1ZJ8YQ?tag=solara02-20',
        affiliate: {
          program: 'Amazon Associates',
          commission: 'Up to 10%',
          tracking: '24 hours'
        },
        productImage: '/api/placeholder/200/200',
        price: '$67',
        category: 'tools'
      }
    ]
  },
  {
    id: 'sage-6',
    type: 'activity',
    title: 'Wisdom Keeper Interview Project',
    description: 'Find 3 people whose knowledge is at risk of being lost (elders, craftspeople, immigrants). Record their stories and wisdom for future generations.',
    quote: 'I preserve wisdom that would otherwise fade into silence.',
    journalPrompt: 'What wisdom did you capture? How did their stories change your understanding?',
    archetype: 'Sol Sage',
    rarity: 'rare',
    icon: '📝',
    color: 'bg-indigo-100 border-indigo-300',
    tags: ['preservation', 'interviews', 'wisdom'],
    duration: '3 hours',
    difficulty: 'medium',
    timeOfDay: 'anytime',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Identify local wisdom keepers',
        content: 'Identify local wisdom keepers (barbers, librarians, immigrants, elders)'
      },
      {
        type: 'prompt',
        label: 'Request permission to record their stories',
        content: 'Request permission to record their stories'
      },
      {
        type: 'prompt',
        label: 'Ask about wisdom they wish younger generations knew',
        content: 'Ask about wisdom they wish younger generations knew'
      },
      {
        type: 'prompt',
        label: 'Create archive of their knowledge',
        content: 'Create archive of their knowledge'
      }
    ],
    freeItems: [
      'Recording device (phone works)',
      'Notebook for notes',
      'Respectful approach and genuine curiosity'
    ],
    nicheItems: [
      {
        type: 'product',
        label: 'Sanken COS-11D Lavalier Microphone',
        content: 'Professional interview microphone that oral historians use to capture subtle vocal nuances',
        url: 'https://amazon.com/dp/B00B1ZJ8YQ?tag=solara02-20',
        affiliate: {
          program: 'Amazon Associates',
          commission: 'Up to 10%',
          tracking: '24 hours'
        },
        productImage: '/api/placeholder/200/200',
        price: '$389',
        category: 'tools'
      }
    ]
  },
  {
    id: 'sage-7',
    type: 'activity',
    title: 'Paradox Investigation Bureau',
    description: 'Collect life paradoxes (like "you must spend money to save money") and investigate why they exist. Create a database of life\'s beautiful contradictions.',
    quote: 'I find wisdom in the spaces between opposing truths.',
    journalPrompt: 'What paradoxes did you discover? How did investigating contradictions reveal deeper wisdom?',
    archetype: 'Sol Sage',
    rarity: 'rare',
    icon: '🔄',
    color: 'bg-indigo-100 border-indigo-300',
    tags: ['paradox', 'investigation', 'wisdom'],
    duration: '2 hours',
    difficulty: 'medium',
    timeOfDay: 'anytime',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Collect 20+ paradoxes from different life areas',
        content: 'Collect 20+ paradoxes from different life areas'
      },
      {
        type: 'prompt',
        label: 'Choose 3 that genuinely puzzle you',
        content: 'Choose 3 that genuinely puzzle you'
      },
      {
        type: 'prompt',
        label: 'Research why these contradictions exist',
        content: 'Research why these contradictions exist'
      },
      {
        type: 'prompt',
        label: 'Document the deeper truths they reveal',
        content: 'Document the deeper truths they reveal'
      }
    ],
    freeItems: [
      'Notebook for paradox collection',
      'Research tools (internet, library)',
      'Curiosity and open mind'
    ],
    nicheItems: [
      {
        type: 'product',
        label: 'Field Notes Pitch Black Notebook 3-Pack',
        content: 'Notebooks that counterintuitive thinkers use to capture contradictions',
        url: 'https://amazon.com/dp/B00B1ZJ8YQ?tag=solara02-20',
        affiliate: {
          program: 'Amazon Associates',
          commission: 'Up to 10%',
          tracking: '24 hours'
        },
        productImage: '/api/placeholder/200/200',
        price: '$12',
        category: 'books'
      }
    ]
  },
  // Legendary Activities (5% probability)
  {
    id: 'sage-8',
    type: 'activity',
    title: 'Living Library Architect',
    description: 'Create a "Human Library" where people check out conversations with living books - experts whose knowledge is at risk of being lost. Organize quarterly community events.',
    quote: 'I build bridges between wisdom seekers and wisdom keepers.',
    journalPrompt: 'How did creating a living library change your community? What wisdom was preserved?',
    archetype: 'Sol Sage',
    rarity: 'legendary',
    icon: '📚',
    color: 'bg-indigo-100 border-indigo-300',
    tags: ['library', 'community', 'wisdom'],
    duration: '3 months',
    difficulty: 'hard',
    timeOfDay: 'anytime',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Partner with libraries, universities, senior centers',
        content: 'Partner with libraries, universities, senior centers'
      },
      {
        type: 'prompt',
        label: 'Recruit "human books" with endangered knowledge',
        content: 'Recruit "human books" with endangered knowledge'
      },
      {
        type: 'prompt',
        label: 'Train them in conversation skills and story structure',
        content: 'Train them in conversation skills and story structure'
      },
      {
        type: 'prompt',
        label: 'Host quarterly events where people "check out" wisdom',
        content: 'Host quarterly events where people "check out" wisdom'
      }
    ],
    freeItems: [
      'Community spaces (libraries, community centers)',
      'Volunteer network',
      'Event planning skills'
    ],
    nicheItems: [
      {
        type: 'product',
        label: 'Rode Wireless GO II Dual-Channel System',
        content: 'Wireless mic system that human libraries use to amplify whispered wisdom',
        url: 'https://amazon.com/dp/B08N5WRWNW?tag=solara02-20',
        affiliate: {
          program: 'Amazon Associates',
          commission: 'Up to 10%',
          tracking: '24 hours'
        },
        productImage: '/api/placeholder/200/200',
        price: '$299',
        category: 'tools'
      }
    ]
  }
];