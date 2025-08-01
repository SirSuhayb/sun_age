import { Horoscope, Origin } from 'circular-natal-horoscope-js';
import { getLifePhase } from './solarIdentity';
import { getWorldEventForDate } from './worldEvent';

// List of major aspects
const MAJOR_ASPECTS = ['conjunction', 'opposition', 'trine', 'square', 'sextile'];

// Known significant astronomical events for fallback
const KNOWN_EVENTS: { [key: string]: string[] } = {
  '2023-05-24': [
    'Moon Conjunct Mars',
    'Moon in Cancer',
    'Mars in Cancer'
  ],
  // Jupiter-Pluto conjunctions - major transformational events
  '2020-04-04': ['Jupiter Conjunction Pluto'],
  '2020-06-30': ['Jupiter Conjunction Pluto'],
  '2020-11-12': ['Jupiter Conjunction Pluto'],
  // Saturn-Pluto conjunction - generational shift
  '2020-01-12': ['Saturn Conjunction Pluto'],
  // Great conjunction events
  '2020-12-21': ['Jupiter Conjunction Saturn'],
  // Other significant cosmic events
  '2019-01-21': ['Total Lunar Eclipse'],
  '2017-08-21': ['Total Solar Eclipse'],
  '2024-04-08': ['Total Solar Eclipse'],
  // Add more known events as needed
};

// Enhanced cosmic event pattern recognition
const COSMIC_PATTERNS = {
  BREAKTHROUGH_INDICATORS: [
    'Jupiter Conjunction Pluto',
    'Jupiter Conjunction Uranus', 
    'Uranus Conjunction Sun',
    'Jupiter Trine Sun',
    'Uranus Trine Mercury'
  ],
  SERENDIPITY_INDICATORS: [
    'Venus Conjunction Jupiter',
    'Moon Conjunction Venus',
    'Jupiter Sextile Sun',
    'Venus Trine Jupiter'
  ],
  TRANSFORMATION_INDICATORS: [
    'Pluto Conjunction Sun',
    'Saturn Conjunction Pluto',
    'Pluto Square Sun',
    'Pluto Opposition Sun'
  ],
  AWAKENING_INDICATORS: [
    'Uranus Conjunction Sun',
    'Uranus Conjunction Moon',
    'Jupiter Conjunction Sun',
    'Sun Conjunction Uranus'
  ]
};

// Contextual event interpretations based on life phase and cosmic moment
const CONTEXTUAL_INTERPRETATIONS = {
  'Jupiter Conjunction Pluto': {
    'Explorer Phase': 'A profound transformation in your worldview and personal power, marking a key turning point in your journey of self-discovery.',
    'Emergence Phase': 'A moment of expansive transformation that reshaped your understanding of your place in the world and your potential impact.',
    'Builder Phase': 'Deep structural changes in your life foundations, with opportunities to rebuild on a more authentic and powerful scale.',
    'Mastery Phase': 'A pivotal moment where your accumulated wisdom met transformative power, enabling profound shifts in your life\'s direction.',
    'Wisdom Phase': 'A culmination of life experience meeting cosmic transformation, offering opportunities to guide others through similar changes.'
  },
  'Saturn Conjunction Pluto': {
    'Explorer Phase': 'Early lessons in the balance between structure and transformation, teaching you about lasting change.',
    'Emergence Phase': 'A formative experience in understanding how to build something enduring while navigating deep change.',
    'Builder Phase': 'A crucial test of your foundations, requiring you to rebuild structures that could withstand transformation.',
    'Mastery Phase': 'The meeting of your mastered discipline with transformative forces, creating lasting legacy potential.',
    'Wisdom Phase': 'A moment where your life\'s work met the forces of generational change, offering wisdom for navigating transitions.'
  },
  'Jupiter Conjunction Saturn': {
    'Explorer Phase': 'A rare alignment that opened new pathways while teaching the value of patience and planning.',
    'Emergence Phase': 'The perfect balance of expansion and discipline, offering structured growth opportunities.',
    'Builder Phase': 'An ideal time for ambitious projects that combine vision with practical implementation.',
    'Mastery Phase': 'The culmination of experience meeting new opportunities for significant achievement.',
    'Wisdom Phase': 'A time to manifest your greatest visions through the wisdom of accumulated experience.'
  }
};

