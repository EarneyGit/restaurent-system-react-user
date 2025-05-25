import React from 'react';

const NoImage: React.FC = () => {
  return (
    <svg
      className="w-full h-full text-gray-300"
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M4 4h16v16H4V4zm1 1v14h14V5H5zm4.5 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm7.293 4.293l3 3a1 1 0 01-1.414 1.414l-3-3a1 1 0 011.414-1.414zM6 15l4-4 2 2 4-4 2 2v4H6v-2z" />
    </svg>
  );
};

export default NoImage; 