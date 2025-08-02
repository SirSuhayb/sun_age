// Deep Astrological Insights System

interface ChartData {
  sun: { sign: string; degree: number; house: number };
  moon: { sign: string; degree: number; house: number };
  rising: { sign: string; degree: number };
  planets?: Array<{
    name: string;
    sign: string;
    degree: number;
    house: number;
  }>;
  houses: Array<{ number: number; sign: string; degree: number }>;
}

interface SolData {
  archetype: string;
  foundation: string;
  depth: string;
  phase: string;
}

// Element associations for deeper understanding
const ELEMENTS = {
  Fire: ['Aries', 'Leo', 'Sagittarius'],
  Earth: ['Taurus', 'Virgo', 'Capricorn'],
  Air: ['Gemini', 'Libra', 'Aquarius'],
  Water: ['Cancer', 'Scorpio', 'Pisces']
};

// Mode associations
const MODES = {
  Cardinal: ['Aries', 'Cancer', 'Libra', 'Capricorn'],
  Fixed: ['Taurus', 'Leo', 'Scorpio', 'Aquarius'],
  Mutable: ['Gemini', 'Virgo', 'Sagittarius', 'Pisces']
};

// Get element for a sign
const getElement = (sign: string): string => {
  for (const [element, signs] of Object.entries(ELEMENTS)) {
    if (signs.includes(sign)) return element;
  }
  return 'Fire';
};

// Get mode for a sign
const getMode = (sign: string): string => {
  for (const [mode, signs] of Object.entries(MODES)) {
    if (signs.includes(sign)) return mode;
  }
  return 'Cardinal';
};