// Cosmic event interpretations for each sol archetype (past tense for previous sol cycles)
const ARCHETYPE_INTERPRETATIONS: Record<string, Record<string, string>> = {
  'Sol Innovator': {
    'conjunction': 'A moment of electric synergy where your innovative ideas aligned with cosmic forces',
    'opposition': 'A call to balance your revolutionary vision with practical implementation',
    'trine': 'Harmonious flow of creative energy that supported your breakthrough thinking',
    'square': 'Creative tension that challenged you to refine your innovative approach',
    'sextile': 'Opportunity to connect your visionary ideas with new possibilities',
    'Sun': 'Your core creative essence was highlighted and amplified',
    'Moon': 'Your intuitive innovations were deeply felt and emotionally resonant',
    'Mercury': 'Your communication of revolutionary ideas flowed with clarity',
    'Venus': 'Your aesthetic vision and values were beautifully expressed',
    'Mars': 'Your pioneering energy and drive were powerfully activated',
    'Jupiter': 'Your expansive vision and humanitarian ideals were magnified',
    'Saturn': 'Your innovative structures gained lasting foundation and discipline',
    'Uranus': 'Your revolutionary insights and breakthroughs were electrified',
    'Neptune': 'Your spiritual vision and cosmic connection were heightened',
    'Pluto': 'Your transformative power to reinvent and evolve was intensified'
  },
  'Sol Nurturer': {
    'conjunction': 'A moment of deep connection where your nurturing energy harmonized with cosmic care',
    'opposition': 'A call to balance your care for others with self-nurturing',
    'trine': 'Flowing energy that supported your natural ability to create safe spaces',
    'square': 'Growth challenge that strengthened your nurturing foundation',
    'sextile': 'Opportunity to extend your care in new and meaningful ways',
    'Sun': 'Your nurturing essence radiated warmth and protective energy',
    'Moon': 'Your emotional intelligence and intuitive care were deeply activated',
    'Mercury': 'Your compassionate communication created understanding and comfort',
    'Venus': 'Your loving presence and aesthetic care were beautifully expressed',
    'Mars': 'Your protective energy and caring actions were powerfully directed',
    'Jupiter': 'Your expansive love and wisdom nurtured growth in others',
    'Saturn': 'Your steady, reliable care provided lasting security',
    'Uranus': 'Your innovative approach to nurturing broke new ground',
    'Neptune': 'Your spiritual compassion and healing presence were heightened',
    'Pluto': 'Your deep transformative care helped others heal and grow'
  },
  'Sol Alchemist': {
    'conjunction': 'A moment of alchemical fusion where your transformative power met cosmic change',
    'opposition': 'A call to balance your deep transformation with gentle integration',
    'trine': 'Flowing energy that supported your natural ability to transmute darkness into light',
    'square': 'Alchemical tension that catalyzed your transformative process',
    'sextile': 'Opportunity to apply your wisdom in new transformative ways',
    'Sun': 'Your alchemical essence shone with transformative power',
    'Moon': 'Your intuitive understanding of deep transformation was activated',
    'Mercury': 'Your communication of profound wisdom created understanding',
    'Venus': 'Your ability to find beauty in transformation was expressed',
    'Mars': 'Your courage to face and transform darkness was empowered',
    'Jupiter': 'Your expansive wisdom guided others through transformation',
    'Saturn': 'Your disciplined approach to alchemy created lasting change',
    'Uranus': 'Your revolutionary insights broke through old patterns',
    'Neptune': 'Your spiritual connection to universal transformation was heightened',
    'Pluto': 'Your deep power to transform and regenerate was intensified'
  },
  'Sol Sage': {
    'conjunction': 'A moment of wisdom convergence where your knowledge aligned with cosmic truth',
    'opposition': 'A call to balance your expansive wisdom with practical application',
    'trine': 'Flowing energy that supported your natural quest for understanding',
    'square': 'Intellectual challenge that deepened your wisdom and knowledge',
    'sextile': 'Opportunity to share your wisdom in new and meaningful ways',
    'Sun': 'Your wise essence illuminated truth and understanding',
    'Moon': 'Your intuitive wisdom and emotional intelligence were activated',
    'Mercury': 'Your communication of wisdom created clarity and insight',
    'Venus': 'Your appreciation of wisdom and truth was beautifully expressed',
    'Mars': 'Your courage to seek truth and knowledge was empowered',
    'Jupiter': 'Your expansive wisdom and philosophical understanding were magnified',
    'Saturn': 'Your disciplined approach to learning created lasting knowledge',
    'Uranus': 'Your revolutionary insights broke through conventional thinking',
    'Neptune': 'Your spiritual wisdom and cosmic understanding were heightened',
    'Pluto': 'Your deep power to uncover hidden truth was intensified'
  },
  'Sol Builder': {
    'conjunction': 'A moment of structural alignment where your building energy met cosmic foundation',
    'opposition': 'A call to balance your practical building with visionary planning',
    'trine': 'Flowing energy that supported your natural ability to create lasting structures',
    'square': 'Building challenge that strengthened your foundation and approach',
    'sextile': 'Opportunity to construct new and meaningful foundations',
    'Sun': 'Your building essence created solid, lasting foundations',
    'Moon': 'Your intuitive understanding of what needed to be built was activated',
    'Mercury': 'Your communication of practical plans created clear direction',
    'Venus': 'Your appreciation of beautiful, functional structures was expressed',
    'Mars': 'Your energy and drive to build and create were empowered',
    'Jupiter': 'Your expansive vision for large-scale building projects was magnified',
    'Saturn': 'Your disciplined approach to building created lasting results',
    'Uranus': 'Your innovative building methods broke new ground',
    'Neptune': 'Your spiritual vision for structures that serve the collective was heightened',
    'Pluto': 'Your deep power to transform and rebuild was intensified'
  },
  'Sol Artist': {
    'conjunction': 'A moment of artistic fusion where your creative expression met cosmic beauty',
    'opposition': 'A call to balance your artistic vision with practical creation',
    'trine': 'Flowing energy that supported your natural ability to create beauty and harmony',
    'square': 'Creative tension that challenged you to refine your artistic expression',
    'sextile': 'Opportunity to express your artistry in new and meaningful ways',
    'Sun': 'Your artistic essence radiated beauty and creative energy',
    'Moon': 'Your intuitive artistic expression and emotional creativity were activated',
    'Mercury': 'Your communication through art created understanding and connection',
    'Venus': 'Your aesthetic sense and appreciation of beauty were beautifully expressed',
    'Mars': 'Your creative energy and drive to express yourself were empowered',
    'Jupiter': 'Your expansive artistic vision and creative wisdom were magnified',
    'Saturn': 'Your disciplined approach to art created lasting masterpieces',
    'Uranus': 'Your revolutionary artistic insights broke new creative ground',
    'Neptune': 'Your spiritual connection to universal beauty was heightened',
    'Pluto': 'Your deep power to transform through artistic expression was intensified'
  },
  'Sol Traveler': {
    'conjunction': 'A moment of cosmic connection where your journey aligned with universal flow',
    'opposition': 'A call to balance your exploration with integration of experiences',
    'trine': 'Flowing energy that supported your natural curiosity and wonder',
    'square': 'Travel challenge that strengthened your understanding and growth',
    'sextile': 'Opportunity to explore new horizons and expand your perspective',
    'Sun': 'Your traveling essence illuminated new paths and possibilities',
    'Moon': 'Your intuitive sense of direction and emotional journey were activated',
    'Mercury': 'Your communication of discoveries created connection and understanding',
    'Venus': 'Your appreciation of beauty in new places and experiences was expressed',
    'Mars': 'Your energy and courage to explore new territories were empowered',
    'Jupiter': 'Your expansive curiosity and wisdom-seeking were magnified',
    'Saturn': 'Your disciplined approach to learning from your travels created lasting growth',
    'Uranus': 'Your revolutionary insights from unique experiences broke new ground',
    'Neptune': 'Your spiritual connection to the universal journey was heightened',
    'Pluto': 'Your deep power to transform through your travels was intensified'
  }
};

