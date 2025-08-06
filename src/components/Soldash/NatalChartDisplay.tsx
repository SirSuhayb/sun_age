'use client';
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface Planet {
  name: string;
  sign: string;
  degree: number;
  house: number;
  symbol?: string;
}

interface ChartData {
  sun: Planet;
  moon: Planet;
  rising: { sign: string; degree: number };
  planets: Planet[];
}

interface NatalChartDisplayProps {
  chartData: ChartData;
  className?: string;
}

// Zodiac sign to degree mapping (0° = Aries)
const SIGN_TO_DEGREE: Record<string, number> = {
  'Aries': 0,
  'Taurus': 30,
  'Gemini': 60,
  'Cancer': 90,
  'Leo': 120,
  'Virgo': 150,
  'Libra': 180,
  'Scorpio': 210,
  'Sagittarius': 240,
  'Capricorn': 270,
  'Aquarius': 300,
  'Pisces': 330
};

// Planet symbols
const PLANET_SYMBOLS: Record<string, string> = {
  'Sun': '☉',
  'Moon': '☽',
  'Mercury': '☿',
  'Venus': '♀',
  'Mars': '♂',
  'Jupiter': '♃',
  'Saturn': '♄',
  'Uranus': '♅',
  'Neptune': '♆',
  'Pluto': '♇',
  'North Node': '☊',
  'South Node': '☋',
  'Ascendant': 'AC',
  'Midheaven': 'MC'
};

// Aspect colors
const ASPECT_COLORS = {
  conjunction: '#E6B13A', // Gold
  opposition: '#DC143C', // Red
  trine: '#4682B4', // Blue
  square: '#8B4513', // Brown
  sextile: '#228B22' // Green
};

