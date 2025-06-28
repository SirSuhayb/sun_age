# Phase 1 Implementation Guide: Astrology Integration

## Overview
This guide provides step-by-step implementation for integrating CircularNatalHoroscopeJS into the existing sol sign tab, transforming it from a simple $SUNDIAL token display into a comprehensive astrological chart viewer.

## Step 1: Dependencies & Setup

### Install Required Packages
```bash
npm install circular-natal-horoscope-js
npm install @types/circular-natal-horoscope-js # If available
```

### Create Astrology Types
```typescript
// src/types/astrology.ts
export interface BirthData {
  date: Date;
  time?: string; // HH:MM format, optional for noon chart fallback
  location?: {
    latitude: number;
    longitude: number;
    city: string;
    timezone: string;
  };
  hasExactTime: boolean;
}

export interface NatalChart {
  sunSign: string;
  moonSign: string;
  risingSign: string;
  planets: PlanetPosition[];
  houses: HousePosition[];
  aspects: AspectData[];
}

export interface PlanetPosition {
  name: string;
  sign: string;
  degree: number;
  house: number;
  retrograde: boolean;
}

export interface HousePosition {
  number: number;
  sign: string;
  degree: number;
}

export interface AspectData {
  planet1: string;
  planet2: string;
  aspect: string;
  orb: number;
  applying: boolean;
}
```

## Step 2: Create Astrology Service

### Core Astrology Service
```typescript
// src/lib/astrology.ts
import { Origin, Horoscope } from 'circular-natal-horoscope-js';
import type { BirthData, NatalChart } from '~/types/astrology';

export class AstrologyService {
  private static instance: AstrologyService;
  
  public static getInstance(): AstrologyService {
    if (!AstrologyService.instance) {
      AstrologyService.instance = new AstrologyService();
    }
    return AstrologyService.instance;
  }

  public generateNatalChart(birthData: BirthData): NatalChart {
    try {
      // Handle missing birth time - default to noon
      const birthTime = birthData.hasExactTime && birthData.time 
        ? birthData.time 
        : '12:00';
      
      // Default location if not provided (could be user's current location or major city)
      const location = birthData.location || {
        latitude: 40.7128,
        longitude: -74.0060,
        city: 'New York',
        timezone: 'America/New_York'
      };

      // Create Origin object for CircularNatalHoroscopeJS
      const origin = new Origin({
        year: birthData.date.getFullYear(),
        month: birthData.date.getMonth(), // 0-based
        date: birthData.date.getDate(),
        hour: parseInt(birthTime.split(':')[0]),
        minute: parseInt(birthTime.split(':')[1]),
        latitude: location.latitude,
        longitude: location.longitude
      });

      // Generate horoscope
      const horoscope = new Horoscope({
        origin,
        houseSystem: "placidus", // Most common house system
        zodiac: "tropical",
        aspectPoints: ['bodies', 'points', 'angles'],
        aspectWithPoints: ['bodies', 'points', 'angles'],
        aspectTypes: ["major", "minor"],
        language: 'en'
      });

      return this.parseHoroscopeData(horoscope);
    } catch (error) {
      console.error('Error generating natal chart:', error);
      throw new Error('Failed to generate natal chart');
    }
  }

  private parseHoroscopeData(horoscope: any): NatalChart {
    // Extract basic signs
    const sunSign = horoscope.CelestialBodies.sun.Sign.label;
    const moonSign = horoscope.CelestialBodies.moon.Sign.label;
    const risingSign = horoscope.Ascendant.Sign.label;

    // Parse planets
    const planets: PlanetPosition[] = Object.entries(horoscope.CelestialBodies.all)
      .map(([name, data]: [string, any]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        sign: data.Sign.label,
        degree: data.ChartPosition.Ecliptic.DecimalDegrees,
        house: data.House.id,
        retrograde: data.isRetrograde || false
      }));

    // Parse houses
    const houses: HousePosition[] = horoscope.Houses.map((house: any, index: number) => ({
      number: index + 1,
      sign: house.Sign.label,
      degree: house.ChartPosition.Ecliptic.DecimalDegrees
    }));

    // Parse aspects
    const aspects: AspectData[] = horoscope.Aspects.all.map((aspect: any) => ({
      planet1: aspect.point1.label,
      planet2: aspect.point2.label,
      aspect: aspect.aspect.label,
      orb: aspect.orb,
      applying: aspect.applying || false
    }));

    return {
      sunSign,
      moonSign,
      risingSign,
      planets,
      houses,
      aspects
    };
  }

  public calculateCompatibility(chart1: NatalChart, chart2: NatalChart): number {
    // Simple compatibility calculation based on elemental harmony
    const elementScores = {
      fire: { fire: 0.9, earth: 0.3, air: 0.8, water: 0.2 },
      earth: { fire: 0.3, earth: 0.9, air: 0.2, water: 0.8 },
      air: { fire: 0.8, earth: 0.2, air: 0.9, water: 0.3 },
      water: { fire: 0.2, earth: 0.8, air: 0.3, water: 0.9 }
    };

    const getElement = (sign: string): string => {
      const fireSign = ['Aries', 'Leo', 'Sagittarius'];
      const earthSigns = ['Taurus', 'Virgo', 'Capricorn'];
      const airSigns = ['Gemini', 'Libra', 'Aquarius'];
      const waterSigns = ['Cancer', 'Scorpio', 'Pisces'];

      if (fireSign.includes(sign)) return 'fire';
      if (earthSigns.includes(sign)) return 'earth';
      if (airSigns.includes(sign)) return 'air';
      if (waterSigns.includes(sign)) return 'water';
      return 'fire'; // fallback
    };

    const sun1Element = getElement(chart1.sunSign);
    const sun2Element = getElement(chart2.sunSign);
    const moon1Element = getElement(chart1.moonSign);
    const moon2Element = getElement(chart2.moonSign);

    const sunCompatibility = elementScores[sun1Element]?.[sun2Element] || 0.5;
    const moonCompatibility = elementScores[moon1Element]?.[moon2Element] || 0.5;

    // Weight sun and moon compatibility
    const overallScore = (sunCompatibility * 0.4 + moonCompatibility * 0.6) * 100;
    
    return Math.round(overallScore);
  }
}

export const astrologyService = AstrologyService.getInstance();
```