// Helper to get noon UTC for a date
function getNoonUTC(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12, 0, 0));
}

// Helper to get planet name
function getPlanetName(planet: string): string {
  const names: { [key: string]: string } = {
    'sun': 'Sun',
    'moon': 'Moon',
    'mercury': 'Mercury',
    'venus': 'Venus',
    'mars': 'Mars',
    'jupiter': 'Jupiter',
    'saturn': 'Saturn',
    'uranus': 'Uranus',
    'neptune': 'Neptune',
    'pluto': 'Pluto'
  };
  return names[planet.toLowerCase()] || planet.charAt(0).toUpperCase() + planet.slice(1);
}

// Helper to get sign name
function getSignName(sign: string): string {
  const names: { [key: string]: string } = {
    'aries': 'Aries',
    'taurus': 'Taurus',
    'gemini': 'Gemini',
    'cancer': 'Cancer',
    'leo': 'Leo',
    'virgo': 'Virgo',
    'libra': 'Libra',
    'scorpio': 'Scorpio',
    'sagittarius': 'Sagittarius',
    'capricorn': 'Capricorn',
    'aquarius': 'Aquarius',
    'pisces': 'Pisces'
  };
  return names[sign.toLowerCase()] || sign.charAt(0).toUpperCase() + sign.slice(1);
}

// Helper to get house name
function getHouseName(house: number): string {
  const houseNames = [
    '1st House', '2nd House', '3rd House', '4th House', '5th House', '6th House',
    '7th House', '8th House', '9th House', '10th House', '11th House', '12th House'
  ];
  return houseNames[house - 1] || `${house}th House`;
}

/**
 * Returns an array of cosmic events for the given date, including:
 * - Major aspects between planets
 * - Planetary positions and sign ingresses
 * - House positions
 * - Known significant events (fallback)
 */