// Deep sign interpretations with placement-specific wisdom
const SIGN_ESSENCE = {
  Aries: {
    core: "pioneering spirit and initiatory force",
    gift: "courage to begin new cycles",
    shadow: "impatience with process",
    evolution: "from raw instinct to conscious leadership",
    sun: "Identity through courageous action - You are here to lead humanity into new territories of possibility",
    moon: "Emotional warrior - Your inner self needs independence and the thrill of new beginnings to feel alive",
    rising: "Perceived as the initiator - Others see you as the one who dares to go first",
    sunPhrase: "I ignite new beginnings with fearless action",
    moonPhrase: "I need the freedom to pioneer and explore",
    risingPhrase: "I lead by daring to go first"
  },
  Taurus: {
    core: "grounding presence and sensual wisdom",
    gift: "manifestation through patience",
    shadow: "resistance to necessary change",
    evolution: "from material attachment to spiritual abundance",
    sun: "Identity through creating lasting value - You build foundations that sustain generations",
    moon: "Emotional security through beauty and comfort - Your inner self craves stability and sensual pleasure",
    rising: "Perceived as the stabilizer - Others trust your grounded presence and practical wisdom",
    sunPhrase: "I build lasting foundations that sustain generations",
    moonPhrase: "I find peace in beauty, comfort, and earthly pleasures",
    risingPhrase: "I ground others with my steady presence"
  },
  Gemini: {
    core: "mental agility and communicative bridge",
    gift: "connecting diverse perspectives",
    shadow: "scattered focus",
    evolution: "from information gathering to wisdom synthesis",
    sun: "Identity through idea pollination - You weave connections between worlds of thought",
    moon: "Emotional curiosity - Your inner self needs mental stimulation and variety to feel nourished",
    rising: "Perceived as the messenger - Others see you as the bridge between different realities",
    sunPhrase: "I weave connections between worlds of thought",
    moonPhrase: "I need mental stimulation and variety to thrive",
    risingPhrase: "I bridge different realities with my words"
  },
  Cancer: {
    core: "emotional intelligence and nurturing wisdom",
    gift: "intuitive understanding of needs",
    shadow: "defensive withdrawal",
    evolution: "from personal protection to universal care",
    sun: "Identity through emotional leadership - You create sanctuary for the human family",
    moon: "Deep feeling nature - Your inner self is the ocean of collective emotion",
    rising: "Perceived as the nurturer - Others instinctively trust you with their vulnerabilities",
    sunPhrase: "I create sanctuary for the human family",
    moonPhrase: "I am the ocean of collective emotion",
    risingPhrase: "I hold space for others' vulnerabilities"
  },
  Leo: {
    core: "creative self-expression and heart radiance",
    gift: "inspiring others through authenticity",
    shadow: "ego-driven validation needs",
    evolution: "from personal glory to collective empowerment",
    sun: "Identity through creative sovereignty - You embody the divine right to shine",
    moon: "Heart-centered emotions - Your inner self needs to create and be celebrated",
    rising: "Perceived as the star - Others are drawn to your natural radiance and confidence",
    sunPhrase: "I embody the divine right to shine",
    moonPhrase: "I need to create and be celebrated",
    risingPhrase: "I radiate confidence that inspires others"
  },
  Virgo: {
    core: "sacred service and analytical precision",
    gift: "healing through practical wisdom",
    shadow: "paralysis through perfectionism",
    evolution: "from criticism to compassionate refinement",
    sun: "Identity through sacred service - You perfect the art of practical mysticism",
    moon: "Emotional refinement - Your inner self seeks purity and meaningful contribution",
    rising: "Perceived as the healer - Others sense your capacity for precise, caring attention",
    sunPhrase: "I perfect the art of practical mysticism",
    moonPhrase: "I seek purity and meaningful contribution",
    risingPhrase: "I offer precise, caring attention to what matters"
  },
  Libra: {
    core: "harmonizing intelligence and relational wisdom",
    gift: "creating beauty and balance",
    shadow: "indecision through over-consideration",
    evolution: "from external harmony to inner equilibrium",
    sun: "Identity through conscious relationship - You are the artist of human connection",
    moon: "Emotional harmony - Your inner self needs beauty, balance, and partnership",
    rising: "Perceived as the diplomat - Others see you as the embodiment of grace and fairness",
    sunPhrase: "I am the artist of human connection",
    moonPhrase: "I need beauty, balance, and partnership",
    risingPhrase: "I embody grace and fairness in all interactions"
  },
  Scorpio: {
    core: "transformational power and depth perception",
    gift: "alchemical transformation of shadow",
    shadow: "destructive intensity",
    evolution: "from control to surrender and rebirth",
    sun: "Identity through transformation - You are the phoenix, showing humanity how to rise from ashes",
    moon: "Emotional intensity - Your inner self navigates the deepest waters of human experience",
    rising: "Perceived as the transformer - Others sense your power to see and change what's hidden",
    sunPhrase: "I am the phoenix, rising and transforming",
    moonPhrase: "I navigate the deepest waters of human experience",
    risingPhrase: "I perceive and transform what's hidden"
  },
  Sagittarius: {
    core: "philosophical vision and expansive faith",
    gift: "inspiring through higher meaning",
    shadow: "dogmatic righteousness",
    evolution: "from belief to direct knowing",
    sun: "Identity through truth-seeking - You are the cosmic explorer expanding humanity's horizons",
    moon: "Emotional freedom - Your inner self needs adventure and philosophical understanding",
    rising: "Perceived as the visionary - Others see you as the bearer of optimism and wisdom",
    sunPhrase: "I expand humanity's horizons through truth",
    moonPhrase: "I need adventure and philosophical understanding",
    risingPhrase: "I carry optimism and wisdom wherever I go"
  },
  Capricorn: {
    core: "masterful structure and timeless wisdom",
    gift: "manifesting lasting legacy",
    shadow: "cold ambition",
    evolution: "from worldly success to spiritual authority",
    sun: "Identity through mastery - You architect structures that elevate collective consciousness",
    moon: "Emotional responsibility - Your inner self finds security in achievement and respect",
    rising: "Perceived as the authority - Others recognize your natural command and integrity",
    sunPhrase: "I architect structures that elevate consciousness",
    moonPhrase: "I find security in achievement and respect",
    risingPhrase: "I command respect through natural authority"
  },
  Aquarius: {
    core: "revolutionary vision and collective consciousness",
    gift: "innovative solutions for humanity",
    shadow: "detached superiority",
    evolution: "from rebellion to conscious revolution",
    sun: "Identity through innovation - You channel future frequencies to liberate humanity",
    moon: "Emotional liberation - Your inner self needs freedom from limitation and space to innovate",
    rising: "Perceived as the revolutionary - Others see you as the harbinger of progressive change",
    sunPhrase: "I channel future frequencies to liberate humanity",
    moonPhrase: "I desire freedom from limitations and space to innovate",
    risingPhrase: "I walk as a harbinger of progressive change"
  },
  Pisces: {
    core: "mystical unity and compassionate dissolution",
    gift: "healing through unconditional love",
    shadow: "escapist tendencies",
    evolution: "from victim to mystic healer",
    sun: "Identity through divine union - You dissolve the boundaries that separate humanity from source",
    moon: "Emotional boundlessness - Your inner self swims in the ocean of collective consciousness",
    rising: "Perceived as the mystic - Others sense your connection to invisible realms",
    sunPhrase: "I dissolve boundaries between humanity and source",
    moonPhrase: "I swim in the ocean of collective consciousness",
    risingPhrase: "I bridge the visible and invisible realms"
  }
};

