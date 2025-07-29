import React from 'react';
import Image from 'next/image';
import { getSunSign, getSolPhase, getSolarArchetype, dayRangeToAgeRange, getCompleteSolarProfile, getFoundationDescription, getDepthDescription } from '../../lib/solarIdentity';
import { getNextMilestone } from '../../lib/milestones';

interface Bookmark {
  birthDate: string;
  solAge?: number;
  solArchetype?: string;
  foundation?: string;
  depth?: string;
  agePhase?: string;
}

interface SolEvolutionProps {
  bookmark: Bookmark;
}

const SolEvolution: React.FC<SolEvolutionProps> = ({ bookmark }) => {
  // Generate complete solar profile from birth date
  const solarProfile = bookmark?.birthDate ? getCompleteSolarProfile(bookmark.birthDate) : null;
  
  const sunSign = solarProfile?.sunSign || (bookmark?.birthDate ? getSunSign(bookmark.birthDate) : '');
  const solArchetype = solarProfile?.archetype || bookmark?.solArchetype || '';
  const foundation = solarProfile?.foundation || bookmark?.foundation || 'Seeker Foundation';
  const depth = solarProfile?.depth || bookmark?.depth || 'Explorer Depth';
  const agePhase = solarProfile?.agePhase || bookmark?.agePhase || '';

  // Use solAge from bookmark if present, otherwise calculate from birthDate
  const solAge =
    typeof bookmark.solAge === 'number' && !isNaN(bookmark.solAge)
      ? bookmark.solAge
      : bookmark.birthDate
        ? Math.floor((Date.now() - new Date(bookmark.birthDate).getTime()) / (1000 * 60 * 60 * 24))
        : undefined;

  // Debug: log the values used for phase calculation
  // eslint-disable-next-line no-console
  console.log('SolEvolution debug:', {
    solArchetype,
    solAge,
    foundation,
    depth,
    agePhase,
    phaseInfo: solArchetype && solAge !== undefined ? getSolPhase(solArchetype, solAge) : null,
    bookmark
  });

  const phaseInfo = solArchetype && solAge !== undefined ? getSolPhase(solArchetype, solAge) : null;

  // Current Phase: name, age range, description with enhanced foundation/depth context
  let phaseLabel = '';
  let phaseDescription = '';
  if (phaseInfo && solArchetype) {
    const phaseRanges = {
      'Sol Innovator': [
        { min: 0, max: 3652 },
        { min: 3653, max: 7305 },
        { min: 7306, max: 10957 },
        { min: 10958, max: 18262 },
        { min: 18263, max: 21914 },
        { min: 21915, max: Infinity },
      ],
      'Sol Nurturer': [
        { min: 0, max: 3652 },
        { min: 3653, max: 7305 },
        { min: 7306, max: 10957 },
        { min: 10958, max: 18262 },
        { min: 18263, max: 21914 },
        { min: 21915, max: Infinity },
      ],
      'Sol Alchemist': [
        { min: 0, max: 3652 },
        { min: 3653, max: 7305 },
        { min: 7306, max: 10957 },
        { min: 10958, max: 18262 },
        { min: 18263, max: 21914 },
        { min: 21915, max: Infinity },
      ],
      'Sol Sage': [
        { min: 0, max: 3652 },
        { min: 3653, max: 7305 },
        { min: 7306, max: 10957 },
        { min: 10958, max: 18262 },
        { min: 18263, max: 21914 },
        { min: 21915, max: Infinity },
      ],
      'Sol Builder': [
        { min: 0, max: 3652 },
        { min: 3653, max: 7305 },
        { min: 7306, max: 10957 },
        { min: 10958, max: 18262 },
        { min: 18263, max: 21914 },
        { min: 21915, max: Infinity },
      ],
      'Sol Artist': [
        { min: 0, max: 3652 },
        { min: 3653, max: 7305 },
        { min: 7306, max: 10957 },
        { min: 10958, max: 18262 },
        { min: 18263, max: 21914 },
        { min: 21915, max: Infinity },
      ],
    };
    const phaseRange = phaseRanges[solArchetype][phaseInfo.phase - 1];
    const ageRange = dayRangeToAgeRange(phaseRange.min, phaseRange.max === Infinity ? phaseRange.min + 3652 : phaseRange.max);
    phaseLabel = `CURRENT PHASE (${ageRange})`;
    
    // Enhanced description with foundation/depth context
    phaseDescription = `The ${phaseInfo.name} — Your ${agePhase.toLowerCase()} period of ${solArchetype.replace('Sol ', '').toLowerCase()} evolution.`;
  } else {
    phaseLabel = 'CURRENT PHASE';
    phaseDescription = 'Your current phase information will appear here.';
  }

  // Enhanced Key Themes with age-appropriate foundation/depth integration
  const keyTheme = `Your ${foundation.replace(' Foundation', '').toLowerCase()} foundation and ${depth.replace(' Depth', '').toLowerCase()} depth are creating a unique ${solArchetype.replace('Sol ', '').toLowerCase() || 'solar'} expression ready to reach wider communities.`;

  // Upcoming Milestone
  let milestoneLabel = '';
  let milestoneDescription = '';
  if (bookmark.birthDate && solAge !== undefined) {
    const milestone = getNextMilestone(solAge, new Date(bookmark.birthDate));
    if (milestone) {
      milestoneLabel = `UPCOMING MILESTONE (DAY ${milestone.cycles.toLocaleString()})`;
      milestoneDescription = `${milestone.description} — ${milestone.daysToMilestone} days away.`;
    } else {
      milestoneLabel = 'UPCOMING MILESTONE';
      milestoneDescription = 'Your next milestone will appear here.';
    }
  } else {
    milestoneLabel = 'UPCOMING MILESTONE';
    milestoneDescription = 'Your next milestone will appear here.';
  }

  return (
    <div className="w-full max-w-xl mx-auto p-8 bg-white border border-gray-200 rounded-none flex flex-col gap-4">
      <div className="text-2xl font-serif font-semibold text-center">Your current Sol evolution</div>
      {/* Current Phase */}
      <div className="flex gap-3 items-start mb-2">
        <Image src="/you/little_light.svg" alt="Current Phase Icon" width={32} height={32} className="w-8 h-8" />
        <div>
          <div className="font-mono text-[#E67803] text-lg font-medium uppercase tracking-tight mb-1">{phaseLabel}</div>
          <div className="font-serif text-lg text-black leading-snug">{phaseDescription}</div>
        </div>
      </div>
      {/* Key Themes */}
      <div className="flex gap-3 items-start mb-2">
        <Image src="/you/little_star.svg" alt="Key Themes Icon" width={32} height={32} className="w-8 h-8 mt-1" />
        <div>
          <div className="font-mono text-[#E67803] text-lg font-medium uppercase tracking-tight mb-1">KEY THEMES THIS SOLAR YEAR</div>
          <div className="font-serif text-lg text-black leading-snug">{keyTheme}</div>
        </div>
      </div>
      {/* Upcoming Milestone */}
      <div className="flex gap-3 items-start">
        <Image src="/you/little_nova.svg" alt="Upcoming Milestone Icon" width={32} height={32} className="w-8 h-8 mt-1" />
        <div>
          <div className="font-mono text-[#E67803] text-lg font-medium uppercase tracking-tight mb-1">{milestoneLabel}</div>
          <div className="font-serif text-lg text-black leading-snug">{milestoneDescription}</div>
        </div>
      </div>
    </div>
  );
};

export default SolEvolution; 