export function getCosmicEventsForDate(date: Date, birthDate: Date): string[] {
  // Use noon UTC for both dates
  const dt = getNoonUTC(date);
  const birthDt = getNoonUTC(birthDate);

  console.log('[Astrology] Calculating for date:', {
    inputDate: date.toISOString(),
    noonUTC: dt.toISOString(),
    birthDate: birthDate.toISOString(),
    birthNoonUTC: birthDt.toISOString()
  });

  // Check for known events first
  const dateKey = date.toISOString().split('T')[0];
  const knownEvents = KNOWN_EVENTS[dateKey] || [];
  console.log('[Astrology] Known events for date:', knownEvents);

  // Use a fixed location (0,0) since we don't have user location
  const origin = new Origin({
    year: dt.getUTCFullYear(),
    month: dt.getUTCMonth(),
    date: dt.getUTCDate(),
    hour: dt.getUTCHours(),
    minute: dt.getUTCMinutes(),
    latitude: 0,
    longitude: 0,
  });

  const horoscope = new Horoscope({
    origin,
    houseSystem: 'whole-sign',
    zodiac: 'tropical',
    aspectPoints: ['bodies'],
    aspectWithPoints: ['bodies'],
    aspectTypes: MAJOR_ASPECTS,
    language: 'en',
  });

  console.log('[Astrology] Horoscope created:', {
    hasAspects: !!horoscope.Aspects,
    aspectTypes: Object.keys(horoscope.Aspects.types || {}),
    hasCelestialBodies: !!horoscope.CelestialBodies,
    celestialBodiesType: typeof horoscope.CelestialBodies,
    celestialBodiesKeys: horoscope.CelestialBodies ? Object.keys(horoscope.CelestialBodies) : [],
    celestialBodiesValue: horoscope.CelestialBodies
  });

  const events: string[] = [];

  // 1. Major aspects between planets
  for (const aspectType of MAJOR_ASPECTS) {
    const aspectList = horoscope.Aspects.types[aspectType] || [];
    console.log(`[Astrology] ${aspectType} aspects:`, aspectList.length);
    for (const aspect of aspectList) {
      console.log(`[Astrology] Processing aspect:`, aspect);
      if (!aspect.point1Key || !aspect.point2Key) {
        console.log(`[Astrology] Skipping aspect - missing point1Key or point2Key`);
        continue;
      }
      const planetA = getPlanetName(aspect.point1Key);
      const planetB = getPlanetName(aspect.point2Key);
      const aspectLabel = aspectType.charAt(0).toUpperCase() + aspectType.slice(1);
      const aspectEvent = `${planetA} ${aspectLabel} ${planetB}`;
      events.push(aspectEvent);
      console.log(`[Astrology] Added aspect: ${aspectEvent}`);
    }
  }

  // 2. Planetary positions and sign ingresses
  try {
    const celestialBodies = horoscope.CelestialBodies;
    console.log('[Astrology] CelestialBodies structure:', {
      type: typeof celestialBodies,
      isArray: Array.isArray(celestialBodies),
      keys: celestialBodies ? Object.keys(celestialBodies) : [],
      value: celestialBodies
    });

    // Log the actual structure of each celestial body
    if (celestialBodies && typeof celestialBodies === 'object') {
      console.log('[Astrology] CelestialBodies details:');
      Object.entries(celestialBodies).forEach(([key, value]) => {
        console.log(`  ${key}:`, value);
      });
    }

    // Handle different possible structures
    let planets: any[] = [];
    if (Array.isArray(celestialBodies)) {
      planets = celestialBodies;
    } else if (celestialBodies && typeof celestialBodies === 'object') {
      // Check if there's an 'all' array property
      if ('all' in celestialBodies && Array.isArray(celestialBodies.all)) {
        planets = celestialBodies.all;
      } else {
        // Extract individual planet objects
        planets = Object.values(celestialBodies).filter(item => 
          item && typeof item === 'object' && 'key' in item && 'Sign' in item
        );
      }
    }

    console.log('[Astrology] Processed planets:', planets?.length || 0);
    for (const planet of planets) {
      console.log('[Astrology] Planet:', planet);
      if (planet && typeof planet === 'object' && 'key' in planet && 'Sign' in planet) {
        const planetName = getPlanetName(planet.key as string);
        // Extract sign name from the Sign object
        const signObj = planet.Sign;
        console.log(`[Astrology] Sign object for ${planetName}:`, signObj);
        if (signObj && typeof signObj === 'object' && 'name' in signObj) {
          const signName = getSignName(signObj.name as string);
          events.push(`${planetName} in ${signName}`);
          console.log(`[Astrology] Added planet position: ${planetName} in ${signName}`);
        } else if (signObj && typeof signObj === 'object' && 'label' in signObj) {
          const signName = getSignName(signObj.label as string);
          events.push(`${planetName} in ${signName}`);
          console.log(`[Astrology] Added planet position: ${planetName} in ${signName}`);
        }
      }
    }
  } catch (e) {
    console.error('[Astrology] Error getting planetary positions:', e);
  }

  // 3. House positions (if we have birth chart data)
  try {
    const birthOrigin = new Origin({
      year: birthDt.getUTCFullYear(),
      month: birthDt.getUTCMonth(),
      date: birthDt.getUTCDate(),
      hour: birthDt.getUTCHours(),
      minute: birthDt.getUTCMinutes(),
      latitude: 0,
      longitude: 0,
    });

    const birthHoroscope = new Horoscope({
      origin: birthOrigin,
      houseSystem: 'whole-sign',
      zodiac: 'tropical',
      aspectPoints: ['bodies'],
      aspectWithPoints: ['bodies'],
      aspectTypes: MAJOR_ASPECTS,
      language: 'en',
    });

    // Check which house the Sun was in on this date
    const celestialBodies = horoscope.CelestialBodies;
    let sunPosition: any = null;
    
    if (Array.isArray(celestialBodies)) {
      sunPosition = celestialBodies.find(p => p && typeof p === 'object' && 'name' in p && p.name === 'sun');
    } else if (celestialBodies && typeof celestialBodies === 'object') {
      // Try to find sun in the object structure
      const planets = Object.values(celestialBodies).filter(item => 
        item && typeof item === 'object' && 'name' in item
      );
      sunPosition = planets.find(p => p && typeof p === 'object' && 'name' in p && p.name === 'sun');
    }

    if (sunPosition && birthHoroscope.Houses) {
      // Find which house the Sun was transiting
      const sunDegree = sunPosition.longitude || 0;
      const birthAscendant = birthHoroscope.Houses[0]?.longitude || 0;
      const houseSize = 30; // Each house is 30 degrees in whole sign
      const houseNumber = Math.floor(((sunDegree - birthAscendant + 360) % 360) / houseSize) + 1;
      if (houseNumber >= 1 && houseNumber <= 12) {
        const houseName = getHouseName(houseNumber);
        events.push(`Sun transiting ${houseName}`);
      }
    }
  } catch (e) {
    console.error('[Astrology] Error calculating house positions:', e);
  }

  // 4. If no events found from calculations, use known events
  if (events.length === 0 && knownEvents.length > 0) {
    console.log('[Astrology] Using known events as fallback');
    events.push(...knownEvents);
  }

  console.log('[Astrology] Final events:', events);
  return events;
}