// House meanings for deeper context
const HOUSE_THEMES = {
  1: "identity and self-expression",
  2: "resources and values",
  3: "communication and learning",
  4: "roots and inner foundation",
  5: "creativity and joy",
  6: "service and health",
  7: "relationships and mirrors",
  8: "transformation and shared resources",
  9: "philosophy and expansion",
  10: "career and public role",
  11: "community and future vision",
  12: "spirituality and transcendence"
};

// Generate Sun interpretation
export const getSunInterpretation = (sun: ChartData['sun'], archetype: string) => {
  const essence = SIGN_ESSENCE[sun.sign as keyof typeof SIGN_ESSENCE];
  const element = getElement(sun.sign);
  const mode = getMode(sun.sign);
  const house = HOUSE_THEMES[sun.house as keyof typeof HOUSE_THEMES];
  
  return {
    title: `${sun.sign} Sun in ${sun.house}th House`,
    core: essence.sun,
    powerPhrase: essence.sunPhrase,
    element: `The ${element} element of your Sun infuses your ${archetype} nature with ${
      element === 'Fire' ? 'inspirational enthusiasm and pioneering spirit' :
      element === 'Earth' ? 'practical wisdom and manifestation abilities' :
      element === 'Air' ? 'intellectual clarity and communication gifts' :
      'emotional depth and intuitive understanding'
    }.`,
    mode: `Your ${mode} Sun quality means you ${
      mode === 'Cardinal' ? 'initiate new cycles and lead transformational change' :
      mode === 'Fixed' ? 'sustain and deepen your commitments with unwavering focus' :
      'adapt and integrate diverse perspectives with flexibility'
    }.`,
    house: `Expressing through the ${sun.house}th house of ${house}, your identity manifests most powerfully in this life area. Your ${archetype} mission is channeled through ${house}, making this the stage where your soul's purpose unfolds.`,
    evolution: `Your highest evolution: ${essence.evolution}. This is the journey from ${essence.shadow} to ${essence.gift}, transforming personal identity into universal service.`,
    integration: `As a ${archetype}, your ${sun.sign} Sun asks you to embody ${essence.core} in service to collective evolution. The shadow of ${essence.shadow} becomes your greatest teacher.`
  };
};

// Generate Moon interpretation
export const getMoonInterpretation = (moon: ChartData['moon'], foundation: string) => {
  const essence = SIGN_ESSENCE[moon.sign as keyof typeof SIGN_ESSENCE];
  const element = getElement(moon.sign);
  const house = HOUSE_THEMES[moon.house as keyof typeof HOUSE_THEMES];
  
  return {
    title: `${moon.sign} Moon in ${moon.house}th House`,
    core: essence.moon,
    powerPhrase: essence.moonPhrase,
    emotional: `You process feelings through the ${element} element, which means ${
      element === 'Fire' ? 'quick, passionate responses that seek immediate expression' :
      element === 'Earth' ? 'slow, steady processing that seeks practical outcomes' :
      element === 'Air' ? 'mental analysis and communication of feelings' :
      'deep, intuitive absorption that transforms over time'
    }.`,
    house: `Your emotional home is in the ${moon.house}th house of ${house}. This is where your soul feels most nourished and where your ${foundation} finds its emotional grounding.`,
    needs: `Core emotional needs: ${essence.gift}. When these needs are met, you become a channel for ${essence.core}, offering emotional wisdom to the collective.`,
    cycles: `Your ${moon.sign} Moon creates ${
      getMode(moon.sign) === 'Cardinal' ? 'waves of new emotional beginnings' :
      getMode(moon.sign) === 'Fixed' ? 'deep emotional consistency and loyalty' :
      'fluid emotional adaptability'
    }, teaching you ${essence.evolution}.`,
    healing: `Your emotional mastery comes through transforming ${essence.shadow} into ${essence.gift}. Your ${foundation} serves as the alchemical container for this transformation.`
  };
};

