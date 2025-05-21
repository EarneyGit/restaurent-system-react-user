import React from 'react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    to: string;
  };
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-md mx-auto">
        <div className="relative">
          {/* Delivery illustration */}
          <div className="w-full">
            <img 
              src="/delivery-image.png" 
              alt="Delivery illustration" 
              className="w-full h-auto"
            />
          </div>
          
          {/* Text content */}
          <div className="mt-6 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
            {description && <p className="text-gray-500 mb-6">{description}</p>}
            {action && (
              <Link 
                to={action.to}
                className="inline-block bg-foodyman-lime text-white px-8 py-3 rounded-md font-medium hover:bg-foodyman-green transition-colors"
              >
                {action.label}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyState; 