export default function NatalChartDisplay({ chartData, className = '' }: NatalChartDisplayProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Calculate absolute degree position for a planet
  const calculateAbsoluteDegree = (planet: Planet): number => {
    const signDegree = SIGN_TO_DEGREE[planet.sign] || 0;
    return (signDegree + planet.degree) % 360;
  };

  // Convert degrees to radians
  const degreesToRadians = (degrees: number): number => {
    return (degrees - 90) * (Math.PI / 180); // Subtract 90 to start from top
  };

  // Calculate X,Y position for a given degree and radius
  const calculatePosition = (degree: number, radius: number, centerX: number = 200, centerY: number = 200) => {
    const radians = degreesToRadians(degree);
    const x = centerX + radius * Math.cos(radians);
    const y = centerY + radius * Math.sin(radians);
    return { x, y };
  };

  // Draw planets on the chart
  const drawPlanets = () => {
    if (!svgRef.current || !chartData) return;

    const planetsGroup = svgRef.current.querySelector('#planets');
    if (!planetsGroup) return;

    // Clear existing planets
    planetsGroup.innerHTML = '';

    // Add all planets including Sun, Moon
    const allPlanets = [
      { ...chartData.sun, name: 'Sun' },
      { ...chartData.moon, name: 'Moon' },
      ...chartData.planets
    ];

    allPlanets.forEach((planet) => {
      const degree = calculateAbsoluteDegree(planet);
      const position = calculatePosition(degree, 125); // Place planets between inner circles

      // Create planet group
      const planetGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      
      // Add planet symbol
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', position.x.toString());
      text.setAttribute('y', position.y.toString());
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-size', '16');
      text.setAttribute('fill', '#444');
      text.setAttribute('font-family', 'serif');
      text.textContent = PLANET_SYMBOLS[planet.name] || planet.name[0];
      
      // Add degree text
      const degreeText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      degreeText.setAttribute('x', position.x.toString());
      degreeText.setAttribute('y', (position.y + 15).toString());
      degreeText.setAttribute('text-anchor', 'middle');
      degreeText.setAttribute('font-size', '10');
      degreeText.setAttribute('fill', '#888');
      degreeText.textContent = `${Math.round(planet.degree)}°`;

      planetGroup.appendChild(text);
      planetGroup.appendChild(degreeText);
      planetsGroup.appendChild(planetGroup);
    });
  };

  // Draw aspect lines between planets
  const drawAspects = () => {
    if (!svgRef.current || !chartData) return;

    const aspectsGroup = svgRef.current.querySelector('#aspects');
    if (!aspectsGroup) return;

    // Clear existing aspects
    aspectsGroup.innerHTML = '';

    // For now, just draw lines between Sun, Moon, and Rising
    // In a full implementation, you'd calculate all aspects
    const sunDegree = calculateAbsoluteDegree({ ...chartData.sun, name: 'Sun' });
    const moonDegree = calculateAbsoluteDegree({ ...chartData.moon, name: 'Moon' });
    
    const sunPos = calculatePosition(sunDegree, 125);
    const moonPos = calculatePosition(moonDegree, 125);

    // Check for conjunction (same sign)
    if (chartData.sun.sign === chartData.moon.sign) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', sunPos.x.toString());
      line.setAttribute('y1', sunPos.y.toString());
      line.setAttribute('x2', moonPos.x.toString());
      line.setAttribute('y2', moonPos.y.toString());
      line.setAttribute('stroke', ASPECT_COLORS.conjunction);
      line.setAttribute('stroke-width', '2');
      line.setAttribute('opacity', '0.6');
      aspectsGroup.appendChild(line);
    }
  };

  useEffect(() => {
    if (chartData && svgRef.current) {
      drawPlanets();
      drawAspects();
      setIsLoaded(true);
    }
  }, [chartData]);

  return (
    <motion.div 
      className={`relative ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <svg
        ref={svgRef}
        width="400"
        height="400"
        viewBox="0 0 400 400"
        className="w-full h-full"
        style={{ maxWidth: '400px', margin: '0 auto' }}
      >
        {/* Background */}
        <rect width="400" height="400" fill="#FFFCF2"/>
        
        {/* Outer circle (zodiac ring) */}
        <circle cx="200" cy="200" r="190" fill="none" stroke="#D4A02A" strokeWidth="20"/>
        
        {/* Inner circles */}
        <circle cx="200" cy="200" r="170" fill="none" stroke="#D4A02A" strokeWidth="1"/>
        <circle cx="200" cy="200" r="140" fill="none" stroke="#D4A02A" strokeWidth="1"/>
        <circle cx="200" cy="200" r="110" fill="none" stroke="#D4A02A" strokeWidth="1"/>
        <circle cx="200" cy="200" r="80" fill="none" stroke="#D4A02A" strokeWidth="1"/>
        
        {/* Center circle */}
        <circle cx="200" cy="200" r="50" fill="#FFF8E7" stroke="#D4A02A" strokeWidth="1"/>
        
        {/* House divisions (12 equal parts) */}
        <g id="house-lines" stroke="#D4A02A" strokeWidth="1">
          {[0, 30, 60, 90, 120, 150].map((degree) => (
            <line 
              key={degree}
              x1="200" 
              y1="50" 
              x2="200" 
              y2="350" 
              transform={`rotate(${degree} 200 200)`}
            />
          ))}
        </g>
        
        {/* Zodiac signs in outer ring */}
        <g id="zodiac-signs" fontFamily="serif" fontSize="16" fill="#444" textAnchor="middle">
          {Object.entries(SIGN_TO_DEGREE).map(([sign, baseDegree], index) => {
            const degree = baseDegree + 15; // Center of each sign
            const pos = calculatePosition(degree, 180);
            return (
              <text 
                key={sign}
                x={pos.x} 
                y={pos.y + 5}
                fontSize="18"
              >
                {['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'][index]}
              </text>
            );
          })}
        </g>
        
        {/* Planet positions will be added dynamically */}
        <g id="planets">
          {/* Planets will be positioned here dynamically */}
        </g>
        
        {/* Aspect lines will be added dynamically */}
        <g id="aspects" strokeWidth="1" fill="none" opacity="0.6">
          {/* Aspect lines will be drawn here dynamically */}
        </g>
        
        {/* Center sun symbol */}
        <text x="200" y="207" textAnchor="middle" fontSize="24" fill="#E6B13A">☉</text>
      </svg>

      {/* Loading animation */}
      {!isLoaded && (
        <motion.div 
          className="absolute inset-0 flex items-center justify-center bg-[#FFFCF2]/80"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="text-4xl mb-2"
            >
              ☉
            </motion.div>
            <p className="text-xs text-[#888]">Calculating planetary positions...</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}