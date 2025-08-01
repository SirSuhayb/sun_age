import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { generateCosmicCodexTimeline, type CosmicCodexTimeline } from '~/lib/astrology';
import { getSolarArchetype } from '~/lib/solarIdentity';

/**
 * CosmicCodex Component Architecture
 * 
 * BEFORE PAYMENT (Current State):
 * - Shows as an upsell component with preview stats
 * - Teases the full timeline experience
 * - Works alongside SolCycle which shows individual past sol cycle analysis
 * 
 * AFTER PAYMENT (Proposed):
 * - Transforms into a full timeline visualization
 * - Shows all cosmic events from birth to present
 * - Could either:
 *   Option A: Replace SolCycle entirely with timeline markers that expand to show details
 *   Option B: Keep SolCycle as a "deep dive" into specific cycles from the timeline
 *   Option C: Merge both - timeline overview with SolCycle as the detail view when clicking a period
 * 
 * RECOMMENDED APPROACH (Option C):
 * 1. CosmicCodex becomes the main timeline overview after payment
 * 2. Clicking on any sol cycle period in the timeline opens SolCycle with that specific date
 * 3. SolCycle remains focused on individual cycle analysis (cosmic events, world events, interpretation)
 * 4. This creates a hierarchy: Timeline Overview → Specific Cycle Detail
 * 
 * UI FLOW:
 * - Journey tab shows both components
 * - Before payment: SolCycle (previous cycle) + CosmicCodex (upsell)
 * - After payment: CosmicCodex (full timeline) + SolCycle (selected cycle detail)
 * - Timeline could highlight "significant" cycles that user can explore
 */

interface CosmicCodexProps {
  birthDate?: string;
  archetype?: string;
  currentAge?: number;
  isPaid?: boolean; // Will be true after user pays
  onCycleSelect?: (date: Date) => void; // Callback when user clicks a cycle in timeline
}

