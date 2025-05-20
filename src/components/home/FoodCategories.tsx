import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { getCategories, Category } from "@/services/api";

interface CategoryProps {
  imageUrl: string;
  name: string;
  color: string;
  id: string;
}

const CategoryItem: React.FC<CategoryProps> = ({ imageUrl, name, color, id }) => {
  return (
    <Link 
      to={`/products/${encodeURIComponent(name)}`} 
      className="flex flex-col items-center min-w-[80px]"
    >
      <div className={`w-[60px] h-[60px] mb-2 rounded-full overflow-hidden ${color}`}>
        {imageUrl !== '/placeholder.svg' ? (
          <img 
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-xl font-semibold">
            {name.charAt(0)}
          </div>
        )}
      </div>
      <span className="text-xs text-center">{name}</span>
    </Link>
  );
};

const FoodCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        // Filter out hidden categories and sort by displayOrder
        const visibleCategories = data
          .filter(cat => !cat.hidden)
          .sort((a, b) => a.displayOrder - b.displayOrder);
        setCategories(visibleCategories);
      } catch (err) {
        setError('Failed to load categories');
        console.error('Error loading categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="mt-4 relative">
        <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex flex-col items-center animate-pulse min-w-[80px]">
              <div className="rounded-full bg-gray-200 w-[60px] h-[60px] mb-2"></div>
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
    <div className="mt-4 relative">
      <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
        {categories.map((category) => (
          <CategoryItem 
            key={category.id}
            id={category.id}
            name={category.name}
            imageUrl={category.imageUrl}
            color={category.color || 'bg-gray-300'}
          />
        ))}
      </div>
      <button className="absolute right-0 top-1/2 -translate-y-1/2 bg-white rounded-full shadow-md p-1">
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default FoodCategories;
