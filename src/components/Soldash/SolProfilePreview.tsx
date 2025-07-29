import React from 'react';
import Image from 'next/image';
import { getSunSign, getSolPhase, getSolarArchetype, solarArchetypeCoreQuotes, generateSolarIdentityDescription, getCompleteSolarProfile } from '../../lib/solarIdentity';

interface Bookmark {
  birthDate: string;
  solAge: number;
  solArchetype?: string;
  foundation?: string;
  depth?: string;
  agePhase?: string;
}

interface SolProfilePreviewProps {
  bookmark: Bookmark;
}

const SolProfilePreview: React.FC<SolProfilePreviewProps> = ({ bookmark }) => {
  // Generate complete solar profile from birth date
  const solarProfile = bookmark?.birthDate ? getCompleteSolarProfile(bookmark.birthDate) : null;
  
  const sunSign = solarProfile?.sunSign || (bookmark?.birthDate ? getSunSign(bookmark.birthDate) : '');
  const solArchetype = solarProfile?.archetype || bookmark?.solArchetype || '';
  const foundation = solarProfile?.foundation || bookmark?.foundation || 'Seeker Foundation';
  const depth = solarProfile?.depth || bookmark?.depth || 'Explorer Depth';
  const agePhase = solarProfile?.agePhase || bookmark?.agePhase || '';
  const coreQuote = solarProfile?.coreQuote || (solArchetype ? solarArchetypeCoreQuotes[solArchetype] : '') || '';

  // Get phase info for compatibility with existing evolution display
  const phaseInfo = solArchetype && bookmark?.solAge !== undefined ? getSolPhase(solArchetype, bookmark.solAge) : null;

  // SVG paths
  const sunSignSvg = sunSign ? `/astrology/signs/${sunSign.toLowerCase()}.svg` : '';
  const radiantSunSvg = '/astrology/radiant_sun.svg';

  // Generate the enhanced value proposition description
  const description = solarProfile
    ? generateSolarIdentityDescription(sunSign, solArchetype, foundation, depth, agePhase)
    : 'Your Solar Identity description will appear here.';

  // Debug logging for missing data
  if (!coreQuote && solArchetype) {
    // eslint-disable-next-line no-console
    console.warn('No coreQuote found for archetype:', solArchetype);
  }
  if (!description && solarProfile) {
    // eslint-disable-next-line no-console
    console.warn('No description generated for:', { sunSign, solArchetype, foundation, depth });
  }

  return (
    <div
      className="w-full max-w-xl mx-auto p-6 flex flex-col gap-6"
      style={{
        background: '#FCF6E5',
        borderTop: '5px solid #DBD3BC',
        borderLeft: '1px solid #DBD3BC',
        borderRight: '1px solid #DBD3BC',
        borderBottom: '1px solid #DBD3BC',
        boxSizing: 'border-box',
        borderRadius: 0,
      }}
    >
      {/* Header Row */}
      <div className="flex items-center justify-between gap-4">
        {sunSignSvg ? (
          <Image src={sunSignSvg} alt={sunSign} width={56} height={56} className="w-14 h-14 object-contain" style={{ borderRadius: 0 }} />
        ) : (
          <div className="w-14 h-14" />
        )}
        <div className="flex-1 text-center">
          <div className="text-2xl font-serif font-semibold text-[#222]">
            {sunSign ? `${sunSign} Sun` : ''}
          </div>
          <div className="text-2xl font-serif text-[#222]">
            {solArchetype || ''}
          </div>
        </div>
        <Image src={radiantSunSvg} alt="Radiant Sun" width={56} height={56} className="w-14 h-14 object-contain" style={{ borderRadius: 0 }} />
      </div>

      {/* Subheader: Foundation & Depth */}
      <div className="text-center">
        <div className="text-base font-mono tracking-tight leading-tightest text-[#888] uppercase">
          {foundation.toUpperCase()} & {depth.toUpperCase()}
        </div>
      </div>

      {/* Power Phrase */}
      <div className="bg-white border border-[#E5E1D8] p-4 text-center italic text-2xl leading-tight tracking-tightest font-serif" style={{ borderRadius: 0 }}>
        {coreQuote ? `"${coreQuote}"` : '"Your power phrase will appear here."'}
      </div>

      {/* Enhanced Description */}
      <div className="text-[#5F5F5F] text-lg font-serif text-left leading-tight mb-4">
        {description}
      </div>
    </div>
  );
};

export default SolProfilePreview; 