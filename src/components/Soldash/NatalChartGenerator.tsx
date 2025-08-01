import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

// Import astrology libraries
// Using CircularNatalHoroscopeJS for calculations: https://github.com/0xStarcat/CircularNatalHoroscopeJS
// Using AstroChart for rendering: https://github.com/AstroDraw/AstroChart
// Note: These need to be imported dynamically due to potential client-side only requirements
import type { Chart as AstroChart } from '@astrodraw/astrochart';

// Zodiac symbols (Unicode characters)
const zodiacSymbols: Record<string, string> = {
  Aries: '♈',
  Taurus: '♉',
  Gemini: '♊',
  Cancer: '♋',
  Leo: '♌',
  Virgo: '♍',
  Libra: '♎',
  Scorpio: '♏',
  Sagittarius: '♐',
  Capricorn: '♑',
  Aquarius: '♒',
  Pisces: '♓'
};

// Planet symbols (Unicode characters)
const planetSymbols: Record<string, string> = {
  sun: '☉',
  moon: '☽',
  mercury: '☿',
  venus: '♀',
  mars: '♂',
  jupiter: '♃',
  saturn: '♄',
  uranus: '♅',
  neptune: '♆',
  pluto: '♇',
  chiron: '⚷',
  lilith: '⚸',
  nnode: '☊',
  snode: '☋'
};

// Get zodiac sign from degree
const getZodiacSign = (degree: number): string => {
  const normalizedDegree = ((degree % 360) + 360) % 360;
  const signIndex = Math.floor(normalizedDegree / 30);
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer',
    'Leo', 'Virgo', 'Libra', 'Scorpio',
    'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  return signs[signIndex] || 'Aries';
};
interface BirthData {
  date: string;
  time: string;
  location: {
    city: string;
    country: string;
    latitude: number;
    longitude: number;
    timezone: string;
  };
}

interface ChartData {
  sun: { sign: string; degree: number; house: number };
  moon: { sign: string; degree: number; house: number };
  rising: { sign: string; degree: number };
  planets: Array<{
    name: string;
    sign: string;
    degree: number;
    house: number;
    retrograde?: boolean;
  }>;
  houses: Array<{
    number: number;
    sign: string;
    degree: number;
  }>;
  aspects: Array<{
    planet1: string;
    planet2: string;
    aspect: string;
    orb: number;
  }>;
}

interface NatalChartGeneratorProps {
  birthData: BirthData;
  onChartGenerated?: (chartData: ChartData) => void;
  className?: string;
}

