// Enhanced Solar Identity System with Age-Based Foundation & Depth Logic

export interface SolarProfile {
  sunSign: string;
  archetype: string;
  foundation: string;
  depth: string;
  agePhase: string;
  coreQuote: string;
  radiatesWith: string;
}

// Age-based life phases
export interface LifePhase {
  name: string;
  ageRange: [number, number];
  description: string;
}

export const LIFE_PHASES: LifePhase[] = [
  { name: "Foundation Layer", ageRange: [0, 10], description: "Building core identity and wonder" },
  { name: "Explorer Phase", ageRange: [11, 17], description: "Discovering self and questioning everything" },
  { name: "Emergence Phase", ageRange: [18, 25], description: "Taking first independent steps" },
  { name: "Builder Phase", ageRange: [26, 35], description: "Constructing life foundations and systems" },
  { name: "Mastery Phase", ageRange: [36, 45], description: "Refining skills and deepening expertise" },
  { name: "Wisdom Phase", ageRange: [46, 60], description: "Mentoring others and sharing knowledge" },
  { name: "Eternal Foundation", ageRange: [61, 120], description: "Living legacy and timeless wisdom" }
];

// Foundation types based on primary life focus/energy
export const FOUNDATION_TYPES = {
  'Seeker Foundation': 'Driven by curiosity and the need to understand',
  'Builder Foundation': 'Focused on creating lasting structures and systems',
  'Nurturer Foundation': 'Centered on growth, care, and supporting others',
  'Innovator Foundation': 'Motivated by change, creativity, and breakthrough thinking',
  'Wisdom Foundation': 'Grounded in experience and sharing knowledge',
  'Harmonic Foundation': 'Balanced integration of all energies'
};

// Depth types based on inner processing style
export const DEPTH_TYPES = {
  'Explorer Depth': 'Surface-level curiosity with broad interests',
  'Artisan Depth': 'Skilled crafting with attention to beauty and form',
  'Alchemist Depth': 'Deep transformation through understanding hidden patterns',
  'Sage Depth': 'Profound wisdom integration across multiple domains',
  'Mystic Depth': 'Transcendent understanding beyond conventional knowledge'
};

// Matrix: [Archetype][Age Phase] -> Foundation
const ARCHETYPE_FOUNDATION_MATRIX: Record<string, Record<string, string>> = {
  'Sol Innovator': {
    'Foundation Layer': 'Seeker Foundation',
    'Explorer Phase': 'Seeker Foundation',
    'Emergence Phase': 'Innovator Foundation',
    'Builder Phase': 'Builder Foundation',
    'Mastery Phase': 'Innovator Foundation',
    'Wisdom Phase': 'Wisdom Foundation',
    'Eternal Foundation': 'Harmonic Foundation'
  },
  'Sol Nurturer': {
    'Foundation Layer': 'Nurturer Foundation',
    'Explorer Phase': 'Seeker Foundation',
    'Emergence Phase': 'Nurturer Foundation',
    'Builder Phase': 'Builder Foundation',
    'Mastery Phase': 'Nurturer Foundation',
    'Wisdom Phase': 'Wisdom Foundation',
    'Eternal Foundation': 'Harmonic Foundation'
  },
  'Sol Alchemist': {
    'Foundation Layer': 'Seeker Foundation',
    'Explorer Phase': 'Seeker Foundation',
    'Emergence Phase': 'Seeker Foundation',
    'Builder Phase': 'Builder Foundation',
    'Mastery Phase': 'Innovator Foundation',
    'Wisdom Phase': 'Wisdom Foundation',
    'Eternal Foundation': 'Harmonic Foundation'
  },
  'Sol Sage': {
    'Foundation Layer': 'Seeker Foundation',
    'Explorer Phase': 'Seeker Foundation',
    'Emergence Phase': 'Seeker Foundation',
    'Builder Phase': 'Builder Foundation',
    'Mastery Phase': 'Wisdom Foundation',
    'Wisdom Phase': 'Wisdom Foundation',
    'Eternal Foundation': 'Harmonic Foundation'
  },
  'Sol Builder': {
    'Foundation Layer': 'Builder Foundation',
    'Explorer Phase': 'Seeker Foundation',
    'Emergence Phase': 'Builder Foundation',
    'Builder Phase': 'Builder Foundation',
    'Mastery Phase': 'Builder Foundation',
    'Wisdom Phase': 'Wisdom Foundation',
    'Eternal Foundation': 'Harmonic Foundation'
  },
  'Sol Artist': {
    'Foundation Layer': 'Seeker Foundation',
    'Explorer Phase': 'Seeker Foundation',
    'Emergence Phase': 'Innovator Foundation',
    'Builder Phase': 'Builder Foundation',
    'Mastery Phase': 'Innovator Foundation',
    'Wisdom Phase': 'Wisdom Foundation',
    'Eternal Foundation': 'Harmonic Foundation'
  }
};

