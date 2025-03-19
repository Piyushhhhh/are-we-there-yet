import React, { useState, useEffect } from 'react';
import { City } from '../utils/locationUtils';
import { TransportOption } from '../utils/travelUtils';

interface Attraction {
  name: string;
  description: string;
  imageUrl: string;
  category: string;
  rating: number;
  estimatedTime: string;
  price: string;
}

interface TripDetailViewProps {
  city: City;
  transportOption: TransportOption;
  budgetBreakdown: {
    transport: number;
    accommodation: number;
    activities: number;
    food: number;
    total: number;
  };
  onClose: () => void;
}

const TripDetailView: React.FC<TripDetailViewProps> = ({
  city,
  transportOption,
  budgetBreakdown,
  onClose
}) => {
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would be an API call to get attractions
    // For now, we'll simulate it with mock data
    const fetchAttractions = async () => {
      setIsLoading(true);
      try {
        // Simulated API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock attractions data
        const mockAttractions: Attraction[] = [
          {
            name: `${city.city} Historical Museum`,
            description: "Explore the rich history and cultural heritage of the city through fascinating exhibits and artifacts.",
            imageUrl: `https://source.unsplash.com/800x600/?${city.city},museum`,
            category: "Culture",
            rating: 4.5,
            estimatedTime: "2-3 hours",
            price: "$15"
          },
          {
            name: `${city.city} Central Park`,
            description: "A beautiful urban park perfect for relaxation, picnics, and outdoor activities.",
            imageUrl: `https://source.unsplash.com/800x600/?${city.city},park`,
            category: "Nature",
            rating: 4.8,
            estimatedTime: "1-4 hours",
            price: "Free"
          },
          {
            name: `${city.city} Cathedral`,
            description: "An architectural masterpiece showcasing stunning religious art and design.",
            imageUrl: `https://source.unsplash.com/800x600/?${city.city},cathedral`,
            category: "Architecture",
            rating: 4.6,
            estimatedTime: "1-2 hours",
            price: "$10"
          },
          {
            name: `${city.city} Market Square`,
            description: "Vibrant local market with traditional food, crafts, and cultural experiences.",
            imageUrl: `https://source.unsplash.com/800x600/?${city.city},market`,
            category: "Shopping & Food",
            rating: 4.7,
            estimatedTime: "2-3 hours",
            price: "Free entry"
          }
        ];
        
        setAttractions(mockAttractions);
      } catch (error) {
        console.error('Error fetching attractions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttractions();
  }, [city]);

  const suggestedItinerary = [
    {
      day: 1,
      activities: [
        { time: "09:00", activity: "Arrival and Hotel Check-in" },
        { time: "11:00", activity: "Visit Historical Museum" },
        { time: "14:00", activity: "Lunch at Local Restaurant" },
        { time: "16:00", activity: "Explore Central Park" },
        { time: "19:00", activity: "Welcome Dinner" }
      ]
    },
    {
      day: 2,
      activities: [
        { time: "09:00", activity: "Cathedral Visit" },
        { time: "11:30", activity: "Walking Tour" },
        { time: "13:30", activity: "Lunch at Market Square" },
        { time: "15:00", activity: "Shopping and Local Experiences" },
        { time: "19:00", activity: "Dinner and Cultural Show" }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 py-8">
        <div className="relative max-w-6xl mx-auto bg-white rounded-lg shadow-xl">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header */}
          <div className="p-6 border-b">
            <h2 className="text-3xl font-bold">{city.city}, {city.country}</h2>
            <p className="text-gray-600 mt-2">Detailed Trip Plan</p>
          </div>

          {/* Main content */}
          <div className="p-6">
            {/* Trip Overview */}
            <section className="mb-8">
              <h3 className="text-2xl font-bold mb-4">Trip Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-lg font-semibold">${budgetBreakdown.transport}</div>
                  <div className="text-sm text-gray-600">Transport</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-lg font-semibold">${budgetBreakdown.accommodation}</div>
                  <div className="text-sm text-gray-600">Accommodation</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-lg font-semibold">${budgetBreakdown.food}</div>
                  <div className="text-sm text-gray-600">Food</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-lg font-semibold">${budgetBreakdown.activities}</div>
                  <div className="text-sm text-gray-600">Activities</div>
                </div>
              </div>
            </section>

            {/* Transport Details */}
            <section className="mb-8">
              <h3 className="text-2xl font-bold mb-4">Transport Details</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold">Departure</p>
                    <p>{new Date(transportOption.departure).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Arrival</p>
                    <p>{new Date(transportOption.arrival).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Provider</p>
                    <p>{transportOption.provider}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Duration</p>
                    <p>{transportOption.duration}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Suggested Itinerary */}
            <section className="mb-8">
              <h3 className="text-2xl font-bold mb-4">Suggested Itinerary</h3>
              <div className="space-y-6">
                {suggestedItinerary.map((day) => (
                  <div key={day.day} className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-bold text-lg mb-3">Day {day.day}</h4>
                    <div className="space-y-2">
                      {day.activities.map((activity, index) => (
                        <div key={index} className="flex">
                          <span className="w-20 font-semibold">{activity.time}</span>
                          <span>{activity.activity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Attractions */}
            <section>
              <h3 className="text-2xl font-bold mb-4">Popular Attractions</h3>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading attractions...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {attractions.map((attraction, index) => (
                    <div key={index} className="border rounded-lg overflow-hidden">
                      <img
                        src={attraction.imageUrl}
                        alt={attraction.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-lg font-bold">{attraction.name}</h4>
                          <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded">
                            {attraction.category}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">{attraction.description}</p>
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>⭐ {attraction.rating}/5</span>
                          <span>⏱ {attraction.estimatedTime}</span>
                          <span>💰 {attraction.price}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetailView; 