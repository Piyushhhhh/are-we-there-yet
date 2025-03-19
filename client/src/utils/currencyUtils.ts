// Cache exchange rates for 1 hour
let exchangeRatesCache: {
  rates: { [key: string]: number };
  timestamp: number;
} | null = null;

const CACHE_DURATION = 3600000; // 1 hour in milliseconds

export async function getExchangeRates(baseCurrency: string = 'USD'): Promise<{ [key: string]: number }> {
  // Check if we have valid cached rates
  if (
    exchangeRatesCache &&
    exchangeRatesCache.rates &&
    Date.now() - exchangeRatesCache.timestamp < CACHE_DURATION
  ) {
    return exchangeRatesCache.rates;
  }

  try {
    // Using ExchangeRate-API's free endpoint
    const response = await fetch(
      `https://open.er-api.com/v6/latest/${baseCurrency}`
    );
    const data = await response.json();

    if (data.rates) {
      // Cache the new rates
      exchangeRatesCache = {
        rates: data.rates,
        timestamp: Date.now(),
      };
      return data.rates;
    }
    throw new Error('Invalid response from exchange rate API');
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    throw error;
  }
}

export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: { [key: string]: number }
): number {
  if (fromCurrency === toCurrency) return amount;
  
  // Convert to USD first (as base currency)
  const amountInUSD = fromCurrency === 'USD' 
    ? amount 
    : amount / rates[fromCurrency];
  
  // Convert from USD to target currency
  const convertedAmount = toCurrency === 'USD'
    ? amountInUSD
    : amountInUSD * rates[toCurrency];

  return Number(convertedAmount.toFixed(2));
} 