// Matrix: [Archetype][Age Phase] -> Depth  
const ARCHETYPE_DEPTH_MATRIX: Record<string, Record<string, string>> = {
  'Sol Innovator': {
    'Foundation Layer': 'Explorer Depth',
    'Explorer Phase': 'Explorer Depth',
    'Emergence Phase': 'Artisan Depth',
    'Builder Phase': 'Alchemist Depth',
    'Mastery Phase': 'Alchemist Depth',
    'Wisdom Phase': 'Sage Depth',
    'Eternal Foundation': 'Mystic Depth'
  },
  'Sol Nurturer': {
    'Foundation Layer': 'Explorer Depth',
    'Explorer Phase': 'Explorer Depth',
    'Emergence Phase': 'Artisan Depth',
    'Builder Phase': 'Artisan Depth',
    'Mastery Phase': 'Alchemist Depth',
    'Wisdom Phase': 'Sage Depth',
    'Eternal Foundation': 'Mystic Depth'
  },
  'Sol Alchemist': {
    'Foundation Layer': 'Explorer Depth',
    'Explorer Phase': 'Artisan Depth',
    'Emergence Phase': 'Alchemist Depth',
    'Builder Phase': 'Alchemist Depth',
    'Mastery Phase': 'Alchemist Depth',
    'Wisdom Phase': 'Sage Depth',
    'Eternal Foundation': 'Mystic Depth'
  },
  'Sol Sage': {
    'Foundation Layer': 'Explorer Depth',
    'Explorer Phase': 'Explorer Depth',
    'Emergence Phase': 'Artisan Depth',
    'Builder Phase': 'Alchemist Depth',
    'Mastery Phase': 'Sage Depth',
    'Wisdom Phase': 'Sage Depth',
    'Eternal Foundation': 'Mystic Depth'
  },
  'Sol Builder': {
    'Foundation Layer': 'Explorer Depth',
    'Explorer Phase': 'Explorer Depth',
    'Emergence Phase': 'Artisan Depth',
    'Builder Phase': 'Artisan Depth',
    'Mastery Phase': 'Alchemist Depth',
    'Wisdom Phase': 'Sage Depth',
    'Eternal Foundation': 'Mystic Depth'
  },
  'Sol Artist': {
    'Foundation Layer': 'Explorer Depth',
    'Explorer Phase': 'Artisan Depth',
    'Emergence Phase': 'Artisan Depth',
    'Builder Phase': 'Alchemist Depth',
    'Mastery Phase': 'Alchemist Depth',
    'Wisdom Phase': 'Sage Depth',
    'Eternal Foundation': 'Mystic Depth'
  }
};

// Sun sign date ranges
const sunSignRanges = [
  { sign: 'Aquarius', start: '01-20', end: '02-18' },
  { sign: 'Pisces', start: '02-19', end: '03-20' },
  { sign: 'Aries', start: '03-21', end: '04-19' },
  { sign: 'Taurus', start: '04-20', end: '05-20' },
  { sign: 'Gemini', start: '05-21', end: '06-20' },
  { sign: 'Cancer', start: '06-21', end: '07-22' },
  { sign: 'Leo', start: '07-23', end: '08-22' },
  { sign: 'Virgo', start: '08-23', end: '09-22' },
  { sign: 'Libra', start: '09-23', end: '10-22' },
  { sign: 'Scorpio', start: '10-23', end: '11-21' },
  { sign: 'Sagittarius', start: '11-22', end: '12-21' },
  { sign: 'Capricorn', start: '12-22', end: '01-19' },
];

