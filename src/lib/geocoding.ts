interface GeocodingResult {
  latitude: number;
  longitude: number;
  timezone: string;
  formattedAddress: string;
}

// Major cities with their coordinates and timezones
// This is a fallback for common locations
const MAJOR_CITIES: Record<string, GeocodingResult> = {
  'philadelphia, pa': {
    latitude: 39.9526,
    longitude: -75.1652,
    timezone: 'America/New_York',
    formattedAddress: 'Philadelphia, PA, USA'
  },
  'new york, ny': {
    latitude: 40.7128,
    longitude: -74.0060,
    timezone: 'America/New_York',
    formattedAddress: 'New York, NY, USA'
  },
  'los angeles, ca': {
    latitude: 34.0522,
    longitude: -118.2437,
    timezone: 'America/Los_Angeles',
    formattedAddress: 'Los Angeles, CA, USA'
  },
  'chicago, il': {
    latitude: 41.8781,
    longitude: -87.6298,
    timezone: 'America/Chicago',
    formattedAddress: 'Chicago, IL, USA'
  },
  'houston, tx': {
    latitude: 29.7604,
    longitude: -95.3698,
    timezone: 'America/Chicago',
    formattedAddress: 'Houston, TX, USA'
  },
  'phoenix, az': {
    latitude: 33.4484,
    longitude: -112.0740,
    timezone: 'America/Phoenix',
    formattedAddress: 'Phoenix, AZ, USA'
  },
  'london, uk': {
    latitude: 51.5074,
    longitude: -0.1278,
    timezone: 'Europe/London',
    formattedAddress: 'London, UK'
  },
  'paris, france': {
    latitude: 48.8566,
    longitude: 2.3522,
    timezone: 'Europe/Paris',
    formattedAddress: 'Paris, France'
  },
  'tokyo, japan': {
    latitude: 35.6762,
    longitude: 139.6503,
    timezone: 'Asia/Tokyo',
    formattedAddress: 'Tokyo, Japan'
  },
  'sydney, australia': {
    latitude: -33.8688,
    longitude: 151.2093,
    timezone: 'Australia/Sydney',
    formattedAddress: 'Sydney, Australia'
  }
};

export async function geocodeLocation(location: string): Promise<GeocodingResult> {
  // Normalize the input
  const normalizedLocation = location.toLowerCase().trim();
  
  // Check if it's in our major cities list
  for (const [key, value] of Object.entries(MAJOR_CITIES)) {
    if (normalizedLocation.includes(key) || key.includes(normalizedLocation)) {
      return value;
    }
  }
  
  // Try to use a free geocoding API (nominatim)
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'Solara App'
        }
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        const result = data[0];
        
        // Get timezone based on coordinates
        const timezoneResponse = await fetch(
          `https://api.timezonedb.com/v2.1/get-time-zone?key=demo&format=json&by=position&lat=${result.lat}&lng=${result.lon}`
        );
        
        let timezone = 'UTC'; // Default
        if (timezoneResponse.ok) {
          const tzData = await timezoneResponse.json();
          timezone = tzData.zoneName || 'UTC';
        }
        
        return {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
          timezone: timezone,
          formattedAddress: result.display_name
        };
      }
    }
  } catch (error) {
    console.error('Geocoding error:', error);
  }
  
  // Default fallback (Greenwich, UK - 0,0 coordinates)
  return {
    latitude: 51.4779,
    longitude: 0.0000,
    timezone: 'UTC',
    formattedAddress: location
  };
}