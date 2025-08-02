import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { calculateNatalChart } from '~/lib/astroCalculations';

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

export interface ChartData {
  sun: { sign: string; degree: number; house: number; houseWS?: number };
  moon: { sign: string; degree: number; house: number; houseWS?: number };
  rising: { sign: string; degree: number };
  planets: Array<{
    name: string;
    sign: string;
    degree: number;
    house: number;
    houseWS?: number; // Whole Sign house
    retrograde?: boolean;
  }>;
  houses: Array<{
    number: number;
    sign: string;
    degree: number;
  }>;
  housesWS?: Array<{  // Whole Sign houses
    number: number;
    sign: string;
    degree: number;
  }>;
  houseSystem?: 'equal' | 'whole' | 'both';
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
  const [houseSystem, setHouseSystem] = useState<'equal' | 'whole'>('equal');

  const generateChart = async () => {
    if (!birthData || !chartRef.current) return;

    console.log('NatalChartGenerator: Starting chart generation');
    setIsGenerating(true);
    setError(null);

    try {
      console.log('Starting chart calculation with new method...');
      
      // Use our new calculation method
      const transformedChartData = await calculateNatalChart(birthData);
      
      console.log('Chart calculation complete:', transformedChartData);

      setChartData(transformedChartData);
      
      // Always use SVG for now since AstroChart seems to have issues
      console.log('Rendering chart with SVG');
      setSvgContent(createChartSVG(transformedChartData));
      
      if (onChartGenerated) {
        onChartGenerated(transformedChartData);
      }

    } catch (err) {
      console.error('Error generating chart:', err);
      console.error('Error details:', {
        birthData,
        errorMessage: err instanceof Error ? err.message : 'Unknown error',
        errorStack: err instanceof Error ? err.stack : undefined
      });
      setError('Failed to generate accurate chart. Showing approximate positions.');
      
      // Fallback: Generate a mock chart with better calculations
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
      
      // Helper function to convert sign + degree to absolute degree
      const getAbsoluteDegree = (sign: string, degree: number): number => {
        const signIndex = Object.keys(zodiacSymbols).indexOf(sign.toLowerCase());
        return signIndex * 30 + degree;
      };
      
      // Convert our data format to AstroChart format
      const astroData = {
        planets: {} as Record<string, number[]>,
        cusps: data.houses?.map(h => getAbsoluteDegree(h.sign, h.degree)) || Array.from({ length: 12 }, (_, i) => i * 30)
      };
      
      // Add main luminaries
      astroData.planets['Sun'] = [getAbsoluteDegree(data.sun.sign, data.sun.degree)];
      astroData.planets['Moon'] = [getAbsoluteDegree(data.moon.sign, data.moon.degree)];
      
      // Add Ascendant to AstroChart
      astroData.planets['ASC'] = [getAbsoluteDegree(data.rising.sign, data.rising.degree)];
      
      console.log('AstroChart data:', {
        sun: astroData.planets['Sun'],
        moon: astroData.planets['Moon'],
        asc: astroData.planets['ASC'],
        cusps: astroData.cusps,
        rising: data.rising
      });
      
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
          astroData.planets[mappedName] = [getAbsoluteDegree(planet.sign, planet.degree)];
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
      setSvgContent(createChartSVG(data, houseSystem === 'whole'));
    }
  };

