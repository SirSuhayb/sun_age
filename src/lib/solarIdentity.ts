// Solar identity and sun sign logic for Solara

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

export function getSunSign(birthDate: string): string {
  const date = new Date(birthDate);
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

export function getSolarArchetype(birthDate: string): string {
  const sunSign = getSunSign(birthDate);
  return sunSignToArchetype[sunSign] || 'Sol Traveler';
}

export const solarArchetypeCoreQuotes: Record<string, string> = {
  'Sol Innovator': "I channel tomorrow's dreams into today's reality",
  'Sol Nurturer': "I create sacred spaces where souls can grow",
  'Sol Alchemist': "I transform darkness into golden wisdom",
  'Sol Sage': "I expand consciousness through adventurous wisdom-seeking",
  'Sol Builder': "I construct lasting foundations that support collective achievement",
  'Sol Artist': "I weave beauty and harmony into the fabric of human connection",
  'Sol Traveler': "You are a child of the cosmos, a way for the universe to know itself.",
};

export const solarArchetypeRadiatesWith: Record<string, string> = {
  'Sol Innovator': 'Their inner Sol radiates with electric creativity and humanitarian vision.',
  'Sol Nurturer': 'Their inner Sol radiates with nurturing care and the power to help others grow.',
  'Sol Alchemist': 'Their inner Sol radiates with transformative wisdom and the courage to turn darkness into light.',
  'Sol Sage': 'Their inner Sol radiates with adventurous wisdom and a quest to expand consciousness.',
  'Sol Builder': 'Their inner Sol radiates with steadfast dedication and the ability to create lasting foundations.',
  'Sol Artist': 'Their inner Sol radiates with beauty, harmony, and the gift of inspiring human connection.',
  'Sol Traveler': 'Their inner Sol radiates with curiosity and cosmic wonder.'
};

// Phase definitions for each archetype (from phases.md)
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

/**
 * Returns the phase number (1-6) and phase name for a given solArchetype and solAge (in days)
 */
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

/**
 * Converts a day range to an age range string, e.g., 10958–18262 days => 'AGES 30–50'
 */
export function dayRangeToAgeRange(min: number, max: number): string {
  const minYears = Math.round(min / 365.25);
  const maxYears = Math.round(max / 365.25);
  return `AGES ${minYears}\u2013${maxYears}`;
}

// Mappings from phases.md for value proposition generation
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

const foundationCapabilities: Record<string, string> = {
  'Innovator Foundation': 'the experimental courage to test breakthrough ideas',
  'Nurturer Foundation': 'the patient wisdom to cultivate sustainable growth',
  'Alchemist Foundation': 'the inner work mastery to process deep transformation',
  'Sage Foundation': 'the knowledge-seeking drive to explore all perspectives',
  'Builder Foundation': 'the practical skills to manifest lasting structures',
  'Artist Foundation': 'the creative genius to express beauty through form',
};

const depthTransformationPowers: Record<string, string> = {
  'Innovator Depth': 'revolutionize outdated systems into breakthrough solutions',
  'Nurturer Depth': 'transform wounds into healing environments',
  'Alchemist Depth': 'transmute complex shadows into golden wisdom',
  'Sage Depth': 'expand limited perspectives into universal understanding',
  'Builder Depth': 'convert chaos into organized, lasting foundations',
  'Artist Depth': 'weave discord into harmonious beauty',
};

const impactStatements: Record<string, string> = {
  'Innovator Depth': 'serves humanity\'s evolution',
  'Nurturer Depth': 'heals collective wounds',
  'Alchemist Depth': 'advances human consciousness',
  'Sage Depth': 'creates lasting positive change',
  'Builder Depth': 'builds bridges between worlds',
  'Artist Depth': 'transforms society through beauty',
};

/**
 * Generates the full solar identity value proposition description.
 * @param sunSign e.g. 'Aquarius'
 * @param solArchetype e.g. 'Sol Innovator'
 * @param foundation e.g. 'Builder Foundation'
 * @param depth e.g. 'Alchemist Depth'
 */
export function generateSolarIdentityDescription(
  sunSign: string,
  solArchetype: string,
  foundation: string,
  depth: string
): string {
  const archetypeDescriptor = archetypeDescriptors[solArchetype] || '';
  const sunSignTrait = sunSignTraits[sunSign] || '';
  const foundationCapability = foundationCapabilities[foundation] || '';
  const depthTransformationPower = depthTransformationPowers[depth] || '';
  const impactStatement = impactStatements[depth] || '';

  return `You're a ${archetypeDescriptor}, combining ${sunSignTrait} with deep transformational wisdom. Your ${foundation.replace(' Foundation', '')} foundation gives you ${foundationCapability}, while your ${depth.replace(' Depth', '')} depth allows you to ${depthTransformationPower} that ${impactStatement}.`;
} 