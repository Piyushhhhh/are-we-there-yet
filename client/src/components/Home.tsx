import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <h1 className="text-5xl font-bold text-blue-600 mb-6">
        Ready for an Adventure?
      </h1>
      <p className="text-xl text-gray-600 mb-8 max-w-2xl">
        Enter your budget and let us surprise you with an exciting destination! 
        Whether you want to know right away or keep it a mystery until the last moment, 
        we've got you covered.
      </p>
      <Link
        to="/plan"
        className="bg-blue-600 text-white px-8 py-4 rounded-full text-xl font-semibold 
                 hover:bg-blue-700 transition-colors duration-300 shadow-lg"
      >
        Start Planning
      </Link>
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-2">Set Your Budget</h3>
          <p className="text-gray-600">Tell us how much you want to spend</p>
        </div>
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-2">Choose Your Style</h3>
          <p className="text-gray-600">Surprise or instant reveal - it's up to you</p>
        </div>
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-2">Start Your Journey</h3>
          <p className="text-gray-600">Get travel options and estimated times</p>
        </div>
      </div>
    </div>
  );
};

export default Home; 