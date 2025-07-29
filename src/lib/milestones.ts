import { isPalindrome, isInterestingNumber } from './numberUtils';

export interface Milestone {
  type: 'interval' | 'palindrome' | 'interesting' | 'cosmic' | 'angel';
  cycles: number;
  label: string;
  emoji: string;
  description: string;
  daysToMilestone: number;
  milestoneDate: string;
}

// Cosmic numbers for special milestones
const COSMIC_NUMBERS = [
  { cycles: 1000, name: "First Thousand", description: "A thousand rotations around the sun" },
  { cycles: 5000, name: "Five Thousand", description: "Five thousand solar cycles" },
  { cycles: 10000, name: "Ten Thousand", description: "Ten thousand days of solar rotation" },
  { cycles: 25000, name: "Twenty-Five Thousand", description: "A quarter of a hundred thousand cycles" },
  { cycles: 50000, name: "Fifty Thousand", description: "Fifty thousand solar cycles" },
  { cycles: 100000, name: "Hundred Thousand", description: "A hundred thousand rotations" }
];

// Angel numbers for spiritual milestones
const ANGEL_NUMBERS = [
  { cycles: 1111, name: "Angel Number 1111", description: "A powerful manifestation number" },
  { cycles: 2222, name: "Angel Number 2222", description: "Balance and harmony" },
  { cycles: 3333, name: "Angel Number 3333", description: "Divine protection and guidance" },
  { cycles: 4444, name: "Angel Number 4444", description: "Angels are near" },
  { cycles: 5555, name: "Angel Number 5555", description: "Major life changes" },
  { cycles: 6666, name: "Angel Number 6666", description: "Material and spiritual balance" },
  { cycles: 7777, name: "Angel Number 7777", description: "Spiritual awakening" },
  { cycles: 8888, name: "Angel Number 8888", description: "Abundance and prosperity" },
  { cycles: 9999, name: "Angel Number 9999", description: "Completion and fulfillment" },
  // 5-digit angel numbers for most lifespans
  { cycles: 11111, name: "Angel Number 11111", description: "A new era of manifestation and alignment" },
  { cycles: 22222, name: "Angel Number 22222", description: "Profound harmony and life balance" },
  { cycles: 33333, name: "Angel Number 33333", description: "Deep spiritual guidance and protection" }
];

// Convert all milestone types to our unified Milestone interface
export const MILESTONES: Milestone[] = [
  // Interval milestones (every 1000 days)
  ...Array.from({ length: 100 }, (_, i) => ({
    type: 'interval' as const,
    cycles: (i + 1) * 1000,
    label: `${(i + 1) * 1000} Rotations`,
    emoji: '🔢',
    description: `${(i + 1) * 1000} days of solar rotation`,
    daysToMilestone: (i + 1) * 1000,
    milestoneDate: new Date((i + 1) * 1000).toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, "."),
  })),
  // Cosmic milestones
  ...COSMIC_NUMBERS.map(m => ({
    type: 'cosmic' as const,
    cycles: m.cycles,
    label: m.name,
    emoji: '🌌',
    description: m.description,
    daysToMilestone: m.cycles,
    milestoneDate: new Date(m.cycles).toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, "."),
  })),
  // Angel number milestones
  ...ANGEL_NUMBERS.map(m => ({
    type: 'angel' as const,
    cycles: m.cycles,
    label: m.name,
    emoji: '👼',
    description: m.description,
    daysToMilestone: m.cycles,
    milestoneDate: new Date(m.cycles).toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, "."),
  })),
  // Palindrome milestones
  ...Array.from({ length: 100 }, (_, i) => ({
    type: 'palindrome' as const,
    cycles: (i + 1) * 1000,
    label: "Palindrome Day",
    emoji: '🔄',
    description: "A rare palindrome day count",
    daysToMilestone: (i + 1) * 1000,
    milestoneDate: new Date((i + 1) * 1000).toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, "."),
  })),
  // Interesting number milestones
  ...Array.from({ length: 100 }, (_, i) => ({
    type: 'interesting' as const,
    cycles: (i + 1) * 1000,
    label: "Interesting Number",
    emoji: '✨',
    description: "A mathematically interesting number",
    daysToMilestone: (i + 1) * 1000,
    milestoneDate: new Date((i + 1) * 1000).toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, "."),
  }))
].sort((a, b) => a.cycles - b.cycles);

