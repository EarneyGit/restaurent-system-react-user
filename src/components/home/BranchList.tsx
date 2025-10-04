import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface Branch {
  id: string;
  name: string;
  image: string;
  slug: string;
}

const BranchList = () => {
  // Sample branch data - this would typically come from an API
  const branches: Branch[] = [
    {
      id: '1',
      name: 'Central Branch',
      image: '/restaurant.jpg',
      slug: 'central-branch'
    },
    {
      id: '2',
      name: 'Noma Haus',
      image: '/restaurant.jpg',
      slug: 'noma-haus'
    }
  ];
  
  const [activeBranch, setActiveBranch] = useState('2'); // Default Noma Haus is active

  return (
    <div className="flex overflow-x-auto py-6 scrollbar-hide">
      <div className="flex gap-6 px-4">
        {branches.map((branch) => (
          <Link 
            to={`/branch/${branch.slug}`} 
            key={branch.id}
            className="flex flex-col items-center min-w-[120px]"
            onClick={() => setActiveBranch(branch.id)}
          >
            <div className={`w-[120px] h-[120px] rounded-full border-4 ${
              branch.id === activeBranch ? 'border-yellow-600' : 'border-gray-200'
            } overflow-hidden flex items-center justify-center`}>
              <img 
                src={branch.image} 
                alt={branch.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <span className="mt-2 text-center text-base font-medium">
              {branch.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BranchList; 
