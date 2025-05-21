import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-[#e8f5e9] flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h1 className="text-4xl font-bold mb-4 text-[#2e7d32]">404</h1>
          <p className="text-gray-600 mb-6">
            Oops! The page you're looking for doesn't exist.
          </p>
          <Link 
            to="/"
            className="inline-block bg-[#4caf50] text-white px-6 py-2 rounded-lg hover:bg-[#2e7d32] transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage; 