import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCategories, Category } from "@/services/api";

interface CategoryProps {
  imageUrl: string;
  name: string;
  isActive: boolean;
  id: string;
  onClick: () => void;
}

const CategoryItem: React.FC<CategoryProps> = ({ imageUrl, name, isActive, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center min-w-[80px]"
    >
      <div className={`w-20 h-20 mb-2 rounded-full overflow-hidden border-2 transition-colors ${
        isActive ? 'border-[#2e7d32] bg-[#e8f5e9]' : 'border-[#4caf50] bg-green-50'
      }`}>
        {imageUrl && imageUrl !== '/placeholder.svg' ? (
          <img 
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center text-[#2e7d32] text-xl font-semibold`}>
            {name.charAt(0)}
          </div>
        )}
      </div>
      <span className={`text-base font-medium transition-colors ${
        isActive ? 'text-[#2e7d32]' : 'text-gray-600'
      }`}>
        {name}
      </span>
    </button>
  );
};

const FoodCategories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        // Filter out hidden categories and sort by displayOrder
        const visibleCategories = data
          .filter(cat => !cat.hidden)
          .sort((a, b) => a.displayOrder - b.displayOrder);
        setCategories(visibleCategories);
        if (visibleCategories.length > 0) {
          setActiveCategory(visibleCategories[0].id);
        }
      } catch (err) {
        setError('Failed to load categories');
        console.error('Error loading categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryId: string, categoryName: string) => {
    setActiveCategory(categoryId);
    navigate(`/app/products/${encodeURIComponent(categoryName)}`);
  };

  if (loading) {
    return (
      <div className="mt-4 relative">
        <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex flex-col items-center animate-pulse min-w-[80px]">
              <div className="rounded-full bg-gray-200 w-16 h-16 mb-2 border-2 border-gray-100"></div>
              <div className="w-16 h-3 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 text-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="py-8 relative">
      <div className="flex overflow-x-auto gap-7 pb-4 scrollbar-hide">
        {categories.map((category) => (
          <CategoryItem 
            key={category.id}
            id={category.id}
            name={category.name}
            imageUrl={category.imageUrl}
            isActive={category.id === activeCategory}
            onClick={() => handleCategoryClick(category.id, category.name)}
          />
        ))}
      </div>
    </div>
  );
};

export default FoodCategories;
