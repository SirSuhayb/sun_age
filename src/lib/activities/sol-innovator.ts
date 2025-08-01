import type { DailyRoll } from '../surpriseMe';

export const activities: DailyRoll[] = [
  // Common Activities (70% probability)
  {
    id: 'innovator-1',
    type: 'activity',
    title: 'Dawn Lightning Session',
    description: 'Set your alarm for sunrise. Go outside for 20 minutes and capture every wild idea that comes to you. Your Sol Innovator frequency peaks when the earth tilts toward light.',
    quote: 'At first light, tomorrow\'s secrets descend like cosmic downloads.',
    journalPrompt: 'What impossible idea downloaded during your lightning session?',
    archetype: 'Sol Innovator',
    rarity: 'common',
    icon: '⚡',
    color: 'bg-yellow-100 border-yellow-300',
    tags: ['morning', 'creativity', 'ideation'],
    duration: '30 minutes',
    difficulty: 'easy',
    timeOfDay: 'morning',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Set alarm for 30 minutes before sunrise',
        content: 'Set alarm for 30 minutes before sunrise'
      },
      {
        type: 'prompt',
        label: 'Go outside facing east with recording device',
        content: 'Go outside facing east with recording device of your choice'
      },
      {
        type: 'prompt',
        label: 'Capture every idea for 20 minutes',
        content: 'Capture every idea for 20 minutes—no editing allowed'
      },
      {
        type: 'prompt',
        label: 'Review and pick your favorite breakthrough',
        content: 'Review and pick your favorite breakthrough'
      },
      {
        type: 'link',
        label: 'Headless Brands Research',
        content: 'Explore how decentralized brands emerge and evolve without central control',
        url: 'https://otherinter.net/research/headless-brands/'
      }
    ],
    freeItems: [
      'Voice memo app on your phone'
    ],
    nicheItems: [
      {
        type: 'product',
        label: 'Teenage Engineering TP7 Field Recorder',
        content: 'Professional audio recorder for capturing breakthrough ideas and interviews',
        url: 'https://amzn.to/4nPXlbc',
        affiliate: {
          program: 'Amazon Associates',
          commission: 'Up to 10%',
          tracking: '24 hours'
        },
        productImage: 'https://m.media-amazon.com/images/I/71wWHYYD4SL._AC_SX679_.jpg',
        price: '$1,499',
        category: 'tools'
      },
      {
        type: 'product',
        label: "The Innovator's Dilemma by Clayton Christensen",
        content: 'Essential reading for innovators understanding disruption and breakthrough',
        url: 'https://amzn.to/4lCnLfa',
        affiliate: {
          program: 'Amazon Associates',
          commission: 'Up to 10%',
          tracking: '24 hours'
        },
        productImage: 'https://m.media-amazon.com/images/I/618BdBwK5ML._SY522_.jpg',
        price: '$37.05',
        category: 'books'
      }
    ]
  },
  {
    id: 'innovator-2',
    type: 'activity',
    title: 'Reverse Archaeology',
    description: 'Find something everyone says "will never work" and architect exactly how it could. Spend 2 hours building the impossible blueprint.',
    quote: 'I excavate breakthrough from the ruins of \'never possible\'.',
    journalPrompt: 'What "impossible" breakthrough did you architect? What resistance did you overcome?',
    archetype: 'Sol Innovator',
    rarity: 'common',
    icon: '🏺',
    color: 'bg-yellow-100 border-yellow-300',
    tags: ['research', 'problem-solving', 'innovation'],
    duration: '2 hours',
    difficulty: 'medium',
    timeOfDay: 'anytime',
    actionableSteps: [
      {
        type: 'link',
        label: 'Research failed inventions',
        content: 'Research "failed" inventions on Reddit or tech forums',
        url: 'https://www.reddit.com/r/technology/search/?q=failed%20inventions&restrict_sr=1&sort=new'
      },
      {
        type: 'link',
        label: 'Explore Google Patents',
        content: 'Explore Google Patents for "failed" inventions from 1990-2010',
        url: 'https://patents.google.com/'
      },
      {
        type: 'prompt',
        label: 'Choose one that still excites you',
        content: 'Choose one that still excites you'
      },
      {
        type: 'prompt',
        label: 'Sketch or wireframe how it could work',
        content: 'Sketch or wireframe how it could actually work'
      },
      {
        type: 'prompt',
        label: 'Document your breakthrough path',
        content: 'Document your breakthrough path'
      }
    ],
    freeItems: [
      'Wikipedia\'s "List of Hypothetical Technologies" page',
      'Google Patents database and Internet Archive'
    ],
    nicheItems: [
      {
        type: 'product',
        label: 'Rhodia Webnotebook A5 - French-made dot grid notebook',
        content: 'French-made dot grid notebook for innovation journaling',
        url: 'https://amzn.to/3UfJ8H3',
        affiliate: {
          program: 'Amazon Associates',
          commission: 'Up to 10%',
          tracking: '24 hours'
        },
        productImage: 'https://m.media-amazon.com/images/I/71NJrY7ob4L._SY522_.jpg',
        price: '$24.40',
        category: 'tools'
      },
      {
        type: 'product',
        label: 'Leuchtturm1917 Bauhaus Edition Notebook',
        content: 'Bauhaus Edition notebook for creative breakthroughs',
        url: 'https://amzn.to/3Iv4vS9',
        affiliate: {
          program: 'Amazon Associates',
          commission: 'Up to 10%',
          tracking: '24 hours'
        },
        productImage: 'https://m.media-amazon.com/images/I/51kk3zFKSQL._AC_SX679_.jpg',
        price: '$25.46',
        category: 'tools'
      }
    ]
  },
  {
    id: 'innovator-3',
    type: 'activity',
    title: 'Micro-Disruption Lab',
    description: 'Find one tiny inconvenience in your daily routine and engineer a micro-solution. Sometimes the smallest innovations create the biggest waves.',
    quote: 'Small sparks ignite the greatest revolutions.',
    journalPrompt: 'How did solving a tiny problem reveal a massive opportunity?',
    archetype: 'Sol Innovator',
    rarity: 'common',
    icon: '🔧',
    color: 'bg-yellow-100 border-yellow-300',
    tags: ['problem-solving', 'prototyping', 'innovation'],
    duration: '1 hour',
    difficulty: 'easy',
    timeOfDay: 'anytime',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Document 5 daily micro-annoyances',
        content: 'Document 5 daily micro-annoyances'
      },
      {
        type: 'prompt',
        label: 'Choose the most solvable one',
        content: 'Choose the most solvable one'
      },
      {
        type: 'prompt',
        label: 'Create a 10-minute solution prototype',
        content: 'Create a 10-minute solution prototype'
      },
      {
        type: 'prompt',
        label: 'Test it for 24 hours',
        content: 'Test it for 24 hours'
      }
    ],
    freeItems: [
      'Cardboard and tape for rapid prototyping'
    ],
    nicheItems: [
      {
        type: 'product',
        label: 'Sugru Moldable Glue 8-pack',
        content: 'Self-setting rubber for micro-innovation prototyping',
        url: 'https://amzn.to/4kGQQog',
        affiliate: {
          program: 'Amazon Associates',
          commission: 'Up to 10%',
          tracking: '24 hours'
        },
        productImage: 'https://m.media-amazon.com/images/I/71Vwdmn+OyL._SX522_.jpg',
        price: '$26.35',
        category: 'tools'
      }
    ]
  },
  // Rare Activities (25% probability)
  {
    id: 'innovator-4',
    type: 'activity',
    title: 'Innovation Constellation',
    description: 'Convene 3 people from completely different fields around one problem none of you can solve alone. Meet outdoors under actual stars.',
    quote: 'Lightning strikes twice when separate brilliances align under starlight.',
    journalPrompt: 'How did different perspectives create breakthrough? What emerged from the collision of minds?',
    archetype: 'Sol Innovator',
    rarity: 'rare',
    icon: '⭐',
    color: 'bg-purple-100 border-purple-300',
    tags: ['collaboration', 'networking', 'innovation'],
    duration: '3 hours',
    difficulty: 'hard',
    timeOfDay: 'evening',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Identify one impossible problem',
        content: 'Identify one impossible problem that excites you'
      },
      {
        type: 'prompt',
        label: 'Recruit diverse trio',
        content: 'Recruit artist + engineer + philosopher (or equivalent diverse trio)'
      },
      {
        type: 'prompt',
        label: 'Meet outdoors under stars',
        content: 'Meet outdoors where you can see actual constellations'
      },
      {
        type: 'prompt',
        label: 'Document the breakthrough',
        content: 'Document the breakthrough that emerges from collision'
      }
    ],
    freeItems: [
      'Blanket + thermos for outdoor meetings'
    ],
    nicheItems: [
      {
        type: 'product',
        label: 'Celestron SkyMaster 15x70 Binoculars',
        content: 'Astronomy binoculars for stargazing and idea mapping',
        url: 'https://amzn.to/44PXz9P',
        affiliate: {
          program: 'Amazon Associates',
          commission: 'Up to 10%',
          tracking: '24 hours'
        },
        productImage: 'https://m.media-amazon.com/images/I/51OwHKeZOEL._AC_SX679_.jpg',
        price: '$89',
        category: 'tools'
      }
    ]
  },
  {
    id: 'innovator-5',
    type: 'activity',
    title: 'Solar Prototype Racing',
    description: 'Challenge another innovator to build competing prototypes of the same idea in 3 hours. Test with real users the same day.',
    quote: 'Speed of light thinking requires speed of light building.',
    journalPrompt: 'What did rapid prototyping reveal about your idea? How did competition change your thinking?',
    archetype: 'Sol Innovator',
    rarity: 'rare',
    icon: '🏁',
    color: 'bg-purple-100 border-purple-300',
    tags: ['competition', 'prototyping', 'testing'],
    duration: '3 hours',
    difficulty: 'hard',
    timeOfDay: 'afternoon',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Find your innovation rival',
        content: 'Find your innovation rival through maker spaces or online'
      },
      {
        type: 'prompt',
        label: 'Choose shared impossible idea',
        content: 'Choose one shared "impossible" idea'
      },
      {
        type: 'prompt',
        label: 'Set 3-hour timer and build',
        content: 'Set 3-hour timer and build competing prototypes'
      },
      {
        type: 'prompt',
        label: 'Test with real users',
        content: 'Test both with 5 real users immediately'
      }
    ],
    freeItems: [
      'Cardboard, tape, and basic crafting supplies'
    ],
    nicheItems: [
      {
        type: 'product',
        label: 'Instax Mini Link 2 Instant Printer',
        content: 'Instant printer for rapid prototyping feedback',
        url: 'https://amzn.to/3GMaIsr',
        affiliate: {
          program: 'Amazon Associates',
          commission: 'Up to 10%',
          tracking: '24 hours'
        },
        productImage: 'https://m.media-amazon.com/images/I/717HaP3bttL._AC_SX679_.jpg',
        price: '$149.95',
        category: 'tools'
      }
    ]
  },

  // Legendary Activities (5% probability)
  {
    id: 'innovator-7',
    type: 'activity',
    title: 'Prometheus Protocol',
    description: 'Identify a technology that only exists in sci-fi. Recruit a team of 5+ people to build a working prototype within 90 days. Document the entire journey.',
    quote: 'I steal fire from the gods of impossibility and gift it to humanity.',
    journalPrompt: 'What will you steal from the gods? How will you gift it to humanity?',
    archetype: 'Sol Innovator',
    rarity: 'legendary',
    icon: '🔥',
    color: 'bg-yellow-100 border-yellow-300',
    tags: ['team-building', 'prototyping', 'documentation'],
    duration: '90 days',
    difficulty: 'hard',
    timeOfDay: 'anytime',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Choose sci-fi technology',
        content: 'Choose sci-fi technology that excites you most'
      },
      {
        type: 'prompt',
        label: 'Recruit diverse team',
        content: 'Recruit diverse team through YC network, university labs, maker spaces'
      },
      {
        type: 'prompt',
        label: 'Break into 90-day milestones',
        content: 'Break impossible into 90-day milestones'
      },
      {
        type: 'prompt',
        label: 'Document every breakthrough',
        content: 'Document every breakthrough and failure'
      }
    ],
    freeItems: [
      'Discord server for team coordination'
    ],
    nicheItems: [
      {
        type: 'product',
        label: 'Make: Electronics',
        content: 'Hands-on electronics book for innovators',
        url: 'https://amzn.to/4m2qoqz',
        affiliate: {
          program: 'Amazon Associates',
          commission: 'Up to 10%',
          tracking: '24 hours'
        },
        productImage: 'https://m.media-amazon.com/images/I/71v+rxNWFEL._SY522_.jpg',
        price: '$19.29',
        category: 'books'
      },
      {
        type: 'product',
        label: 'Vilros Raspberry Pi 4 Complete Starter Kit',
        content: 'Raspberry Pi kit for rapid prototyping',
        url: 'https://amzn.to/453vMUx',
        affiliate: {
          program: 'Amazon Associates',
          commission: 'Up to 10%',
          tracking: '24 hours'
        },
        productImage: 'https://m.media-amazon.com/images/I/91BoSluMdjL._AC_SX679_.jpg',
        price: '$117.99',
        category: 'tools'
      },
      {
        type: 'product',
        label: 'FLASHFORGE Adventurer 5M 3D Printer',
        content: '3D printer for building prototypes',
        url: 'https://amzn.to/4lARt4h',
        affiliate: {
          program: 'Amazon Associates',
          commission: 'Up to 10%',
          tracking: '24 hours'
        },
        productImage: 'https://m.media-amazon.com/images/I/71lL+5cwJLL._AC_SX679_.jpg',
        price: '$259',
        category: 'tools'
      },
      {
        type: 'product',
        label: 'Futuria: Art of the Sci-Fi Age',
        content: 'Book on sci-fi art and future technology',
        url: 'https://amzn.to/4kJt9fg',
        affiliate: {
          program: 'Amazon Associates',
          commission: 'Up to 10%',
          tracking: '24 hours'
        },
        productImage: 'https://m.media-amazon.com/images/I/71+Rulg5SLL._SY522_.jpg',
        price: '$34.78',
        category: 'books'
      }
    ]
  },
  {
    id: 'innovator-8',
    type: 'activity',
    title: 'Reality Distortion Field',
    description: 'Choose one "impossible" idea and make it feel inevitable by documenting your conviction so powerfully that others start believing too. Use pure belief as your reality-bending tool.',
    quote: 'I bend the laws of \'practical\' until impossible becomes inevitable.',
    journalPrompt: 'How did documenting your conviction change others\' belief in the impossible? What happens when you refuse to accept "can\'t be done"?',
    archetype: 'Sol Innovator',
    rarity: 'legendary',
    icon: '🌀',
    color: 'bg-yellow-100 border-yellow-300',
    tags: ['impossible', 'breakthrough', 'public'],
    duration: '3 months',
    difficulty: 'hard',
    timeOfDay: 'anytime',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Choose one impossible idea you genuinely believe could work',
        content: 'Choose one impossible idea you genuinely believe could work'
      },
      {
        type: 'prompt',
        label: 'Create compelling documentation: write, video, or visual proof of concept',
        content: 'Create compelling documentation: write, video, or visual proof of concept'
      },
      {
        type: 'prompt',
        label: 'Share with increasing conviction across different platforms/communities',
        content: 'Share with increasing conviction across different platforms/communities'
      },
      {
        type: 'prompt',
        label: 'Track how your certainty influences others\' perception of possibility',
        content: 'Track how your certainty influences others\' perception of possibility'
      }
    ],
    freeItems: [
      'Phone camera + social media platforms for documentation'
    ],
    nicheItems: [
      {
        type: 'product',
        label: 'Screen Studio',
        content: 'Video documentation tool that thought leaders use to make ideas feel inevitable',
        url: 'https://screen.studio/',
        productImage: '/api/placeholder/200/200',
        price: '$96/year',
        category: 'tools'
      }
    ]
  }
];