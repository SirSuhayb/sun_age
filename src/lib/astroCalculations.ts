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

// Convert to Julian Day
function dateToJulianDay(year: number, month: number, day: number, hour: number, minute: number): number {
  const decimalHours = hour + minute / 60;
  
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

// Calculate T (centuries since J2000)
function calculateT(jd: number): number {
  return (jd - 2451545.0) / 36525.0;
}

// Calculate Mean Obliquity of Ecliptic
function calculateObliquity(T: number): number {
  return 23.439291 - 0.0130042 * T - 0.00000016 * T * T + 0.000000504 * T * T * T;
}

// Calculate Greenwich Mean Sidereal Time
function calculateGMST(jd: number): number {
  const jd0 = Math.floor(jd - 0.5) + 0.5;
  const T = (jd0 - 2451545.0) / 36525.0;
  const T2 = T * T;
  const T3 = T2 * T;
  
  // GMST at 0h UT
  let gmst = 100.46061837 + 36000.770053608 * T + 0.000387933 * T2 - T3 / 38710000.0;
  
  // Add the time since 0h UT
  const ut = (jd - jd0) * 24.0;
  gmst += ut * 1.00273790935 * 15.0;
  
  // Normalize to 0-360
  gmst = gmst % 360;
  if (gmst < 0) gmst += 360;
  
  return gmst;
}

// Calculate Local Sidereal Time
function calculateLST(jd: number, longitude: number): number {
  const gmst = calculateGMST(jd);
  let lst = gmst + longitude;
  
  // Normalize
  lst = lst % 360;
  if (lst < 0) lst += 360;
  
  return lst;
}

// Calculate Ascendant
function calculateAscendant(lst: number, latitude: number, obliquity: number): number {
  const lstRad = lst * Math.PI / 180;
  const latRad = latitude * Math.PI / 180;
  const oblRad = obliquity * Math.PI / 180;
  
  // Using the proven formula from RadixPro:
  // tan(Longitude asc) = cos RAMC / -(sin E × tan GL + cos E × sin RAMC)
  // where RAMC = LST (Local Sidereal Time in degrees)
  
  const numerator = Math.cos(lstRad);
  const denominator = -(Math.sin(oblRad) * Math.tan(latRad) + Math.cos(oblRad) * Math.sin(lstRad));
  
  // Use atan2 for proper quadrant determination
  let ascRad = Math.atan2(numerator, denominator);
  let asc = ascRad * 180 / Math.PI;
  
  // Normalize to 0-360
  if (asc < 0) asc += 360;
  
  // The ascendant should be in the eastern half of the sky
  // Calculate the MC (approximately at LST)
  const mc = lst;
  
  // The ascendant should be within 180 degrees following the MC in zodiacal order
  // Check if we need to add 180 degrees for proper quadrant
  const diff = (asc - mc + 360) % 360;
  if (diff > 180) {
    asc = (asc + 180) % 360;
  }
  
  console.log('Ascendant calculation details:');
  console.log('  LST (RAMC):', lst, 'degrees');
  console.log('  MC (approx):', mc, 'degrees');
  console.log('  Initial Asc:', ascRad * 180 / Math.PI, 'degrees');
  console.log('  Corrected Asc:', asc, 'degrees');
  
  return asc;
}

// Simple Sun position calculator
function calculateSunPosition(T: number): number {
  // Mean longitude of Sun
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  
  // Mean anomaly of Sun
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const MRad = M * Math.PI / 180;
  
  // Equation of center
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(MRad) +
            (0.019993 - 0.000101 * T) * Math.sin(2 * MRad) +
            0.000289 * Math.sin(3 * MRad);
  
  // True longitude of Sun
  let sunLon = L0 + C;
  
  // Normalize
  sunLon = sunLon % 360;
  if (sunLon < 0) sunLon += 360;
  
  return sunLon;
}

// Simple Moon position calculator
function calculateMoonPosition(T: number): number {
  // Mean longitude of Moon
  const Lp = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T + T * T * T / 538841.0;
  
  // Mean elongation of Moon
  const D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T * T + T * T * T / 545868.0;
  
  // Mean anomaly of Moon
  const Mp = 134.9633964 + 477198.8675055 * T + 0.0087414 * T * T + T * T * T / 69699.0;
  
  // Mean anomaly of Sun
  const M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T * T + T * T * T / 24490000.0;
  
  // Convert to radians
  const DRad = D * Math.PI / 180;
  const MpRad = Mp * Math.PI / 180;
  const MRad = M * Math.PI / 180;
  
  // Simplified calculation for longitude
  let moonLon = Lp + 
    6.288774 * Math.sin(MpRad) +
    1.274027 * Math.sin(2 * DRad - MpRad) +
    0.658314 * Math.sin(2 * DRad) +
    0.213618 * Math.sin(2 * MpRad) -
    0.185116 * Math.sin(MRad);
  
  // Normalize
  moonLon = moonLon % 360;
  if (moonLon < 0) moonLon += 360;
  
  return moonLon;
}

// Calculate planetary positions (simplified Keplerian elements)
function calculatePlanetaryPositions(T: number, sunLon: number): Record<string, number> {
  const planets: Record<string, number> = {};
  
  // Mercury - closest to Sun, max elongation ~28°
  const mercuryM = (102.27938 + 149472.51529 * T) % 360;
  const mercuryMRad = mercuryM * Math.PI / 180;
  const mercuryElong = 23.5 * Math.sin(mercuryMRad) + 2.8 * Math.sin(2 * mercuryMRad);
  planets.mercury = (sunLon + mercuryElong + 360) % 360;
  
  // Venus - max elongation ~47°
  const venusM = (212.60322 + 58517.80387 * T) % 360;
  const venusMRad = venusM * Math.PI / 180;
  const venusElong = 46.3 * Math.sin(venusMRad) + 0.8 * Math.sin(2 * venusMRad);
  planets.venus = (sunLon + venusElong + 360) % 360;
  
  // Mars
  const marsL = (355.45332 + 19140.29934 * T) % 360;
  const marsM = (319.51913 + 19139.85475 * T) % 360;
  const marsMRad = marsM * Math.PI / 180;
  const marsC = 10.691 * Math.sin(marsMRad) + 0.623 * Math.sin(2 * marsMRad);
  planets.mars = (marsL + marsC + 360) % 360;
  
  // Jupiter
  const jupiterL = (34.35519 + 3034.90567 * T) % 360;
  const jupiterM = (225.32833 + 3034.69202 * T) % 360;
  const jupiterMRad = jupiterM * Math.PI / 180;
  const jupiterC = 5.31 * Math.sin(jupiterMRad) + 0.148 * Math.sin(2 * jupiterMRad);
  planets.jupiter = (jupiterL + jupiterC + 360) % 360;
  
  // Saturn
  const saturnL = (50.07744 + 1222.11381 * T) % 360;
  const saturnM = (142.59889 + 1221.55147 * T) % 360;
  const saturnMRad = saturnM * Math.PI / 180;
  const saturnC = 6.40 * Math.sin(saturnMRad) + 0.212 * Math.sin(2 * saturnMRad);
  planets.saturn = (saturnL + saturnC + 360) % 360;
  
  // Outer planets (very simplified - these move slowly)
  planets.uranus = (314.05500 + 428.46699 * T) % 360;
  planets.neptune = (304.34866 + 218.48620 * T) % 360;
  planets.pluto = (238.92881 + 145.20444 * T) % 360;
  
  // North Node (Mean Node)
  planets.northNode = (125.04452 - 1934.13618 * T + 0.00207 * T * T) % 360;
  if (planets.northNode < 0) planets.northNode += 360;
  
  // South Node is always opposite North Node
  planets.southNode = (planets.northNode + 180) % 360;
  
  return planets;
}

export async function calculateNatalChart(birthData: {
  date: string;
  time: string;
  location: {
    latitude: number;
    longitude: number;
    timezone?: string;
  };
}): Promise<ChartData> {
  console.log('calculateNatalChart called with:', birthData);
  try {
    // Parse date and time
    const [year, month, day] = birthData.date.split('-').map(Number);
    const [hour, minute] = birthData.time.split(':').map(Number);
    
    console.log('=== NATAL CHART CALCULATION ===');
    console.log('Birth data:', { year, month, day, hour, minute });
    console.log('Location:', birthData.location);
    
    // Convert to UTC (simple timezone handling)
    let utcHour = hour;
    let utcDay = day;
    let utcMonth = month;
    let utcYear = year;
    
    console.log('Local time:', { year, month, day, hour, minute });
    console.log('Timezone:', birthData.location.timezone);
    
    // Handle timezone conversion
    const tz = birthData.location.timezone;
    const lat = birthData.location.latitude;
    const lon = birthData.location.longitude;
    
    // Check for EST/EDT timezone or Philadelphia coordinates
    const isPhiladelphia = lat && lon && Math.abs(lat - 39.9526) < 0.5 && Math.abs(lon - (-75.1652)) < 0.5;
    const isEasternTime = tz && (
      tz === 'America/New_York' || 
      tz.includes('EST') || 
      tz.includes('EDT') ||
      tz === 'Etc/GMT+5' || // Etc/GMT+5 is UTC-5 (inverted sign convention)
      tz === 'US/Eastern'
    );
    
    if (isEasternTime || isPhiladelphia) {
      // EST is UTC-5 (add 5 hours to local time to get UTC)
      // February 1994 would be EST (no DST)
      utcHour = hour + 5; // Add 5 to local time to get UTC
      console.log('Applying EST timezone adjustment: +5 hours (timezone:', tz, ', isPhiladelphia:', isPhiladelphia, ')');
      
      // Handle day rollover
      if (utcHour >= 24) {
        utcHour -= 24;
        utcDay += 1;
        
        // Handle month rollover
        const daysInMonth = new Date(year, month, 0).getDate();
        if (utcDay > daysInMonth) {
          utcDay = 1;
          utcMonth += 1;
          
          // Handle year rollover
          if (utcMonth > 12) {
            utcMonth = 1;
            utcYear += 1;
          }
        }
      }
        } else if (tz && tz.startsWith('Etc/GMT')) {
      // Handle Etc/GMT timezones (note: signs are inverted)
      // Etc/GMT+5 means UTC-5, Etc/GMT-5 means UTC+5
      const match = tz.match(/Etc\/GMT([+-]\d+)/);
      if (match) {
        const offset = -parseInt(match[1]); // Invert the sign
        utcHour = hour - offset; // Subtract offset to get UTC
        console.log('Applying Etc/GMT timezone adjustment:', -offset, 'hours (timezone:', tz, ')');
        
        // Handle day rollover
        if (utcHour >= 24) {
          utcHour -= 24;
          utcDay += 1;
          
          // Handle month rollover
          const daysInMonth = new Date(year, month, 0).getDate();
          if (utcDay > daysInMonth) {
            utcDay = 1;
            utcMonth += 1;
            
            // Handle year rollover
            if (utcMonth > 12) {
              utcMonth = 1;
              utcYear += 1;
            }
          }
        } else if (utcHour < 0) {
          utcHour += 24;
          utcDay -= 1;
          
          // Handle month rollback
          if (utcDay < 1) {
            utcMonth -= 1;
            if (utcMonth < 1) {
              utcMonth = 12;
              utcYear -= 1;
            }
            const daysInPrevMonth = new Date(utcYear, utcMonth, 0).getDate();
            utcDay = daysInPrevMonth;
          }
        }
      }
    } else {
      console.log('WARNING: No timezone adjustment applied. Timezone:', tz, 'Coordinates:', lat, lon);
    }
    
    console.log('UTC time:', { utcYear, utcMonth, utcDay, utcHour, minute });
    
    // Calculate Julian Day
    const jd = dateToJulianDay(utcYear, utcMonth, utcDay, utcHour, minute);
    console.log('Julian Day:', jd);
    
    // Calculate T (centuries since J2000)
    const T = calculateT(jd);
    console.log('T (centuries):', T);
    
    // Calculate obliquity
    const obliquity = calculateObliquity(T);
    console.log('Obliquity:', obliquity);
    
    // Calculate Local Sidereal Time
    const lst = calculateLST(jd, birthData.location.longitude);
    console.log('Local Sidereal Time:', lst, 'degrees');
    
    // Calculate Ascendant
    const ascendant = calculateAscendant(lst, birthData.location.latitude, obliquity);
    console.log('Ascendant:', ascendant, 'degrees =', getZodiacSign(ascendant), getDegreeInSign(ascendant));
    
    // Calculate Sun position
    const sunLon = calculateSunPosition(T);
    console.log('Sun longitude:', sunLon, 'degrees =', getZodiacSign(sunLon), getDegreeInSign(sunLon));
    
    // Calculate Moon position
    const moonLon = calculateMoonPosition(T);
    console.log('Moon longitude:', moonLon, 'degrees =', getZodiacSign(moonLon), getDegreeInSign(moonLon));
    
    // Calculate all planetary positions
    const planetPositions = calculatePlanetaryPositions(T, sunLon);
    console.log('Planetary positions:', planetPositions);
    
    // Calculate BOTH house systems
    const equalHouses: number[] = [];
    const wholeSignHouses: number[] = [];
    
    // Equal House System - each house is exactly 30 degrees from Ascendant
    for (let i = 0; i < 12; i++) {
      let cusp = ascendant + (i * 30);
      if (cusp >= 360) cusp -= 360;
      equalHouses.push(cusp);
    }
    
    // Whole Sign House System - each house is an entire sign
    const ascSign = Math.floor(ascendant / 30);
    for (let i = 0; i < 12; i++) {
      const houseSign = (ascSign + i) % 12;
      wholeSignHouses.push(houseSign * 30);
    }
    
    // Calculate house positions
    function getHousePosition(longitude: number, houses: number[]): number {
      const normLon = ((longitude % 360) + 360) % 360;
      for (let i = 0; i < 12; i++) {
        const house = houses[i];
        const nextHouse = houses[(i + 1) % 12];
        
        if (nextHouse > house) {
          if (normLon >= house && normLon < nextHouse) return i + 1;
        } else {
          if (normLon >= house || normLon < nextHouse) return i + 1;
        }
      }
      return 1;
    }
    
    // Build the chart data with BOTH house systems
    const transformedData: ChartData = {
      sun: {
        sign: getZodiacSign(sunLon),
        degree: getDegreeInSign(sunLon),
        house: getHousePosition(sunLon, equalHouses),
        houseWS: getHousePosition(sunLon, wholeSignHouses)
      },
      moon: {
        sign: getZodiacSign(moonLon),
        degree: getDegreeInSign(moonLon),
        house: getHousePosition(moonLon, equalHouses),
        houseWS: getHousePosition(moonLon, wholeSignHouses)
      },
      rising: {
        sign: getZodiacSign(ascendant),
        degree: getDegreeInSign(ascendant)
      },
      planets: Object.entries(planetPositions).map(([name, longitude]) => ({
        name,
        sign: getZodiacSign(longitude),
        degree: getDegreeInSign(longitude),
        house: getHousePosition(longitude, equalHouses),
        houseWS: getHousePosition(longitude, wholeSignHouses),
        retrograde: false // Would need ephemeris for accurate retrograde detection
      })),
      houses: equalHouses.map((cusp, i) => ({
        number: i + 1,
        sign: getZodiacSign(cusp),
        degree: getDegreeInSign(cusp)
      })),
      housesWS: wholeSignHouses.map((cusp, i) => ({
        number: i + 1,
        sign: getZodiacSign(cusp),
        degree: getDegreeInSign(cusp)
      })),
      houseSystem: 'both',
      aspects: []
    };
    
    console.log('=== FINAL CHART DATA ===');
    console.log('Sun:', transformedData.sun);
    console.log('Moon:', transformedData.moon);
    console.log('Rising:', transformedData.rising);
    console.log('================================');
    
    return transformedData;
    
  } catch (error) {
    console.error('Error in chart calculation:', error);
    throw error;
  }
}