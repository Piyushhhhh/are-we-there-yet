import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            Are We There Yet?
          </Link>
          <div className="flex space-x-4">
            <Link to="/" className="text-gray-700 hover:text-blue-600 px-3 py-2">
              Home
            </Link>
            <Link to="/plan" className="text-gray-700 hover:text-blue-600 px-3 py-2">
              Plan Trip
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 