import React from 'react';
import { Link } from 'react-router-dom';

interface BranchCategory {
  id: string;
  name: string;
  image: string;
  slug: string;
}

interface BranchCategoriesProps {
  categories: BranchCategory[];
  activeCategoryId?: string;
}

const BranchCategories: React.FC<BranchCategoriesProps> = ({ 
  categories = [],
  activeCategoryId 
}) => {
  return (
    <div className="flex overflow-x-auto py-4 px-4 scrollbar-hide">
      <div className="flex gap-4">
        {categories.map((category) => (
          <Link 
            to={`/branch/${category.slug}`} 
            key={category.id}
            className="flex flex-col items-center min-w-[100px]"
          >
            <div className={`
              w-[100px] h-[100px] rounded-full border-2 overflow-hidden
              ${category.id === activeCategoryId 
                ? 'border-foodyman-lime' 
                : 'border-gray-200'}
            `}>
              <img 
                src={category.image} 
                alt={category.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <span className="mt-2 text-center text-sm font-medium">
              {category.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BranchCategories; 