## Step 3: Enhanced Birth Data Collection

### Update the FormSection Component
```typescript
// src/components/SunCycleAge/EnhancedFormSection.tsx
import React, { useState } from 'react';

interface EnhancedFormSectionProps {
  onBirthDataSubmit: (data: BirthData) => void;
}

export function EnhancedFormSection({ onBirthDataSubmit }: EnhancedFormSectionProps) {
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [hasExactTime, setHasExactTime] = useState(false);
  const [location, setLocation] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = async () => {
    if (!birthDate) return;

    let locationData = undefined;
    
    // If location is provided, try to geocode it
    if (location.trim()) {
      try {
        locationData = await geocodeLocation(location);
      } catch (error) {
        console.warn('Geocoding failed, using default location');
      }
    }

    const birthData: BirthData = {
      date: new Date(birthDate),
      time: hasExactTime ? birthTime : undefined,
      location: locationData,
      hasExactTime
    };

    onBirthDataSubmit(birthData);
  };

  return (
    <div className="w-full space-y-4">
      {/* Existing birth date input */}
      <div>
        <label className="block text-sm font-mono text-gray-700 mb-2 uppercase tracking-wider">
          Birth Date
        </label>
        <input
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          className="w-full px-4 py-3 border border-gray-400 text-lg font-mono tracking-wide text-center bg-white"
          style={{ borderRadius: 0 }}
        />
      </div>

      {/* Advanced options toggle */}
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="w-full py-2 text-sm font-mono text-gray-600 hover:text-black transition-colors"
      >
        {showAdvanced ? '▼' : '▶'} ADVANCED ASTROLOGY OPTIONS
      </button>

      {showAdvanced && (
        <>
          {/* Birth time section */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                id="hasExactTime"
                checked={hasExactTime}
                onChange={(e) => setHasExactTime(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="hasExactTime" className="text-sm font-mono text-gray-700 uppercase tracking-wider">
                I know my exact birth time
              </label>
            </div>
            
            {hasExactTime && (
              <input
                type="time"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                className="w-full px-4 py-3 border border-gray-400 text-lg font-mono tracking-wide text-center bg-white"
                style={{ borderRadius: 0 }}
              />
            )}
            
            {!hasExactTime && (
              <div className="text-xs font-mono text-gray-500 italic">
                Chart will use noon as birth time (still accurate for most purposes)
              </div>
            )}
          </div>

          {/* Birth location */}
          <div>
            <label className="block text-sm font-mono text-gray-700 mb-2 uppercase tracking-wider">
              Birth Location (Optional)
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, State/Country"
              className="w-full px-4 py-3 border border-gray-400 text-lg font-mono tracking-wide text-center bg-white"
              style={{ borderRadius: 0 }}
            />
            <div className="text-xs font-mono text-gray-500 italic mt-1">
              Leave blank to use approximate location
            </div>
          </div>
        </>
      )}

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={!birthDate}
        className="w-full py-4 bg-[#d4af37] text-black font-mono text-base tracking-widest uppercase border border-black rounded-none hover:bg-[#e6c75a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Generate My Cosmic Chart
      </button>
    </div>
  );
}

// Geocoding helper function
async function geocodeLocation(location: string) {
  // Using a free geocoding service like OpenStreetMap Nominatim
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`
  );
  
  const data = await response.json();
  
  if (data && data.length > 0) {
    return {
      latitude: parseFloat(data[0].lat),
      longitude: parseFloat(data[0].lon),
      city: location,
      timezone: 'UTC' // You'd want to use a timezone lookup service here
    };
  }
  
  throw new Error('Location not found');
}
```

## Step 4: Update Sol Sign Tab

### Enhanced Sol Sign Component
```typescript
// src/components/SunCycleAge/AstroChart.tsx
import React, { useState, useEffect } from 'react';
import { astrologyService } from '~/lib/astrology';
import type { BirthData, NatalChart } from '~/types/astrology';