// Generate Rising interpretation
export const getRisingInterpretation = (rising: ChartData['rising'], depth: string) => {
  const essence = SIGN_ESSENCE[rising.sign as keyof typeof SIGN_ESSENCE];
  const element = getElement(rising.sign);
  const mode = getMode(rising.sign);
  
  return {
    title: `${rising.sign} Rising`,
    core: essence.rising,
    powerPhrase: essence.risingPhrase,
    approach: `You approach life with ${element} energy, ${
      element === 'Fire' ? 'meeting each moment with enthusiasm and direct action' :
      element === 'Earth' ? 'grounding each experience in practical reality' :
      element === 'Air' ? 'engaging through ideas and social connection' :
      'feeling your way through intuitive perception'
    }.`,
    mask: `Your ${rising.sign} Ascendant is the sacred mask through which your ${depth} interfaces with the world. This is not deception but divine theater - you play the role of ${essence.core} to serve your higher purpose.`,
    lifeApproach: `Your ${mode} Rising creates ${
      mode === 'Cardinal' ? 'constant initiations - you are always at the beginning of something' :
      mode === 'Fixed' ? 'unwavering presence - you are the rock others orient around' :
      'fluid adaptability - you shapeshift to meet what life presents'
    }.`,
    integration: `Mastery comes through ${essence.evolution}. Your ${depth} transforms what begins as ${essence.shadow} into the gift of ${essence.gift}.`,
    perception: `The world needs to see you as ${essence.core} because this is how you deliver your medicine. Your ${rising.sign} Rising is the delivery system for your soul's work.`
  };
};

