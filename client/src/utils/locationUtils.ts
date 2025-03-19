export interface City {
  id: string;
  city: string;
  country: string;
  countryCode: string;
  region: string;
  latitude: number;
  longitude: number;
  population: number;
}

// Sample city database
export const CITIES_DATABASE: City[] = [
  {
    id: "LON-UK",
    city: "London",
    country: "United Kingdom",
    countryCode: "GB",
    region: "England",
    latitude: 51.5074,
    longitude: -0.1278,
    population: 8982000
  },
  {
    id: "PAR-FR",
    city: "Paris",
    country: "France",
    countryCode: "FR",
    region: "Île-de-France",
    latitude: 48.8566,
    longitude: 2.3522,
    population: 2148271
  },
  {
    id: "NYC-US",
    city: "New York",
    country: "United States",
    countryCode: "US",
    region: "New York",
    latitude: 40.7128,
    longitude: -74.0060,
    population: 8419000
  },
  {
    id: "TOK-JP",
    city: "Tokyo",
    country: "Japan",
    countryCode: "JP",
    region: "Kantō",
    latitude: 35.6762,
    longitude: 139.6503,
    population: 37400068
  },
  {
    id: "SYD-AU",
    city: "Sydney",
    country: "Australia",
    countryCode: "AU",
    region: "New South Wales",
    latitude: -33.8688,
    longitude: 151.2093,
    population: 5367206
  },
  {
    id: "DEL-IN",
    city: "Delhi",
    country: "India",
    countryCode: "IN",
    region: "Delhi",
    latitude: 28.6139,
    longitude: 77.2090,
    population: 16787941
  },
  {
    id: "DXB-AE",
    city: "Dubai",
    country: "United Arab Emirates",
    countryCode: "AE",
    region: "Dubai",
    latitude: 25.2048,
    longitude: 55.2708,
    population: 3331420
  },
  {
    id: "SIN-SG",
    city: "Singapore",
    country: "Singapore",
    countryCode: "SG",
    region: "Central Region",
    latitude: 1.3521,
    longitude: 103.8198,
    population: 5850342
  },
  {
    id: "IST-TR",
    city: "Istanbul",
    country: "Turkey",
    countryCode: "TR",
    region: "Marmara",
    latitude: 41.0082,
    longitude: 28.9784,
    population: 15460000
  },
  {
    id: "BCN-ES",
    city: "Barcelona",
    country: "Spain",
    countryCode: "ES",
    region: "Catalonia",
    latitude: 41.3851,
    longitude: 2.1734,
    population: 1620343
  },
  {
    id: "BER-DE",
    city: "Berlin",
    country: "Germany",
    countryCode: "DE",
    region: "Berlin",
    latitude: 52.5200,
    longitude: 13.4050,
    population: 3669495
  },
  {
    id: "ROM-IT",
    city: "Rome",
    country: "Italy",
    countryCode: "IT",
    region: "Lazio",
    latitude: 41.9028,
    longitude: 12.4964,
    population: 4342212
  },
  {
    id: "AMS-NL",
    city: "Amsterdam",
    country: "Netherlands",
    countryCode: "NL",
    region: "North Holland",
    latitude: 52.3676,
    longitude: 4.9041,
    population: 821752
  },
  {
    id: "HKG-HK",
    city: "Hong Kong",
    country: "Hong Kong",
    countryCode: "HK",
    region: "Hong Kong Island",
    latitude: 22.3193,
    longitude: 114.1694,
    population: 7482500
  },
  {
    id: "BKK-TH",
    city: "Bangkok",
    country: "Thailand",
    countryCode: "TH",
    region: "Bangkok",
    latitude: 13.7563,
    longitude: 100.5018,
    population: 8280925
  }
];

// Cache for search results
const searchCache = new Map<string, { cities: City[]; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export async function searchCitiesWithCache(query: string): Promise<City[]> {
  if (!query || query.length < 2) return [];

  const cacheKey = query.toLowerCase();
  const cached = searchCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.cities;
  }

  const results = await searchCities(query);
  searchCache.set(cacheKey, { cities: results, timestamp: Date.now() });
  
  return results;
}

export async function searchCities(query: string): Promise<City[]> {
  query = query.toLowerCase();
  
  // Search through the database
  const results = CITIES_DATABASE.filter(city => {
    const cityName = city.city.toLowerCase();
    const countryName = city.country.toLowerCase();
    const regionName = city.region.toLowerCase();
    const countryCode = city.countryCode.toLowerCase();
    
    return cityName.includes(query) ||
           countryName.includes(query) ||
           regionName.includes(query) ||
           countryCode === query;
  });

  // Sort results by relevance
  return results.sort((a, b) => {
    const aName = a.city.toLowerCase();
    const bName = b.city.toLowerCase();
    
    // Exact matches first
    if (aName === query) return -1;
    if (bName === query) return 1;
    
    // Starts with query second
    if (aName.startsWith(query) && !bName.startsWith(query)) return -1;
    if (bName.startsWith(query) && !aName.startsWith(query)) return 1;
    
    // Sort by population
    return b.population - a.population;
  });
} 