/**
 * Returns an array of strings like 'Venus conjunct Jupiter' for the given date.
 * @param date The date to calculate aspects for (previous sol cycle date)
 * @param birthDate The user's birth date (used for houses if needed, but not used here)
 * @deprecated Use getCosmicEventsForDate instead
 */
export function getMajorAspectsForDate(date: Date, birthDate: Date): string[] {
  return getCosmicEventsForDate(date, birthDate);
}

/**
 * Interprets cosmic events in relation to the user's sol archetype
 */
export function interpretCosmicEventsForArchetype(events: string[], archetype: string): string {
  if (events.length === 0) {
    return "A quiet moment in your cosmic journey, perfect for reflection and inner growth.";
  }

  // Get the first major aspect or planetary position
  const firstEvent = events[0];
  const interpretations = ARCHETYPE_INTERPRETATIONS[archetype] || ARCHETYPE_INTERPRETATIONS['Sol Traveler'];

  // Check if it's an aspect (contains conjunction, opposition, trine, square, or sextile)
  const aspectTypes = ['conjunction', 'opposition', 'trine', 'square', 'sextile'];
  const aspectType = aspectTypes.find(type => firstEvent.toLowerCase().includes(type));
  
  if (aspectType && interpretations[aspectType]) {
    return interpretations[aspectType];
  }

  // Check if it's a planetary position
  const planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
  const planet = planets.find(p => firstEvent.includes(p));
  
  if (planet && interpretations[planet]) {
    return interpretations[planet];
  }

  // Default interpretation
  return `A cosmic moment that aligns with your ${archetype.toLowerCase()} essence, offering insights and opportunities for growth.`;
} 

