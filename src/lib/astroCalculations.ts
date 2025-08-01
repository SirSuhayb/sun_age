import type { ChartData } from '~/components/Soldash/NatalChartGenerator';

// Zodiac signs
const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer',
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

// Get zodiac sign from ecliptic longitude
function getZodiacSign(longitude: number): string {
  const normalizedDegree = ((longitude % 360) + 360) % 360;
  const signIndex = Math.floor(normalizedDegree / 30);
  return ZODIAC_SIGNS[signIndex] || 'Aries';
}

// Get degree within sign (0-30)
function getDegreeInSign(longitude: number): number {
  const normalizedDegree = ((longitude % 360) + 360) % 360;
  return normalizedDegree % 30;
}

// Convert date to Julian Day Number
function dateToJulianDay(year: number, month: number, day: number, hour: number, minute: number): number {
  // Convert to decimal hours
  const decimalHours = hour + minute / 60;
  
  // Algorithm from Meeus "Astronomical Algorithms"
  let y = year;
  let m = month;
  
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  
  const jd = Math.floor(365.25 * (y + 4716)) + 
             Math.floor(30.6001 * (m + 1)) + 
             day + b - 1524.5 + decimalHours / 24;
  
  return jd;
}

// Calculate local sidereal time
function calculateLST(jd: number, longitude: number): number {
  // Calculate centuries from J2000
  const t = (jd - 2451545.0) / 36525;
  
  // Greenwich sidereal time at midnight
  let gst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 
            0.000387933 * t * t - t * t * t / 38710000;
  
  // Normalize to 0-360
  gst = ((gst % 360) + 360) % 360;
  
  // Add longitude (east positive)
  const lst = gst + longitude;
  
  return ((lst % 360) + 360) % 360;
}

// Calculate house cusps using Placidus system
function calculateHouses(lst: number, latitude: number): number[] {
  const houses: number[] = [];
  
  // Calculate MC (Midheaven) - it's simply the LST
  const mc = lst;
  
  // Calculate Ascendant
  const obliquity = 23.4397; // Approximate obliquity of ecliptic
  const tanLat = Math.tan(latitude * Math.PI / 180);
  const cosObl = Math.cos(obliquity * Math.PI / 180);
  
  // RAMC (Right Ascension of MC)
  const ramc = mc;
  
  // Ascendant calculation
  const y = Math.sin(ramc * Math.PI / 180) / cosObl;
  const x = Math.cos(ramc * Math.PI / 180);
  let ascendant = Math.atan2(y, x) * 180 / Math.PI;
  ascendant = ((ascendant % 360) + 360) % 360;
  
  // For now, use equal house system starting from ascendant
  for (let i = 0; i < 12; i++) {
    houses.push(((ascendant + i * 30) % 360));
  }
  
  return houses;
}

export async function calculateNatalChart(birthData: {
  date: string;
  time: string;
  location: {
    latitude: number;
    longitude: number;
  };
}): Promise<ChartData> {
  try {
    // Parse date and time
    const [year, month, day] = birthData.date.split('-').map(Number);
    const [hour, minute] = birthData.time.split(':').map(Number);
    
    console.log('Calculating chart for:', { year, month, day, hour, minute });
    
    // Calculate Julian Day
    const jd = dateToJulianDay(year, month, day, hour, minute);
    console.log('Julian Day:', jd);
    
    // Import ephemeris
    const ephemeris = await import('ephemeris-moshier');
    
    // Calculate planetary positions
    const date = {
      year: year,
      month: month,
      day: day,
      hours: hour,
      minutes: minute,
      seconds: 0
    };
    
    console.log('Calculating positions for date:', date);
    
    // Get positions
    const result = ephemeris.getAllPlanets(date, birthData.location.longitude, birthData.location.latitude, 0);
    console.log('Ephemeris result:', result);
    
    // Calculate houses
    const lst = calculateLST(jd, birthData.location.longitude);
    const houses = calculateHouses(lst, birthData.location.latitude);
    const ascendant = houses[0];
    
    // Transform ephemeris data to our format
    const sun = result.observed.sun || result.sun || {};
    const moon = result.observed.moon || result.moon || {};
    
    const transformedData: ChartData = {
      sun: {
        sign: getZodiacSign(sun.longitude || 0),
        degree: getDegreeInSign(sun.longitude || 0),
        house: Math.floor(((sun.longitude || 0) - ascendant + 360) % 360 / 30) + 1
      },
      moon: {
        sign: getZodiacSign(moon.longitude || 0),
        degree: getDegreeInSign(moon.longitude || 0),
        house: Math.floor(((moon.longitude || 0) - ascendant + 360) % 360 / 30) + 1
      },
      rising: {
        sign: getZodiacSign(ascendant),
        degree: getDegreeInSign(ascendant)
      },
      planets: [
        'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'
      ].map(name => {
        const planet = result.observed?.[name] || result[name] || {};
        return {
          name: name,
          sign: getZodiacSign(planet.longitude || 0),
          degree: getDegreeInSign(planet.longitude || 0),
          house: Math.floor(((planet.longitude || 0) - ascendant + 360) % 360 / 30) + 1,
          retrograde: planet.speed < 0
        };
      }).filter(p => p.degree > 0), // Filter out missing planets
      houses: houses.map((cusp, i) => ({
        number: i + 1,
        sign: getZodiacSign(cusp),
        degree: getDegreeInSign(cusp)
      })),
      aspects: [] // TODO: Calculate aspects
    };
    
    console.log('Transformed chart data:', transformedData);
    return transformedData;
    
  } catch (error) {
    console.error('Error in ephemeris calculation:', error);
    throw error;
  }
}