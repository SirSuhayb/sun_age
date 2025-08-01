import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { getCosmicEventsForDate, contextualizeCosmicMoment, analyzeCosmicPatterns } from '~/lib/astrology';
import { getWorldEventForDate } from '~/lib/worldEvent';
import { getLifePhase } from '~/lib/solarIdentity';

interface CosmicCodexProps {
  birthDate?: string;
  archetype?: string;
  currentAge?: number;
}

// Updated milestones with more dynamic positioning
const generateTimelineMilestones = (userAge: number) => [
  { x: 60, label: `Age ${Math.max(5, userAge - 15)}`, type: 'LIFE_MARKER', eventY: 52, labelY: 50, eventAlign: 'top' },
  { x: 150, label: 'COSMIC EVENT', type: 'COSMIC_EVENT', eventY: 52, labelY: 50, eventAlign: 'top', isEvent: true },
  { x: 60, label: `Age ${Math.max(10, userAge - 10)}`, type: 'LIFE_MARKER', eventY: 140, labelY: 168, eventAlign: 'bottom' },
  { x: 250, label: 'WORLD EVENT', type: 'WORLD_EVENT', eventY: 140, labelY: 168, eventAlign: 'bottom' },
  { x: 340, label: 'COSMIC EVENT', type: 'COSMIC_EVENT', eventY: 52, labelY: 50, eventAlign: 'top', isEvent: true },
];

const EVENT_COLORS = {
  'WORLD_EVENT': '#3730A3',
  'COSMIC_EVENT': '#3730A3',
  'LIFE_MARKER': '#666666',
};

