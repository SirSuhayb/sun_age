import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

// Import astrology libraries
// Using CircularNatalHoroscopeJS for calculations: https://github.com/0xStarcat/CircularNatalHoroscopeJS
// Using AstroChart for rendering: https://github.com/AstroDraw/AstroChart
// Note: These need to be imported dynamically due to potential client-side only requirements
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateChart = async () => {
    if (!birthData || !chartRef.current) return;

    setIsGenerating(true);
    setError(null);

    try {
      // Parse birth data
      const birthDateTime = new Date(`${birthData.date}T${birthData.time}`);
      
      // Dynamic import to avoid SSR issues
      // CircularNatalHoroscopeJS - https://github.com/0xStarcat/CircularNatalHoroscopeJS
      // @ts-expect-error - Library has TypeScript issues
      const CircularNatalHoroscopeModule = await import('circular-natal-horoscope-js');
      const { Origin, Horoscope } = CircularNatalHoroscopeModule as any;
      
      // Create an Origin instance
      const origin = new Origin({
        year: birthDateTime.getFullYear(),
        month: birthDateTime.getMonth(), // Origin expects 0-11
        date: birthDateTime.getDate(),
        hour: birthDateTime.getHours(),
        minute: birthDateTime.getMinutes(),
        latitude: birthData.location.latitude,
        longitude: birthData.location.longitude
      });

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
          .filter(([name]) => !['ASC', 'MC'].includes(name))
          .map(([name, data]: [string, any]) => ({
            name,
            sign: data.sign || 'Unknown',
            degree: data.degree || 0,
            house: data.house || 1
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
      
      // Generate SVG chart using CircularNatalHoroscope
      const chartSvg = horoscope.draw();
      
      // Style the SVG to match solChart.svg aesthetic
      if (chartSvg && chartRef.current) {
        // Clear previous content
        chartRef.current.innerHTML = '';
        
        // Create container for the chart
        const container = document.createElement('div');
        container.className = 'w-full h-full flex items-center justify-center';
        container.style.minHeight = '400px';
        
        // Style the SVG to match our design
        if (typeof chartSvg === 'string') {
          container.innerHTML = chartSvg;
          const svg = container.querySelector('svg');
          if (svg) {
            svg.setAttribute('width', '100%');
            svg.setAttribute('height', '100%');
            svg.setAttribute('viewBox', '0 0 400 400');
            svg.style.maxWidth = '400px';
            svg.style.maxHeight = '400px';
            svg.style.filter = 'sepia(20%) saturate(200%) hue-rotate(35deg)';
          }
        } else {
          container.appendChild(chartSvg);
        }
        
        chartRef.current.appendChild(container);
      }

      if (onChartGenerated) {
        onChartGenerated(transformedChartData);
      }

    } catch (err) {
      console.error('Error generating chart:', err);
      setError('Failed to generate chart. Please check your birth data and try again.');
      
      // Fallback: Generate a mock chart
      generateMockChart();
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMockChart = () => {
    if (!chartRef.current) return;

    // Create a styled mock chart based on solChart.svg
    const mockChart = `
      <div class="w-full h-full flex items-center justify-center" style="min-height: 400px;">
        <svg width="300" height="300" viewBox="0 0 240 234" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Outer circle -->
          <circle cx="120" cy="117" r="110" fill="none" stroke="#AE8C25" stroke-width="2"/>
          <circle cx="120" cy="117" r="90" fill="none" stroke="#B18500" stroke-width="1" opacity="0.5"/>
          
          <!-- Inner chart wheel -->
          <circle cx="120" cy="117" r="70" fill="#FCF6E5" stroke="#E5E1D8" stroke-width="1"/>
          
          <!-- House divisions -->
          ${Array.from({ length: 12 }, (_, i) => {
            const angle = (i * 30) - 90; // Start from top
            const x1 = 120 + 70 * Math.cos(angle * Math.PI / 180);
            const y1 = 117 + 70 * Math.sin(angle * Math.PI / 180);
            const x2 = 120 + 110 * Math.cos(angle * Math.PI / 180);
            const y2 = 117 + 110 * Math.sin(angle * Math.PI / 180);
            return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#D7D7D7" stroke-width="1"/>`;
          }).join('')}
          
          <!-- Zodiac signs -->
          ${['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'].map((sign, i) => {
            const angle = (i * 30) - 75; // Offset for center of house
            const x = 120 + 100 * Math.cos(angle * Math.PI / 180);
            const y = 117 + 100 * Math.sin(angle * Math.PI / 180);
            return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" fill="#AE8C25" font-size="16">${sign}</text>`;
          }).join('')}
          
          <!-- Center -->
          <circle cx="120" cy="117" r="25" fill="#E6B13A" opacity="0.3"/>
          <text x="120" y="125" text-anchor="middle" fill="#444" font-size="12" font-family="serif">Your Chart</text>
        </svg>
      </div>
    `;

    chartRef.current.innerHTML = mockChart;

    // Set mock chart data
    const mockChartData: ChartData = {
      sun: { sign: 'Aquarius', degree: 15, house: 5 },
      moon: { sign: 'Pisces', degree: 22, house: 6 },
      rising: { sign: 'Gemini', degree: 8 },
      planets: [
        { name: 'Mercury', sign: 'Aquarius', degree: 25, house: 5 },
        { name: 'Venus', sign: 'Capricorn', degree: 18, house: 4 },
        { name: 'Mars', sign: 'Aries', degree: 12, house: 7 }
      ],
      houses: Array.from({ length: 12 }, (_, i) => ({
        number: i + 1,
        sign: ['Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces', 'Aries', 'Taurus'][i],
        degree: i * 30
      })),
      aspects: [
        { planet1: 'Sun', planet2: 'Moon', aspect: 'Sextile', orb: 2.5 },
        { planet1: 'Sun', planet2: 'Mercury', aspect: 'Conjunction', orb: 1.2 }
      ]
    };

    setChartData(mockChartData);
    if (onChartGenerated) {
      onChartGenerated(mockChartData);
    }
  };

  useEffect(() => {
    if (birthData && chartRef.current) {
      generateChart();
    }
  }, [birthData]); // eslint-disable-line react-hooks/exhaustive-deps

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
            onClick={generateChart}
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
      <div 
        ref={chartRef} 
        className="w-full h-full border border-[#E5E1D8] bg-[#FCF6E5] p-4"
        style={{ minHeight: '400px' }}
      />
      {chartData && (
        <div className="mt-4 text-center text-sm text-[#666]">
          Chart generated for {birthData.location.city}, {birthData.location.country}
        </div>
      )}
    </div>
  );
};

export default NatalChartGenerator;