// Get the next milestone based on current cycles and birth date
export function getNextMilestone(days: number, birthDate: Date): Milestone | null {
  const today = new Date();
  const nextMilestones: Milestone[] = [];

  // 1. Next 1000-day interval
  const nextInterval = Math.ceil((days + 1) / 1000) * 1000;
  const toNextInterval = nextInterval - days;
  const dInterval = new Date(birthDate);
  dInterval.setDate(dInterval.getDate() + days + toNextInterval);
  nextMilestones.push({
    cycles: nextInterval,
    label: 'Numerical Milestone',
    emoji: '🔢',
    description: 'A significant numerical milestone',
    daysToMilestone: toNextInterval,
    milestoneDate: dInterval.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, "."),
    type: 'interval'
  });

  // 2. Next birthday (solar return)
  const nextBirthday = new Date(birthDate);
  nextBirthday.setFullYear(today.getFullYear());
  if (nextBirthday < today) {
    nextBirthday.setFullYear(today.getFullYear() + 1);
  }
  const daysToBirthday = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const cyclesAtBirthday = days + daysToBirthday;
  nextMilestones.push({
    cycles: cyclesAtBirthday,
    label: 'Solar Return',
    emoji: '🌞',
    description: 'Your annual solar return',
    daysToMilestone: daysToBirthday,
    milestoneDate: nextBirthday.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, "."),
    type: 'cosmic'
  });

  // 3. Next palindrome
  let nextPalindrome = days + 1;
  while (!isPalindrome(nextPalindrome)) {
    nextPalindrome++;
  }
  const toNextPalindrome = nextPalindrome - days;
  const dPalindrome = new Date(birthDate);
  dPalindrome.setDate(dPalindrome.getDate() + days + toNextPalindrome);
  nextMilestones.push({
    cycles: nextPalindrome,
    label: 'Palindrome Day',
    emoji: '🔄',
    description: 'A rare palindrome day count',
    daysToMilestone: toNextPalindrome,
    milestoneDate: dPalindrome.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, "."),
    type: 'palindrome'
  });

  // 4. Next interesting number
  let nextInteresting = days + 1;
  while (!isInterestingNumber(nextInteresting)) {
    nextInteresting++;
  }
  const toNextInteresting = nextInteresting - days;
  const dInteresting = new Date(birthDate);
  dInteresting.setDate(dInteresting.getDate() + days + toNextInteresting);
  nextMilestones.push({
    cycles: nextInteresting,
    label: 'Interesting Number',
    emoji: '✨',
    description: 'A mathematically interesting number',
    daysToMilestone: toNextInteresting,
    milestoneDate: dInteresting.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, "."),
    type: 'interesting'
  });

  // 5. Next cosmic number
  const nextCosmic = COSMIC_NUMBERS.find(m => m.cycles > days);
  if (nextCosmic) {
    const toNextCosmic = nextCosmic.cycles - days;
    const dCosmic = new Date(birthDate);
    dCosmic.setDate(dCosmic.getDate() + days + toNextCosmic);
    nextMilestones.push({
      cycles: nextCosmic.cycles,
      label: nextCosmic.name,
      emoji: '🌌',
      description: nextCosmic.description,
      daysToMilestone: toNextCosmic,
      milestoneDate: dCosmic.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, "."),
      type: 'cosmic'
    });
  }

  // 6. Next angel number
  const nextAngel = ANGEL_NUMBERS.find(m => m.cycles > days);
  if (nextAngel) {
    const toNextAngel = nextAngel.cycles - days;
    const dAngel = new Date(birthDate);
    dAngel.setDate(dAngel.getDate() + days + toNextAngel);
    nextMilestones.push({
      cycles: nextAngel.cycles,
      label: nextAngel.name,
      emoji: '👼',
      description: nextAngel.description,
      daysToMilestone: toNextAngel,
      milestoneDate: dAngel.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, "."),
      type: 'angel'
    });
  }

  // Find the soonest milestone
  const soonest = nextMilestones.reduce((a, b) => (a.daysToMilestone < b.daysToMilestone ? a : b));
  return soonest;
}

export function getCurrentMilestone(currentCycles: number): Milestone | null {
  return MILESTONES.find(m => m.cycles === currentCycles) || null;
}

export function getProgressToNextMilestone(days: number, birthDate: Date): number {
  const nextMilestone = getNextMilestone(days, birthDate);
  if (!nextMilestone) return 0;
  const totalDays = nextMilestone.cycles - days;
  return (days % totalDays) / totalDays;
}

function getPreviousMilestone(currentCycles: number): Milestone | null {
  return MILESTONES.filter(m => m.cycles < currentCycles).pop() || null;
}

export function getMilestoneDescription(milestone: Milestone): string {
  switch (milestone.type) {
    case 'interval':
      return `Reach ${milestone.cycles} rotations around the sun`;
    case 'cosmic':
      return milestone.description;
    case 'angel':
      return milestone.description;
    case 'palindrome':
      return "A rare palindrome day count";
    case 'interesting':
      return "A mathematically interesting number";
    default:
      return milestone.description;
  }
}

// Main function: get next N numerical milestones
export function getNextNumericalMilestones(days: number, birthDate: Date, count: number = 10): Milestone[] {
  const milestones: Milestone[] = [];
  let currentDays = days;

  for (let i = 0; i < count; i++) {
    const nextMilestone = getNextMilestone(currentDays, birthDate);
    if (!nextMilestone) break;
    milestones.push(nextMilestone);
    currentDays = nextMilestone.cycles;
  }

  return milestones;
}

