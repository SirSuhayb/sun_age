// Deep Astrological Insights System

interface ChartData {
  sun: { sign: string; degree: number; house: number };
  moon: { sign: string; degree: number; house: number };
  rising: { sign: string; degree: number };
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

// Deep sign interpretations
const SIGN_ESSENCE = {
  Aries: {
    core: "pioneering spirit and initiatory force",
    gift: "courage to begin new cycles",
    shadow: "impatience with process",
    evolution: "from raw instinct to conscious leadership"
  },
  Taurus: {
    core: "grounding presence and sensual wisdom",
    gift: "manifestation through patience",
    shadow: "resistance to necessary change",
    evolution: "from material attachment to spiritual abundance"
  },
  Gemini: {
    core: "mental agility and communicative bridge",
    gift: "connecting diverse perspectives",
    shadow: "scattered focus",
    evolution: "from information gathering to wisdom synthesis"
  },
  Cancer: {
    core: "emotional intelligence and nurturing wisdom",
    gift: "intuitive understanding of needs",
    shadow: "defensive withdrawal",
    evolution: "from personal protection to universal care"
  },
  Leo: {
    core: "creative self-expression and heart radiance",
    gift: "inspiring others through authenticity",
    shadow: "ego-driven validation needs",
    evolution: "from personal glory to collective empowerment"
  },
  Virgo: {
    core: "sacred service and analytical precision",
    gift: "healing through practical wisdom",
    shadow: "paralysis through perfectionism",
    evolution: "from criticism to compassionate refinement"
  },
  Libra: {
    core: "harmonizing intelligence and relational wisdom",
    gift: "creating beauty and balance",
    shadow: "indecision through over-consideration",
    evolution: "from external harmony to inner equilibrium"
  },
  Scorpio: {
    core: "transformational power and depth perception",
    gift: "alchemical transformation of shadow",
    shadow: "destructive intensity",
    evolution: "from control to surrender and rebirth"
  },
  Sagittarius: {
    core: "philosophical vision and expansive faith",
    gift: "inspiring through higher meaning",
    shadow: "dogmatic righteousness",
    evolution: "from belief to direct knowing"
  },
  Capricorn: {
    core: "masterful structure and timeless wisdom",
    gift: "manifesting lasting legacy",
    shadow: "cold ambition",
    evolution: "from worldly success to spiritual authority"
  },
  Aquarius: {
    core: "revolutionary vision and collective consciousness",
    gift: "innovative solutions for humanity",
    shadow: "detached superiority",
    evolution: "from rebellion to conscious revolution"
  },
  Pisces: {
    core: "mystical unity and compassionate dissolution",
    gift: "healing through unconditional love",
    shadow: "escapist tendencies",
    evolution: "from victim to mystic healer"
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
    core: `Your ${sun.sign} Sun represents ${essence.core}, expressing through the realm of ${house}. As a ${archetype}, this placement gives you ${essence.gift}, particularly in areas related to ${house}.`,
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
    evolution: `Your soul's journey involves ${essence.evolution}, using your ${archetype} gifts to illuminate the ${house} area of life.`,
    integration: `To fully embody your ${sun.sign} Sun, embrace ${essence.gift} while being mindful of ${essence.shadow}. Your ${archetype} path offers unique opportunities to transform these shadow aspects into wisdom.`
  };
};

// Generate Moon interpretation
export const getMoonInterpretation = (moon: ChartData['moon'], foundation: string) => {
  const essence = SIGN_ESSENCE[moon.sign as keyof typeof SIGN_ESSENCE];
  const element = getElement(moon.sign);
  const house = HOUSE_THEMES[moon.house as keyof typeof HOUSE_THEMES];
  
  return {
    title: `${moon.sign} Moon in ${moon.house}th House`,
    core: `Your ${moon.sign} Moon reveals ${essence.core} in your emotional nature, finding comfort through ${house}. Your ${foundation} provides the container for these deep emotional currents.`,
    emotional: `You process feelings through the ${element} element, which means ${
      element === 'Fire' ? 'quick, passionate responses that seek immediate expression' :
      element === 'Earth' ? 'slow, steady processing that seeks practical outcomes' :
      element === 'Air' ? 'mental analysis and communication of feelings' :
      'deep, intuitive absorption that transforms over time'
    }.`,
    needs: `Your soul needs ${essence.gift} to feel emotionally secure, particularly in matters of ${house}. Your ${foundation} supports these needs through practical structures.`,
    cycles: `Your emotional cycles follow the ${moon.sign} rhythm, ${
      getMode(moon.sign) === 'Cardinal' ? 'initiating new emotional experiences regularly' :
      getMode(moon.sign) === 'Fixed' ? 'building deep emotional consistency over time' :
      'flowing between different emotional states with natural ease'
    }.`,
    healing: `Emotional healing comes through embracing ${essence.gift} while releasing ${essence.shadow}. Your ${foundation} provides the stability needed for this deep work.`
  };
};

// Generate Rising interpretation
export const getRisingInterpretation = (rising: ChartData['rising'], depth: string) => {
  const essence = SIGN_ESSENCE[rising.sign as keyof typeof SIGN_ESSENCE];
  const element = getElement(rising.sign);
  const mode = getMode(rising.sign);
  
  return {
    title: `${rising.sign} Rising`,
    core: `Your ${rising.sign} Ascendant creates a persona of ${essence.core}, the mask through which your ${depth} expresses itself to the world.`,
    approach: `You approach life with ${element} energy, ${
      element === 'Fire' ? 'meeting each moment with enthusiasm and direct action' :
      element === 'Earth' ? 'grounding each experience in practical reality' :
      element === 'Air' ? 'engaging through ideas and social connection' :
      'feeling your way through intuitive perception'
    }.`,
    firstImpression: `Others first perceive you as embodying ${essence.gift}, though your ${depth} adds layers of complexity beneath this initial impression.`,
    lifeApproach: `Your ${mode} Rising means you ${
      mode === 'Cardinal' ? 'constantly initiate new beginnings and fresh starts' :
      mode === 'Fixed' ? 'maintain steady presence and consistent approach' :
      'adapt your approach based on circumstances'
    }.`,
    integration: `The journey involves ${essence.evolution}, using your ${depth} to transform the ${rising.sign} mask into authentic self-expression.`
  };
};

// Generate synthesis interpretation
export const getSynthesisInterpretation = (
  sun: ChartData['sun'],
  moon: ChartData['moon'],
  rising: ChartData['rising'],
  archetype: string,
  foundation: string,
  depth: string
) => {
  const sunElement = getElement(sun.sign);
  const moonElement = getElement(moon.sign);
  const risingElement = getElement(rising.sign);
  
  // Element balance analysis
  const elements = [sunElement, moonElement, risingElement];
  const elementCounts = elements.reduce((acc, el) => {
    acc[el] = (acc[el] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const dominantElement = Object.entries(elementCounts)
    .sort(([,a], [,b]) => b - a)[0][0];
  
  return {
    title: "Cosmic Trinity Integration",
    core: `Your ${sun.sign} Sun (conscious will), ${moon.sign} Moon (emotional needs), and ${rising.sign} Rising (life approach) create a unique cosmic signature that perfectly supports your ${archetype} path.`,
    elementBalance: `With ${dominantElement} as your dominant element, you naturally ${
      dominantElement === 'Fire' ? 'inspire and initiate transformational action' :
      dominantElement === 'Earth' ? 'manifest and ground spiritual visions into reality' :
      dominantElement === 'Air' ? 'communicate and bridge different realms of understanding' :
      'feel and intuit the deeper currents of existence'
    }.`,
    soulPurpose: `Your soul chose this specific combination to ${
      sun.sign === moon.sign ? `deeply master the lessons of ${sun.sign} through unified expression` :
      getElement(sun.sign) === getElement(moon.sign) ? 
        `harmonize your inner and outer life through ${getElement(sun.sign)} wisdom` :
        'integrate diverse energies into a unique synthesis'
    }.`,
    lifeTheme: `The interplay between your ${archetype} (soul mission), ${foundation} (practical tools), and ${depth} (transformational gifts) is perfectly supported by your astrological configuration.`,
    evolution: `Your highest evolution involves integrating:\n` +
      `- ${SIGN_ESSENCE[sun.sign as keyof typeof SIGN_ESSENCE].gift} (Sun)\n` +
      `- ${SIGN_ESSENCE[moon.sign as keyof typeof SIGN_ESSENCE].gift} (Moon)\n` +
      `- ${SIGN_ESSENCE[rising.sign as keyof typeof SIGN_ESSENCE].gift} (Rising)\n` +
      `Into a unified expression of your ${archetype} nature.`
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