import { City } from './locationUtils';

interface FlightOffer {
  id: string;
  price: {
    total: string;
    currency: string;
  };
  itineraries: Array<{
    duration: string;
    segments: Array<{
      departure: {
        iataCode: string;
        terminal?: string;
        at: string;
      };
      arrival: {
        iataCode: string;
        terminal?: string;
        at: string;
      };
      carrierCode: string;
      number: string;
      aircraft: {
        code: string;
      };
      duration: string;
      id: string;
    }>;
  }>;
  numberOfBookableSeats: number;
  validatingAirlineCodes: string[];
}

export interface TransportOption {
  type: 'flight' | 'train' | 'bus';
  provider: string;
  price: number;
  currency: string;
  duration: string;
  departure: string;
  arrival: string;
  details: any;
}

interface FlightData {
  airline: string;
  flight_number: string;
  departure: {
    airport: string;
    scheduled: string;
  };
  arrival: {
    airport: string;
    scheduled: string;
  };
}

// Mock data for initial testing
const MOCK_AIRLINES = ['Budget Air', 'Sky Express', 'Global Wings', 'City Hopper'];
const MOCK_PRICES = {
  SHORT: { min: 50, max: 200 },
  MEDIUM: { min: 150, max: 500 },
  LONG: { min: 400, max: 1200 }
};

