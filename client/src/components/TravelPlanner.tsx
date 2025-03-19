import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getExchangeRates, convertCurrency } from '../utils/currencyUtils';
import { searchCitiesWithCache, City } from '../utils/locationUtils';
import { searchTransportOptions, TransportOption, generateSurpriseTrip } from '../utils/travelUtils';
import { getRecommendationsForBudget } from '../utils/budgetUtils';
import TripDetailView from './TripDetailView';
import debounce from 'lodash/debounce';

interface ExchangeRates {
  [key: string]: number;
}

const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
];

interface TravelPreferences {
  climate: 'warm' | 'cold' | 'moderate' | 'any';
  transportModes: ('flight' | 'train' | 'bus')[];
  travelGroup: 'solo' | 'couple' | 'group';
  excludedDestinations: string[];
  isSurpriseMode: boolean;
}

interface TravelOptions {
  fromCity: City | null;
  toCity: City | null;
  budget: string;
  currency: string;
  isReturn: boolean;
  departureDate: string;
  returnDate?: string;
  preferences: TravelPreferences;
}

interface Recommendation {
  city: City;
  transportOptions: TransportOption[];
  budgetBreakdown: {
    transport: number;
    accommodation: number;
    activities: number;
    food: number;
    total: number;
  };
  confidence: number;
  tags: string[];
}