export function getNextMilestoneByType(days: number, birthDate: Date): Record<Milestone['type'], Milestone | null> {
  const types: Milestone['type'][] = ['interval', 'palindrome', 'interesting', 'cosmic', 'angel'];
  const result: Record<Milestone['type'], Milestone | null> = {
    interval: null,
    palindrome: null,
    interesting: null,
    cosmic: null,
    angel: null,
  };

  // 1. Next interval
  const nextInterval = Math.ceil((days + 1) / 1000) * 1000;
  const toNextInterval = nextInterval - days;
  const dInterval = new Date(birthDate);
  dInterval.setDate(dInterval.getDate() + days + toNextInterval);
  result.interval = {
    cycles: nextInterval,
    label: 'Numerical Milestone',
    emoji: '🔢',
    description: 'A significant numerical milestone.',
    daysToMilestone: toNextInterval,
    milestoneDate: dInterval.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, "."),
    type: 'interval'
  };

  // 2. Next palindrome
  let nextPalindrome = days + 1;
  while (!isPalindrome(nextPalindrome)) {
    nextPalindrome++;
  }
  const toNextPalindrome = nextPalindrome - days;
  const dPalindrome = new Date(birthDate);
  dPalindrome.setDate(dPalindrome.getDate() + days + toNextPalindrome);
  result.palindrome = {
    cycles: nextPalindrome,
    label: 'Palindrome Day',
    emoji: '🔄',
    description: 'A rare palindrome day count!',
    daysToMilestone: toNextPalindrome,
    milestoneDate: dPalindrome.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, "."),
    type: 'palindrome'
  };

  // 3. Next interesting number
  let nextInteresting = days + 1;
  while (!isInterestingNumber(nextInteresting)) {
    nextInteresting++;
  }
  const toNextInteresting = nextInteresting - days;
  const dInteresting = new Date(birthDate);
  dInteresting.setDate(dInteresting.getDate() + days + toNextInteresting);
  result.interesting = {
    cycles: nextInteresting,
    label: 'Interesting Number',
    emoji: '✨',
    description: 'A mathematically interesting number!',
    daysToMilestone: toNextInteresting,
    milestoneDate: dInteresting.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, "."),
    type: 'interesting'
  };

  // 4. Next cosmic (including solar return)
  // Solar return (birthday)
  const today = new Date();
  const nextBirthday = new Date(birthDate);
  nextBirthday.setFullYear(today.getFullYear());
  if (nextBirthday < today) {
    nextBirthday.setFullYear(today.getFullYear() + 1);
  }
  const daysToBirthday = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const cyclesAtBirthday = days + daysToBirthday;
  const dCosmicBirthday = new Date(birthDate);
  dCosmicBirthday.setDate(dCosmicBirthday.getDate() + days + daysToBirthday);
  // Next cosmic number milestone
  const nextCosmic = COSMIC_NUMBERS.find(m => m.cycles > days);
  let cosmicMilestone: Milestone | null = null;
  if (nextCosmic) {
    const toNextCosmic = nextCosmic.cycles - days;
    const dCosmic = new Date(birthDate);
    dCosmic.setDate(dCosmic.getDate() + days + toNextCosmic);
    // Pick the soonest between solar return and cosmic number
    if (toNextCosmic < daysToBirthday) {
      cosmicMilestone = {
        cycles: nextCosmic.cycles,
        label: nextCosmic.name,
        emoji: '🌌',
        description: nextCosmic.description,
        daysToMilestone: toNextCosmic,
        milestoneDate: dCosmic.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, "."),
        type: 'cosmic'
      };
    } else {
      cosmicMilestone = {
        cycles: cyclesAtBirthday,
        label: 'Solar Return',
        emoji: '🌞',
        description: 'Your annual solar return.',
        daysToMilestone: daysToBirthday,
        milestoneDate: nextBirthday.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, "."),
        type: 'cosmic'
      };
    }
  } else {
    // Only solar return available
    cosmicMilestone = {
      cycles: cyclesAtBirthday,
      label: 'Solar Return',
      emoji: '🌞',
      description: 'Your annual solar return.',
      daysToMilestone: daysToBirthday,
      milestoneDate: nextBirthday.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, "."),
      type: 'cosmic'
    };
  }
  result.cosmic = cosmicMilestone;

  // 5. Next angel number
  const nextAngel = ANGEL_NUMBERS.find(m => m.cycles > days);
  if (nextAngel) {
    const toNextAngel = nextAngel.cycles - days;
    const dAngel = new Date(birthDate);
    dAngel.setDate(dAngel.getDate() + days + toNextAngel);
    result.angel = {
      cycles: nextAngel.cycles,
      label: nextAngel.name,
      emoji: '👼',
      description: nextAngel.description,
      daysToMilestone: toNextAngel,
      milestoneDate: dAngel.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, "."),
      type: 'angel'
    };
  } else {
    result.angel = null;
  }

  return result;
} 