export function getSunSign(birthDate: string | Date): string {
  const date = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const mmdd = `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

  for (const { sign, start, end } of sunSignRanges) {
    if (start < end) {
      if (mmdd >= start && mmdd <= end) return sign;
    } else {
      // Capricorn wraps year end
      if (mmdd >= start || mmdd <= end) return sign;
    }
  }
  return 'Unknown';
}

export const sunSignToArchetype: Record<string, string> = {
  'Aries': 'Sol Innovator',
  'Leo': 'Sol Artist',
  'Sagittarius': 'Sol Sage',
  'Taurus': 'Sol Nurturer',
  'Virgo': 'Sol Builder',
  'Capricorn': 'Sol Builder',
  'Gemini': 'Sol Innovator',
  'Libra': 'Sol Artist',
  'Aquarius': 'Sol Innovator',
  'Cancer': 'Sol Nurturer',
  'Scorpio': 'Sol Alchemist',
  'Pisces': 'Sol Alchemist',
};

export function getSolarArchetype(birthDate: string | Date): string {
  const sunSign = getSunSign(birthDate);
  return sunSignToArchetype[sunSign] || 'Sol Traveler';
}

export function getLifePhase(age: number): LifePhase {
  return LIFE_PHASES.find(phase =>
    age >= phase.ageRange[0] && age <= phase.ageRange[1]
  ) || LIFE_PHASES[LIFE_PHASES.length - 1]; // Default to last phase
}

export function calculateAge(birthDate: string | Date): number {
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

export function getFoundation(archetype: string, agePhase: string): string {
  return ARCHETYPE_FOUNDATION_MATRIX[archetype]?.[agePhase] || 'Seeker Foundation';
}

export function getDepth(archetype: string, agePhase: string): string {
  return ARCHETYPE_DEPTH_MATRIX[archetype]?.[agePhase] || 'Explorer Depth';
}

// Updated core quotes that incorporate foundation/depth awareness
export const solarArchetypeCoreQuotes: Record<string, string> = {
  'Sol Innovator': "I channel tomorrow's dreams into today's reality through systematic transformation",
  'Sol Nurturer': "I create sacred spaces where souls can grow and foundations can flourish",
  'Sol Alchemist': "I transform darkness into golden wisdom through deep pattern recognition",
  'Sol Sage': "I expand consciousness through adventurous wisdom-seeking and systematic understanding",
  'Sol Builder': "I construct lasting foundations that support collective achievement and growth",
  'Sol Artist': "I weave beauty and harmony into systematic structures that inspire human connection",
  'Sol Traveler': "You are a child of the cosmos, building your unique path through space and time",
};

export const solarArchetypeRadiatesWith: Record<string, string> = {
  'Sol Innovator': 'Their inner Sol radiates with electric creativity, systematic thinking, and transformative humanitarian vision.',
  'Sol Nurturer': 'Their inner Sol radiates with nurturing care, structural wisdom, and the power to help others build lasting growth.',
  'Sol Alchemist': 'Their inner Sol radiates with deep transformative wisdom, systematic pattern recognition, and the courage to build light from darkness.',
  'Sol Sage': 'Their inner Sol radiates with adventurous wisdom, systematic knowledge integration, and consciousness expansion through structured exploration.',
  'Sol Builder': 'Their inner Sol radiates with steadfast dedication, transformative insight, and the ability to create foundations that evolve and adapt.',
  'Sol Artist': 'Their inner Sol radiates with beauty, systematic harmony, and the gift of inspiring human connection through structured creativity.',
  'Sol Traveler': 'Their inner Sol radiates with curiosity, systematic wonder, and the deep building of cosmic understanding.'
};

/**
 * Main function: Get complete solar profile based on birth date
 */
export function getCompleteSolarProfile(birthDate: string | Date): SolarProfile {
  const age = calculateAge(birthDate);
  const lifePhase = getLifePhase(age);
  const sunSign = getSunSign(birthDate);
  const archetype = getSolarArchetype(birthDate);
  const foundation = getFoundation(archetype, lifePhase.name);
  const depth = getDepth(archetype, lifePhase.name);

  return {
    sunSign,
    archetype,
    foundation,
    depth,
    agePhase: lifePhase.name,
    coreQuote: solarArchetypeCoreQuotes[archetype] || solarArchetypeCoreQuotes['Sol Traveler'],
    radiatesWith: solarArchetypeRadiatesWith[archetype] || solarArchetypeRadiatesWith['Sol Traveler']
  };
}

/**
 * Get foundation and depth descriptions
 */
export function getFoundationDescription(foundation: string): string {
  return FOUNDATION_TYPES[foundation] || 'A unique foundation seeking its path';
}

export function getDepthDescription(depth: string): string {
  return DEPTH_TYPES[depth] || 'A unique depth of understanding';
}

// Legacy compatibility functions to keep existing code working
export function dayRangeToAgeRange(min: number, max: number): string {
  const minYears = Math.round(min / 365.25);
  const maxYears = Math.round(max / 365.25);
  return `AGES ${minYears}–${maxYears}`;
}

// Phase definitions for each archetype (keeping for compatibility with existing code)
const solArchetypePhases: Record<string, { name: string; min: number; max: number }[]> = {
  'Sol Innovator': [
    { name: 'Curious Experimenter', min: 0, max: 3652 },
    { name: 'System Questioner', min: 3653, max: 7305 },
    { name: 'Innovation Architect', min: 7306, max: 10957 },
    { name: 'Connected Revolutionary', min: 10958, max: 18262 },
    { name: 'Wisdom Transmitter', min: 18263, max: 21914 },
    { name: 'System Transformer', min: 21915, max: Infinity },
  ],
  'Sol Nurturer': [
    { name: 'Natural Caregiver', min: 0, max: 3652 },
    { name: 'Community Builder', min: 3653, max: 7305 },
    { name: 'Support System Creator', min: 7306, max: 10957 },
    { name: 'Growth Facilitator', min: 10958, max: 18262 },
    { name: 'Wisdom Keeper', min: 18263, max: 21914 },
    { name: 'Sacred Guardian', min: 21915, max: Infinity },
  ],
  'Sol Alchemist': [
    { name: 'Sensitive Explorer', min: 0, max: 3652 },
    { name: 'Shadow Walker', min: 3653, max: 7305 },
    { name: 'Transformation Student', min: 7306, max: 10957 },
    { name: 'Wisdom Alchemist', min: 10958, max: 18262 },
    { name: 'Mystical Teacher', min: 18263, max: 21914 },
    { name: 'Sacred Oracle', min: 21915, max: Infinity },
  ],
  'Sol Sage': [
    { name: 'Wonder Seeker', min: 0, max: 3652 },
    { name: 'Truth Hunter', min: 3653, max: 7305 },
    { name: 'Experience Collector', min: 7306, max: 10957 },
    { name: 'Wisdom Teacher', min: 10958, max: 18262 },
    { name: 'Universal Connector', min: 18263, max: 21914 },
    { name: 'Cosmic Philosopher', min: 21915, max: Infinity },
  ],
  'Sol Builder': [
    { name: 'Foundation Layer', min: 0, max: 3652 },
    { name: 'Skill Forger', min: 3653, max: 7305 },
    { name: 'Structure Creator', min: 7306, max: 10957 },
    { name: 'Master Builder', min: 10958, max: 18262 },
    { name: 'Architect of Legacy', min: 18263, max: 21914 },
    { name: 'Eternal Foundation', min: 21915, max: Infinity },
  ],
  'Sol Artist': [
    { name: 'Beauty Discoverer', min: 0, max: 3652 },
    { name: 'Creative Rebel', min: 3653, max: 7305 },
    { name: 'Harmony Weaver', min: 7306, max: 10957 },
    { name: 'Beauty Ambassador', min: 10958, max: 18262 },
    { name: 'Harmony Master', min: 18263, max: 21914 },
    { name: 'Pure Beauty', min: 21915, max: Infinity },
  ],
};

export function getSolPhase(solArchetype: string, solAge: number): { phase: number; name: string } | null {
  const phases = solArchetypePhases[solArchetype];
  if (!phases) return null;
  for (let i = 0; i < phases.length; i++) {
    if (solAge >= phases[i].min && solAge <= phases[i].max) {
      return { phase: i + 1, name: phases[i].name };
    }
  }
  return null;
}

// Enhanced value proposition generator
export function generateSolarIdentityDescription(
  sunSign: string,
  solArchetype: string,
  foundation: string,
  depth: string,
  agePhase?: string
): string {
  const archetypeDescriptors: Record<string, string> = {
    'Sol Innovator': 'visionary architect of the future',
    'Sol Nurturer': 'sacred gardener of human potential',
    'Sol Alchemist': 'mystical transformer of darkness into light',
    'Sol Sage': 'philosophical explorer of consciousness',
    'Sol Builder': 'cosmic architect of lasting foundations',
    'Sol Artist': 'divine weaver of beauty and harmony',
  };

  const sunSignTraits: Record<string, string> = {
    'Aries': 'pioneering fire with unstoppable momentum',
    'Taurus': 'grounding earth energy with unshakeable determination',
    'Gemini': 'quicksilver communication with endless curiosity',
    'Cancer': 'protective waters with deep emotional wisdom',
    'Leo': 'radiant solar power with magnetic leadership',
    'Virgo': 'precision earth magic with perfectionist drive',
    'Libra': 'harmonizing air with diplomatic grace',
    'Scorpio': 'transformational intensity with penetrating insight',
    'Sagittarius': 'expansive fire with philosophical wisdom',
    'Capricorn': 'mountainous authority with strategic mastery',
    'Aquarius': 'revolutionary innovation with humanitarian vision',
    'Pisces': 'flowing intuition with mystical connection',
  };

  const archetypeDescriptor = archetypeDescriptors[solArchetype] || '';
  const sunSignTrait = sunSignTraits[sunSign] || '';
  const foundationDescription = getFoundationDescription(foundation);
  const depthDescription = getDepthDescription(depth);
  const phaseContext = agePhase ? ` In your ${agePhase}, you are` : ' You are';

  return `${phaseContext} a ${archetypeDescriptor}, combining ${sunSignTrait} with deep transformational wisdom. Your ${foundation.replace(' Foundation', '')} foundation makes you ${foundationDescription.toLowerCase()}, while your ${depth.replace(' Depth', '')} depth gives you ${depthDescription.toLowerCase()} that serves humanity's evolution.`;
}