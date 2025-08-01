import type { DailyRoll } from '../surpriseMe';

export const activities: DailyRoll[] = [
  // Common Activities (70% probability)
  {
    id: 'artist-1',
    type: 'activity',
    title: 'Golden Hour Alchemy',
    description: 'During golden hour, find the ugliest thing in your vicinity and reveal its hidden beauty through light, angle, or framing. Transform what others overlook.',
    quote: 'I reveal beauty hidden in the shadows of the overlooked.',
    journalPrompt: 'What hidden beauty did you discover? How did perspective change everything?',
    archetype: 'Sol Artist',
    rarity: 'common',
    icon: '🌅',
    color: 'bg-purple-100 border-purple-300',
    tags: ['photography', 'beauty', 'transformation'],
    duration: '1 hour',
    difficulty: 'easy',
    timeOfDay: 'evening',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Check golden hour timing',
        content: 'Check golden hour timing (1 hour before sunset)'
      },
      {
        type: 'prompt',
        label: 'Find the ugliest object',
        content: 'Find the ugliest object, building, or space near you'
      },
      {
        type: 'prompt',
        label: 'Use natural light and creative angles',
        content: 'Use natural light and creative angles to reveal beauty'
      },
      {
        type: 'prompt',
        label: 'Document the transformation',
        content: 'Document the transformation'
      }
    ],
    freeItems: [
      'Camera or phone',
      'Golden hour timing app'
    ],
    nicheItems: [
      {
        type: 'product',
        label: 'Westcott Flex 5-in-1 Reflector',
        content: 'Collapsible light reflector that street photographers use to bend harsh light into silk',
        url: 'https://amazon.com/dp/B002ZIMEMW?tag=solara02-20',
        affiliate: {
          program: 'Amazon Associates',
          commission: 'Up to 10%',
          tracking: '24 hours'
        },
        productImage: '/api/placeholder/200/200',
        price: '$31',
        category: 'tools'
      }
    ]
  },
  {
    id: 'artist-2',
    type: 'activity',
    title: 'Cosmic Color Alchemy',
    description: 'Choose one color that represents your current emotional state. Create art using only that color in 50 different shades. Let the color tell your story.',
    quote: 'I paint my soul\'s journey through the language of light.',
    journalPrompt: 'What story did your chosen color reveal? How did working with one color change your perspective?',
    archetype: 'Sol Artist',
    rarity: 'common',
    icon: '🎨',
    color: 'bg-purple-100 border-purple-300',
    tags: ['color', 'emotion', 'art'],
    duration: '2 hours',
    difficulty: 'easy',
    timeOfDay: 'anytime',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Choose one color that represents your current emotional state',
        content: 'Choose one color that represents your current emotional state'
      },
      {
        type: 'prompt',
        label: 'Create 50 different shades of that color',
        content: 'Create 50 different shades of that color using any medium'
      },
      {
        type: 'prompt',
        label: 'Use only those shades to create art',
        content: 'Use only those shades to create art that tells your story'
      }
    ],
    freeItems: [
      'Any art supplies you have',
      'Paper or canvas',
      'Your emotional awareness'
    ],
    nicheItems: [
      {
        type: 'product',
        label: 'Professional Color Wheel',
        content: 'Professional color wheel for artists to explore color relationships',
        url: 'https://amazon.com/dp/B08N5WRWNW?tag=solara02-20',
        affiliate: {
          program: 'Amazon Associates',
          commission: 'Up to 10%',
          tracking: '24 hours'
        },
        productImage: '/api/placeholder/200/200',
        price: '$15',
        category: 'tools'
      }
    ]
  },
  {
    id: 'artist-3',
    type: 'activity',
    title: 'Synesthetic Jam Session',
    description: 'Create art that blends two senses - paint what music looks like, compose what sunset sounds like, or sculpt what wind feels like.',
    quote: 'I translate the language of one sense into the poetry of another.',
    journalPrompt: 'What did you discover about the relationship between senses? How did synesthesia change your art?',
    archetype: 'Sol Artist',
    rarity: 'common',
    icon: '🎶',
    color: 'bg-purple-100 border-purple-300',
    tags: ['art', 'music', 'senses'],
    duration: '1 hour',
    difficulty: 'easy',
    timeOfDay: 'anytime',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Choose two senses to blend',
        content: 'Choose two senses to blend (sight + sound, touch + taste, etc.)'
      },
      {
        type: 'prompt',
        label: 'Record or experience your chosen sensory input',
        content: 'Record or experience your chosen sensory input'
      },
      {
        type: 'prompt',
        label: 'Translate it into a different sensory medium',
        content: 'Translate it into a different sensory medium'
      },
      {
        type: 'prompt',
        label: 'Create art that captures the crossover',
        content: 'Create art that captures the crossover'
      }
    ],
    freeItems: [
      'Any art supplies you have',
      'Recording device (phone works)',
      'Your senses and imagination'
    ],
    nicheItems: [
      {
        type: 'product',
        label: 'Korg Volca Keys',
        content: 'Analog synthesizer that lets you paint sounds and compose with color frequencies',
        url: 'https://amazon.com/dp/B00HH62VB6?tag=solara02-20',
        affiliate: {
          program: 'Amazon Associates',
          commission: 'Up to 10%',
          tracking: '24 hours'
        },
        productImage: '/api/placeholder/200/200',
        price: '$149',
        category: 'tools'
      }
    ]
  },
  {
    id: 'artist-4',
    type: 'activity',
    title: 'Emotional Archaeology',
    description: 'Dig through old photos, letters, or memories to find a forgotten emotion. Create art that resurrects and honors that feeling.',
    quote: 'I excavate the buried treasures of my heart.',
    journalPrompt: 'What forgotten emotion did you discover? How did resurrecting it change your art?',
    archetype: 'Sol Artist',
    rarity: 'common',
    icon: '🖼️',
    color: 'bg-purple-100 border-purple-300',
    tags: ['emotion', 'memory', 'art'],
    duration: '1 hour',
    difficulty: 'easy',
    timeOfDay: 'anytime',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Browse old photos/letters/journals',
        content: 'Browse old photos/letters/journals for emotional artifacts'
      },
      {
        type: 'prompt',
        label: 'Choose one forgotten feeling',
        content: 'Choose one forgotten feeling that still moves you'
      },
      {
        type: 'prompt',
        label: 'Create art that embodies that emotion',
        content: 'Create art that embodies that exact emotion'
      },
      {
        type: 'prompt',
        label: 'Share with someone who knew you during that time',
        content: 'Share with someone who knew you during that time'
      }
    ],
    freeItems: [
      'Old photos, letters, or journals',
      'Art supplies',
      'Emotional courage'
    ],
    nicheItems: [
      {
        type: 'product',
        label: 'Prismacolor Premier Soft Core Colored Pencils',
        content: 'Wax-based pencils that professional illustrators use for emotional depth',
        url: 'https://amazon.com/dp/B00006IEEU?tag=solara02-20',
        affiliate: {
          program: 'Amazon Associates',
          commission: 'Up to 10%',
          tracking: '24 hours'
        },
        productImage: '/api/placeholder/200/200',
        price: '$45',
        category: 'tools'
      }
    ]
  },
  {
    id: 'artist-5',
    type: 'activity',
    title: 'Imperfection Celebration',
    description: 'Create art that intentionally celebrates flaws, mistakes, and imperfections. Turn "errors" into the most beautiful parts of your work.',
    quote: 'I find beauty in the cracks where light gets in.',
    journalPrompt: 'What imperfections did you celebrate? How did embracing flaws change your creative process?',
    archetype: 'Sol Artist',
    rarity: 'common',
    icon: '✨',
    color: 'bg-purple-100 border-purple-300',
    tags: ['imperfection', 'beauty', 'art'],
    duration: '1 hour',
    difficulty: 'easy',
    timeOfDay: 'anytime',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Start with a "perfect" piece of art',
        content: 'Start with a "perfect" piece of art'
      },
      {
        type: 'prompt',
        label: 'Intentionally add "mistakes"',
        content: 'Intentionally add "mistakes" or imperfections'
      },
      {
        type: 'prompt',
        label: 'Make those imperfections the focal point',
        content: 'Make those imperfections the focal point of your art'
      }
    ],
    freeItems: [
      'Any art supplies you have',
      'Willingness to make "mistakes"',
      'Open mind about beauty'
    ],
    nicheItems: []
  },
  // Rare Activities (25% probability)
  {
    id: 'artist-6',
    type: 'activity',
    title: 'Beauty Intervention Squad',
    description: 'Assemble 3-5 other artists for a coordinated beauty intervention in a neglected public space. Leave it transformed but don\'t get arrested.',
    quote: 'I reveal beauty hidden in the shadows of the overlooked.',
    journalPrompt: 'How did transforming a neglected space change your understanding of beauty? What did the community response teach you?',
    archetype: 'Sol Artist',
    rarity: 'rare',
    icon: '🧑‍🎨',
    color: 'bg-purple-100 border-purple-300',
    tags: ['public art', 'community', 'beauty'],
    duration: '2 hours',
    difficulty: 'medium',
    timeOfDay: 'afternoon',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Scout neglected public spaces',
        content: 'Scout neglected public spaces that need beauty'
      },
      {
        type: 'prompt',
        label: 'Recruit 3-5 local artists',
        content: 'Recruit 3-5 local artists through Instagram or community boards'
      },
      {
        type: 'prompt',
        label: 'Plan temporary (legal) transformation',
        content: 'Plan temporary (legal) transformation using removable materials'
      },
      {
        type: 'prompt',
        label: 'Document before/after and community reactions',
        content: 'Document before/after and community reactions'
      }
    ],
    freeItems: [
      'Temporary art materials (chalk, flowers, etc.)',
      'Camera for documentation',
      '3-5 creative collaborators'
    ],
    nicheItems: [
      {
        type: 'product',
        label: 'Montana Chalk Spray Paint',
        content: 'Temporary street art medium that disappears with rain but photographs beautifully',
        url: 'https://amazon.com/dp/B00K6QFQ1A?tag=solara02-20',
        affiliate: {
          program: 'Amazon Associates',
          commission: 'Up to 10%',
          tracking: '24 hours'
        },
        productImage: '/api/placeholder/200/200',
        price: '$8/can',
        category: 'tools'
      }
    ]
  },
  {
    id: 'artist-7',
    type: 'activity',
    title: 'Empathy Canvas Project',
    description: 'Interview 5 people about the same emotional experience. Create a collaborative art piece that reveals the universal pattern underneath their unique stories.',
    quote: 'I paint the invisible threads that connect all human hearts.',
    journalPrompt: 'What universal patterns did you discover? How did empathy change your art?',
    archetype: 'Sol Artist',
    rarity: 'rare',
    icon: '🖌️',
    color: 'bg-purple-100 border-purple-300',
    tags: ['empathy', 'collaboration', 'art'],
    duration: '3 hours',
    difficulty: 'medium',
    timeOfDay: 'anytime',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Choose one universal emotion',
        content: 'Choose one universal emotion (heartbreak, joy, fear, wonder)'
      },
      {
        type: 'prompt',
        label: 'Interview 5 diverse people',
        content: 'Interview 5 diverse people about their experience with it'
      },
      {
        type: 'prompt',
        label: 'Find the common threads and unique expressions',
        content: 'Find the common threads and unique expressions'
      },
      {
        type: 'prompt',
        label: 'Create art that shows both unity and diversity',
        content: 'Create art that shows both unity and diversity'
      }
    ],
    freeItems: [
      'Interview skills and empathy',
      'Recording device (phone works)',
      'Art supplies for collaborative piece',
      'Open heart and listening skills'
    ],
    nicheItems: []
  },
  {
    id: 'artist-8',
    type: 'activity',
    title: 'Temporal Beauty Mapping',
    description: 'Document how beauty changes throughout one day. Create art that captures the evolution of light, mood, and aesthetic from dawn to dusk.',
    quote: 'I capture the fleeting moments of beauty that dance across time.',
    journalPrompt: 'How did beauty transform throughout the day? What patterns did you discover in temporal aesthetics?',
    archetype: 'Sol Artist',
    rarity: 'rare',
    icon: '⏰',
    color: 'bg-purple-100 border-purple-300',
    tags: ['time', 'beauty', 'observation'],
    duration: '1 day',
    difficulty: 'medium',
    timeOfDay: 'anytime',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Choose one location to observe',
        content: 'Choose one location to observe throughout the day'
      },
      {
        type: 'prompt',
        label: 'Document beauty at 6 different times',
        content: 'Document beauty at 6 different times (dawn, morning, noon, afternoon, dusk, night)'
      },
      {
        type: 'prompt',
        label: 'Create art that shows the evolution',
        content: 'Create art that shows the evolution of beauty over time'
      }
    ],
    freeItems: [
      'Camera or phone for documentation',
      'Notebook for observations',
      'Art supplies for final piece',
      'Patience to observe throughout the day'
    ],
    nicheItems: []
  },
  // Legendary Activities (5% probability)
  {
    id: 'artist-9',
    type: 'activity',
    title: 'Living Mandala Ceremony',
    description: 'Design and direct 50+ people in creating a temporary living mandala that can only be seen from above. Document its creation and natural dissolution.',
    quote: 'I orchestrate cosmic patterns through human hearts in motion.',
    journalPrompt: 'What emerged when 50+ souls moved as one? How did creating ephemeral beauty change your art?',
    archetype: 'Sol Artist',
    rarity: 'legendary',
    icon: '🌀',
    color: 'bg-purple-100 border-purple-300',
    tags: ['community', 'ceremony', 'art'],
    duration: '1 day',
    difficulty: 'hard',
    timeOfDay: 'anytime',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Design mandala pattern',
        content: 'Design mandala pattern that works with 50+ people'
      },
      {
        type: 'prompt',
        label: 'Coordinate through community centers, yoga studios, art collectives',
        content: 'Coordinate through community centers, yoga studios, art collectives'
      },
      {
        type: 'prompt',
        label: 'Choose location where pattern harmonizes with landscape',
        content: 'Choose location where pattern harmonizes with landscape'
      },
      {
        type: 'prompt',
        label: 'Document from above as it forms and dissolves',
        content: 'Document from above as it forms and dissolves'
      }
    ],
    freeItems: [
      'Community organizing skills',
      'Open space for formation',
      'Documentation equipment'
    ],
    nicheItems: [
      {
        type: 'product',
        label: 'DJI Mini 3 Drone',
        content: 'Compact drone that captures the cosmic perspective of human art formations',
        url: 'https://amazon.com/dp/B0B5N8L6Z2?tag=solara02-20',
        affiliate: {
          program: 'Amazon Associates',
          commission: 'Up to 10%',
          tracking: '24 hours'
        },
        productImage: '/api/placeholder/200/200',
        price: '$489',
        category: 'tools'
      }
    ]
  },
  {
    id: 'artist-10',
    type: 'activity',
    title: 'Transgenerational Art Bridge',
    description: 'Design an art project that requires collaboration between people who are 50+ years apart in age. Create something that bridges generational divides through shared creativity.',
    quote: 'I dance with the muse of unexpected partnerships.',
    journalPrompt: 'How did collaboration with a different discipline change your art? What cosmic synchronicity emerged?',
    archetype: 'Sol Artist',
    rarity: 'legendary',
    icon: '🌟',
    color: 'bg-purple-100 border-purple-300',
    tags: ['collaboration', 'synchronicity', 'art'],
    duration: '4 hours',
    difficulty: 'hard',
    timeOfDay: 'anytime',
    actionableSteps: [
      {
        type: 'prompt',
        label: 'Find someone from a different creative discipline',
        content: 'Find someone from a different creative discipline (musician, dancer, writer, etc.)'
      },
      {
        type: 'prompt',
        label: 'Share your creative processes with each other',
        content: 'Share your creative processes with each other'
      },
      {
        type: 'prompt',
        label: 'Create art that blends both disciplines',
        content: 'Create art that blends both disciplines in unexpected ways'
      },
      {
        type: 'prompt',
        label: 'Let cosmic synchronicity guide your choices',
        content: 'Let cosmic synchronicity guide your choices throughout the process'
      }
    ],
    freeItems: [
      'Open mind and willingness to collaborate',
      'Art supplies for both disciplines',
      'Space for creative experimentation',
      'Trust in the creative process'
    ],
    nicheItems: []
  }
];