interface AstroChartProps {
  birthDate: string;
  solAge: number;
}

export function AstroChart({ birthDate, solAge }: AstroChartProps) {
  const [chart, setChart] = useState<NatalChart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (birthDate) {
      generateChart();
    }
  }, [birthDate]);

  const generateChart = async () => {
    setLoading(true);
    setError(null);

    try {
      const birthData: BirthData = {
        date: new Date(birthDate),
        hasExactTime: false // Using existing birth date data
      };

      const natalChart = astrologyService.generateNatalChart(birthData);
      setChart(natalChart);
    } catch (err) {
      setError('Failed to generate chart. Please try again.');
      console.error('Chart generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full text-center py-8">
        <div className="text-2xl mb-2">🌌</div>
        <div className="font-mono text-sm text-gray-600">Calculating your cosmic blueprint...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full text-center py-8">
        <div className="text-2xl mb-2">⚠️</div>
        <div className="font-mono text-sm text-gray-600">{error}</div>
        <button 
          onClick={generateChart}
          className="mt-4 px-4 py-2 bg-[#d4af37] text-black font-mono text-sm uppercase border border-black"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!chart) {
    return (
      <div className="w-full text-center py-8">
        <div className="text-2xl mb-2">✨</div>
        <div className="font-mono text-sm text-gray-600">No chart data available</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Big Three */}
      <div className="border border-gray-300 p-4 bg-white">
        <div className="text-lg font-serif font-bold mb-4 text-center">Your Cosmic Signature</div>
        <div className="grid grid-cols-1 gap-4">
          <div className="text-center">
            <div className="text-sm font-mono text-gray-600 uppercase tracking-wider">Sun Sign</div>
            <div className="text-2xl font-serif font-bold text-[#d4af37]">{chart.sunSign}</div>
            <div className="text-xs font-mono text-gray-500">Your core essence</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-mono text-gray-600 uppercase tracking-wider">Moon Sign</div>
            <div className="text-2xl font-serif font-bold text-[#d4af37]">{chart.moonSign}</div>
            <div className="text-xs font-mono text-gray-500">Your emotional nature</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-mono text-gray-600 uppercase tracking-wider">Rising Sign</div>
            <div className="text-2xl font-serif font-bold text-[#d4af37]">{chart.risingSign}</div>
            <div className="text-xs font-mono text-gray-500">How others see you</div>
          </div>
        </div>
      </div>

      {/* Sol Age Integration */}
      <div className="border border-gray-300 p-4 bg-white">
        <div className="text-lg font-serif font-bold mb-2 text-center">Cosmic Journey Stats</div>
        <div className="grid grid-cols-2 gap-4 text-sm font-mono">
          <div>
            <div className="text-gray-600">Sol Rotations:</div>
            <div className="font-bold">{solAge.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-gray-600">Solar Returns:</div>
            <div className="font-bold">{Math.floor(solAge / 365.25)}</div>
          </div>
        </div>
      </div>

      {/* Planetary Positions */}
      <div className="border border-gray-300 p-4 bg-white">
        <div className="text-lg font-serif font-bold mb-4 text-center">Planetary Positions</div>
        <div className="space-y-2">
          {chart.planets.slice(0, 7).map((planet) => ( // Show first 7 planets
            <div key={planet.name} className="flex justify-between items-center text-sm font-mono">
              <span className="text-gray-700">{planet.name}</span>
              <span className="font-bold">{planet.sign}</span>
              <span className="text-gray-500 text-xs">House {planet.house}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Major Aspects */}
      <div className="border border-gray-300 p-4 bg-white">
        <div className="text-lg font-serif font-bold mb-4 text-center">Major Aspects</div>
        <div className="space-y-2">
          {chart.aspects.slice(0, 5).map((aspect, index) => (
            <div key={index} className="text-sm font-mono text-center">
              <span className="text-gray-700">{aspect.planet1}</span>
              <span className="mx-2 text-[#d4af37] font-bold">{aspect.aspect}</span>
              <span className="text-gray-700">{aspect.planet2}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade CTA */}
      <div className="border-2 border-[#d4af37] p-4 bg-[#fffcf2]">
        <div className="text-center">
          <div className="text-lg font-serif font-bold mb-2">Unlock Your Full Chart</div>
          <div className="text-sm font-mono text-gray-600 mb-4">
            Get detailed interpretations, compatibility readings, and transit predictions
          </div>
          <button className="w-full py-3 bg-[#d4af37] text-black font-mono text-base tracking-widest uppercase border border-black">
            Upgrade to Solar Initiate
          </button>
          <div className="text-xs font-mono text-gray-500 mt-2">
            Requires 100 $SOLAR tokens
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Step 5: Integration with Existing Sol Sign Tab

### Update BookmarkCard Component
```typescript
// In src/components/SunCycleAge.tsx, update the sol sign tab section:

{tab === 'sol sign' && (
  <div className="w-full space-y-4">
    {/* Keep existing $SUNDIAL display */}
    <div className="text-center border-b border-gray-200 pb-4">
      <div className="text-2xl font-serif font-bold mb-2">SUNDIAL</div>
      <Image
        src="/sundial_sm.jpg"
        alt="$SUNDIAL"
        width={200}
        height={200}
        style={{ 
          margin: '0 auto', 
          filter: sundialBalance > 0 && sundialBalance < 10000000 ? 'blur(8px)' : 'none' 
        }}
        priority
      />
      <div className="text-lg font-bold mt-2">{sundialBalance.toLocaleString()} $SUNDIAL</div>
      {sundialBalance > 0 && sundialBalance < 10000000 && (
        <div className="mt-2 p-2 bg-yellow-200 border border-yellow-400 text-yellow-900 font-mono text-xs">
          You must have at least 10m $SUNDIAL to reveal this image
        </div>
      )}
    </div>

    {/* New Astrology Chart Section */}
    <AstroChart 
      birthDate={bookmark.birthDate} 
      solAge={bookmark.days}
    />
  </div>
)}
```

## Step 6: Error Handling & Fallbacks

### Graceful Degradation
```typescript
// Add to astrology service for better error handling
export function createFallbackChart(birthDate: Date): NatalChart {
  // Simple sun sign calculation as fallback
  const sunSign = calculateSunSign(birthDate);
  
  return {
    sunSign,
    moonSign: 'Unknown',
    risingSign: 'Unknown',
    planets: [],
    houses: [],
    aspects: []
  };
}

function calculateSunSign(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // Simple sun sign calculation
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
  // ... continue for all signs
  
  return 'Aries'; // fallback
}
```

## Next Steps

1. **Install dependencies** and set up the basic astrology service
2. **Test chart generation** with existing user birth dates
3. **Update the sol sign tab** to display basic chart information
4. **Add error handling** and fallback mechanisms
5. **Prepare for Phase 2** compatibility features

This implementation maintains compatibility with existing functionality while adding rich astrological features that will serve as the foundation for advanced relational and monetization features in subsequent phases.

## Testing Strategy

1. **Unit tests** for astrology calculations
2. **Integration tests** for chart generation with various birth data
3. **User testing** with different levels of birth data completeness
4. **Performance testing** for chart calculation speed

The enhanced sol sign tab will now provide meaningful astrological content while maintaining the existing $SUNDIAL token functionality, setting the stage for advanced features and monetization in future phases.