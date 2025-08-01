import type { DailyRoll } from '../surpriseMe';

export const activities: DailyRoll[] = [
  // Common Activities (70% probability)
  {
    id: 'builder-1',
    type: 'activity',
    title: 'Dawn Foundation Ritual',
    description: 'Every sunrise for 30 days, spend 15 minutes strengthening one foundational area. Track which sunrise energy builds which foundation best.',
    quote: 'I build lasting foundations with the energy of first light.',
    journalPrompt: 'Which foundation did you strengthen? How did sunrise energy enhance your building?',
    archetype: 'Sol Builder',
    rarity: 'common',
    icon: '🌅',
    color: 'bg-yellow-100 border-yellow-300',
    tags: ['foundation', 'ritual', 'building'],
    duration: '30 days',
    difficulty: 'medium',
    timeOfDay: 'morning',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Choose one foundation area',
        content: 'Choose one foundation area: health, finances, relationships, or skills'
      },
      {
        type: 'prompt',
        label: 'Set sunrise alarm for 30 consecutive days',
        content: 'Set sunrise alarm for 30 consecutive days'
      },
      {
        type: 'prompt',
        label: 'Face east during your 15-minute foundation work',
        content: 'Face east during your 15-minute foundation work'
      },
      {
        type: 'prompt',
        label: 'Track which sunrise conditions enhance your building energy',
        content: 'Track which sunrise conditions enhance your building energy'
      }
    ],
    freeItems: [
      'Sunrise alarm',
      'East-facing space'
    ],
    nicheItems: [
      {
        type: 'product',
        label: 'Himalayan Salt Lamp with Timer',
        content: 'Natural light therapy that circadian rhythm researchers use to regulate building energy',
        url: 'https://amazon.com/dp/B00B1ZJ8YQ?tag=solara02-20',
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
    id: 'builder-2',
    type: 'activity',
    title: 'Legacy Blueprint Design',
    description: 'Design a project that will outlive you by 100 years. Create detailed blueprints for something that future generations will thank you for building.',
    quote: 'I build foundations that will shelter generations yet unborn.',
    journalPrompt: 'What legacy project did you design? How did thinking 100 years ahead change your building approach?',
    archetype: 'Sol Builder',
    rarity: 'common',
    icon: '🏗️',
    color: 'bg-yellow-100 border-yellow-300',
    tags: ['legacy', 'planning', 'building'],
    duration: '3 hours',
    difficulty: 'medium',
    timeOfDay: 'anytime',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Choose a project that could last 100 years',
        content: 'Choose a project that could last 100 years (community garden, library, art installation)'
      },
      {
        type: 'prompt',
        label: 'Design detailed blueprints',
        content: 'Design detailed blueprints with materials that will last'
      },
      {
        type: 'prompt',
        label: 'Consider how future generations will use it',
        content: 'Consider how future generations will use and maintain it'
      }
    ],
    freeItems: [
      'Paper and drawing supplies',
      'Research on long-lasting materials',
      'Imagination for future scenarios',
      'Community input and feedback'
    ],
    nicheItems: []
  },
  {
    id: 'builder-3',
    type: 'activity',
    title: 'Legacy Seed Planting',
    description: 'Start something designed to outlast you by decades. Plant actual trees, start educational funds, create institutions, or build lasting infrastructure.',
    quote: 'I plant seeds today that will grow into forests for tomorrow.',
    journalPrompt: 'What legacy project did you start? How did thinking beyond your lifetime change your perspective?',
    archetype: 'Sol Builder',
    rarity: 'common',
    icon: '🌱',
    color: 'bg-yellow-100 border-yellow-300',
    tags: ['legacy', 'planting', 'future'],
    duration: '1 day',
    difficulty: 'easy',
    timeOfDay: 'anytime',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Research what your community will need in 50 years',
        content: 'Research what your community will need in 50 years'
      },
      {
        type: 'prompt',
        label: 'Choose one legacy project that excites you',
        content: 'Choose one legacy project that excites you'
      },
      {
        type: 'prompt',
        label: 'Take the first concrete action today',
        content: 'Take the first concrete action today'
      },
      {
        type: 'prompt',
        label: 'Involve younger people in the planning process',
        content: 'Involve younger people in the planning process'
      }
    ],
    freeItems: [
      'Research tools (internet, library)',
      'Community connections',
      'Long-term thinking mindset',
      'Willingness to start small'
    ],
    nicheItems: []
  },
  {
    id: 'builder-4',
    type: 'activity',
    title: 'System Architecture Audit',
    description: 'Identify one chaotic area of your life and build a system that runs automatically. Focus on systems that improve with use, not just organization.',
    quote: 'I architect order from chaos, one system at a time.',
    journalPrompt: 'What system did you build? How did creating automatic order change your daily life?',
    archetype: 'Sol Builder',
    rarity: 'common',
    icon: '🏗️',
    color: 'bg-yellow-100 border-yellow-300',
    tags: ['systems', 'organization', 'automation'],
    duration: '2 weeks',
    difficulty: 'medium',
    timeOfDay: 'anytime',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'List 5 areas of life that feel chaotic or inefficient',
        content: 'List 5 areas of life that feel chaotic or inefficient'
      },
      {
        type: 'prompt',
        label: 'Choose one with the highest daily impact',
        content: 'Choose one with the highest daily impact'
      },
      {
        type: 'prompt',
        label: 'Design system that runs without your constant attention',
        content: 'Design system that runs without your constant attention'
      },
      {
        type: 'prompt',
        label: 'Test and refine for 2 weeks',
        content: 'Test and refine for 2 weeks'
      }
    ],
    freeItems: [
      'Notebook for system design',
      'Patience to test and refine',
      'Willingness to experiment',
      'Focus on one area at a time'
    ],
    nicheItems: []
  },
  // Rare Activities (25% probability)
  {
    id: 'builder-5',
    type: 'activity',
    title: 'Apprentice Master Program',
    description: 'Design a formal apprenticeship to transfer your core skill to 3 people over 6 months. Include graduation ceremony and skill certification.',
    quote: 'I build foundations in others that will support generations.',
    journalPrompt: 'How did teaching your craft change your mastery? What legacy did you create through apprentices?',
    archetype: 'Sol Builder',
    rarity: 'rare',
    icon: '🎓',
    color: 'bg-yellow-100 border-yellow-300',
    tags: ['teaching', 'apprenticeship', 'skills'],
    duration: '6 months',
    difficulty: 'hard',
    timeOfDay: 'anytime',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Identify your most valuable transferable skill',
        content: 'Identify your most valuable transferable skill'
      },
      {
        type: 'prompt',
        label: 'Create structured curriculum with measurable milestones',
        content: 'Create structured curriculum with measurable milestones'
      },
      {
        type: 'prompt',
        label: 'Recruit 3 apprentices through professional networks',
        content: 'Recruit 3 apprentices through professional networks'
      },
      {
        type: 'prompt',
        label: 'Design graduation ceremony with skill demonstration',
        content: 'Design graduation ceremony with skill demonstration'
      }
    ],
    freeItems: [
      'Teaching materials and curriculum',
      'Meeting space for instruction',
      'Professional network for recruiting',
      'Time and dedication to teach'
    ],
    nicheItems: [
      {
        type: 'product',
        label: 'Personalized Certificate Maker Kit',
        content: 'Professional certification materials that trade guilds use for apprentice graduations',
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
    id: 'builder-6',
    type: 'activity',
    title: 'Community Infrastructure Hacking',
    description: 'Identify missing infrastructure that would benefit 100+ people. Build the minimum viable version and test community adoption.',
    quote: 'I build bridges where others see only gaps.',
    journalPrompt: 'What infrastructure did you create? How did serving the community change your building approach?',
    archetype: 'Sol Builder',
    rarity: 'rare',
    icon: '🏘️',
    color: 'bg-yellow-100 border-yellow-300',
    tags: ['community', 'infrastructure', 'building'],
    duration: '1 month',
    difficulty: 'hard',
    timeOfDay: 'anytime',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Survey 20+ community members about daily frustrations',
        content: 'Survey 20+ community members about daily frustrations'
      },
      {
        type: 'prompt',
        label: 'Identify infrastructure gap that affects many people',
        content: 'Identify infrastructure gap that affects many people'
      },
      {
        type: 'prompt',
        label: 'Build simple prototype solution',
        content: 'Build simple prototype solution'
      },
      {
        type: 'prompt',
        label: 'Test with community and iterate',
        content: 'Test with community and iterate'
      }
    ],
    freeItems: [
      'Community survey tools',
      'Prototyping materials',
      'Community connections',
      'Willingness to serve others'
    ],
    nicheItems: []
  },
  {
    id: 'builder-7',
    type: 'activity',
    title: 'Resilience Engineering',
    description: 'Build something that gets stronger when stressed or broken. Create systems that learn from failure and become more robust through adversity.',
    quote: 'I forge strength through the fires of challenge.',
    journalPrompt: 'What resilient system did you build? How did designing for failure make it stronger?',
    archetype: 'Sol Builder',
    rarity: 'rare',
    icon: '🛡️',
    color: 'bg-yellow-100 border-yellow-300',
    tags: ['resilience', 'engineering', 'strength'],
    duration: '2 weeks',
    difficulty: 'hard',
    timeOfDay: 'anytime',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Identify a system that fails under stress',
        content: 'Identify a system that fails under stress'
      },
      {
        type: 'prompt',
        label: 'Design it to get stronger when stressed',
        content: 'Design it to get stronger when stressed'
      },
      {
        type: 'prompt',
        label: 'Test it under various stress conditions',
        content: 'Test it under various stress conditions'
      },
      {
        type: 'prompt',
        label: 'Document how it improves through failure',
        content: 'Document how it improves through failure'
      }
    ],
    freeItems: [
      'Engineering mindset',
      'Testing tools and methods',
      'Documentation skills',
      'Willingness to fail and learn'
    ],
    nicheItems: []
  },
  {
    id: 'builder-8',
    type: 'activity',
    title: 'Intergenerational Project Bridge',
    description: 'Create a project that requires collaboration between people 40+ years apart in age. Build something that honors both traditional wisdom and modern innovation.',
    quote: 'I construct bridges that span the gaps between generations.',
    journalPrompt: 'What intergenerational project did you build? How did bridging age gaps change your construction approach?',
    archetype: 'Sol Builder',
    rarity: 'rare',
    icon: '🌉',
    color: 'bg-yellow-100 border-yellow-300',
    tags: ['generations', 'collaboration', 'building'],
    duration: '3 months',
    difficulty: 'hard',
    timeOfDay: 'anytime',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Connect with both senior centers and youth programs',
        content: 'Connect with both senior centers and youth programs'
      },
      {
        type: 'prompt',
        label: 'Design project requiring both traditional and modern skills',
        content: 'Design project requiring both traditional and modern skills'
      },
      {
        type: 'prompt',
        label: 'Facilitate intergenerational building sessions',
        content: 'Facilitate intergenerational building sessions'
      },
      {
        type: 'prompt',
        label: 'Document how different generations approach construction',
        content: 'Document how different generations approach construction'
      }
    ],
    freeItems: [
      'Community connections',
      'Facilitation skills',
      'Building materials',
      'Patience for intergenerational learning'
    ],
    nicheItems: [
      {
        type: 'product',
        label: 'Traditional Japanese Wood Joinery Tools Set',
        content: 'Hand tools that connect traditional building wisdom with modern creativity',
        url: 'https://amazon.com/dp/B00B1ZJ8YQ?tag=solara02-20',
        affiliate: {
          program: 'Amazon Associates',
          commission: 'Up to 10%',
          tracking: '24 hours'
        },
        productImage: '/api/placeholder/200/200',
        price: '$89',
        category: 'tools'
      }
    ]
  },
  // Legendary Activities (5% probability)
  {
    id: 'builder-9',
    type: 'activity',
    title: 'Generational Architecture',
    description: 'Lead a community project to build something designed to be enhanced by each generation - libraries that expand, gardens that evolve, traditions that adapt.',
    quote: 'I build foundations that future generations will build upon.',
    journalPrompt: 'What generational project did you initiate? How did designing for future enhancement change your approach?',
    archetype: 'Sol Builder',
    rarity: 'legendary',
    icon: '🏛️',
    color: 'bg-yellow-100 border-yellow-300',
    tags: ['generations', 'community', 'architecture'],
    duration: '1 year',
    difficulty: 'hard',
    timeOfDay: 'anytime',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Include all ages in design process',
        content: 'Include all ages in design process - children to elders'
      },
      {
        type: 'prompt',
        label: 'Create expansion plans for future generations',
        content: 'Create expansion plans for future generations'
      },
      {
        type: 'prompt',
        label: 'Build with materials that age beautifully',
        content: 'Build with materials that age beautifully'
      },
      {
        type: 'prompt',
        label: 'Establish governance structure for ongoing enhancement',
        content: 'Establish governance structure for ongoing enhancement'
      }
    ],
    freeItems: [
      'Community organizing skills',
      'Long-term vision',
      'Collaborative design tools',
      'Patience for multi-generational planning'
    ],
    nicheItems: [
      {
        type: 'product',
        label: 'Community Planning Board Game',
        content: 'Simulation tool that urban planners use to design multi-generational infrastructure',
        url: 'https://amazon.com/dp/B00B1ZJ8YQ?tag=solara02-20',
        affiliate: {
          program: 'Amazon Associates',
          commission: 'Up to 10%',
          tracking: '24 hours'
        },
        productImage: '/api/placeholder/200/200',
        price: '$78',
        category: 'tools'
      }
    ]
  },
  {
    id: 'builder-10',
    type: 'activity',
    title: 'Cosmic Architecture Studio',
    description: 'Design a building or space that responds to cosmic events. Create architecture that changes with lunar phases, solar cycles, or celestial alignments.',
    quote: 'I build structures that dance with the rhythms of the cosmos.',
    journalPrompt: 'What cosmic-responsive architecture did you design? How did aligning with celestial cycles change your building approach?',
    archetype: 'Sol Builder',
    rarity: 'legendary',
    icon: '🌌',
    color: 'bg-yellow-100 border-yellow-300',
    tags: ['cosmic', 'architecture', 'design'],
    duration: '1 month',
    difficulty: 'hard',
    timeOfDay: 'anytime',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Choose a cosmic event to respond to',
        content: 'Choose a cosmic event to respond to (lunar phases, solar cycles, celestial alignments)'
      },
      {
        type: 'prompt',
        label: 'Design architecture that changes with the event',
        content: 'Design architecture that changes with the event'
      },
      {
        type: 'prompt',
        label: 'Create detailed blueprints and models',
        content: 'Create detailed blueprints and models'
      },
      {
        type: 'prompt',
        label: 'Consider how occupants will experience the changes',
        content: 'Consider how occupants will experience the changes'
      }
    ],
    freeItems: [
      'Architectural drawing tools',
      'Astronomical knowledge',
      'Model-making materials',
      'Imagination for cosmic integration'
    ],
    nicheItems: []
  }
];