export const NatalChartGenerator: React.FC<NatalChartGeneratorProps> = ({
  birthData,
  onChartGenerated,
  className = ''
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [astroChart, setAstroChart] = useState<AstroChart | null>(null);
  const [svgContent, setSvgContent] = useState<string | null>(null);

  const generateChart = async () => {
    if (!birthData || !chartRef.current) return;

    setIsGenerating(true);
    setError(null);

    try {
      // Parse birth data - the time is already in local time at birth location
      const [year, month, day] = birthData.date.split('-').map(Number);
      const [hour, minute] = birthData.time.split(':').map(Number);
      
      console.log('Parsing birth data:', {
        date: birthData.date,
        time: birthData.time,
        parsed: { year, month, day, hour, minute }
      });
      
      // Dynamic import to avoid SSR issues
      // CircularNatalHoroscopeJS - https://github.com/0xStarcat/CircularNatalHoroscopeJS
      const { Origin, Horoscope } = await import('circular-natal-horoscope-js');
      
      // Create an Origin instance
      const originData = {
        year: year,
        month: month - 1, // Origin expects 0-11, but input is 1-12
        date: day,
        hour: hour,
        minute: minute,
        latitude: birthData.location.latitude,
        longitude: birthData.location.longitude
      };
      
      console.log('Birth data for chart calculation:', {
        input: birthData,
        parsed: originData
      });
      
      const origin = new Origin(originData);

      // Generate the horoscope
      const horoscope = new Horoscope({
        origin: origin,
        houseSystem: "placidus",
        zodiac: "tropical",
        aspectPoints: ['bodies', 'points', 'angles'],
        aspectWithPoints: ['bodies', 'points', 'angles'],
        aspectTypes: ["major", "minor"],
        language: 'en'
      });
      
      // Get calculated positions
      const positions = horoscope.CelestialBodies;
      const houses = horoscope.Houses;
      const aspects = horoscope.Aspects;

      // Transform data into our format
      const transformedChartData: ChartData = {
        sun: {
          sign: positions.Sun?.sign || 'Unknown',
          degree: positions.Sun?.degree || 0,
          house: positions.Sun?.house || 1
        },
        moon: {
          sign: positions.Moon?.sign || 'Unknown',
          degree: positions.Moon?.degree || 0,
          house: positions.Moon?.house || 1
        },
        rising: {
          sign: positions.ASC?.sign || 'Unknown',
          degree: positions.ASC?.degree || 0
        },
        planets: Object.entries(positions)
          .filter(([name]) => !['ASC', 'MC', 'Sun', 'Moon'].includes(name))
          .map(([name, data]: [string, any]) => ({
            name: name.toLowerCase(),
            sign: data.sign || 'Unknown',
            degree: data.degree || 0,
            house: data.house || 1,
            retrograde: data.retrograde || false
          })),
        houses: houses?.map((house: any, index: number) => ({
          number: index + 1,
          sign: house.sign || 'Unknown',
          degree: house.degree || 0
        })) || [],
        aspects: aspects?.map((aspect: any) => ({
          planet1: aspect.planet1 || '',
          planet2: aspect.planet2 || '',
          aspect: aspect.aspect || '',
          orb: aspect.orb || 0
        })) || []
      };

      setChartData(transformedChartData);
      
      // Try to render chart using AstroChart first
      try {
        await renderWithAstroChart(transformedChartData);
      } catch (renderError) {
        console.error('AstroChart rendering failed, using SVG fallback:', renderError);
        setSvgContent(createChartSVG(transformedChartData));
      }
      
      if (onChartGenerated) {
        onChartGenerated(transformedChartData);
      }

    } catch (err) {
      console.error('Error generating chart:', err);
      setError('Failed to generate chart. Please check your birth data and try again.');
      
      // Fallback: Generate a mock chart
      await generateMockChart();
    } finally {
      setIsGenerating(false);
    }
  };

  // Render chart using AstroChart library
  const renderWithAstroChart = async (data: ChartData) => {
    if (!chartRef.current) {
      console.log('Chart ref not available, falling back to SVG');
      setSvgContent(createChartSVG(data));
      return;
    }
    
    try {
      console.log('Starting AstroChart render with data:', data);
      
      // Dynamic import AstroChart to avoid SSR issues
      const { Chart } = await import('@astrodraw/astrochart');
      
      // Clear previous content
      chartRef.current.innerHTML = '';
      
      // Create a div for the chart
      const chartDiv = document.createElement('div');
      chartDiv.id = 'astrochart-' + Date.now();
      chartRef.current.appendChild(chartDiv);
      
      // Convert our data format to AstroChart format
      const astroData = {
        planets: {} as Record<string, number[]>,
        cusps: data.houses?.map(h => h.degree) || Array.from({ length: 12 }, (_, i) => i * 30)
      };
      
      // Add main luminaries
      astroData.planets['Sun'] = [data.sun.degree];
      astroData.planets['Moon'] = [data.moon.degree];
      
      // Map planet names to AstroChart format
      const planetNameMap: Record<string, string> = {
        mercury: 'Mercury',
        venus: 'Venus',
        mars: 'Mars',
        jupiter: 'Jupiter',
        saturn: 'Saturn',
        uranus: 'Uranus',
        neptune: 'Neptune',
        pluto: 'Pluto'
      };
      
      // Add other planets
      data.planets?.forEach(planet => {
        const mappedName = planetNameMap[planet.name] || planet.name;
        if (mappedName) {
          astroData.planets[mappedName] = [planet.degree];
        }
      });
      
      // Configure AstroChart settings to match our style
      const settings = {
        CHART_STROKE_ONLY: false,
        COLORS_BACKGROUND: '#FFFCF2',
        COLORS_CIRCLES: '#E6B13A',
        COLORS_TEXTS: '#444',
        COLORS_LINES: '#E5E1D8',
        COLORS_SYMBOLS: '#444',
        SYMBOL_SCALE: 1.2,
        CHART_PADDING: 20,
        CHART_LINE_WIDTH: 1,
        SYMBOL_SUN: '☉',
        SYMBOL_MOON: '☽',
        SYMBOL_MERCURY: '☿',
        SYMBOL_VENUS: '♀',
        SYMBOL_MARS: '♂',
        SYMBOL_JUPITER: '♃',
        SYMBOL_SATURN: '♄',
        SYMBOL_URANUS: '♅',
        SYMBOL_NEPTUNE: '♆',
        SYMBOL_PLUTO: '♇'
      };
      
      // Create the chart
      const chart = new Chart('#' + chartDiv.id, 400, 400, settings);
      const radixChart = chart.radix(astroData);
      
      // Store chart instance for potential future use
      setAstroChart(chart);
      
      // Apply custom styling to match solChart.svg aesthetic
      const svg = chartDiv.querySelector('svg');
      if (svg) {
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.maxWidth = '400px';
        svg.style.maxHeight = '400px';
        
        // Add custom styles
        const style = document.createElement('style');
        style.textContent = `
          #${chartDiv.id} .astrology-radix-planets-marker {
            fill: #FCF6E5;
            stroke: #E6B13A;
          }
          #${chartDiv.id} .astrology-radix-axis-marker {
            stroke: #E6B13A;
            stroke-width: 2;
          }
          #${chartDiv.id} .astrology-radix-cusps-line {
            stroke: #E5E1D8;
            stroke-dasharray: 2,2;
          }
          #${chartDiv.id} .astrology-radix-circle {
            fill: none;
            stroke: #E6B13A;
          }
          #${chartDiv.id} text {
            font-family: serif;
          }
        `;
        chartDiv.appendChild(style);
      }
      
    } catch (err) {
      console.error('Error rendering with AstroChart, falling back to custom SVG:', err);
      // Fallback to our custom SVG if AstroChart fails
      setSvgContent(createChartSVG(data));
    }
  };

  // Create SVG chart visualization based on calculated data (fallback)
  const createChartSVG = (data: ChartData): string => {
    const size = 400;
    const center = size / 2;
    const outerRadius = 180;
    const innerRadius = 120;
    const planetRadius = 150;
    
    // Calculate planet positions
    const planetPositions = data.planets?.map(planet => {
      const angle = (planet.degree - 90) * Math.PI / 180;
      return {
        ...planet,
        symbol: planetSymbols[planet.name.toLowerCase()] || planet.name.charAt(0).toUpperCase(),
        x: center + planetRadius * Math.cos(angle),
        y: center + planetRadius * Math.sin(angle)
      };
    }) || [];

    return `
      <svg viewBox="0 0 ${size} ${size}" style="width: 100%; height: 100%; max-width: 400px; max-height: 400px;">
        <defs>
          <style>
            .zodiac-text { fill: #666; font-size: 14px; font-family: serif; }
            .planet-text { fill: #444; font-size: 16px; font-family: serif; font-weight: bold; }
            .degree-text { fill: #888; font-size: 10px; font-family: monospace; }
            .house-line { stroke: #E5E1D8; stroke-width: 1; stroke-dasharray: 2,2; }
            .zodiac-line { stroke: #E6B13A; stroke-width: 1; }
          </style>
        </defs>
        
        <!-- Background -->
        <rect width="${size}" height="${size}" fill="#FFFCF2" opacity="0.5"/>
        
        <!-- Outer circle (Zodiac wheel) -->
        <circle cx="${center}" cy="${center}" r="${outerRadius}" 
                fill="none" stroke="#E6B13A" stroke-width="2"/>
        
        <!-- Inner circle (House wheel) -->
        <circle cx="${center}" cy="${center}" r="${innerRadius}" 
                fill="#FFFCF2" stroke="#E6B13A" stroke-width="1"/>
        
        <!-- Zodiac divisions -->
        ${Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30 - 90) * Math.PI / 180;
          const x1 = center + innerRadius * Math.cos(angle);
          const y1 = center + innerRadius * Math.sin(angle);
          const x2 = center + outerRadius * Math.cos(angle);
          const y2 = center + outerRadius * Math.sin(angle);
          return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="zodiac-line"/>`;
        }).join('')}
        
        <!-- House divisions -->
        ${data.houses?.map((house) => {
          const angle = (house.degree - 90) * Math.PI / 180;
          const x1 = center;
          const y1 = center;
          const x2 = center + innerRadius * Math.cos(angle);
          const y2 = center + innerRadius * Math.sin(angle);
          return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="house-line"/>`;
        }).join('') || ''}
        
        <!-- Zodiac signs -->
        ${Object.entries(zodiacSymbols).map(([sign, symbol], i) => {
          const angle = ((i * 30 + 15) - 90) * Math.PI / 180;
          const x = center + (outerRadius + innerRadius) / 2 * Math.cos(angle);
          const y = center + (outerRadius + innerRadius) / 2 * Math.sin(angle) + 5;
          return `<text x="${x}" y="${y}" text-anchor="middle" class="zodiac-text">${symbol}</text>`;
        }).join('')}
        
        <!-- House numbers -->
        ${Array.from({ length: 12 }).map((_, i) => {
          const houseAngle = data.houses?.[i]?.degree || (i * 30);
          const nextHouseAngle = data.houses?.[i + 1]?.degree || ((i + 1) * 30);
          const midAngle = ((houseAngle + nextHouseAngle) / 2 - 90) * Math.PI / 180;
          const x = center + (innerRadius * 0.7) * Math.cos(midAngle);
          const y = center + (innerRadius * 0.7) * Math.sin(midAngle) + 3;
          return `<text x="${x}" y="${y}" text-anchor="middle" class="degree-text">${i + 1}</text>`;
        }).join('')}
        
        <!-- Planets -->
        ${planetPositions.map(planet => `
          <g transform="translate(${planet.x},${planet.y})">
            <circle r="15" fill="#FCF6E5" stroke="#E6B13A" stroke-width="1"/>
            <text y="5" text-anchor="middle" class="planet-text">${planet.symbol}</text>
            ${planet.retrograde ? `<text y="15" text-anchor="middle" class="degree-text">℞</text>` : ''}
          </g>
        `).join('')}
        
        <!-- Center info -->
        <circle cx="${center}" cy="${center}" r="60" fill="#FCF6E5" stroke="#E6B13A" stroke-width="1"/>
        <text x="${center}" y="${center - 20}" text-anchor="middle" class="planet-text">
          ${planetSymbols.sun} ${data.sun.sign}
        </text>
        <text x="${center}" y="${center}" text-anchor="middle" class="zodiac-text">
          ${planetSymbols.moon} ${data.moon.sign}
        </text>
        <text x="${center}" y="${center + 20}" text-anchor="middle" class="zodiac-text">
          ASC ${data.rising.sign}
        </text>
      </svg>
    `;
  };

  const generateMockChart = async () => {
    if (!chartRef.current || !birthData) return;
    
    // Generate mock chart data based on birth date/time
    const birthDateTime = new Date(`${birthData.date}T${birthData.time}`);
    const dayOfYear = Math.floor((birthDateTime.getTime() - new Date(birthDateTime.getFullYear(), 0, 0).getTime()) / 86400000);
    
    // Simple calculations for demo
    const sunDegree = (dayOfYear * 360 / 365) % 360;
    const moonDegree = (sunDegree + 120 + birthDateTime.getHours() * 15) % 360;
    const risingDegree = ((birthDateTime.getHours() + birthDateTime.getMinutes() / 60) * 15) % 360;
    
    const mockData: ChartData = {
      sun: { 
        sign: getZodiacSign(sunDegree), 
        degree: sunDegree % 30,
        house: Math.floor(((sunDegree - risingDegree + 360) % 360) / 30) + 1
      },
      moon: { 
        sign: getZodiacSign(moonDegree), 
        degree: moonDegree % 30,
        house: Math.floor(((moonDegree - risingDegree + 360) % 360) / 30) + 1
      },
      rising: { 
        sign: getZodiacSign(risingDegree), 
        degree: risingDegree % 30
      },
      planets: [
        { name: 'mercury', sign: getZodiacSign((sunDegree + 10) % 360), degree: (sunDegree + 10) % 360, house: 1 },
        { name: 'venus', sign: getZodiacSign((sunDegree - 30) % 360), degree: (sunDegree - 30) % 360, house: 2 },
        { name: 'mars', sign: getZodiacSign((sunDegree + 180) % 360), degree: (sunDegree + 180) % 360, house: 7 },
        { name: 'jupiter', sign: getZodiacSign((sunDegree + 90) % 360), degree: (sunDegree + 90) % 360, house: 4 },
        { name: 'saturn', sign: getZodiacSign((sunDegree - 90) % 360), degree: (sunDegree - 90) % 360, house: 10 }
      ],
      houses: Array.from({ length: 12 }, (_, i) => ({
        number: i + 1,
        sign: getZodiacSign((risingDegree + i * 30) % 360),
        degree: (risingDegree + i * 30) % 360
      })),
      aspects: [] // Mock: no aspects calculated for demo
    };
    
    setChartData(mockData);
    
    // Try to render with AstroChart first
    await renderWithAstroChart(mockData);
    
    if (onChartGenerated) {
      onChartGenerated(mockData);
    }
  };

  const generateFallbackChart = async () => {
    // This is now just an alias for generateMockChart
    await generateMockChart();
  };

  // Generate chart on mount or when birth data changes
  useEffect(() => {
    if (birthData) {
      generateChart();
    }
  }, [birthData]); // eslint-disable-line react-hooks/exhaustive-deps

  // Render loading state
  if (isGenerating) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ minHeight: '400px' }}>
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="text-4xl mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            🌌
          </motion.div>
          <div className="text-lg font-serif text-[#444]">Calculating your chart...</div>
          <div className="text-sm text-[#666] mt-2">Analyzing planetary positions</div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ minHeight: '400px' }}>
        <div className="text-center">
          <div className="text-2xl mb-2">⚠️</div>
          <div className="text-red-600 font-serif">{error}</div>
          <button
            onClick={() => {
              setError(null);
              setSvgContent(null);
              setChartData(null);
              generateChart();
            }}
            className="mt-4 px-4 py-2 bg-[#E6B13A] text-black font-mono text-sm uppercase tracking-wide hover:bg-[#D4A02A] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`natal-chart-container ${className}`}>
      {svgContent ? (
        <div 
          className="w-full h-full border border-[#E5E1D8] bg-[#FCF6E5] p-4"
          style={{ minHeight: '400px' }}
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      ) : (
        <div 
          ref={chartRef} 
          className="w-full h-full border border-[#E5E1D8] bg-[#FCF6E5] p-4"
          style={{ minHeight: '400px' }}
        />
      )}
      {chartData && (
        <div className="mt-4 text-center text-sm text-[#666]">
          Chart generated for {birthData.location.city}, {birthData.location.country}
        </div>
      )}
    </div>
  );
};

export default NatalChartGenerator;