function generateMockPrice(distance: number): number {
  if (distance < 1000) {
    return Math.floor(Math.random() * (MOCK_PRICES.SHORT.max - MOCK_PRICES.SHORT.min) + MOCK_PRICES.SHORT.min);
  } else if (distance < 3000) {
    return Math.floor(Math.random() * (MOCK_PRICES.MEDIUM.max - MOCK_PRICES.MEDIUM.min) + MOCK_PRICES.MEDIUM.min);
  } else {
    return Math.floor(Math.random() * (MOCK_PRICES.LONG.max - MOCK_PRICES.LONG.min) + MOCK_PRICES.LONG.min);
  }
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function generateMockDuration(distance: number): string {
  const avgSpeedKmH = 800; // Average flight speed
  const hours = Math.floor(distance / avgSpeedKmH);
  const minutes = Math.floor((distance % avgSpeedKmH) / (avgSpeedKmH / 60));
  return `${hours}h ${minutes}m`;
}

export async function searchFlights(
  fromCity: City,
  toCity: City,
  departureDate: string,
  returnDate?: string,
  maxPrice?: number,
  currency: string = 'USD'
): Promise<FlightOffer[]> {
  // Using mock data instead of Amadeus API
  const distance = calculateDistance(
    fromCity.latitude,
    fromCity.longitude,
    toCity.latitude,
    toCity.longitude
  );

  const numFlights = Math.floor(Math.random() * 3) + 2;
  const mockFlights: FlightOffer[] = [];

  for (let i = 0; i < numFlights; i++) {
    const price = generateMockPrice(distance);
    if (maxPrice && price > maxPrice) continue;

    const duration = generateMockDuration(distance);
    const airline = MOCK_AIRLINES[Math.floor(Math.random() * MOCK_AIRLINES.length)];
    const flightNumber = `${airline.substring(0, 2)}${100 + Math.floor(Math.random() * 900)}`;

    const departureTime = new Date(departureDate);
    departureTime.setHours(7 + (i * 3)); // Flights starting from 7 AM, 3 hours apart

    const arrivalTime = new Date(departureTime);
    const [hours, minutes] = duration.split('h ').map(part => parseInt(part));
    arrivalTime.setHours(arrivalTime.getHours() + hours);
    arrivalTime.setMinutes(arrivalTime.getMinutes() + (minutes || 0));

    mockFlights.push({
      id: `${flightNumber}-${departureDate}`,
      price: {
        total: price.toString(),
        currency: currency
      },
      itineraries: [{
        duration: duration,
        segments: [{
          departure: {
            iataCode: fromCity.countryCode,
            at: departureTime.toISOString()
          },
          arrival: {
            iataCode: toCity.countryCode,
            at: arrivalTime.toISOString()
          },
          carrierCode: airline.substring(0, 2),
          number: flightNumber,
          aircraft: {
            code: 'B737'
          },
          duration: duration,
          id: `${flightNumber}-${departureDate}-seg1`
        }]
      }],
      numberOfBookableSeats: Math.floor(Math.random() * 50) + 1,
      validatingAirlineCodes: [airline.substring(0, 2)]
    });
  }

  return mockFlights;
}

export async function searchTransportOptions(
  fromCity: City,
  toCity: City,
  departureDate: string,
  budget: number,
  currency: string
): Promise<TransportOption[]> {
  const options: TransportOption[] = [];
  const distance = calculateDistance(
    fromCity.latitude,
    fromCity.longitude,
    toCity.latitude,
    toCity.longitude
  );

  // Generate 3-5 flight options
  const numOptions = Math.floor(Math.random() * 3) + 3;
  const departureTime = new Date(departureDate);

  for (let i = 0; i < numOptions; i++) {
    const price = generateMockPrice(distance);
    if (price > budget) continue;

    const duration = generateMockDuration(distance);
    const airline = MOCK_AIRLINES[Math.floor(Math.random() * MOCK_AIRLINES.length)];
    
    // Spread departures throughout the day
    const deptTime = new Date(departureTime);
    deptTime.setHours(7 + (i * 3)); // Flights starting from 7 AM, 3 hours apart
    
    const arrivalTime = new Date(deptTime);
    const [hours, minutes] = duration.split('h ').map(part => parseInt(part));
    arrivalTime.setHours(arrivalTime.getHours() + hours);
    arrivalTime.setMinutes(arrivalTime.getMinutes() + (minutes || 0));

    options.push({
      type: 'flight',
      provider: airline,
      price: price,
      currency: currency,
      duration: duration,
      departure: deptTime.toISOString(),
      arrival: arrivalTime.toISOString(),
      details: {
        flightNumber: `${airline.substring(0, 2)}${100 + Math.floor(Math.random() * 900)}`,
        aircraft: 'Boeing 737',
        fromAirport: `${fromCity.city} International`,
        toAirport: `${toCity.city} International`
      }
    });
  }

  // Mock train options for shorter distances (< 1000 km)
  if (distance < 1000) {
    const trainDuration = generateMockDuration(distance * 0.7); // Trains are slower
    const trainPrice = generateMockPrice(distance * 0.5); // Trains are cheaper
    
    if (trainPrice <= budget) {
      const deptTime = new Date(departureTime);
      deptTime.setHours(8); // Train departure at 8 AM
      
      const arrivalTime = new Date(deptTime);
      const [hours, minutes] = trainDuration.split('h ').map(part => parseInt(part));
      arrivalTime.setHours(arrivalTime.getHours() + hours);
      arrivalTime.setMinutes(arrivalTime.getMinutes() + (minutes || 0));

      options.push({
        type: 'train',
        provider: 'EuroRail Express',
        price: trainPrice,
        currency: currency,
        duration: trainDuration,
        departure: deptTime.toISOString(),
        arrival: arrivalTime.toISOString(),
        details: {
          trainNumber: `TR${100 + Math.floor(Math.random() * 900)}`,
          class: 'First Class',
          fromStation: `${fromCity.city} Central`,
          toStation: `${toCity.city} Central`
        }
      });
    }
  }

  // Mock bus options for shorter distances (< 500 km)
  if (distance < 500) {
    const busDuration = generateMockDuration(distance * 0.4); // Buses are slower
    const busPrice = generateMockPrice(distance * 0.3); // Buses are cheaper
    
    if (busPrice <= budget) {
      const deptTime = new Date(departureTime);
      deptTime.setHours(9); // Bus departure at 9 AM
      
      const arrivalTime = new Date(deptTime);
      const [hours, minutes] = busDuration.split('h ').map(part => parseInt(part));
      arrivalTime.setHours(arrivalTime.getHours() + hours);
      arrivalTime.setMinutes(arrivalTime.getMinutes() + (minutes || 0));

      options.push({
        type: 'bus',
        provider: 'EuroLines',
        price: busPrice,
        currency: currency,
        duration: busDuration,
        departure: deptTime.toISOString(),
        arrival: arrivalTime.toISOString(),
        details: {
          busNumber: `BUS${100 + Math.floor(Math.random() * 900)}`,
          class: 'Standard',
          fromStation: `${fromCity.city} Bus Terminal`,
          toStation: `${toCity.city} Bus Terminal`
        }
      });
    }
  }

  return options.sort((a, b) => a.price - b.price);
}

export async function generateSurpriseTrip(
  fromCity: City,
  budget: number,
  currency: string,
  preferences: {
    climate?: string;
    activities?: string[];
    duration?: number;
  }
): Promise<{
  destination: City;
  transportOptions: TransportOption[];
  activities: string[];
  estimatedCosts: {
    transport: number;
    accommodation: number;
    activities: number;
    total: number;
  };
}> {
  // For now, return a mock surprise destination
  const mockDestinations = [
    {
      id: "mock1",
      city: "Barcelona",
      country: "Spain",
      countryCode: "ES",
      region: "Catalonia",
      latitude: 41.3851,
      longitude: 2.1734,
      population: 1620343
    },
    {
      id: "mock2",
      city: "Prague",
      country: "Czech Republic",
      countryCode: "CZ",
      region: "Prague",
      latitude: 50.0755,
      longitude: 14.4378,
      population: 1324277
    },
    {
      id: "mock3",
      city: "Amsterdam",
      country: "Netherlands",
      countryCode: "NL",
      region: "North Holland",
      latitude: 52.3676,
      longitude: 4.9041,
      population: 821752
    }
  ];

  const destination = mockDestinations[Math.floor(Math.random() * mockDestinations.length)];
  const transportOptions = await searchTransportOptions(
    fromCity,
    destination as City,
    new Date().toISOString().split('T')[0],
    budget,
    currency
  );

  const cheapestTransport = transportOptions[0];
  const remainingBudget = budget - cheapestTransport.price;

  return {
    destination: destination as City,
    transportOptions,
    activities: [
      "City sightseeing tour",
      "Local food tasting",
      "Museum visits",
      "Cultural experiences"
    ],
    estimatedCosts: {
      transport: cheapestTransport.price,
      accommodation: remainingBudget * 0.5,
      activities: remainingBudget * 0.3,
      total: budget
    }
  };
} 