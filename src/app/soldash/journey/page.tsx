'use client';

import { useState, useEffect } from 'react';
import { getSolarArchetype } from '~/lib/solarIdentity';
import CosmicCodex from '~/components/Soldash/CosmicCodex';

export default function JourneyPage() {
  const [bookmark, setBookmark] = useState<any>(null);
  
  useEffect(() => {
    // Load bookmark from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sunCycleBookmark');
      if (saved) {
        try {
          setBookmark(JSON.parse(saved));
        } catch (error) {
          console.error('Error parsing bookmark:', error);
        }
      }
    }
  }, []);
  
  // Calculate user's current age and archetype if bookmark exists
  const userAge = bookmark ? Math.floor((Date.now() - new Date(bookmark.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 25;
  const userArchetype = bookmark ? getSolarArchetype(bookmark.birthDate) : 'Sol Traveler';

  return (
    <div className="min-h-screen" style={{ background: '#FFFEF7' }}>
      <div className="container mx-auto px-4 py-8">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif text-black mb-4" style={{ letterSpacing: '-0.02em' }}>
            Your Cosmic Journey
          </h1>
          <p className="text-lg text-gray-600 font-serif max-w-2xl mx-auto leading-relaxed">
            Explore the intersection of cosmic events and your personal timeline. 
            Discover the patterns that have shaped your path and insights for your future trajectory.
          </p>
        </div>

        {/* Cosmic Codex Component */}
        <div className="max-w-4xl mx-auto">
          <CosmicCodex 
            birthDate={bookmark?.birthDate}
            archetype={userArchetype}
            currentAge={userAge}
          />
        </div>

        {/* Additional Journey Content */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            
            {/* Future Vision Section */}
            <div className="p-8 bg-white border border-gray-200 rounded-lg shadow-sm">
              <h3 className="text-2xl font-serif text-black mb-4">Future Cosmic Moments</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Your cosmic codex will reveal upcoming astrological events that align with your personal 
                journey, helping you prepare for windows of opportunity and transformation.
              </p>
              <div className="text-sm font-mono text-gray-500 uppercase tracking-wider">
                Coming in Full Cosmic Codex
              </div>
            </div>

            {/* Pattern Analysis Section */}
            <div className="p-8 bg-white border border-gray-200 rounded-lg shadow-sm">
              <h3 className="text-2xl font-serif text-black mb-4">Pattern Recognition</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                By analyzing the intersection of cosmic events with your life milestones, we identify 
                patterns of breakthrough, serendipity, and transformation unique to your journey.
              </p>
              <div className="text-sm font-mono text-gray-500 uppercase tracking-wider">
                Advanced Analytics Available
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
} 