interface Destination {
  city: string;
  country: string;
  airport: string;
  continent: string;
}

export const destinations: Destination[] = [
  { city: 'Paris', country: 'France', airport: 'CDG', continent: 'Europe' },
  { city: 'London', country: 'United Kingdom', airport: 'LHR', continent: 'Europe' },
  { city: 'New York', country: 'United States', airport: 'JFK', continent: 'North America' },
  { city: 'Tokyo', country: 'Japan', airport: 'NRT', continent: 'Asia' },
  { city: 'Dubai', country: 'United Arab Emirates', airport: 'DXB', continent: 'Asia' },
  { city: 'Singapore', country: 'Singapore', airport: 'SIN', continent: 'Asia' },
  { city: 'Sydney', country: 'Australia', airport: 'SYD', continent: 'Oceania' },
  { city: 'Barcelona', country: 'Spain', airport: 'BCN', continent: 'Europe' },
  { city: 'Rome', country: 'Italy', airport: 'FCO', continent: 'Europe' },
  { city: 'Amsterdam', country: 'Netherlands', airport: 'AMS', continent: 'Europe' },
  { city: 'Berlin', country: 'Germany', airport: 'BER', continent: 'Europe' },
  { city: 'Mumbai', country: 'India', airport: 'BOM', continent: 'Asia' },
  { city: 'Bangkok', country: 'Thailand', airport: 'BKK', continent: 'Asia' },
  { city: 'Istanbul', country: 'Turkey', airport: 'IST', continent: 'Europe' },
  { city: 'Cairo', country: 'Egypt', airport: 'CAI', continent: 'Africa' },
  { city: 'Cape Town', country: 'South Africa', airport: 'CPT', continent: 'Africa' },
  { city: 'Rio de Janeiro', country: 'Brazil', airport: 'GIG', continent: 'South America' },
  { city: 'Buenos Aires', country: 'Argentina', airport: 'EZE', continent: 'South America' },
  { city: 'Mexico City', country: 'Mexico', airport: 'MEX', continent: 'North America' },
  { city: 'Toronto', country: 'Canada', airport: 'YYZ', continent: 'North America' },
];

export function searchDestinations(query: string): Destination[] {
  const searchTerm = query.toLowerCase().trim();
  if (!searchTerm) return [];
  
  return destinations.filter(dest => 
    dest.city.toLowerCase().includes(searchTerm) ||
    dest.country.toLowerCase().includes(searchTerm) ||
    dest.airport.toLowerCase().includes(searchTerm)
  ).slice(0, 8); // Limit to 8 results for better UX
} 