// Generate synthesis interpretation with special configurations
export const getSynthesisInterpretation = (
  sun: ChartData['sun'],
  moon: ChartData['moon'],
  rising: ChartData['rising'],
  archetype: string,
  foundation: string,
  depth: string,
  planets?: ChartData['planets']
) => {
  const sunElement = getElement(sun.sign);
  const moonElement = getElement(moon.sign);
  const risingElement = getElement(rising.sign);
  
  // Check for special configurations
  const hasDoubleSigns = sun.sign === moon.sign || sun.sign === rising.sign || moon.sign === rising.sign;
  const hasTripleSigns = sun.sign === moon.sign && sun.sign === rising.sign;
  
  // Check for stelliums (3+ planets in same sign)
  const signCounts: Record<string, number> = {};
  signCounts[sun.sign] = (signCounts[sun.sign] || 0) + 1;
  signCounts[moon.sign] = (signCounts[moon.sign] || 0) + 1;
  if (planets) {
    planets.forEach(planet => {
      signCounts[planet.sign] = (signCounts[planet.sign] || 0) + 1;
    });
  }
  const stelliums = Object.entries(signCounts).filter(([_, count]) => count >= 3);
  
  // Element balance analysis
  const elements = [sunElement, moonElement, risingElement];
  const elementCounts = elements.reduce((acc, el) => {
    acc[el] = (acc[el] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const dominantElement = Object.entries(elementCounts)
    .sort(([,a], [,b]) => b - a)[0][0];
  
  let specialConfiguration = '';
  
  if (hasTripleSigns) {
    const sign = sun.sign;
    const essence = SIGN_ESSENCE[sign as keyof typeof SIGN_ESSENCE];
    specialConfiguration = `TRIPLE ${sign.toUpperCase()} MASTERY: You are a pure channel of ${essence.core}. This rare configuration makes you a living embodiment of ${sign} energy. Your identity (Sun), emotions (Moon), and persona (Rising) are unified in service to ${essence.evolution}. You are here to show humanity the highest expression of ${essence.gift}.`;
  } else if (hasDoubleSigns) {
    if (sun.sign === moon.sign) {
      const sign = sun.sign;
      const essence = SIGN_ESSENCE[sign as keyof typeof SIGN_ESSENCE];
      specialConfiguration = `SUN-MOON ${sign.toUpperCase()} CONJUNCTION: Your conscious will and unconscious needs are unified in ${essence.core}. This creates exceptional focus and clarity of purpose. You have no internal conflict between what you want (Sun) and what you need (Moon) - both seek ${essence.gift}.`;
    } else if (sun.sign === rising.sign) {
      const sign = sun.sign;
      const essence = SIGN_ESSENCE[sign as keyof typeof SIGN_ESSENCE];
      specialConfiguration = `SUN-RISING ${sign.toUpperCase()} ALIGNMENT: What you are (Sun) is exactly how you appear (Rising). This creates powerful authenticity - there's no mask, only truth. You embody ${essence.core} so completely that others immediately recognize your ${essence.gift}.`;
    } else if (moon.sign === rising.sign) {
      const sign = moon.sign;
      const essence = SIGN_ESSENCE[sign as keyof typeof SIGN_ESSENCE];
      specialConfiguration = `MOON-RISING ${sign.toUpperCase()} HARMONY: Your emotional nature (Moon) flows seamlessly through your persona (Rising). This creates magnetic presence - people instinctively trust you because your feelings and appearance are congruent. You offer ${essence.gift} through emotional authenticity.`;
    }
  }
  
  if (stelliums.length > 0) {
    const [stelliumSign, count] = stelliums[0];
    const essence = SIGN_ESSENCE[stelliumSign as keyof typeof SIGN_ESSENCE];
    specialConfiguration += `\n\nSTELLIUM IN ${stelliumSign.toUpperCase()}: With ${count} planets in ${stelliumSign}, you carry concentrated ${essence.core}. This stellium makes you a specialist in ${essence.gift}, here to advance humanity's understanding of ${stelliumSign} wisdom.`;
  }
  
  return {
    title: "Cosmic Trinity Integration",
    specialConfiguration,
    core: `Your ${sun.sign} Sun (${SIGN_ESSENCE[sun.sign as keyof typeof SIGN_ESSENCE].sun}), ${moon.sign} Moon (${SIGN_ESSENCE[moon.sign as keyof typeof SIGN_ESSENCE].moon}), and ${rising.sign} Rising (${SIGN_ESSENCE[rising.sign as keyof typeof SIGN_ESSENCE].rising}) create a unique cosmic signature.`,
    elementBalance: `With ${dominantElement} as your dominant element, you naturally ${
      dominantElement === 'Fire' ? 'inspire and initiate transformational action' :
      dominantElement === 'Earth' ? 'manifest and ground spiritual visions into reality' :
      dominantElement === 'Air' ? 'communicate and bridge different realms of understanding' :
      'feel and intuit the deeper currents of existence'
    }.`,
    soulPurpose: `Your soul chose this specific combination to master the interplay between ${sun.sign} consciousness, ${moon.sign} emotion, and ${rising.sign} expression. This trinity teaches you to integrate ${
      hasTripleSigns ? 'absolute mastery of one energy' :
      hasDoubleSigns ? 'focused power through repetition' :
      'diverse energies into wholeness'
    }.`,
    lifeTheme: `The interplay between your ${archetype} (soul mission), ${foundation} (practical tools), and ${depth} (transformational gifts) is divinely orchestrated through your cosmic trinity.`,
    evolution: `Your highest evolution path:\n` +
      `- Sun: ${SIGN_ESSENCE[sun.sign as keyof typeof SIGN_ESSENCE].evolution}\n` +
      `- Moon: ${SIGN_ESSENCE[moon.sign as keyof typeof SIGN_ESSENCE].evolution}\n` +
      `- Rising: ${SIGN_ESSENCE[rising.sign as keyof typeof SIGN_ESSENCE].evolution}`
  };
};

// Generate life phases based on astrological cycles
export const getLifePhases = (chartData: ChartData, currentAge: number) => {
  const phases: Array<{
    name: string;
    age: string;
    focus: string;
    current?: boolean;
  }> = [];
  
  // Saturn cycles (every ~29.5 years)
  if (currentAge < 29) {
    phases.push({
      name: "First Saturn Cycle: Foundation Building",
      age: "0-29",
      focus: "Discovering identity, learning through experience, building life structures",
      current: true
    });
  } else if (currentAge < 58) {
    phases.push({
      name: "Second Saturn Cycle: Mastery Development",
      age: "29-58",
      focus: "Deepening expertise, taking responsibility, creating lasting impact",
      current: true
    });
  } else {
    phases.push({
      name: "Third Saturn Cycle: Wisdom Sharing",
      age: "58+",
      focus: "Teaching others, spiritual integration, legacy creation",
      current: true
    });
  }
  
  // Jupiter cycles (every ~12 years)
  const jupiterCycle = Math.floor(currentAge / 12) + 1;
  phases.push({
    name: `${jupiterCycle}th Jupiter Cycle`,
    age: `${(jupiterCycle - 1) * 12}-${jupiterCycle * 12}`,
    focus: "Expansion, new opportunities, philosophical growth",
    current: true
  });
  
  // Progressed Moon cycles (every ~27-28 years)
  const moonCycle = Math.floor(currentAge / 27.5) + 1;
  const moonPhase = (currentAge % 27.5) / 27.5;
  phases.push({
    name: `${moonCycle}th Emotional Cycle - ${
      moonPhase < 0.25 ? 'New Moon Phase' :
      moonPhase < 0.5 ? 'First Quarter Phase' :
      moonPhase < 0.75 ? 'Full Moon Phase' :
      'Last Quarter Phase'
    }`,
    age: `Current`,
    focus: moonPhase < 0.25 ? 'New emotional beginnings, planting seeds' :
           moonPhase < 0.5 ? 'Building emotional foundations, taking action' :
           moonPhase < 0.75 ? 'Emotional fulfillment, sharing gifts' :
           'Emotional release, preparing for renewal',
    current: true
  });
  
  return phases;
};

// Generate practical integration tips
export const getIntegrationPractices = (
  chartData: ChartData,
  solData: SolData
) => {
  const sunElement = getElement(chartData.sun.sign);
  const moonElement = getElement(chartData.moon.sign);
  
  return {
    daily: {
      morning: `Begin each day honoring your ${chartData.rising.sign} Rising through ${
        getElement(chartData.rising.sign) === 'Fire' ? 'movement and energetic activation' :
        getElement(chartData.rising.sign) === 'Earth' ? 'grounding practices and intention setting' :
        getElement(chartData.rising.sign) === 'Air' ? 'breathwork and mental clarity practices' :
        'emotional check-ins and intuitive guidance'
      }.`,
      midday: `Engage your ${chartData.sun.sign} Sun through ${
        sunElement === 'Fire' ? 'creative expression and leadership activities' :
        sunElement === 'Earth' ? 'productive work and tangible progress' :
        sunElement === 'Air' ? 'learning, communication, and idea exchange' :
        'emotional connection and intuitive work'
      }.`,
      evening: `Nurture your ${chartData.moon.sign} Moon through ${
        moonElement === 'Fire' ? 'passionate pursuits and spontaneous joy' :
        moonElement === 'Earth' ? 'sensory comfort and practical care' :
        moonElement === 'Air' ? 'social connection and mental stimulation' :
        'emotional processing and spiritual practices'
      }.`
    },
    weekly: {
      monday: "Moon day - honor emotional needs and intuitive guidance",
      tuesday: "Mars day - take action on your passions",
      wednesday: "Mercury day - communicate and learn",
      thursday: "Jupiter day - expand vision and seek growth",
      friday: "Venus day - cultivate beauty and relationships",
      saturday: "Saturn day - build structures and commitments",
      sunday: "Sun day - express authentic self and create"
    },
    monthly: {
      newMoon: `Set intentions aligned with your ${solData.archetype} vision`,
      firstQuarter: `Take concrete action on your ${solData.foundation} projects`,
      fullMoon: `Celebrate achievements and release what no longer serves your ${solData.depth}`,
      lastQuarter: `Reflect, integrate lessons, and prepare for renewal`
    },
    seasonal: {
      spring: "Plant seeds aligned with your soul mission",
      summer: "Nurture growth and expand your influence",
      autumn: "Harvest wisdom and share your gifts",
      winter: "Rest, reflect, and deepen spiritual connection"
    }
  };
};