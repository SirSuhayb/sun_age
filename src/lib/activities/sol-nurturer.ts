import type { DailyRoll } from '../surpriseMe';

export const activities: DailyRoll[] = [
  // Common Activities (70% probability)
  {
    id: 'nurturer-1',
    type: 'activity',
    title: 'Emotional Weather Station',
    description: 'Create a daily ritual to check in with your emotional climate. Track patterns like a meteorologist, predicting storms and celebrating sunny days.',
    quote: 'I tend to the garden of my heart with daily care and attention.',
    journalPrompt: 'What emotional patterns did you discover? How did tracking your emotional weather change your self-care?',
    archetype: 'Sol Nurturer',
    rarity: 'common',
    icon: '🌤️',
    color: 'bg-green-100 border-green-300',
    tags: ['emotions', 'self-care', 'ritual'],
    duration: '30 minutes',
    difficulty: 'easy',
    timeOfDay: 'morning',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Create a daily emotional check-in ritual',
        content: 'Create a daily emotional check-in ritual'
      },
      {
        type: 'prompt',
        label: 'Track your emotional patterns for 2 weeks',
        content: 'Track your emotional patterns for 2 weeks'
      },
      {
        type: 'prompt',
        label: 'Identify triggers and positive influences',
        content: 'Identify triggers and positive influences'
      },
      {
        type: 'prompt',
        label: 'Develop strategies for emotional storms',
        content: 'Develop strategies for emotional storms'
      }
    ],
    freeItems: [
      'Journal or notebook',
      'Daily commitment to self-care',
      'Honesty about your emotions',
      'Patience with the process'
    ],
    nicheItems: []
  },
  {
    id: 'nurturer-2',
    type: 'activity',
    title: 'Emotional Weather Tracking',
    description: 'For one week, track the emotional weather of 5 people in your life. Offer support before they ask for it, based on what you observe.',
    quote: 'I read the subtle signs of others\' hearts before they speak.',
    journalPrompt: 'What emotional patterns did you observe in others? How did offering preemptive support change your relationships?',
    archetype: 'Sol Nurturer',
    rarity: 'common',
    icon: '🌤️',
    color: 'bg-green-100 border-green-300',
    tags: ['emotion', 'support', 'observation'],
    duration: '1 week',
    difficulty: 'easy',
    timeOfDay: 'anytime',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Choose 5 people across different life areas',
        content: 'Choose 5 people across different life areas (family, friends, work, neighbors)'
      },
      {
        type: 'prompt',
        label: 'Note their emotional patterns without judgment',
        content: 'Note their emotional patterns without judgment'
      },
      {
        type: 'prompt',
        label: 'Offer support before they ask for it',
        content: 'Offer support before they ask for it (gentle check-ins, small gestures)'
      },
      {
        type: 'prompt',
        label: 'Track how preemptive care changes relationships',
        content: 'Track how preemptive care changes relationships'
      }
    ],
    freeItems: [
      'Observation skills',
      'Gentle communication',
      'Small gestures of care',
      'Empathy and patience'
    ],
    nicheItems: []
  },
  {
    id: 'nurturer-3',
    type: 'activity',
    title: 'Healing Circle Facilitator',
    description: 'Organize a monthly gathering where people share struggles and receive collective support. No advice-giving, only witnessing and holding space.',
    quote: 'I create sacred spaces where hearts can heal in community.',
    journalPrompt: 'How did facilitating a healing circle change your understanding of support? What did you learn about holding space?',
    archetype: 'Sol Nurturer',
    rarity: 'common',
    icon: '🔄',
    color: 'bg-green-100 border-green-300',
    tags: ['healing', 'community', 'support'],
    duration: '2 hours',
    difficulty: 'medium',
    timeOfDay: 'evening',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Invite 6-8 people who trust you',
        content: 'Invite 6-8 people who trust you'
      },
      {
        type: 'prompt',
        label: 'Create simple circle format',
        content: 'Create simple circle format: opening, sharing, closing'
      },
      {
        type: 'prompt',
        label: 'Facilitate with no advice - only witnessing',
        content: 'Facilitate with no advice - only witnessing'
      },
      {
        type: 'prompt',
        label: 'Hold monthly gatherings and let group evolve organically',
        content: 'Hold monthly gatherings and let group evolve organically'
      }
    ],
    freeItems: [
      'Safe space for gathering',
      'Facilitation skills',
      'Willingness to hold space',
      'Trust in the healing process'
    ],
    nicheItems: []
  },
  {
    id: 'nurturer-4',
    type: 'activity',
    title: 'Care Package Stealth Mission',
    description: 'Create surprise care packages for people going through difficult times. Focus on those who struggle to ask for help directly.',
    quote: 'I deliver love in unexpected packages to those who need it most.',
    journalPrompt: 'What care packages did you create? How did surprising others with care change your relationships?',
    archetype: 'Sol Nurturer',
    rarity: 'common',
    icon: '📦',
    color: 'bg-green-100 border-green-300',
    tags: ['care', 'surprise', 'support'],
    duration: '1 hour',
    difficulty: 'easy',
    timeOfDay: 'anytime',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Identify 3 people going through challenges',
        content: 'Identify 3 people going through challenges'
      },
      {
        type: 'prompt',
        label: 'Create personalized care packages with meaningful items',
        content: 'Create personalized care packages with meaningful items'
      },
      {
        type: 'prompt',
        label: 'Deliver anonymously or with simple "thinking of you" note',
        content: 'Deliver anonymously or with simple "thinking of you" note'
      },
      {
        type: 'prompt',
        label: 'Observe how unexpected care creates ripple effects',
        content: 'Observe how unexpected care creates ripple effects'
      }
    ],
    freeItems: [
      'Thoughtful items for care packages',
      'Wrapping materials',
      'Anonymous delivery method',
      'Empathy and observation skills'
    ],
    nicheItems: []
  },
  {
    id: 'nurturer-5',
    type: 'activity',
    title: 'Boundary Garden Tending',
    description: 'Create healthy boundaries while maintaining compassion. Learn to say "no" with love and "yes" with intention.',
    quote: 'I tend the garden of my boundaries with love and firmness.',
    journalPrompt: 'What boundaries did you set? How did maintaining healthy boundaries change your relationships?',
    archetype: 'Sol Nurturer',
    rarity: 'common',
    icon: '🌿',
    color: 'bg-green-100 border-green-300',
    tags: ['boundaries', 'self-care', 'compassion'],
    duration: '2 weeks',
    difficulty: 'medium',
    timeOfDay: 'anytime',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Identify areas where you need stronger boundaries',
        content: 'Identify areas where you need stronger boundaries'
      },
      {
        type: 'prompt',
        label: 'Practice saying "no" with love and clarity',
        content: 'Practice saying "no" with love and clarity'
      },
      {
        type: 'prompt',
        label: 'Learn to say "yes" only with full intention',
        content: 'Learn to say "yes" only with full intention'
      },
      {
        type: 'prompt',
        label: 'Maintain compassion while holding firm boundaries',
        content: 'Maintain compassion while holding firm boundaries'
      }
    ],
    freeItems: [
      'Self-reflection time',
      'Communication skills',
      'Self-compassion practices',
      'Support from trusted friends'
    ],
    nicheItems: []
  },
  // Rare Activities (25% probability)
  {
    id: 'nurturer-6',
    type: 'activity',
    title: 'Invisible Support Network',
    description: 'Create anonymous support systems for people who struggle to ask for help. Coordinate with mutual friends to provide seamless care.',
    quote: 'I weave invisible threads of support for those who cannot ask.',
    journalPrompt: 'How did creating invisible support change your understanding of care? What did you learn about anonymous giving?',
    archetype: 'Sol Nurturer',
    rarity: 'rare',
    icon: '🕸️',
    color: 'bg-pink-100 border-pink-300',
    tags: ['anonymous', 'support', 'network'],
    duration: '1 month',
    difficulty: 'hard',
    timeOfDay: 'anytime',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Identify people who need support but won\'t ask',
        content: 'Identify people who need support but won\'t ask'
      },
      {
        type: 'prompt',
        label: 'Coordinate with mutual friends to provide invisible help',
        content: 'Coordinate with mutual friends to provide invisible help'
      },
      {
        type: 'prompt',
        label: 'Create system for groceries, childcare, transportation without exposure',
        content: 'Create system for groceries, childcare, transportation without exposure'
      },
      {
        type: 'prompt',
        label: 'Track how invisible support changes people\'s confidence',
        content: 'Track how invisible support changes people\'s confidence'
      }
    ],
    freeItems: [
      'Network of caring friends',
      'Coordination skills',
      'Discretion and tact',
      'Resources to share'
    ],
    nicheItems: [
      {
        type: 'product',
        label: 'Handcrafted Postcard Set - 50 Beautiful Cards',
        content: 'Personalized postcards that nurturers use to send anonymous care and support',
        url: 'https://amazon.com/dp/B00B1ZJ8YQ?tag=solara02-20',
        affiliate: {
          program: 'Amazon Associates',
          commission: 'Up to 10%',
          tracking: '24 hours'
        },
        productImage: '/api/placeholder/200/200',
        price: '$18',
        category: 'tools'
      }
    ]
  },
  {
    id: 'nurturer-7',
    type: 'activity',
    title: 'Intergenerational Nurturing Exchange',
    description: 'Connect elders who need companionship with young families who need wisdom. Facilitate regular exchanges of caregiving and guidance.',
    quote: 'I bridge the gaps between generations through shared care.',
    journalPrompt: 'What intergenerational connections did you facilitate? How did bridging age gaps change both generations?',
    archetype: 'Sol Nurturer',
    rarity: 'rare',
    icon: '👥',
    color: 'bg-pink-100 border-pink-300',
    tags: ['generations', 'exchange', 'care'],
    duration: '3 months',
    difficulty: 'hard',
    timeOfDay: 'anytime',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Partner with senior centers and family resource centers',
        content: 'Partner with senior centers and family resource centers'
      },
      {
        type: 'prompt',
        label: 'Match elders with young families based on interests',
        content: 'Match elders with young families based on interests'
      },
      {
        type: 'prompt',
        label: 'Facilitate regular exchanges: meals, activities, wisdom sharing',
        content: 'Facilitate regular exchanges: meals, activities, wisdom sharing'
      },
      {
        type: 'prompt',
        label: 'Create ongoing support system for both generations',
        content: 'Create ongoing support system for both generations'
      }
    ],
    freeItems: [
      'Community connections',
      'Matching and facilitation skills',
      'Meeting spaces',
      'Long-term commitment'
    ],
    nicheItems: [
      {
        type: 'product',
        label: 'Intergenerational Board Game Collection',
        content: 'Games specifically designed to bridge age gaps and create connection',
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
  {
    id: 'nurturer-8',
    type: 'activity',
    title: 'Grief Holding Space Sanctuary',
    description: 'Organize quarterly gatherings for people experiencing different types of loss. Create space for grief to be witnessed and honored without rushing to healing.',
    quote: 'I hold space for grief to be witnessed in its fullness.',
    journalPrompt: 'How did creating a grief sanctuary change your understanding of loss? What did you learn about holding space for pain?',
    archetype: 'Sol Nurturer',
    rarity: 'rare',
    icon: '🕊️',
    color: 'bg-pink-100 border-pink-300',
    tags: ['grief', 'sanctuary', 'healing'],
    duration: '3 hours',
    difficulty: 'hard',
    timeOfDay: 'evening',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Invite people experiencing loss (death, divorce, job loss, etc.)',
        content: 'Invite people experiencing loss (death, divorce, job loss, etc.)'
      },
      {
        type: 'prompt',
        label: 'Create ritual space for sharing grief stories',
        content: 'Create ritual space for sharing grief stories'
      },
      {
        type: 'prompt',
        label: 'Facilitate without trying to "fix" or rush healing',
        content: 'Facilitate without trying to "fix" or rush healing'
      },
      {
        type: 'prompt',
        label: 'Let people witness each other\'s pain without judgment',
        content: 'Let people witness each other\'s pain without judgment'
      }
    ],
    freeItems: [
      'Sacred space for gathering',
      'Ritual elements (candles, tissues, etc.)',
      'Facilitation skills',
      'Emotional resilience'
    ],
    nicheItems: [
      {
        type: 'product',
        label: 'Himalayan Salt Tears Holder',
        content: 'Handcrafted vessel that grief counselors use to hold symbolic tears during mourning rituals',
        url: 'https://amazon.com/dp/B00B1ZJ8YQ?tag=solara02-20',
        affiliate: {
          program: 'Amazon Associates',
          commission: 'Up to 10%',
          tracking: '24 hours'
        },
        productImage: '/api/placeholder/200/200',
        price: '$23',
        category: 'tools'
      }
    ]
  },
  {
    id: 'nurturer-9',
    type: 'activity',
    title: 'Compassionate Witness Training',
    description: 'Practice being a compassionate witness to others\' suffering without trying to fix it. Learn to hold space for pain without taking it on.',
    quote: 'I hold space for others\' pain without making it my own.',
    journalPrompt: 'How did being a compassionate witness change your approach to helping others? What did you learn about holding space?',
    archetype: 'Sol Nurturer',
    rarity: 'rare',
    icon: '👁️',
    color: 'bg-green-100 border-green-300',
    tags: ['compassion', 'witnessing', 'support'],
    duration: '1 month',
    difficulty: 'hard',
    timeOfDay: 'anytime',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Practice active listening without offering solutions',
        content: 'Practice active listening without offering solutions'
      },
      {
        type: 'prompt',
        label: 'Learn to validate feelings without fixing problems',
        content: 'Learn to validate feelings without fixing problems'
      },
      {
        type: 'prompt',
        label: 'Develop emotional boundaries while staying present',
        content: 'Develop emotional boundaries while staying present'
      },
      {
        type: 'prompt',
        label: 'Practice self-care after witnessing difficult emotions',
        content: 'Practice self-care after witnessing difficult emotions'
      }
    ],
    freeItems: [
      'Active listening skills',
      'Emotional resilience',
      'Self-care practices',
      'Support network for yourself'
    ],
    nicheItems: []
  },
  // Legendary Activities (5% probability)
  {
    id: 'nurturer-10',
    type: 'activity',
    title: 'Community Resilience Architecture',
    description: 'Design and implement a neighborhood mutual aid network that activates automatically during crises and celebrates automatically during joys.',
    quote: 'I architect networks of care that strengthen with every use.',
    journalPrompt: 'What resilience network did you create? How did designing automatic care systems change your community?',
    archetype: 'Sol Nurturer',
    rarity: 'legendary',
    icon: '🏘️',
    color: 'bg-pink-100 border-pink-300',
    tags: ['community', 'resilience', 'network'],
    duration: '6 months',
    difficulty: 'hard',
    timeOfDay: 'anytime',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Map every household\'s needs and gifts',
        content: 'Map every household\'s needs and gifts'
      },
      {
        type: 'prompt',
        label: 'Create communication systems for crisis response and celebration',
        content: 'Create communication systems for crisis response and celebration'
      },
      {
        type: 'prompt',
        label: 'Design automatic triggers for community support',
        content: 'Design automatic triggers for community support'
      },
      {
        type: 'prompt',
        label: 'Center gatherings around seasonal celebrations and natural rhythms',
        content: 'Center gatherings around seasonal celebrations and natural rhythms'
      }
    ],
    freeItems: [
      'Community organizing skills',
      'Communication systems',
      'Neighborhood connections',
      'Long-term commitment'
    ],
    nicheItems: [
      {
        type: 'product',
        label: 'Neighborhood Communication Hub Kit',
        content: 'Analog bulletin board system that resilient communities use for crisis coordination',
        url: 'https://amazon.com/dp/B00B1ZJ8YQ?tag=solara02-20',
        affiliate: {
          program: 'Amazon Associates',
          commission: 'Up to 10%',
          tracking: '24 hours'
        },
        productImage: '/api/placeholder/200/200',
        price: '$199',
        category: 'tools'
      }
    ]
  },
  {
    id: 'nurturer-11',
    type: 'activity',
    title: 'Healing Institution Founder',
    description: 'Establish a new institution focused on community healing - healing café, grief support center, intergenerational program, or wellness cooperative.',
    quote: 'I plant healing sanctuaries that bloom for generations.',
    journalPrompt: 'What healing institution did you create? How did founding a space for healing change your community?',
    archetype: 'Sol Nurturer',
    rarity: 'legendary',
    icon: '🏥',
    color: 'bg-pink-100 border-pink-300',
    tags: ['institution', 'healing', 'community'],
    duration: '1 year',
    difficulty: 'hard',
    timeOfDay: 'anytime',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Identify healing gap in your community',
        content: 'Identify healing gap in your community'
      },
      {
        type: 'prompt',
        label: 'Design institution that serves multiple generations',
        content: 'Design institution that serves multiple generations'
      },
      {
        type: 'prompt',
        label: 'Create sustainable funding and volunteer model',
        content: 'Create sustainable funding and volunteer model'
      },
      {
        type: 'prompt',
        label: 'Launch with community celebration and ongoing programming',
        content: 'Launch with community celebration and ongoing programming'
      }
    ],
    freeItems: [
      'Vision for healing',
      'Community support',
      'Organizational skills',
      'Dedication to long-term service'
    ],
    nicheItems: []
  }
];