// Enhanced pattern recognition for user experiences
export function analyzeCosmicPatterns(events: string[], userPhase: string, date: Date): {
  pattern: string | null;
  interpretation: string;
  phenomenaLikelihood: number;
} {
  const breakthrough = COSMIC_PATTERNS.BREAKTHROUGH_INDICATORS.some(indicator => 
    events.some(event => event.includes(indicator.replace(' ', ' '))));
  
  const serendipity = COSMIC_PATTERNS.SERENDIPITY_INDICATORS.some(indicator => 
    events.some(event => event.includes(indicator.replace(' ', ' '))));
    
  const transformation = COSMIC_PATTERNS.TRANSFORMATION_INDICATORS.some(indicator => 
    events.some(event => event.includes(indicator.replace(' ', ' '))));
    
  const awakening = COSMIC_PATTERNS.AWAKENING_INDICATORS.some(indicator => 
    events.some(event => event.includes(indicator.replace(' ', ' '))));

  let pattern: string | null = null;
  let interpretation = 'A quiet cosmic moment that offered space for reflection and inner growth.';
  let phenomenaLikelihood = 0.2; // Base likelihood of meaningful phenomena

  if (breakthrough) {
    pattern = 'BREAKTHROUGH';
    interpretation = `A cosmic alignment that created optimal conditions for breakthrough insights and innovative solutions. Your mind was primed for "aha!" moments and creative leaps.`;
    phenomenaLikelihood = 0.8;
  } else if (serendipity) {
    pattern = 'SERENDIPITY';
    interpretation = `A harmonious cosmic dance that increased the likelihood of meaningful coincidences, unexpected opportunities, and fortuitous encounters.`;
    phenomenaLikelihood = 0.7;
  } else if (transformation) {
    pattern = 'TRANSFORMATION';
    interpretation = `Deep cosmic currents that supported profound personal transformation and the release of what no longer served your highest path.`;
    phenomenaLikelihood = 0.6;
  } else if (awakening) {
    pattern = 'AWAKENING';
    interpretation = `An electric cosmic moment that heightened your awareness and opened new dimensions of understanding about yourself and your path.`;
    phenomenaLikelihood = 0.7;
  }

  return { pattern, interpretation, phenomenaLikelihood };
}

// Enhanced cosmic event contextualizer
export function contextualizeCosmicMoment(events: string[], userPhase: string, archetype: string, date: Date): {
  cosmicMoment: string;
  personalContext: string;
  trajectory: string;
  rawEvents: string[];
} {
  if (events.length === 0) {
    return {
      cosmicMoment: 'Cosmic Quiet',
      personalContext: 'A moment of cosmic stillness that invited deep reflection and inner alignment.',
      trajectory: `This quiet space in your ${userPhase.toLowerCase()} supported integration of recent experiences and preparation for what's to come.`,
      rawEvents: []
    };
  }

  const primaryEvent = events[0];
  
  // Check for specific contextual interpretations
  for (const [eventPattern, phaseInterpretations] of Object.entries(CONTEXTUAL_INTERPRETATIONS)) {
    if (primaryEvent.includes(eventPattern)) {
      const contextualInterpretation = phaseInterpretations[userPhase] || phaseInterpretations['Builder Phase'];
      return {
        cosmicMoment: eventPattern,
        personalContext: contextualInterpretation,
        trajectory: generateTrajectoryInsight(eventPattern, userPhase, archetype),
        rawEvents: events
      };
    }
  }

  // Fall back to archetype-based interpretation
  const interpretation = interpretCosmicEventsForArchetype(events, archetype);
  
  return {
    cosmicMoment: primaryEvent,
    personalContext: `During your ${userPhase.toLowerCase()}, ${interpretation.toLowerCase()}`,
    trajectory: generateTrajectoryInsight(primaryEvent, userPhase, archetype),
    rawEvents: events
  };
}

function generateTrajectoryInsight(cosmicEvent: string, userPhase: string, archetype: string): string {
  const trajectoryTemplates = {
    'Jupiter Conjunction Pluto': `This transformative alignment during your ${userPhase.toLowerCase()} set the stage for profound personal evolution, preparing you for greater alignment with your ${archetype.toLowerCase()} essence.`,
    'Saturn Conjunction Pluto': `The structural transformation of this cosmic moment helped establish the foundation for your current path as a ${archetype.toLowerCase()}.`,
    'Jupiter Conjunction Saturn': `This rare alignment during your ${userPhase.toLowerCase()} created a bridge between vision and manifestation that continues to influence your trajectory today.`
  };

  return trajectoryTemplates[cosmicEvent] || 
    `This cosmic moment during your ${userPhase.toLowerCase()} was part of the larger pattern that shaped your evolution as a ${archetype.toLowerCase()}.`;
} 

// Comprehensive cosmic timeline system for premium experience
export interface CosmicTimelineEvent {
  date: Date;
  age: number;
  lifePhase: string;
  cosmicEvents: string[];
  cosmicMoment: string;
  personalContext: string;
  worldEvent?: { text: string; url?: string };
  pattern: string | null;
  phenomenaLikelihood: number;
  significance: 'major' | 'moderate' | 'minor';
  trajectory: string;
}

