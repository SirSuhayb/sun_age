import type { DailyRoll } from '../surpriseMe';

export const activities: DailyRoll[] = [
  // Common Activities (70% probability)
  {
    id: 'alchemist-1',
    type: 'activity',
    title: 'Transformation Ritual Design',
    description: 'Create a personal ritual that transforms one aspect of your life. Use symbolic elements, timing, and intention to catalyze change.',
    quote: 'I craft rituals that transmute the lead of limitation into the gold of possibility.',
    journalPrompt: 'What transformation ritual did you create? How did the ritual process change your relationship to change?',
    archetype: 'Sol Alchemist',
    rarity: 'common',
    icon: '⚗️',
    color: 'bg-orange-100 border-orange-300',
    tags: ['transformation', 'ritual', 'change'],
    duration: '1 hour',
    difficulty: 'easy',
    timeOfDay: 'anytime',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Choose one aspect of your life to transform',
        content: 'Choose one aspect of your life to transform'
      },
      {
        type: 'prompt',
        label: 'Design a ritual with symbolic elements',
        content: 'Design a ritual with symbolic elements'
      },
      {
        type: 'prompt',
        label: 'Set clear intention and timing',
        content: 'Set clear intention and timing'
      },
      {
        type: 'prompt',
        label: 'Perform the ritual with full presence',
        content: 'Perform the ritual with full presence'
      }
    ],
    freeItems: [
      'Symbolic elements for your ritual',
      'Quiet space for performance',
      'Clear intention and focus',
      'Openness to transformation'
    ],
    nicheItems: []
  },
  {
    id: 'alchemist-2',
    type: 'activity',
    title: 'Shadow Solar Eclipse Work',
    description: 'During new moon or cloudy days, consciously work with a shadow aspect of yourself. Turn self-criticism into self-compassion through alchemical practice.',
    quote: 'I embrace my shadows to find the hidden light within.',
    journalPrompt: 'What shadow aspect did you work with? How did embracing your shadow change your self-compassion?',
    archetype: 'Sol Alchemist',
    rarity: 'common',
    icon: '🌑',
    color: 'bg-orange-100 border-orange-300',
    tags: ['shadow', 'transformation', 'healing'],
    duration: '30 minutes',
    difficulty: 'medium',
    timeOfDay: 'evening',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Check moon phases and choose new moon or overcast day',
        content: 'Check moon phases and choose new moon or overcast day'
      },
      {
        type: 'prompt',
        label: 'Identify one shadow aspect you usually avoid',
        content: 'Identify one shadow aspect you usually avoid'
      },
      {
        type: 'prompt',
        label: 'Spend 30 minutes dialoguing with it outdoors',
        content: 'Spend 30 minutes dialoguing with it outdoors'
      },
      {
        type: 'prompt',
        label: 'Find the hidden gift within the shadow trait',
        content: 'Find the hidden gift within the shadow trait'
      }
    ],
    freeItems: [
      'Moon phase calendar',
      'Quiet outdoor space',
      'Journal for shadow work',
      'Self-compassion practices'
    ],
    nicheItems: []
  },
  {
    id: 'alchemist-3',
    type: 'activity',
    title: 'Poison into Medicine Alchemy',
    description: 'Identify your deepest wound and create something that helps others heal the same pain. Transform personal poison into collective medicine.',
    quote: 'I transmute my deepest wounds into medicine for others.',
    journalPrompt: 'What wound did you transform into medicine? How did helping others heal change your own healing?',
    archetype: 'Sol Alchemist',
    rarity: 'common',
    icon: '⚗️',
    color: 'bg-orange-100 border-orange-300',
    tags: ['healing', 'transformation', 'medicine'],
    duration: '2 hours',
    difficulty: 'medium',
    timeOfDay: 'anytime',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Identify your most transformed wound or struggle',
        content: 'Identify your most transformed wound or struggle'
      },
      {
        type: 'prompt',
        label: 'Create something that helps others with similar pain',
        content: 'Create something that helps others with similar pain'
      },
      {
        type: 'prompt',
        label: 'Share your transformation story with someone who needs it',
        content: 'Share your transformation story with someone who needs it'
      },
      {
        type: 'prompt',
        label: 'Document how your medicine helps others heal',
        content: 'Document how your medicine helps others heal'
      }
    ],
    freeItems: [
      'Courage to face your wounds',
      'Creative expression tools',
      'Willingness to share your story',
      'Empathy for others\' pain'
    ],
    nicheItems: []
  },
  {
    id: 'alchemist-4',
    type: 'activity',
    title: 'Emotional Transmutation Lab',
    description: 'Take a challenging emotion you\'re experiencing and consciously alchemize it into something constructive. Use emotional energy as raw material for creation.',
    quote: 'I transform emotional chaos into creative order.',
    journalPrompt: 'What emotion did you transmute? How did using emotional energy as fuel change your creative process?',
    archetype: 'Sol Alchemist',
    rarity: 'common',
    icon: '🔬',
    color: 'bg-orange-100 border-orange-300',
    tags: ['emotion', 'transformation', 'creation'],
    duration: '1 hour',
    difficulty: 'medium',
    timeOfDay: 'anytime',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Name the difficult emotion you\'re currently experiencing',
        content: 'Name the difficult emotion you\'re currently experiencing'
      },
      {
        type: 'prompt',
        label: 'Feel it fully without trying to change it',
        content: 'Feel it fully without trying to change it'
      },
      {
        type: 'prompt',
        label: 'Channel that energy into productive action',
        content: 'Channel that energy into productive action'
      },
      {
        type: 'prompt',
        label: 'Create something meaningful from the emotional fuel',
        content: 'Create something meaningful from the emotional fuel'
      }
    ],
    freeItems: [
      'Emotional awareness',
      'Creative expression tools',
      'Willingness to feel difficult emotions',
      'Focus on constructive action'
    ],
    nicheItems: []
  },
  // Rare Activities (25% probability)
  {
    id: 'alchemist-5',
    type: 'activity',
    title: 'Collective Trauma Alchemy',
    description: 'Research collective trauma in your community and organize a healing ritual or restorative project that addresses it historically and spiritually.',
    quote: 'I transmute collective wounds into shared wisdom and strength.',
    journalPrompt: 'What collective trauma did you address? How did facilitating collective healing change your understanding of transformation?',
    archetype: 'Sol Alchemist',
    rarity: 'rare',
    icon: '🏛️',
    color: 'bg-indigo-100 border-indigo-300',
    tags: ['collective', 'trauma', 'healing'],
    duration: '3 months',
    difficulty: 'hard',
    timeOfDay: 'anytime',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Research historical trauma in your community',
        content: 'Research historical trauma in your community'
      },
      {
        type: 'prompt',
        label: 'Partner with affected communities for authentic healing',
        content: 'Partner with affected communities for authentic healing'
      },
      {
        type: 'prompt',
        label: 'Design respectful ritual or restorative project',
        content: 'Design respectful ritual or restorative project'
      },
      {
        type: 'prompt',
        label: 'Hold healing ceremony in location connected to original trauma',
        content: 'Hold healing ceremony in location connected to original trauma'
      }
    ],
    freeItems: [
      'Research resources',
      'Community partnerships',
      'Ritual planning skills',
      'Sacred space for ceremony'
    ],
    nicheItems: [
      {
        type: 'product',
        label: 'Sage Smudge Bundle Making Kit',
        content: 'Traditional cleansing herbs that indigenous healers use for collective trauma work',
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
    id: 'alchemist-6',
    type: 'activity',
    title: 'Elements Transformation Workshop',
    description: 'Design workshop that teaches 10+ people to transform suffering into wisdom using natural elements as metaphors and healing partners.',
    quote: 'I teach others to dance with the elements of transformation.',
    journalPrompt: 'How did teaching elemental transformation change your own practice? What did participants discover?',
    archetype: 'Sol Alchemist',
    rarity: 'rare',
    icon: '🌊',
    color: 'bg-indigo-100 border-indigo-300',
    tags: ['workshop', 'elements', 'teaching'],
    duration: '1 day',
    difficulty: 'hard',
    timeOfDay: 'anytime',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Design curriculum using earth, water, fire, air as teachers',
        content: 'Design curriculum using earth, water, fire, air as teachers'
      },
      {
        type: 'prompt',
        label: 'Recruit participants through healing communities',
        content: 'Recruit participants through healing communities'
      },
      {
        type: 'prompt',
        label: 'Hold workshop entirely outdoors with natural elements',
        content: 'Hold workshop entirely outdoors with natural elements'
      },
      {
        type: 'prompt',
        label: 'Create follow-up support for ongoing transformation',
        content: 'Create follow-up support for ongoing transformation'
      }
    ],
    freeItems: [
      'Outdoor workshop space',
      'Teaching materials',
      'Access to natural elements',
      'Facilitation skills'
    ],
    nicheItems: [
      {
        type: 'product',
        label: 'Portable Copper Fire Bowl',
        content: 'Sacred fire vessel that transformation workshops use for releasing old patterns',
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
    id: 'alchemist-7',
    type: 'activity',
    title: 'Relationship Alchemy Laboratory',
    description: 'Heal a broken relationship through conscious alchemical work. Use conflict as raw material for deeper understanding and connection.',
    quote: 'I transform relationship wounds into bridges of understanding.',
    journalPrompt: 'What relationship did you heal? How did alchemical work transform the connection?',
    archetype: 'Sol Alchemist',
    rarity: 'rare',
    icon: '💝',
    color: 'bg-indigo-100 border-indigo-300',
    tags: ['relationship', 'healing', 'connection'],
    duration: '1 month',
    difficulty: 'hard',
    timeOfDay: 'anytime',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Choose one relationship that needs healing',
        content: 'Choose one relationship that needs healing'
      },
      {
        type: 'prompt',
        label: 'Take responsibility for your part without blaming',
        content: 'Take responsibility for your part without blaming'
      },
      {
        type: 'prompt',
        label: 'Create ritual space for honest communication',
        content: 'Create ritual space for honest communication'
      },
      {
        type: 'prompt',
        label: 'Transform conflict into deeper understanding',
        content: 'Transform conflict into deeper understanding'
      }
    ],
    freeItems: [
      'Willingness to heal',
      'Communication skills',
      'Safe space for dialogue',
      'Patience for the process'
    ],
    nicheItems: [
      {
        type: 'product',
        label: 'Nonviolent Communication Card Deck',
        content: 'Conversation tools that relationship alchemists use to transform conflict',
        url: 'https://amazon.com/dp/B00B1ZJ8YQ?tag=solara02-20',
        affiliate: {
          program: 'Amazon Associates',
          commission: 'Up to 10%',
          tracking: '24 hours'
        },
        productImage: '/api/placeholder/200/200',
        price: '$24',
        category: 'tools'
      }
    ]
  },
  {
    id: 'alchemist-8',
    type: 'activity',
    title: 'Limitation Liberation Ritual',
    description: 'Identify one limitation you\'ve accepted and create a ritual to break free from it. Use symbolic actions to transform self-imposed boundaries.',
    quote: 'I dissolve the chains of limitation through the power of ritual transformation.',
    journalPrompt: 'What limitation did you break free from? How did the liberation ritual change your sense of possibility?',
    archetype: 'Sol Alchemist',
    rarity: 'rare',
    icon: '🔓',
    color: 'bg-orange-100 border-orange-300',
    tags: ['liberation', 'ritual', 'transformation'],
    duration: '2 hours',
    difficulty: 'hard',
    timeOfDay: 'anytime',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Identify one limitation you\'ve accepted',
        content: 'Identify one limitation you\'ve accepted'
      },
      {
        type: 'prompt',
        label: 'Design a ritual to break free from it',
        content: 'Design a ritual to break free from it'
      },
      {
        type: 'prompt',
        label: 'Perform the ritual with full intention',
        content: 'Perform the ritual with full intention'
      },
      {
        type: 'prompt',
        label: 'Document the transformation and new possibilities',
        content: 'Document the transformation and new possibilities'
      }
    ],
    freeItems: [
      'Symbolic elements for your ritual',
      'Courage to face limitations',
      'Clear intention and focus',
      'Willingness to change'
    ],
    nicheItems: []
  },
  // Legendary Activities (5% probability)
  {
    id: 'alchemist-9',
    type: 'activity',
    title: 'Generational Pattern Breaker',
    description: 'Map destructive patterns across 3+ generations of your family/culture. Create comprehensive intervention that breaks the cycle permanently.',
    quote: 'I shatter the chains that bind generations to repeating pain.',
    journalPrompt: 'What generational pattern did you break? How did breaking ancestral cycles change your lineage?',
    archetype: 'Sol Alchemist',
    rarity: 'legendary',
    icon: '🔗',
    color: 'bg-indigo-100 border-indigo-300',
    tags: ['generations', 'patterns', 'healing'],
    duration: '1 year',
    difficulty: 'hard',
    timeOfDay: 'anytime',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Research family patterns across 3+ generations',
        content: 'Research family patterns across 3+ generations'
      },
      {
        type: 'prompt',
        label: 'Map destructive cycles and their origins',
        content: 'Map destructive cycles and their origins'
      },
      {
        type: 'prompt',
        label: 'Involve willing family members in healing work',
        content: 'Involve willing family members in healing work'
      },
      {
        type: 'prompt',
        label: 'Create new traditions connected to natural cycles',
        content: 'Create new traditions connected to natural cycles'
      }
    ],
    freeItems: [
      'Family history research',
      'Healing modalities',
      'Support from willing family',
      'Long-term commitment'
    ],
    nicheItems: [
      {
        type: 'product',
        label: 'Ancestral Healing Ritual Kit',
        content: 'Traditional ceremony supplies that lineage healers use to break generational patterns',
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
    id: 'alchemist-10',
    type: 'activity',
    title: 'Community Shadow Integration',
    description: 'Address and transform a collective shadow or wound in your community through organized healing work, truth-telling, and restorative practices.',
    quote: 'I illuminate the darkness we collectively refuse to see.',
    journalPrompt: 'What community shadow did you help integrate? How did collective shadow work transform your community?',
    archetype: 'Sol Alchemist',
    rarity: 'legendary',
    icon: '🌙',
    color: 'bg-indigo-100 border-indigo-300',
    tags: ['community', 'shadow', 'integration'],
    duration: '6 months',
    difficulty: 'hard',
    timeOfDay: 'anytime',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Identify community shadow that needs integration',
        content: 'Identify community shadow that needs integration'
      },
      {
        type: 'prompt',
        label: 'Create safe space for truth-telling and acknowledgment',
        content: 'Create safe space for truth-telling and acknowledgment'
      },
      {
        type: 'prompt',
        label: 'Design restorative practices that honor all affected',
        content: 'Design restorative practices that honor all affected'
      },
      {
        type: 'prompt',
        label: 'Establish ongoing healing practices for community',
        content: 'Establish ongoing healing practices for community'
      }
    ],
    freeItems: [
      'Community organizing skills',
      'Safe facilitation methods',
      'Restorative justice knowledge',
      'Long-term dedication'
    ],
    nicheItems: []
  },
  {
    id: 'alchemist-11',
    type: 'activity',
    title: 'Cosmic Transformation Portal',
    description: 'Create a transformation ritual that aligns with cosmic events. Use celestial timing to amplify your alchemical work.',
    quote: 'I open portals of transformation that align with the rhythms of the cosmos.',
    journalPrompt: 'What cosmic transformation portal did you create? How did aligning with celestial timing enhance your alchemical work?',
    archetype: 'Sol Alchemist',
    rarity: 'legendary',
    icon: '🌌',
    color: 'bg-orange-100 border-orange-300',
    tags: ['cosmic', 'transformation', 'ritual'],
    duration: '1 month',
    difficulty: 'hard',
    timeOfDay: 'anytime',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Choose a cosmic event to align with',
        content: 'Choose a cosmic event to align with (lunar phases, solar cycles, celestial alignments)'
      },
      {
        type: 'prompt',
        label: 'Design transformation ritual for that timing',
        content: 'Design transformation ritual for that timing'
      },
      {
        type: 'prompt',
        label: 'Perform the ritual during the cosmic event',
        content: 'Perform the ritual during the cosmic event'
      },
      {
        type: 'prompt',
        label: 'Document how cosmic alignment enhanced transformation',
        content: 'Document how cosmic alignment enhanced transformation'
      }
    ],
    freeItems: [
      'Astronomical knowledge',
      'Ritual space and materials',
      'Clear intention and focus',
      'Patience for cosmic timing'
    ],
    nicheItems: []
  }
];