import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

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
  sun: { sign: string; degree: number; house?: number };
  moon: { sign: string; degree: number; house?: number };
  rising: { sign: string; degree: number; house?: number };
}

interface NatalChartGeneratorProps {
  birthData: BirthData;
  onChartGenerated?: (chartData: ChartData) => void;
  className?: string;
}

const zodiacSigns = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const getZodiacSign = (degree: number): string => {
  const normalizedDegree = degree % 360;
  const signIndex = Math.floor(normalizedDegree / 30);
  return zodiacSigns[signIndex];
};

const NatalChartGenerator: React.FC<NatalChartGeneratorProps> = ({
  birthData,
  onChartGenerated,
  className = ''
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [chartData, setChartData] = useState<ChartData | null>(null);

  useEffect(() => {
    if (!birthData || !chartRef.current) return;

    setIsGenerating(true);

    // Mock calculation
    setTimeout(() => {
      const birthDateTime = new Date(`${birthData.date}T${birthData.time}`);
      const dayOfYear = Math.floor((birthDateTime.getTime() - new Date(birthDateTime.getFullYear(), 0, 0).getTime()) / 86400000);
      const hourAngle = (birthDateTime.getHours() + birthDateTime.getMinutes() / 60) * 15;
      
      const sunDegree = (dayOfYear * 360 / 365) % 360;
      const moonDegree = (sunDegree + hourAngle + 120) % 360;
      const risingDegree = (hourAngle + birthData.location.longitude) % 360;
      
      const mockData: ChartData = {
        sun: { sign: getZodiacSign(sunDegree), degree: sunDegree % 30 },
        moon: { sign: getZodiacSign(moonDegree), degree: moonDegree % 30 },
        rising: { sign: getZodiacSign(risingDegree), degree: risingDegree % 30 }
      };

      setChartData(mockData);
      setIsGenerating(false);
      
      if (onChartGenerated) {
        onChartGenerated(mockData);
      }

      // Create simple SVG
      if (chartRef.current) {
        chartRef.current.innerHTML = `
          <svg viewBox="0 0 400 400" style="width: 100%; height: 100%; max-width: 400px;">
            <circle cx="200" cy="200" r="180" fill="none" stroke="#E6B13A" stroke-width="2"/>
            <circle cx="200" cy="200" r="120" fill="none" stroke="#E6B13A" stroke-width="1"/>
            <text x="200" y="190" text-anchor="middle" fill="#444" font-size="16" font-family="serif">☉ ${mockData.sun.sign}</text>
            <text x="200" y="210" text-anchor="middle" fill="#666" font-size="14" font-family="serif">☽ ${mockData.moon.sign}</text>
            <text x="200" y="230" text-anchor="middle" fill="#666" font-size="14" font-family="serif">↗ ${mockData.rising.sign}</text>
          </svg>
        `;
      }
    }, 2000);
  }, [birthData, onChartGenerated]);

  if (isGenerating) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#E6B13A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-[#666] font-mono">Calculating planetary positions...</p>
        </div>
      </div>
    );
  }

  return <div ref={chartRef} className={`flex items-center justify-center ${className}`} style={{ minHeight: '400px' }} />;
};

export default NatalChartGenerator;
