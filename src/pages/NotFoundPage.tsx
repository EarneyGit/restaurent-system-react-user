import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen  flex items-center justify-center p-4">
      <div className="max-w-md w-full mx-auto text-center">
        <img 
          src="/not-found.png" 
          alt="Page Not Found" 
          className="w-full max-w-[300px] mx-auto mb-8"
        />
        <h1 className="text-4xl font-bold mb-4 text-neutral-800">404</h1>
        <p className="text-gray-600 mb-8 text-lg">
          Oops! The page you're looking for doesn't exist.
        </p>
        <Link 
          to="/"
          className="inline-block bg-neutral-800 text-white px-8 py-3 rounded-lg hover:bg-neutral-800/90 transition-colors font-medium"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage; 