  // Create SVG chart visualization based on calculated data (fallback)
  const createChartSVG = (data: ChartData, useWholeSign: boolean = false): string => {
    console.log('Creating SVG with data:', {
      sun: data.sun,
      moon: data.moon,
      rising: data.rising,
      firstHouse: data.houses?.[0],
      eleventhHouse: data.houses?.[10]
    });
    
    const size = 400;
    const center = size / 2;
    const outerRadius = 180;
    const innerRadius = 120;
    const planetRadius = 150;
    
    // Helper function to convert sign + degree to absolute degree
    const getAbsoluteDegree = (sign: string, degree: number): number => {
      const signs = [
        'Aries', 'Taurus', 'Gemini', 'Cancer',
        'Leo', 'Virgo', 'Libra', 'Scorpio',
        'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
      ];
      const signIndex = signs.findIndex(s => s.toLowerCase() === sign.toLowerCase());
      if (signIndex === -1) {
        console.error(`Unknown sign: ${sign}`);
        return degree; // Fallback
      }
      return signIndex * 30 + degree;
    };
    
    // Calculate planet positions (including Sun and Moon)
    const allPlanets = [
      { name: 'sun', ...data.sun },
      { name: 'moon', ...data.moon },
      ...(data.planets || [])
    ];
    
    const planetPositions = allPlanets.map(planet => {
      const absoluteDegree = getAbsoluteDegree(planet.sign, planet.degree);
      // Rotate -90 degrees to put Aries at the left (9 o'clock position)
      const angle = (absoluteDegree - 180) * Math.PI / 180;
      return {
        ...planet,
        absoluteDegree,
        symbol: planetSymbols[planet.name.toLowerCase()] || planet.name.charAt(0).toUpperCase(),
        x: center + planetRadius * Math.cos(angle),
        y: center + planetRadius * Math.sin(angle)
      };
    });

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
          const angle = (i * 30 - 180) * Math.PI / 180;
          const x1 = center + innerRadius * Math.cos(angle);
          const y1 = center + innerRadius * Math.sin(angle);
          const x2 = center + outerRadius * Math.cos(angle);
          const y2 = center + outerRadius * Math.sin(angle);
          return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="zodiac-line"/>`;
        }).join('')}
        
        <!-- House divisions -->
        ${(useWholeSign ? data.housesWS : data.houses)?.map((house) => {
          const absoluteDegree = getAbsoluteDegree(house.sign, house.degree);
          const angle = (absoluteDegree - 180) * Math.PI / 180;
          const x1 = center;
          const y1 = center;
          const x2 = center + innerRadius * Math.cos(angle);
          const y2 = center + innerRadius * Math.sin(angle);
          return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="house-line"/>`;
        }).join('') || ''}
        
        <!-- Zodiac signs -->
        ${Object.entries(zodiacSymbols).map(([sign, symbol], i) => {
          const angle = ((i * 30 + 15) - 180) * Math.PI / 180;
          const x = center + (outerRadius + innerRadius) / 2 * Math.cos(angle);
          const y = center + (outerRadius + innerRadius) / 2 * Math.sin(angle) + 5;
          return `<text x="${x}" y="${y}" text-anchor="middle" class="zodiac-text">${symbol}</text>`;
        }).join('')}
        
        <!-- House numbers -->
        ${Array.from({ length: 12 }).map((_, i) => {
          const house = data.houses?.[i];
          const nextHouse = data.houses?.[i + 1] || data.houses?.[0];
          const houseAngle = house ? getAbsoluteDegree(house.sign, house.degree) : (i * 30);
          const nextHouseAngle = nextHouse ? getAbsoluteDegree(nextHouse.sign, nextHouse.degree) : ((i + 1) * 30);
          const midAngle = ((houseAngle + nextHouseAngle) / 2 - 180) * Math.PI / 180;
          const x = center + (innerRadius * 0.7) * Math.cos(midAngle);
          const y = center + (innerRadius * 0.7) * Math.sin(midAngle) + 3;
          return `<text x="${x}" y="${y}" text-anchor="middle" class="degree-text">${i + 1}</text>`;
        }).join('')}
        
        <!-- Sun -->
        ${(() => {
          const sunAbsoluteDegree = getAbsoluteDegree(data.sun.sign, data.sun.degree);
          const sunAngle = (sunAbsoluteDegree - 180) * Math.PI / 180;
          const sunX = center + planetRadius * Math.cos(sunAngle);
          const sunY = center + planetRadius * Math.sin(sunAngle);
          return `
            <g transform="translate(${sunX},${sunY})">
              <circle r="15" fill="#FFD700" stroke="#E6B13A" stroke-width="1"/>
              <text y="5" text-anchor="middle" class="planet-text">${planetSymbols.sun}</text>
            </g>
          `;
        })()}
        
        <!-- Moon -->
        ${(() => {
          const moonAbsoluteDegree = getAbsoluteDegree(data.moon.sign, data.moon.degree);
          const moonAngle = (moonAbsoluteDegree - 180) * Math.PI / 180;
          const moonX = center + planetRadius * Math.cos(moonAngle);
          const moonY = center + planetRadius * Math.sin(moonAngle);
          return `
            <g transform="translate(${moonX},${moonY})">
              <circle r="15" fill="#C0C0C0" stroke="#E6B13A" stroke-width="1"/>
              <text y="5" text-anchor="middle" class="planet-text">${planetSymbols.moon}</text>
            </g>
          `;
        })()}
        
        <!-- Planets -->
        ${planetPositions.map(planet => `
          <g transform="translate(${planet.x},${planet.y})">
            <circle r="15" fill="#FCF6E5" stroke="#E6B13A" stroke-width="1"/>
            <text y="5" text-anchor="middle" class="planet-text">${planet.symbol}</text>
            ${planet.retrograde ? `<text y="15" text-anchor="middle" class="degree-text">℞</text>` : ''}
          </g>
        `).join('')}
        
        <!-- Ascendant marker -->
        ${(() => {
          const ascAbsoluteDegree = getAbsoluteDegree(data.rising.sign, data.rising.degree);
          const ascAngle = (ascAbsoluteDegree - 180) * Math.PI / 180;
          const x1 = center + (innerRadius - 10) * Math.cos(ascAngle);
          const y1 = center + (innerRadius - 10) * Math.sin(ascAngle);
          const x2 = center + (outerRadius + 10) * Math.cos(ascAngle);
          const y2 = center + (outerRadius + 10) * Math.sin(ascAngle);
          const textX = x2 + 15 * Math.cos(ascAngle);
          const textY = y2 + 15 * Math.sin(ascAngle);
          return `
            <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#E6B13A" stroke-width="3"/>
            <text x="${textX}" y="${textY}" text-anchor="middle" class="zodiac-text" font-weight="bold">ASC</text>
          `;
        })()}
        
        <!-- Center info -->
        <circle cx="${center}" cy="${center}" r="60" fill="#FCF6E5" stroke="#E6B13A" stroke-width="1"/>
        <text x="${center}" y="${center - 20}" text-anchor="middle" class="planet-text">
          ${data.rising.sign}
        </text>
        <text x="${center}" y="${center}" text-anchor="middle" class="zodiac-text">
          ASC ${data.rising.degree.toFixed(1)}°
        </text>
        <text x="${center}" y="${center + 20}" text-anchor="middle" class="degree-text">
          Rising Sign
        </text>
      </svg>
    `;
  };

  const generateMockChart = async () => {
    console.log('⚠️ USING MOCK CHART GENERATION - This should not happen!');
    if (!chartRef.current || !birthData) return;
    
    // Generate mock chart data based on birth date/time
    const birthDateTime = new Date(`${birthData.date}T${birthData.time}`);
    const dayOfYear = Math.floor((birthDateTime.getTime() - new Date(birthDateTime.getFullYear(), 0, 0).getTime()) / 86400000);
    
    // More accurate calculations for demo
    // Sun position based on actual date (approximately)
    const sunDegree = ((dayOfYear - 80) * 360 / 365) % 360; // -80 adjusts for spring equinox
    // Moon moves ~13 degrees per day, adding hour factor
    const moonDegree = (sunDegree + (dayOfYear * 13) + (birthDateTime.getHours() * 0.5)) % 360;
    // Rising sign based on time of day and location
    const hourAngle = (birthDateTime.getHours() + birthDateTime.getMinutes() / 60) * 15;
    const risingDegree = (hourAngle + 90) % 360; // +90 for eastern horizon
    
    console.log('Mock chart debug:', {
      birthDateTime: birthDateTime.toString(),
      hourAngle,
      risingDegree,
      risingSign: getZodiacSign(risingDegree),
      sunDegree,
      sunSign: getZodiacSign(sunDegree)
    });
    
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
        degree: ((risingDegree + i * 30) % 360) % 30
      })),
      aspects: [] // Mock: no aspects calculated for demo
    };
    
    setChartData(mockData);
    
    // Use SVG rendering
    setSvgContent(createChartSVG(mockData, houseSystem === 'whole'));
    
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

  console.log('NatalChartGenerator render:', { 
    hasChartData: !!chartData, 
    hasSvgContent: !!svgContent,
    isGenerating,
    error,
    houseSystem 
  });

  return (
    <div className={`natal-chart-container ${className}`}>
      {/* House System Toggle - Only show when chart is rendered */}
      {(svgContent || chartData) && (
        <div className="flex flex-col items-center mb-4">
          <div className="text-xs font-mono text-[#666] mb-2 uppercase tracking-wide">House System</div>
          <div className="inline-flex bg-[#FCF6E5] border-2 border-[#E5E1D8] rounded-md p-1 shadow-sm">
            <button
              onClick={() => {
                setHouseSystem('equal');
                if (chartData) setSvgContent(createChartSVG(chartData, false));
              }}
              className={`px-4 py-2 text-sm font-mono transition-colors rounded ${
                houseSystem === 'equal' 
                  ? 'bg-[#E6B13A] text-black shadow-sm' 
                  : 'text-[#666] hover:text-black hover:bg-[#F5F1E8]'
              }`}
            >
              Equal Houses
            </button>
            <button
              onClick={() => {
                setHouseSystem('whole');
                if (chartData) setSvgContent(createChartSVG(chartData, true));
              }}
              className={`px-4 py-2 text-sm font-mono transition-colors rounded ${
                houseSystem === 'whole' 
                  ? 'bg-[#E6B13A] text-black shadow-sm' 
                  : 'text-[#666] hover:text-black hover:bg-[#F5F1E8]'
              }`}
            >
              Whole Sign
            </button>
          </div>
        </div>
      )}
      
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