export interface CosmicCodexTimeline {
  birthDate: Date;
  archetype: string;
  totalEvents: number;
  majorTransformations: CosmicTimelineEvent[];
  breakthroughMoments: CosmicTimelineEvent[];
  serendipityWindows: CosmicTimelineEvent[];
  allEvents: CosmicTimelineEvent[];
  futurePotentials: CosmicTimelineEvent[];
  lifePatterns: {
    dominantPattern: string;
    secondaryPatterns: string[];
    cycleLength: number;
    nextMajorEvent?: Date;
  };
}

/**
 * Generates a comprehensive cosmic timeline from birth to present (and future potential)
 * This is the foundation for the premium cosmic codex experience
 */
export async function generateCosmicCodexTimeline(
  birthDate: Date, 
  archetype: string,
  includeWorldEvents: boolean = true
): Promise<CosmicCodexTimeline> {
  const timeline: CosmicTimelineEvent[] = [];
  const currentDate = new Date();
  
  // Calculate significant dates throughout the user's life
  const significantDates = generateSignificantDates(birthDate, currentDate);
  
  for (const date of significantDates) {
    const ageAtEvent = Math.floor((date.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    const lifePhase = getLifePhase(ageAtEvent);
    
    // Get cosmic events for this date
    const cosmicEvents = getCosmicEventsForDate(date, birthDate);
    
    if (cosmicEvents.length > 0) {
      // Contextualize the cosmic moment
      const cosmicContext = contextualizeCosmicMoment(cosmicEvents, lifePhase.name, archetype, date);
      
      // Analyze patterns
      const patterns = analyzeCosmicPatterns(cosmicEvents, lifePhase.name, date);
      
      // Determine significance based on patterns and cosmic events
      const significance = determinePhenomenaSignificance(cosmicEvents, patterns);
      
      // Get world event if requested
      let worldEvent: { text: string; url?: string } | undefined = undefined;
      if (includeWorldEvents) {
        try {
          worldEvent = await getWorldEventForDate(date);
        } catch (error) {
          console.log(`Could not fetch world event for ${date.toISOString()}`);
        }
      }
      
      const timelineEvent: CosmicTimelineEvent = {
        date,
        age: ageAtEvent,
        lifePhase: lifePhase.name,
        cosmicEvents,
        cosmicMoment: cosmicContext.cosmicMoment,
        personalContext: cosmicContext.personalContext,
        worldEvent,
        pattern: patterns.pattern,
        phenomenaLikelihood: patterns.phenomenaLikelihood,
        significance,
        trajectory: cosmicContext.trajectory
      };
      
      timeline.push(timelineEvent);
    }
  }
  
  // Sort timeline by date
  timeline.sort((a, b) => a.date.getTime() - b.date.getTime());
  
  // Generate future potentials (next 2-3 years)
  const futurePotentials = generateFuturePotentials(birthDate, archetype, currentDate);
  
  // Analyze life patterns
  const lifePatterns = analyzeLifePatterns(timeline);
  
  // Categorize events by type
  const majorTransformations = timeline.filter(e => 
    e.pattern === 'TRANSFORMATION' && e.significance === 'major'
  );
  
  const breakthroughMoments = timeline.filter(e => 
    e.pattern === 'BREAKTHROUGH' && e.phenomenaLikelihood > 0.6
  );
  
  const serendipityWindows = timeline.filter(e => 
    e.pattern === 'SERENDIPITY' && e.phenomenaLikelihood > 0.5
  );
  
  return {
    birthDate,
    archetype,
    totalEvents: timeline.length,
    majorTransformations,
    breakthroughMoments,
    serendipityWindows,
    allEvents: timeline,
    futurePotentials,
    lifePatterns
  };
}

/**
 * Generates significant dates throughout a person's life for cosmic analysis
 */
function generateSignificantDates(birthDate: Date, currentDate: Date): Date[] {
  const dates: Date[] = [];
  const birthYear = birthDate.getFullYear();
  const currentYear = currentDate.getFullYear();
  
  // Add birthday each year (solar return)
  for (let year = birthYear; year <= currentYear; year++) {
    const solarReturn = new Date(year, birthDate.getMonth(), birthDate.getDate());
    if (solarReturn <= currentDate) {
      dates.push(solarReturn);
    }
  }
  
  // Add major cosmic event dates that occurred during the person's lifetime
  const cosmicEventDates = Object.keys(KNOWN_EVENTS).map(dateStr => new Date(dateStr));
  for (const eventDate of cosmicEventDates) {
    if (eventDate >= birthDate && eventDate <= currentDate) {
      dates.push(eventDate);
    }
  }
  
  // Add additional significant dates (every 7 years for major life transitions)
  for (let age = 7; age <= Math.floor((currentDate.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)); age += 7) {
    const transitionDate = new Date(birthDate);
    transitionDate.setFullYear(transitionDate.getFullYear() + age);
    if (transitionDate <= currentDate) {
      dates.push(transitionDate);
    }
  }
  
  // Remove duplicates and sort
  const uniqueDates = Array.from(new Set(dates.map(d => d.getTime()))).map(time => new Date(time));
  return uniqueDates.sort((a, b) => a.getTime() - b.getTime());
}

/**
 * Determines the significance of cosmic phenomena based on events and patterns
 */
function determinePhenomenaSignificance(
  cosmicEvents: string[], 
  patterns: { pattern: string | null; phenomenaLikelihood: number }
): 'major' | 'moderate' | 'minor' {
  // Check for major cosmic events
  const majorEvents = [
    'Jupiter Conjunction Pluto',
    'Saturn Conjunction Pluto', 
    'Jupiter Conjunction Saturn',
    'Total Solar Eclipse',
    'Total Lunar Eclipse'
  ];
  
  const hasMajorEvent = cosmicEvents.some(event => 
    majorEvents.some(major => event.includes(major))
  );
  
  if (hasMajorEvent || patterns.phenomenaLikelihood > 0.7) {
    return 'major';
  } else if (patterns.phenomenaLikelihood > 0.4) {
    return 'moderate';
  } else {
    return 'minor';
  }
}

/**
 * Generates future cosmic potentials for the next 2-3 years
 */
function generateFuturePotentials(
  birthDate: Date, 
  archetype: string, 
  currentDate: Date
): CosmicTimelineEvent[] {
  const futurePotentials: CosmicTimelineEvent[] = [];
  const futureYears = 3;
  
  for (let year = 1; year <= futureYears; year++) {
    const futureDate = new Date(currentDate);
    futureDate.setFullYear(futureDate.getFullYear() + year);
    
    // Solar return analysis
    const solarReturn = new Date(futureDate.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    const ageAtEvent = Math.floor((solarReturn.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    const lifePhase = getLifePhase(ageAtEvent);
    
    // Generate potential cosmic events (this would be enhanced with actual ephemeris data)
    const potentialEvents = [`Solar Return Year ${ageAtEvent + 1}`, 'Potential cosmic alignment'];
    
    const futureEvent: CosmicTimelineEvent = {
      date: solarReturn,
      age: ageAtEvent,
      lifePhase: lifePhase.name,
      cosmicEvents: potentialEvents,
      cosmicMoment: `Year ${ageAtEvent + 1} Solar Return`,
      personalContext: `A year of continued ${archetype.toLowerCase()} evolution during your ${lifePhase.name.toLowerCase()}`,
      pattern: null,
      phenomenaLikelihood: 0.5,
      significance: 'moderate',
      trajectory: `This upcoming year offers opportunities to deepen your ${archetype.toLowerCase()} mastery`
    };
    
    futurePotentials.push(futureEvent);
  }
  
  return futurePotentials;
}

/**
 * Analyzes patterns across a person's cosmic timeline
 */
function analyzeLifePatterns(timeline: CosmicTimelineEvent[]): {
  dominantPattern: string;
  secondaryPatterns: string[];
  cycleLength: number;
  nextMajorEvent?: Date;
} {
  const patternCounts: Record<string, number> = {};
  
  // Count pattern occurrences
  timeline.forEach(event => {
    if (event.pattern) {
      patternCounts[event.pattern] = (patternCounts[event.pattern] || 0) + 1;
    }
  });
  
  // Find dominant pattern
  const dominantPattern = Object.entries(patternCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'GROWTH';
  
  // Find secondary patterns
  const secondaryPatterns = Object.entries(patternCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(1, 3)
    .map(([pattern]) => pattern);
  
  // Calculate average cycle length between major events
  const majorEvents = timeline.filter(e => e.significance === 'major');
  let cycleLength = 7; // Default 7-year cycle
  
  if (majorEvents.length > 1) {
    const intervals: number[] = [];
    for (let i = 1; i < majorEvents.length; i++) {
      const interval = (majorEvents[i].date.getTime() - majorEvents[i-1].date.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      intervals.push(interval);
    }
    cycleLength = Math.round(intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length);
  }
  
  // Predict next major event
  const lastMajorEvent = majorEvents[majorEvents.length - 1];
  let nextMajorEvent: Date | undefined = undefined;
  if (lastMajorEvent) {
    nextMajorEvent = new Date(lastMajorEvent.date);
    nextMajorEvent.setFullYear(nextMajorEvent.getFullYear() + cycleLength);
  }
  
  return {
    dominantPattern,
    secondaryPatterns,
    cycleLength,
    nextMajorEvent
  };
} 