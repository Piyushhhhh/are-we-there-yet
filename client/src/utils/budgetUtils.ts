import { City, CITIES_DATABASE } from './locationUtils';
import { TransportOption, searchTransportOptions } from './travelUtils';

interface BudgetBreakdown {
  transport: number;
  accommodation: number;
  activities: number;
  food: number;
  total: number;
}

interface Recommendation {
  city: City;
  transportOptions: TransportOption[];
  budgetBreakdown: BudgetBreakdown;
  confidence: number; // 0-1 score of how well this matches the budget
  tags: string[]; // e.g., ["budget-friendly", "luxury", "cultural", "beach"]
}

// Cost of living multipliers for different cities (1.0 is average)
const CITY_COST_MULTIPLIERS: { [key: string]: number } = {
  "LON-UK": 1.8,  // London - very expensive
  "PAR-FR": 1.6,  // Paris - expensive
  "NYC-US": 2.0,  // New York - very expensive
  "TOK-JP": 1.7,  // Tokyo - expensive
  "SYD-AU": 1.5,  // Sydney - somewhat expensive
  "DEL-IN": 0.4,  // Delhi - very affordable
  "DXB-AE": 1.4,  // Dubai - somewhat expensive
  "SIN-SG": 1.5,  // Singapore - somewhat expensive
  "IST-TR": 0.6,  // Istanbul - affordable
  "BCN-ES": 1.1,  // Barcelona - moderate
  "BER-DE": 1.2,  // Berlin - moderate
  "ROM-IT": 1.3,  // Rome - somewhat expensive
  "AMS-NL": 1.4,  // Amsterdam - somewhat expensive
  "HKG-HK": 1.6,  // Hong Kong - expensive
  "BKK-TH": 0.5   // Bangkok - very affordable
};

// Base daily costs in USD for different expense categories
const BASE_DAILY_COSTS = {
  BUDGET: {
    accommodation: 50,
    food: 30,
    activities: 20
  },
  MODERATE: {
    accommodation: 150,
    food: 60,
    activities: 40
  },
  LUXURY: {
    accommodation: 300,
    food: 120,
    activities: 100
  }
};

function calculateDailyCosts(cityId: string, tier: 'BUDGET' | 'MODERATE' | 'LUXURY'): {
  daily: number;
  breakdown: { accommodation: number; food: number; activities: number; }
} {
  const multiplier = CITY_COST_MULTIPLIERS[cityId] || 1.0;
  const baseCosts = BASE_DAILY_COSTS[tier];
  
  return {
    daily: Object.values(baseCosts).reduce((a, b) => a + b, 0) * multiplier,
    breakdown: {
      accommodation: baseCosts.accommodation * multiplier,
      food: baseCosts.food * multiplier,
      activities: baseCosts.activities * multiplier
    }
  };
}

function getTravelTier(budget: number, days: number): 'BUDGET' | 'MODERATE' | 'LUXURY' {
  const dailyBudget = budget / days;
  if (dailyBudget < 150) return 'BUDGET';
  if (dailyBudget < 400) return 'MODERATE';
  return 'LUXURY';
}

export async function getRecommendationsForBudget(
  fromCity: City,
  budget: number,
  days: number = 7,
  preferences: {
    maxFlightBudget?: number;
    preferredRegions?: string[];
    excludedCities?: string[];
  } = {}
): Promise<Recommendation[]> {
  const recommendations: Recommendation[] = [];
  const { maxFlightBudget = budget * 0.4 } = preferences;
  
  const departureDate = new Date();
  departureDate.setDate(departureDate.getDate() + 30);
  const dateStr = departureDate.toISOString().split('T')[0];

  // For each city in our database
  for (const destCity of CITIES_DATABASE) {
    // Skip if it's the same as origin or in excluded list
    if (destCity.id === fromCity.id || preferences.excludedCities?.includes(destCity.id)) {
      continue;
    }

    // Skip if not in preferred regions (if specified)
    if (preferences.preferredRegions?.length && 
        !preferences.preferredRegions.includes(destCity.region)) {
      continue;
    }

    try {
      // Get transport options
      const transportOptions = await searchTransportOptions(
        fromCity,
        destCity,
        dateStr,
        maxFlightBudget,
        'USD'
      );

      if (transportOptions.length === 0) continue;

      const cheapestTransport = transportOptions[0];
      const remainingBudget = budget - cheapestTransport.price;
      const dailyBudget = remainingBudget / days;

      const tier = getTravelTier(dailyBudget, days);
      const costs = calculateDailyCosts(destCity.id, tier);
      
      const totalDailyCosts = costs.daily * days;
      const totalCost = cheapestTransport.price + totalDailyCosts;

      if (totalCost > budget) continue;

      const budgetUtilization = totalCost / budget;
      const confidence = 1 - Math.abs(0.9 - budgetUtilization);

      const tags = [];
      if (CITY_COST_MULTIPLIERS[destCity.id] < 0.8) tags.push('budget-friendly');
      if (CITY_COST_MULTIPLIERS[destCity.id] > 1.4) tags.push('luxury');
      if (['Bangkok', 'Delhi', 'Istanbul'].includes(destCity.city)) tags.push('cultural');
      if (['Sydney', 'Barcelona', 'Dubai'].includes(destCity.city)) tags.push('beach');
      if (['Tokyo', 'Singapore', 'Hong Kong'].includes(destCity.city)) tags.push('modern');
      if (['Paris', 'Rome', 'Amsterdam'].includes(destCity.city)) tags.push('historic');

      recommendations.push({
        city: destCity,
        transportOptions,
        budgetBreakdown: {
          transport: cheapestTransport.price,
          accommodation: costs.breakdown.accommodation * days,
          activities: costs.breakdown.activities * days,
          food: costs.breakdown.food * days,
          total: totalCost
        },
        confidence,
        tags
      });
    } catch (error) {
      console.error(`Error processing city ${destCity.city}:`, error);
    }
  }

  return recommendations
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5);
} 