export default function CosmicCodex({ 
  birthDate,
  archetype = 'Sol Traveler',
  currentAge = 25 
}: CosmicCodexProps) {
  const [cosmicContext, setCosmicContext] = useState<{
    cosmicMoment: string;
    personalContext: string;
    trajectory: string;
    pattern: string | null;
    phenomenaLikelihood: number;
  } | null>(null);
  
  const [worldEvent, setWorldEvent] = useState<{ text: string, url?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (birthDate) {
      loadCosmicContext();
    }
  }, [birthDate, archetype]);

  const loadCosmicContext = async () => {
    if (!birthDate) return;
    
    setLoading(true);
    try {
      const birth = new Date(birthDate);
      const currentDate = new Date();
      
      // Look back at a significant moment (could be previous sol cycle or meaningful date)
      const lookbackDate = new Date(currentDate);
      lookbackDate.setFullYear(lookbackDate.getFullYear() - 1); // Example: 1 year ago
      
      // Get cosmic events for that date
      const cosmicEvents = getCosmicEventsForDate(lookbackDate, birth);
      
      // Get user's life phase at that time
      const ageAtEvent = Math.floor((lookbackDate.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      const lifePhase = getLifePhase(ageAtEvent);
      
      // Contextualize the cosmic moment
      const context = contextualizeCosmicMoment(cosmicEvents, lifePhase.name, archetype, lookbackDate);
      
      // Analyze patterns for phenomena likelihood
      const patterns = analyzeCosmicPatterns(cosmicEvents, lifePhase.name, lookbackDate);
      
      setCosmicContext({
        cosmicMoment: context.cosmicMoment,
        personalContext: context.personalContext,
        trajectory: context.trajectory,
        pattern: patterns.pattern,
        phenomenaLikelihood: patterns.phenomenaLikelihood
      });

      // Get world event for context
      const worldEventData = await getWorldEventForDate(lookbackDate);
      setWorldEvent(worldEventData);
      
    } catch (error) {
      console.error('Error loading cosmic context:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderPatternBadge = () => {
    if (!cosmicContext?.pattern) return null;
    
    const patternColors = {
      'BREAKTHROUGH': '#FFD700',
      'SERENDIPITY': '#FF69B4', 
      'TRANSFORMATION': '#8A2BE2',
      'AWAKENING': '#00CED1'
    };

    return (
      <div 
        className="inline-block px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wide mb-2"
        style={{ 
          backgroundColor: patternColors[cosmicContext.pattern] || '#D4AF37',
          color: 'white'
        }}
      >
        {cosmicContext.pattern} PATTERN
      </div>
    );
  };

  const milestones = generateTimelineMilestones(currentAge);

  return (
    <div className="w-full flex flex-col items-center">
      <div
        className="w-full mt-1 mb-2"
        style={{
          background: '#FEFDF8',
          border: '1px solid #D7D7D7',
          boxSizing: 'border-box',
        }}
      >
        <div className="px-6 pt-10 pb-10">
          {/* Title */}
          <div className="text-2xl font-serif text-black text-center mb-4 font-normal" style={{ letterSpacing: '-0.04em' }}>
            Unlock your Cosmic Codex
          </div>
          
          {/* Subtitle */}
          <div className="text-base text-sm font-mono text-gray-700 text-center mb-8 tracking-tightest uppercase" style={{ letterSpacing: '0.08em' }}>
            JOURNEY THROUGH TIME TO UNCOVER THE COSMIC PATTERNS THAT REVEAL YOUR TRUE TRAJECTORY.
          </div>

          {/* Dynamic Cosmic Context Preview */}
          {cosmicContext && (
            <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
              {renderPatternBadge()}
              
              <div className="text-lg font-serif text-gray-800 font-bold mb-2">
                Cosmic Moment: {cosmicContext.cosmicMoment}
              </div>
              
              <div className="text-base font-serif text-gray-700 mb-3 leading-relaxed">
                {cosmicContext.personalContext}
              </div>
              
              <div className="text-sm font-mono text-gray-600 uppercase tracking-wide">
                Pattern Recognition: {Math.round(cosmicContext.phenomenaLikelihood * 100)}% likelihood of meaningful phenomena
              </div>
              
              {worldEvent && (
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <div className="text-sm font-mono text-blue-700 uppercase tracking-wide mb-1">
                    World Context
                  </div>
                  <div className="text-sm text-gray-600">
                    {worldEvent.text}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Timeline Section with SVG */}
          <div className="w-full flex justify-center mb-10">
            <div style={{ width: 420, maxWidth: '100%', background: '#FFF7DD', border: '1px solid #E0D09D', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Image
                src="/journey/codex_timeline.svg"
                alt="Timeline of cosmic and world events"
                width={400}
                height={200}
                style={{ width: '100%', height: 'auto', display: 'block' }}
                priority
              />
            </div>
          </div>

          {/* Enhanced Description */}
          <div className="text-lg font-serif text-[#555] font-bold mb-3 text-left" style={{ letterSpacing: '-0.01em' }}>
            The stars remember what you&apos;ve forgotten.
          </div>
          
          <div className="text-lg font-serif text-[#555] leading-tight text-left mb-6" style={{ letterSpacing: '-0.01em', maxWidth: 480 }}>
            Every moment of your journey through time carries encoded wisdom—patterns that reveal not just where you&apos;ve been, but where you&apos;re destined to go. The cosmos doesn&apos;t just witness your story; it holds the keys to unlock your future.
          </div>

          {cosmicContext && (
            <div className="text-base font-serif text-[#666] leading-tight text-left mb-8" style={{ letterSpacing: '-0.01em', maxWidth: 520 }}>
              <strong>Your Trajectory:</strong> {cosmicContext.trajectory}
            </div>
          )}

          {/* Enhanced Call to Action */}
          <div className="mb-4">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="w-full py-4 bg-[#D4AF37] text-black font-mono text-base tracking-widest uppercase border border-black rounded-none mt-2 hover:bg-[#B8941F] transition-colors"
              style={{ letterSpacing: '0.04em' }}
            >
              {showPreview ? 'HIDE PREVIEW' : 'PREVIEW YOUR COSMIC JOURNEY'}
            </button>
          </div>

          {/* Preview Section */}
          {showPreview && (
            <div className="mt-6 p-6 bg-gray-50 border border-gray-300">
              <div className="text-lg font-serif text-gray-800 font-bold mb-4">
                What Your Full Cosmic Codex Will Reveal:
              </div>
              
              <div className="space-y-3 text-base text-gray-700">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-[#D4AF37] rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong>Birth to Present Timeline:</strong> Every significant cosmic event during your lifetime with personalized interpretation
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-[#D4AF37] rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong>Pattern Recognition:</strong> Identification of breakthrough moments, serendipitous alignments, and transformation periods
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-[#D4AF37] rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong>World Event Context:</strong> How global events intersected with your personal cosmic moments
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-[#D4AF37] rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong>Future Trajectory:</strong> Insights into upcoming cosmic opportunities based on your unique pattern
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-300">
                <button
                  className="w-full py-3 bg-black text-white font-mono text-sm tracking-wider uppercase hover:bg-gray-800 transition-colors"
                  style={{ letterSpacing: '0.04em' }}
                  disabled
                >
                  UNLOCK FULL COSMIC CODEX - COMING SOON
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Starburst SVG helper
function Starburst({ x, y, color }: { x: number; y: number; color: string }) {
  // 16-pointed starburst
  const points = Array.from({ length: 16 }).map((_, i) => {
    const angle = (Math.PI * 2 * i) / 16;
    const r = i % 2 === 0 ? 28 : 12;
    return [
      x + Math.cos(angle) * r,
      y + Math.sin(angle) * r,
    ];
  });
  const d = points.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ') + ' Z';
  return <path d={d} fill="none" stroke={color} strokeWidth={3} />;
} 