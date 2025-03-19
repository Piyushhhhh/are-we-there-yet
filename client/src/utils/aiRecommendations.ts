import { City } from './locationUtils';

interface CostOfLiving {
  cityTier: 'budget' | 'moderate' | 'luxury';
  dailyCosts: {
    accommodation: number;
    food: number;
    transport: number;
    activities: number;
  };
  bestTimeToVisit: string[];
  tags: string[];
}

interface Recommendation {
  city: City;
  matchScore: number;
  costBreakdown: {
    accommodation: number;
    food: number;
    transport: number;
    activities: number;
    total: number;
  };
  suggestedDuration: number;
  tags: string[];
  bestTimeToVisit: string[];
}

// Cost multipliers based on city tiers
const CITY_COSTS: Record<string, CostOfLiving> = {
  'New York': {
    cityTier: 'luxury',
    dailyCosts: {
      accommodation: 200,
      food: 80,
      transport: 30,
      activities: 100
    },
    bestTimeToVisit: ['April', 'May', 'September', 'October'],
    tags: ['Urban', 'Culture', 'Shopping', 'Food']
  },
  'Bangkok': {
    cityTier: 'budget',
    dailyCosts: {
      accommodation: 40,
      food: 15,
      transport: 5,
      activities: 20
    },
    bestTimeToVisit: ['November', 'December', 'January', 'February'],
    tags: ['Culture', 'Food', 'Temples', 'Nightlife']
  },
  'Paris': {
    cityTier: 'luxury',
    dailyCosts: {
      accommodation: 150,
      food: 60,
      transport: 20,
      activities: 80
    },
    bestTimeToVisit: ['April', 'May', 'September', 'October'],
    tags: ['Romance', 'Culture', 'Art', 'Food']
  },
  // Add more cities as needed
};

// Default costs for cities not in the database
const DEFAULT_COSTS: CostOfLiving = {
  cityTier: 'moderate',
  dailyCosts: {
    accommodation: 100,
    food: 40,
    transport: 15,
    activities: 50
  },
  bestTimeToVisit: ['Spring', 'Fall'],
  tags: ['Travel', 'Explore']
};

const calculateMatchScore = (
  budget: number,
  duration: number,
  totalCost: number,
  preferences: string[]
): number => {
  // Budget match score (0-50 points)
  const budgetDiff = Math.abs(budget - totalCost);
  const budgetScore = Math.max(0, 50 - (budgetDiff / budget) * 50);

  // Duration match score (0-30 points)
  const idealDuration = Math.ceil(budget / 200); // Rough estimate of ideal trip duration
  const durationDiff = Math.abs(duration - idealDuration);
  const durationScore = Math.max(0, 30 - (durationDiff / idealDuration) * 30);

  // Preferences match score (0-20 points)
  const preferencesScore = 20; // Implement preference matching logic

  return budgetScore + durationScore + preferencesScore;
};

export const getDestinationRecommendations = (
  budget: number,
  fromCity: City,
  preferences: string[] = [],
  duration: number = 7
): Recommendation[] => {
  const recommendations: Recommendation[] = [];

  // Get all available cities (you would typically get this from your API)
  const availableCities = Object.keys(CITY_COSTS).map(cityName => ({
    id: Math.random().toString(),
    city: cityName,
    country: 'Sample Country',
    countryCode: 'SC',
    region: 'Sample Region',
    latitude: 0,
    longitude: 0,
    population: 1000000
  }));

  for (const city of availableCities) {
    const cityCosts = CITY_COSTS[city.city] || DEFAULT_COSTS;
    const { dailyCosts } = cityCosts;

    // Calculate total costs
    const totalAccommodation = dailyCosts.accommodation * duration;
    const totalFood = dailyCosts.food * duration;
    const totalTransport = dailyCosts.transport * duration;
    const totalActivities = dailyCosts.activities * duration;
    const totalCost = totalAccommodation + totalFood + totalTransport + totalActivities;

    // Calculate match score
    const matchScore = calculateMatchScore(budget, duration, totalCost, preferences);

    // Only include cities that fit within the budget with some flexibility
    if (totalCost <= budget * 1.2) {
      recommendations.push({
        city,
        matchScore,
        costBreakdown: {
          accommodation: totalAccommodation,
          food: totalFood,
          transport: totalTransport,
          activities: totalActivities,
          total: totalCost
        },
        suggestedDuration: duration,
        tags: cityCosts.tags,
        bestTimeToVisit: cityCosts.bestTimeToVisit
      });
    }
  }

  // Sort by match score
  return recommendations.sort((a, b) => b.matchScore - a.matchScore);
};

export const getSuggestedDuration = (budget: number, cityTier: string): number => {
  const costs = CITY_COSTS[cityTier] || DEFAULT_COSTS;
  const dailyTotal = Object.values(costs.dailyCosts).reduce((a, b) => a + b, 0);
  return Math.max(3, Math.floor(budget / dailyTotal));
}; 