const TravelPlanner: React.FC = () => {
  const [options, setOptions] = useState<TravelOptions>({
    budget: '',
    currency: 'USD',
    isReturn: false,
    fromCity: null,
    toCity: null,
    departureDate: '',
    preferences: {
      climate: 'any',
      transportModes: ['flight', 'train', 'bus'],
      travelGroup: 'solo',
      excludedDestinations: [],
      isSurpriseMode: false
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(null);
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fromQuery, setFromQuery] = useState('');
  const [toQuery, setToQuery] = useState('');
  const [fromSuggestions, setFromSuggestions] = useState<City[]>([]);
  const [toSuggestions, setToSuggestions] = useState<City[]>([]);
  const [isLoadingFrom, setIsLoadingFrom] = useState(false);
  const [isLoadingTo, setIsLoadingTo] = useState(false);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const [transportOptions, setTransportOptions] = useState<TransportOption[]>([]);
  const [selectedTransport, setSelectedTransport] = useState<TransportOption | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);
  const [selectedTransportForDetail, setSelectedTransportForDetail] = useState<TransportOption | null>(null);

  const fromInputRef = useRef<HTMLInputElement>(null);
  const toInputRef = useRef<HTMLInputElement>(null);

  // Debounced search functions
  const debouncedSearchFrom = useCallback(
    debounce(async (query: string) => {
      if (query.length >= 2) {
        setIsLoadingFrom(true);
        try {
          const cities = await searchCitiesWithCache(query);
          setFromSuggestions(cities);
        } catch (err) {
          console.error('Error searching cities:', err);
        } finally {
          setIsLoadingFrom(false);
        }
      } else {
        setFromSuggestions([]);
      }
    }, 300),
    []
  );

  const debouncedSearchTo = useCallback(
    debounce(async (query: string) => {
      if (query.length >= 2) {
        setIsLoadingTo(true);
        try {
          const cities = await searchCitiesWithCache(query);
          setToSuggestions(cities);
        } catch (err) {
          console.error('Error searching cities:', err);
        } finally {
          setIsLoadingTo(false);
        }
      } else {
        setToSuggestions([]);
      }
    }, 300),
    []
  );

  useEffect(() => {
    const loadExchangeRates = async () => {
      try {
        setIsLoadingRates(true);
        setError(null);
        const rates = await getExchangeRates();
        setExchangeRates(rates);
      } catch (err) {
        setError('Failed to load exchange rates. Please try again later.');
        console.error('Error loading exchange rates:', err);
      } finally {
        setIsLoadingRates(false);
      }
    };

    loadExchangeRates();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const budgetValue = parseFloat(options.budget);
    if (!options.budget || isNaN(budgetValue) || budgetValue <= 0) {
      setError('Please enter a valid budget amount');
      return;
    }

    if (!options.fromCity) {
      setError('Please select a departure city');
      return;
    }

    if (!options.preferences.isSurpriseMode && !options.toCity) {
      setError('Please select a destination city or enable surprise mode');
      return;
    }

    if (!options.departureDate) {
      setError('Please select a departure date');
      return;
    }

    setIsProcessing(true);
    setError(null);
    
    try {
      if (options.preferences.isSurpriseMode) {
        const surpriseTrip = await generateSurpriseTrip(
          options.fromCity,
          budgetValue,
          options.currency,
          {
            climate: options.preferences.climate,
            activities: [],
            duration: options.isReturn ? 7 : undefined
          }
        );
        setOptions(prev => ({ ...prev, toCity: surpriseTrip.destination }));
        setTransportOptions(surpriseTrip.transportOptions);
      } else if (options.fromCity && options.toCity) {
        const transport = await searchTransportOptions(
          options.fromCity,
          options.toCity,
          options.departureDate,
          budgetValue,
          options.currency
        );
        setTransportOptions(transport);
      }
      setShowResults(true);
    } catch (err) {
      setError('An error occurred while planning your trip. Please try again.');
      console.error('Error planning trip:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setOptions(prev => ({ ...prev, budget: value }));
    }
  };

  const handleCurrencyChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCurrency = e.target.value;
    setOptions({ ...options, currency: newCurrency });
    
    try {
      setIsLoadingRates(true);
      setError(null);
      const rates = await getExchangeRates(newCurrency);
      setExchangeRates(rates);
    } catch (err) {
      setError('Failed to update exchange rates. Please try again.');
      console.error('Error updating exchange rates:', err);
    } finally {
      setIsLoadingRates(false);
    }
  };

  const handleFromQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFromQuery(value);
    setShowFromSuggestions(true);
    debouncedSearchFrom(value);
  };

  const handleToQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setToQuery(value);
    setShowToSuggestions(true);
    debouncedSearchTo(value);
  };

  const handleFromCitySelect = (city: City) => {
    setOptions({ ...options, fromCity: city });
    setFromQuery(`${city.city}, ${city.country}`);
    setShowFromSuggestions(false);
    toInputRef.current?.focus();
  };

  const handleToCitySelect = (city: City) => {
    setOptions({ ...options, toCity: city });
    setToQuery(`${city.city}, ${city.country}`);
    setShowToSuggestions(false);
  };

  const selectedCurrency = currencies.find(c => c.code === options.currency) || currencies[0];

  // Add new handlers for preferences
  const handlePreferenceChange = (key: keyof TravelPreferences, value: any) => {
    setOptions(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }));
  };

  // Add a function to get recommendations
  const handleGetRecommendations = async () => {
    if (!options.fromCity || !options.budget) {
      setError('Please select a departure city and enter your budget');
      return;
    }

    setIsProcessing(true);
    setError(null);
    
    try {
      const budgetValue = parseFloat(options.budget);
      const recs = await getRecommendationsForBudget(
        options.fromCity,
        budgetValue,
        options.isReturn ? 14 : 7,
        {
          maxFlightBudget: budgetValue * (options.isReturn ? 0.3 : 0.4),
          preferredRegions: options.preferences.climate !== 'any' ? [options.preferences.climate] : undefined
        }
      );
      setRecommendations(recs);
      setShowRecommendations(true);
      setShowResults(false);
    } catch (err) {
      setError('Error getting recommendations. Please try again.');
      console.error('Error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-8">Plan Your Adventure</h2>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Destination inputs */}
        <div className="space-y-4">
          <div className="relative">
            <label className="block text-gray-700 mb-2">From</label>
            <input
              ref={fromInputRef}
              type="text"
              value={fromQuery}
              onChange={handleFromQueryChange}
              placeholder="Enter city name"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
            {isLoadingFrom && (
              <div className="absolute right-3 top-[42px]">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              </div>
            )}
            {showFromSuggestions && fromSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
                {fromSuggestions.map((city) => (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => handleFromCitySelect(city)}
                    className="w-full px-4 py-2 text-left hover:bg-blue-50 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-medium">{city.city}</span>
                      <span className="text-gray-500">, {city.country}</span>
                      <div className="text-sm text-gray-400">{city.region}</div>
                    </div>
                    <span className="text-gray-400 text-sm">{city.countryCode}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <label className="block text-gray-700 mb-2">To</label>
            <input
              ref={toInputRef}
              type="text"
              value={toQuery}
              onChange={handleToQueryChange}
              placeholder="Enter city name"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
            {isLoadingTo && (
              <div className="absolute right-3 top-[42px]">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              </div>
            )}
            {showToSuggestions && toSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
                {toSuggestions.map((city) => (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => handleToCitySelect(city)}
                    className="w-full px-4 py-2 text-left hover:bg-blue-50 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-medium">{city.city}</span>
                      <span className="text-gray-500">, {city.country}</span>
                      <div className="text-sm text-gray-400">{city.region}</div>
                    </div>
                    <span className="text-gray-400 text-sm">{city.countryCode}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* New date inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-2">Departure Date</label>
            <input
              type="date"
              value={options.departureDate}
              onChange={(e) => setOptions(prev => ({ ...prev, departureDate: e.target.value }))}
              min={new Date().toISOString().split('T')[0]}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          {options.isReturn && (
            <div>
              <label className="block text-gray-700 mb-2">Return Date</label>
              <input
                type="date"
                value={options.returnDate || ''}
                onChange={(e) => setOptions(prev => ({ ...prev, returnDate: e.target.value }))}
                min={options.departureDate}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}
        </div>

        {/* Travel Preferences */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Travel Preferences</h3>
          
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.preferences.isSurpriseMode}
                onChange={(e) => handlePreferenceChange('isSurpriseMode', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span>Surprise Me!</span>
            </label>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Climate Preference</label>
            <select
              value={options.preferences.climate}
              onChange={(e) => handlePreferenceChange('climate', e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="any">Any Climate</option>
              <option value="warm">Warm</option>
              <option value="cold">Cold</option>
              <option value="moderate">Moderate</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Travel Group</label>
            <select
              value={options.preferences.travelGroup}
              onChange={(e) => handlePreferenceChange('travelGroup', e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="solo">Solo</option>
              <option value="couple">Couple</option>
              <option value="group">Group</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Transport Modes</label>
            <div className="space-y-2">
              {['flight', 'train', 'bus'].map((mode) => (
                <label key={mode} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={options.preferences.transportModes.includes(mode as any)}
                    onChange={(e) => {
                      const modes = e.target.checked
                        ? [...options.preferences.transportModes, mode]
                        : options.preferences.transportModes.filter(m => m !== mode);
                      handlePreferenceChange('transportModes', modes);
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="capitalize">{mode}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Budget input */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Your Budget</label>
          <div className="flex gap-2">
            <select
              value={options.currency}
              onChange={(e) => setOptions(prev => ({ ...prev, currency: e.target.value }))}
              className="w-24 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {currencies.map(c => (
                <option key={c.code} value={c.code}>
                  {c.symbol} {c.code}
                </option>
              ))}
            </select>
            <input
              type="text"
              inputMode="decimal"
              value={options.budget}
              onChange={handleBudgetChange}
              placeholder="Enter amount"
              className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Return trip checkbox */}
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={options.isReturn}
              onChange={(e) => setOptions({ ...options, isReturn: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2">Return Trip</span>
          </label>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading || !options.budget || isLoadingRates || !options.fromCity || !options.toCity}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 
                   transition-colors duration-300 disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Searching Flights...' : 'Search Flights'}
        </button>
      </form>

      {/* Transport Options Results */}
      {showResults && transportOptions.length > 0 && (
        <div className="mt-8">
          <h3 className="text-2xl font-bold mb-4">Available Transport Options</h3>
          <div className="space-y-4">
            {transportOptions.map((option, index) => (
              <div
                key={index}
                className={`p-4 border rounded-lg cursor-pointer transition-colors duration-200 ${
                  selectedTransport === option ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-400'
                }`}
                onClick={() => setSelectedTransport(option)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-semibold capitalize">{option.type}</span>
                    <span className="text-gray-500 ml-2">by {option.provider}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{selectedCurrency.symbol}{option.price} {option.currency}</div>
                    <div className="text-sm text-gray-500">{option.duration}</div>
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <div>Departure: {new Date(option.departure).toLocaleString()}</div>
                  <div>Arrival: {new Date(option.arrival).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trip summary */}
      {!error && options.fromCity && options.toCity && (
        <div className="mt-8 p-6 bg-white rounded-lg shadow-lg">
          <h3 className="text-2xl font-bold mb-4">Trip Summary</h3>
          <div className="space-y-2">
            <p className="text-gray-600">
              <span className="font-semibold">From:</span> {options.fromCity.city}, {options.fromCity.country}
              <span className="text-sm text-gray-400 ml-2">({options.fromCity.countryCode})</span>
            </p>
            <p className="text-gray-600">
              <span className="font-semibold">To:</span> {options.toCity.city}, {options.toCity.country}
              <span className="text-sm text-gray-400 ml-2">({options.toCity.countryCode})</span>
            </p>
            <p className="text-gray-600">
              <span className="font-semibold">Budget:</span> {selectedCurrency.symbol}{options.budget} {options.currency}
            </p>
            {exchangeRates && options.currency !== 'USD' && (
              <p className="text-sm text-gray-500">
                ≈ ${(parseFloat(options.budget || '0') * (exchangeRates[options.currency] || 1)).toFixed(2)} USD
              </p>
            )}
            <p className="text-gray-600">
              <span className="font-semibold">Trip Type:</span> {options.isReturn ? 'Return' : 'One-way'}
            </p>
            {options.fromCity && options.toCity && (
              <p className="text-gray-600">
                <span className="font-semibold">Distance:</span> {calculateDistance(
                  options.fromCity.latitude,
                  options.fromCity.longitude,
                  options.toCity.latitude,
                  options.toCity.longitude
                ).toFixed(0)} km
              </p>
            )}
          </div>
        </div>
      )}

      {/* Add a "Get Recommendations" button */}
      <div className="mt-6">
        <button
          onClick={handleGetRecommendations}
          disabled={isProcessing || !options.fromCity || !options.budget}
          className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isProcessing ? 'Finding destinations...' : 'Get Destination Recommendations'}
        </button>
      </div>

      {/* Show recommendations */}
      {showRecommendations && recommendations.length > 0 && (
        <div className="mt-8">
          <h3 className="text-2xl font-bold mb-4">Recommended Destinations</h3>
          <div className="space-y-6">
            {recommendations.map((rec, index) => (
              <div
                key={rec.city.id}
                className="p-6 border rounded-lg hover:border-blue-500 transition-colors cursor-pointer"
                onClick={() => {
                  setSelectedRecommendation(rec);
                  setSelectedTransportForDetail(rec.transportOptions[0]);
                }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-xl font-semibold">{rec.city.city}, {rec.city.country}</h4>
                    <div className="flex gap-2 mt-2">
                      {rec.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-sm rounded-full text-gray-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      ${rec.budgetBreakdown.total.toFixed(0)}
                    </div>
                    <div className="text-sm text-gray-500">total estimated cost</div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mt-4">
                  <div>
                    <div className="text-lg font-semibold">${rec.budgetBreakdown.transport.toFixed(0)}</div>
                    <div className="text-sm text-gray-600">Transport</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold">${rec.budgetBreakdown.accommodation.toFixed(0)}</div>
                    <div className="text-sm text-gray-600">Accommodation</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold">${rec.budgetBreakdown.food.toFixed(0)}</div>
                    <div className="text-sm text-gray-600">Food</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold">${rec.budgetBreakdown.activities.toFixed(0)}</div>
                    <div className="text-sm text-gray-600">Activities</div>
                  </div>
                </div>

                <div className="mt-4 text-sm text-gray-500">
                  {rec.transportOptions.length} transport options available
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add TripDetailView */}
      {selectedRecommendation && selectedTransportForDetail && (
        <TripDetailView
          city={selectedRecommendation.city}
          transportOption={selectedTransportForDetail}
          budgetBreakdown={selectedRecommendation.budgetBreakdown}
          onClose={() => {
            setSelectedRecommendation(null);
            setSelectedTransportForDetail(null);
          }}
        />
      )}
    </div>
  );
};

// Helper function to calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export default TravelPlanner; 