export default function CosmicCodex({ 
  birthDate,
  archetype = 'Sol Traveler',
  currentAge = 25,
  isPaid = false
}: CosmicCodexProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [timelinePreview, setTimelinePreview] = useState<{
    totalEvents: number;
    majorTransformations: number;
    breakthroughMoments: number;
    dominantPattern: string;
  } | null>(null);
  const [fullTimeline, setFullTimeline] = useState<CosmicCodexTimeline | null>(null);
  const [loading, setLoading] = useState(false);

  // Generate preview stats without showing actual events
  const generatePreviewStats = useCallback(async () => {
    if (!birthDate) return;
    
    setLoading(true);
    try {
      const timeline = await generateCosmicCodexTimeline(
        new Date(birthDate),
        archetype,
        false // Don't fetch world events for preview
      );
      
      setTimelinePreview({
        totalEvents: timeline.totalEvents,
        majorTransformations: timeline.majorTransformations.length,
        breakthroughMoments: timeline.breakthroughMoments.length,
        dominantPattern: timeline.lifePatterns.dominantPattern
      });

      // If paid, load full timeline
      if (isPaid) {
        setFullTimeline(timeline);
      }
    } catch (error) {
      console.error('Error generating timeline preview:', error);
    } finally {
      setLoading(false);
    }
  }, [birthDate, archetype, isPaid]);

  useEffect(() => {
    if (birthDate) {
      generatePreviewStats();
    }
  }, [birthDate, generatePreviewStats]);

  // If user has paid, show full timeline view
  if (isPaid && fullTimeline) {
    return (
      <div className="w-full flex flex-col items-center">
        <div className="w-full mt-1 mb-2" style={{
          background: '#FEFDF8',
          border: '1px solid #D7D7D7',
          boxSizing: 'border-box',
        }}>
          <div className="px-6 pt-10 pb-10">
            {/* Full Timeline View - Coming Soon */}
            <div className="text-2xl font-serif text-black text-center mb-4 font-normal" style={{ letterSpacing: '-0.04em' }}>
              Your Complete Cosmic Timeline
            </div>
            
            <div className="text-center text-gray-600 mb-8">
              <p className="text-lg">Timeline visualization coming soon...</p>
              <p className="text-sm mt-2">
                {fullTimeline.totalEvents} cosmic moments analyzed from birth to present
              </p>
            </div>
            
            {/* Placeholder for timeline visualization */}
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">Interactive timeline will appear here</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Upsell view (default)
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

          {/* Timeline Preview Image */}
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

          {/* Teaser Stats */}
          {timelinePreview && !loading && (
            <div className="mb-8 grid grid-cols-2 gap-4 max-w-md mx-auto">
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-700">{timelinePreview.totalEvents}</div>
                <div className="text-sm text-gray-600">Cosmic Moments</div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-700">{timelinePreview.majorTransformations}</div>
                <div className="text-sm text-gray-600">Major Transformations</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-700">{timelinePreview.breakthroughMoments}</div>
                <div className="text-sm text-gray-600">Breakthrough Moments</div>
              </div>
              
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-lg font-bold text-yellow-700">{timelinePreview.dominantPattern}</div>
                <div className="text-sm text-gray-600">Dominant Pattern</div>
              </div>
            </div>
          )}

          {/* Callout */}
          <div className="text-lg font-serif text-[#555] font-bold mb-3 text-left" style={{ letterSpacing: '-0.01em' }}>
            The stars remember what you&apos;ve forgotten.
          </div>
          
          <div className="text-lg font-serif text-[#555] leading-tight text-left mb-8" style={{ letterSpacing: '-0.01em', maxWidth: 480 }}>
            Every moment of your journey through time carries encoded wisdom—patterns that reveal not just where you&apos;ve been, but where you&apos;re destined to go. The cosmos doesn&apos;t just witness your story; it holds the keys to unlock your future.
          </div>

          {/* What You'll Discover Button */}
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="w-full py-4 bg-[#D4AF37] text-black font-mono text-base tracking-widest uppercase border border-black rounded-none mt-2 hover:bg-[#B8941F] transition-colors"
            style={{ letterSpacing: '0.04em' }}
          >
            {showPreview ? 'HIDE DETAILS' : 'WHAT YOU\'LL DISCOVER'}
          </button>

          {/* Preview Section */}
          {showPreview && (
            <div className="mt-6 p-6 bg-gray-50 border border-gray-300">
              <div className="text-lg font-serif text-gray-800 font-bold mb-4">
                Your Personal Cosmic Codex Includes:
              </div>
              
              <div className="space-y-4 text-base text-gray-700">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-[#D4AF37] rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong>Complete Birth-to-Present Timeline:</strong> Interactive visualization of every significant cosmic event during your lifetime, with personalized interpretations based on your {archetype} archetype
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-[#D4AF37] rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong>Pattern Analysis:</strong> Discover your dominant life patterns, breakthrough moments, and transformation cycles unique to your cosmic journey
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-[#D4AF37] rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong>World Event Synchronicities:</strong> See how major world events aligned with your personal cosmic moments
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-[#D4AF37] rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong>Future Trajectory Insights:</strong> Understand your cosmic cycles to anticipate upcoming opportunities and transformations
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-[#D4AF37] rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong>Sol Cycle Integration:</strong> See how your past Sol cycles align with cosmic patterns for deeper self-understanding
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-300">
                <div className="text-center">
                  <div className="text-3xl font-bold text-black mb-2">$22</div>
                  <div className="text-sm text-gray-600 mb-4">One-time unlock • Lifetime access</div>
                  <button
                    className="w-full py-3 bg-black text-white font-mono text-sm tracking-wider uppercase hover:bg-gray-800 transition-colors"
                    style={{ letterSpacing: '0.04em' }}
                    disabled
                  >
                    UNLOCK YOUR COSMIC CODEX
                  </button>
                  <div className="text-xs text-gray-500 mt-2">Payment integration coming soon</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 