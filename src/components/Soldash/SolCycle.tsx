import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { getCosmicEventsForDate, interpretCosmicEventsForArchetype, contextualizeCosmicMoment, analyzeCosmicPatterns } from '~/lib/astrology';
import { getWorldEventForDate } from '~/lib/worldEvent';
import { getSolarArchetype } from '~/lib/solarArchetype';
import { getLifePhase } from '~/lib/solarIdentity';
import { useFrameSDK } from '~/hooks/useFrameSDK';

function getRandomSolDay(solAge: number) {
  const min = Math.max(1, solAge - 7 * 365);
  const max = Math.max(1, solAge - 2 * 365);
  if (max <= min) return min;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function truncateEventText(eventText: string, maxWords = 10): string {
  const [year, ...descParts] = eventText.split(':');
  const desc = descParts.join(':').trim();
  const words = desc.split(/\s+/);
  const truncated = words.length > maxWords
    ? words.slice(0, maxWords).join(' ') + '…'
    : desc;
  return descParts.length ? `${year.trim()}: ${truncated}` : truncated;
}

export default function SolCycle() {
  const { isSDKLoaded, isInFrame, sdk } = useFrameSDK();
  const [bookmark, setBookmark] = useState<{ solAge: number; birthDate: string } | null>(null);
  const [prevSolDay, setPrevSolDay] = useState<number | null>(null);
  const [prevSolDate, setPrevSolDate] = useState<Date | null>(null);
  const [cosmicAspect, setCosmicAspect] = useState<string | null>(null);
  const [cosmicInterpretation, setCosmicInterpretation] = useState<string>('');
  const [cosmicPattern, setCosmicPattern] = useState<{
    pattern: string | null;
    interpretation: string;
    phenomenaLikelihood: number;
  } | null>(null);
  const [dynamicAwakeningText, setDynamicAwakeningText] = useState<string>('A day of profound creative breakthroughs');
  const [worldEvent, setWorldEvent] = useState<{ text: string, url?: string } | null>(null);
  const [worldEventLoading, setWorldEventLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sunCycleBookmark');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.days && parsed.birthDate) {
          setBookmark({ solAge: parsed.days, birthDate: parsed.birthDate });
        }
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (bookmark) {
      const solAge = bookmark.solAge;
      const prevDay = getRandomSolDay(solAge);
      setPrevSolDay(prevDay);
      // Compute the date: birthDate + prevDay days
      const birth = new Date(bookmark.birthDate);
      const prevDate = new Date(birth.getTime() + prevDay * 24 * 60 * 60 * 1000);
      setPrevSolDate(prevDate);
    }
  }, [bookmark]);

  useEffect(() => {
    if (prevSolDate && bookmark) {
      const events = getCosmicEventsForDate(prevSolDate, new Date(bookmark.birthDate));
      console.log('[SolCycle] Cosmic events for date:', {
        date: prevSolDate.toISOString(),
        birthDate: bookmark.birthDate,
        events,
        eventCount: events.length,
        firstEvent: events[0]
      });
      
      // Get the user's sol archetype
      const archetype = getSolarArchetype(bookmark.birthDate);
      console.log('[SolCycle] User archetype:', archetype);
      
      // Get user's life phase at that time
      const ageAtEvent = Math.floor((prevSolDate.getTime() - new Date(bookmark.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      const lifePhase = getLifePhase(ageAtEvent);
      
      // Get the cosmic event and its interpretation
      const firstEvent = events[0] || null;
      const interpretation = interpretCosmicEventsForArchetype(events, archetype);
      
      // Analyze cosmic patterns for enhanced understanding
      const patterns = analyzeCosmicPatterns(events, lifePhase.name, prevSolDate);
      const cosmicContext = contextualizeCosmicMoment(events, lifePhase.name, archetype, prevSolDate);
      
      setCosmicAspect(firstEvent);
      setCosmicInterpretation(interpretation);
      setCosmicPattern(patterns);
      
      // Generate dynamic awakening text based on cosmic context
      const awakeningText = generateDynamicAwakeningText(patterns, cosmicContext, lifePhase.name, archetype);
      setDynamicAwakeningText(awakeningText);
      
      console.log('[SolCycle] Enhanced cosmic interpretation:', {
        event: firstEvent,
        archetype,
        interpretation,
        patterns,
        cosmicContext,
        awakeningText
      });
    }
  }, [prevSolDate, bookmark]);

  useEffect(() => {
    let cancelled = false;
    async function fetchEvent() {
      if (prevSolDate) {
        setWorldEventLoading(true);
        const event = await getWorldEventForDate(prevSolDate);
        if (!cancelled) {
          setWorldEvent(event);
          setWorldEventLoading(false);
        }
      }
    }
    fetchEvent();
    return () => { cancelled = true; };
  }, [prevSolDate]);

  const handleWorldEventClick = (url: string) => {
    console.log('[SolCycle] World event click:', { url, isInFrame, isSDKLoaded, hasSDK: !!sdk });
    
    if (isInFrame && isSDKLoaded && sdk) {
      // Use Farcaster SDK to open URL in frame
      console.log('[SolCycle] Using Farcaster SDK openUrl');
      sdk.actions.openUrl(url);
    } else {
      // Fallback to regular link behavior
      console.log('[SolCycle] Using fallback window.open');
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const generateDynamicAwakeningText = (
    patterns: { pattern: string | null; interpretation: string; phenomenaLikelihood: number },
    cosmicContext: { cosmicMoment: string; personalContext: string; trajectory: string },
    lifePhase: string,
    archetype: string
  ): string => {
    const baseAwakenings = {
      'BREAKTHROUGH': `A day of cosmic breakthrough where ${archetype.toLowerCase()} insights flowed freely`,
      'SERENDIPITY': `A harmonious day when meaningful coincidences aligned with your ${archetype.toLowerCase()} path`,
      'TRANSFORMATION': `A powerful day of personal transformation during your ${lifePhase.toLowerCase()}`,
      'AWAKENING': `An electric day of heightened awareness and ${archetype.toLowerCase()} activation`,
    };

    if (patterns.pattern && baseAwakenings[patterns.pattern]) {
      return baseAwakenings[patterns.pattern];
    }

    // Fallback based on cosmic moment
    if (cosmicContext.cosmicMoment.includes('Jupiter')) {
      return `A day of expansion and wisdom during your ${lifePhase.toLowerCase()}`;
    } else if (cosmicContext.cosmicMoment.includes('Pluto')) {
      return `A day of deep transformation and personal power`;
    } else if (cosmicContext.cosmicMoment.includes('Uranus')) {
      return `A day of innovation and sudden insights`;
    } else if (cosmicContext.cosmicMoment.includes('Venus')) {
      return `A day of beauty, connection, and creative flow`;
    }

    return `A day of profound ${archetype.toLowerCase()} expression and growth`;
  };

  if (!bookmark || !prevSolDay || !prevSolDate) return null;

  return (
    <div className="w-full flex flex-col items-center">
      {/* Section Title (optional, for consistency) */}
      {/* <div className="text-lg font-serif font-bold text-center mb-2" style={{ color: '#AE8C25' }}>
        Previous Sol Cycles
      </div> */}
      {/* Card */}
      <div
        className="w-full mt-1 mb-2"
        style={{
          background: '#F1F3FF',
          border: '1px solid #3730A3',
          boxSizing: 'border-box',
        }}
      >
        <div className="px-6 pt-6 pb-2">
          {/* Starspike SVG */}
          <div className="flex justify-center" style={{ marginBottom: 12 }}>
            <Image src="/journey/starspike.svg" alt="Starspike" width={44} height={44} style={{ width: 44, height: 44 }} />
          </div>
          {/* Title */}
          <div className="text-2xl font-serif text-black text-center" style={{ letterSpacing: '-0.04em', marginBottom: 20 }}>
            Previous Sol Cycles
          </div>
          {/* Arc with dots (SVG) and Day label */}
          <div className="relative w-full flex flex-col items-center" style={{ height: 82, marginBottom: 0 }}>
            <Image
              src="/journey/arcline.svg"
              alt="Arc with dots"
              width={1}
              height={1}
              style={{ width: '100%', height: 'auto', display: 'block', margin: '0 auto' }}
            />
            {/* Day label centered within arc */}
            <div
              className="absolute left-1/2"
              style={{
                top: 26,
                transform: 'translateX(-50%)',
                color: '#3730A3',
                fontFamily: 'serif',
                fontSize: '1.5rem',
                fontWeight: 500,
                letterSpacing: '-0.04em',
                textAlign: 'center',
                width: 110,
                pointerEvents: 'none',
                lineHeight: 1.1,
                background: 'transparent',
              }}
            >
              Day {prevSolDay}
            </div>
          </div>
          {/* Dashed line (SVG) with BIRTH and TODAY labels */}
          <div className="relative w-full flex flex-col items-center" style={{ height: 36, marginBottom: 20 }}>
            <Image
              src="/journey/dashedline.svg"
              alt="Dashed timeline"
              width={1}
              height={1}
              style={{ width: '100%', height: 'auto', display: 'block', margin: '0 auto' }}
            />
            {/* BIRTH label (left) */}
            <div
              className="absolute"
              style={{
                left: 8,
                top: 30,
                color: '#8B8B8B',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontWeight: 500,
                width: 60,
                textAlign: 'left',
                background: 'transparent',
              }}
            >
              BIRTH
            </div>
            {/* TODAY label (right) */}
            <div
              className="absolute"
              style={{
                right: 8,
                top: 30,
                color: '#8B8B8B',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontWeight: 500,
                width: 60,
                textAlign: 'right',
                background: 'transparent',
              }}
            >
              TODAY
            </div>
          </div>
          {/* Milestone Info */}
          <div className="text-base font-mono text-[#3730A3] font-medium uppercase text-center" style={{ letterSpacing: '-0.02em', marginBottom: 2}}>
            {cosmicPattern?.pattern ? `${cosmicPattern.pattern} SOLAR AWAKENING` : 'SOLAR AWAKENING'}
          </div>
          <div className="text-lg font-serif text-black text-center" style={{ letterSpacing: '-0.02em', marginBottom: 18 }}>
            {dynamicAwakeningText}
          </div>
          
          {/* Pattern Recognition Indicator */}
          {cosmicPattern && cosmicPattern.phenomenaLikelihood > 0.5 && (
            <div className="text-sm font-mono text-[#3730A3] text-center mb-4" style={{ letterSpacing: '-0.01em' }}>
              {Math.round(cosmicPattern.phenomenaLikelihood * 100)}% cosmic alignment for meaningful experiences
            </div>
          )}
          {/* Event Boxes */}
          <div className="flex w-full gap-4" style={{ marginBottom: 24 }}>
            {/* Cosmic Event */}
            <div className="flex-1 border flex flex-col" style={{ borderColor: '#3730A3', background: 'transparent', borderWidth: 1, borderRadius: 0, minWidth: 0 }}>
              {/* Title with white background and separator */}
              <div style={{ background: '#fff', padding: '0', position: 'relative', zIndex: 1, borderBottom: '1px solid #3730A3' }}>
                <div className="text-sm font-mono font-medium uppercase text-[#3730A3] text-center" style={{ letterSpacing: '-0.02em', padding: '8px 0 4px 0', margin: 0 }}>
                  COSMIC EVENT
                </div>
              </div>
              {/* Content area, no background */}
              <div className="text-base font-serif text-black text-center px-2 pb-3 pt-3" style={{ background: 'transparent', fontWeight: 500 }}>
                {cosmicAspect ? (
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 8 }}>{cosmicAspect}</div>
                    {cosmicInterpretation && (
                      <div style={{ fontSize: '0.9rem', color: '#666', fontStyle: 'italic', lineHeight: 1.3 }}>
                        {cosmicInterpretation}
                      </div>
                    )}
                  </div>
                ) : (
                  <span style={{ color: '#AAA' }}>No major aspect found for this day</span>
                )}
              </div>
            </div>
            {/* World Event */}
            <div className="flex-1 border flex flex-col" style={{ borderColor: '#3730A3', background: 'transparent', borderWidth: 1, borderRadius: 0, minWidth: 0 }}>
              {/* Title with white background and separator */}
              <div style={{ background: '#fff', padding: '0', position: 'relative', zIndex: 1, borderBottom: '1px solid #3730A3' }}>
                <div className="text-sm font-mono font-medium uppercase text-[#3730A3] text-center" style={{ letterSpacing: '-0.02em', padding: '8px 0 4px 0', margin: 0 }}>
                  WORLD EVENT
                </div>
              </div>
              {/* Content area, no background */}
              <div className="text-base font-serif text-black text-center px-2 pb-3 pt-3" style={{ background: 'transparent', fontWeight: 500 }}>
                {worldEventLoading ? (
                  <span style={{ color: '#AAA' }}>Loading...</span>
                ) : worldEvent && worldEvent.text ? (
                  worldEvent.url ? (
                    <button
                      onClick={() => handleWorldEventClick(worldEvent.url!)}
                      className="underline text-[#3730A3] cursor-pointer"
                      style={{ fontWeight: 500, background: 'transparent', border: 'none', padding: 0, font: 'inherit' }}
                    >
                      {truncateEventText(worldEvent.text)}
                    </button>
                  ) : (
                    <span style={{ fontWeight: 500 }}>{truncateEventText(worldEvent.text)}</span>
                  )
                ) : (
                  <span style={{ color: '#AAA' }}>No world event found for this date</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 