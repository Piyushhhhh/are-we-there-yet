# Are We There Yet - Smart Travel Planner 🌍

A modern, intuitive travel planning application built with React and TypeScript that helps users plan their perfect trip by providing intelligent destination recommendations, detailed budget breakdowns, and comprehensive itineraries.

<div align="center">
  <img src="client/public/assets/screenshots/hero.png" alt="Travel Planner Hero" width="100%" />
</div>

## ✨ Features

### 🎯 Smart AI-Powered Recommendations
- Intelligent destination matching based on your budget
- Smart cost analysis and breakdown
- Personalized travel duration suggestions
- Match scoring system considering:
  - Budget optimization (50%)
  - Duration suitability (30%)
  - Preference matching (20%)

### 💰 Budget Planning & Analysis
- Multi-currency support with real-time conversion
- Smart budget breakdowns for:
  - Transportation
  - Accommodation
  - Food & Dining
  - Activities & Entertainment
- Visual budget distribution charts
- Cost of living adjustments by city

### 🗺️ Comprehensive Trip Planning
- Detailed itineraries with day-by-day activities
- Popular attractions with:
  - High-quality images
  - Ratings and reviews
  - Estimated visit durations
  - Entrance fees
  - Best times to visit
- Local transportation options
- Weather forecasts

### 🎲 Destination Discovery
- City categorization (Budget, Moderate, Luxury)
- Rich city information including:
  - Popular attractions
  - Local culture
  - Best times to visit
  - Cost estimates
- Category-based image galleries

## 🖥️ Screenshots & Features

### Home Screen & Destination Search
<div align="center">
  <img src="client/public/assets/screenshots/home.png" alt="Home Screen" width="800px" />
</div>

- Clean, modern interface
- Quick search functionality with autocomplete
- Popular destinations showcase
- From and To destination fields

### Budget Planning Interface
<div align="center">
  <img src="client/public/assets/screenshots/budget.png" alt="Budget Planning" width="800px" />
</div>

- Interactive budget input
- Multi-currency support
- Smart budget distribution
- Real-time currency conversion

### Trip Details & Attractions
<div align="center">
  <img src="client/public/assets/screenshots/details.png" alt="Trip Details" width="800px" />
</div>

- Comprehensive trip overview
- Popular attractions with images and ratings
- Day-by-day itinerary planning
- Transport and accommodation details
- Cost breakdown visualization

## 🎯 AI Features in Detail

### 1. Smart Destination Matching
- Budget-based filtering
- Cost of living adjustments
- Match score calculation
- Preference consideration

### 2. Cost Analysis
- City tier categorization (Budget/Moderate/Luxury)
- Daily cost calculations
- Budget optimization
- Flexible duration suggestions

### 3. Attraction Recommendations
- Category-based suggestions
- Dynamic image loading
- Fallback image system
- Rating and pricing information

### 4. Itinerary Generation
- Time-optimized schedules
- Activity categorization
- Duration management
- Meal time considerations

## 🛠️ Tech Stack

- **Frontend:**
  - React 18
  - TypeScript
  - Tailwind CSS
  - Lodash

- **APIs & Services:**
  - 🌐 GeoDB Cities API for destination data
  - 💱 Exchange Rate API for currency conversion
  - 🖼️ Unsplash API for destination images
  - 🗺️ Maps integration for location visualization

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- API keys for external services

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Piyushhhhh/are-we-there-yet.git
cd are-we-there-yet
```

2. Install dependencies:
```bash
cd client
npm install
```

3. Set up environment variables:
Create a `.env` file in the client directory:
```env
REACT_APP_RAPIDAPI_KEY=your_api_key_here
```

4. Start the development server:
```bash
npm start
```

Visit `http://localhost:3000` to see the application in action!

## 🎯 Core Features in Detail

### 1. Destination Search
- Semantic search with typo tolerance
- Rich destination data including:
  - City information
  - Country details
  - Popular attractions
  - Local currency

### 2. Budget Management
- Smart budget distribution
- Cost of living adjustments
- Currency conversion
- Visual budget breakdowns

### 3. Itinerary Planning
- AI-powered activity suggestions
- Time-optimized schedules
- Popular attractions integration
- Local transport options

### 4. Trip Details View
- Comprehensive trip overview
- Interactive maps
- Weather forecasts
- Local recommendations

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create your feature branch:
```bash
git checkout -b feature/AmazingFeature
```
3. Commit your changes:
```bash
git commit -m 'Add some AmazingFeature'
```
4. Push to the branch:
```bash
git push origin feature/AmazingFeature
```
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Unsplash](https://unsplash.com) for beautiful travel images
- [RapidAPI](https://rapidapi.com) for GeoDB Cities API
- [ExchangeRate-API](https://www.exchangerate-api.com) for currency conversion

## 📫 Contact

Piyush - [@Piyushhhhh](https://github.com/Piyushhhhh)

Project Link: [https://github.com/Piyushhhhh/are-we-there-yet](https://github.com/Piyushhhhh/are-we-there-yet) 