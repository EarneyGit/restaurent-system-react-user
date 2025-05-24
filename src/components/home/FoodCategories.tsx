import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getCategories, Category } from "@/services/api";
import { Pizza, UtensilsCrossed, Fish, Beef, Apple, Coffee, Sandwich, IceCream2, Soup, ChefHat, LucideIcon, Candy } from "lucide-react";

// Map of category names to icons for better representation
const CATEGORY_ICONS: { [key: string]: { icon: LucideIcon; color: string } } = {
  "Dessert": { icon: IceCream2, color: "text-gray-400" },
  "Cake": { icon: Coffee, color: "text-gray-400" },
  "Sanwhich": { icon: Sandwich, color: "text-gray-400" },
  "Chocho": { icon: Candy, color: "text-gray-400" },
  "default": { icon: UtensilsCrossed, color: "text-gray-400" }
};

interface CategoryProps {
  imageUrl: string;
  name: string;
  isActive: boolean;
  id: string;
  index: number;
  onClick: () => void;
}

const CategoryItem: React.FC<CategoryProps> = ({
  imageUrl,
  name,
  isActive,
  onClick,
  index
}) => {
  const [imageError, setImageError] = useState(false);
  const IconComponent = CATEGORY_ICONS[name] || CATEGORY_ICONS.default;

  // Function to get the correct image URL
  const getImageUrl = (url: string): string | null => {
    if (!url || url.trim() === '') return null;
    
    try {
      // If it's already a full URL, return it
      if (url.startsWith('http')) return url;
      
      // Remove leading slashes and clean the path
      const cleanUrl = url.trim()
        .replace(/^\/+/, '')
        .replace(/\\/g, '/');
      
      // Encode the path segments but keep the slashes
      const encodedUrl = cleanUrl.split('/')
        .map(segment => encodeURIComponent(segment))
        .join('/');
      
      // Construct the full URL
      return `http://localhost:5000/${encodedUrl}`;
    } catch (error) {
      console.error('Error processing image URL:', error);
      return null;
    }
  };

  const processedImageUrl = getImageUrl(imageUrl);
  const shouldShowImage = processedImageUrl && !imageError;

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center min-w-[80px] group`}
    >
      <div
        className={`w-[80px] h-[80px] border-gray-300 border-2 shadow-sm transition-all duration-300 mb-2 rounded-xl flex items-center justify-center bg-white overflow-hidden
          ${isActive 
            ? "border-2 border-gray-100"
            : "border-2 border-gray-100"
          }`}
      >
        {shouldShowImage ? (
          <img
            src={processedImageUrl}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('Image load error for:', processedImageUrl);
              setImageError(true);
            }}
            loading="lazy"
          />
        ) : (
          <IconComponent.icon 
            className={`w-6 h-6 ${IconComponent.color}`}
          />
        )}
      </div>
      <span
        className={`text-sm font-medium transition-colors whitespace-nowrap ${
          isActive ? "text-neutral-700" : "text-neutral-700 font-semibold"
        }`}
      >
        {name}
      </span>
    </button>
  );
};

const FoodCategories = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        const visibleCategories = data
          .filter((cat) => !cat.hidden)
          .sort((a, b) => a.displayOrder - b.displayOrder);
        setCategories(visibleCategories);
        if (visibleCategories.length > 0) {
          setActiveCategory(visibleCategories[0].id);
        }
      } catch (err) {
        setError("Failed to load categories");
        console.error("Error loading categories:", err);
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
      <div className="py-4">
        <div className="flex overflow-x-auto gap-4 scrollbar-hide">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="flex flex-col items-center animate-pulse min-w-[80px]"
            >
              <div className="w-[72px] h-[72px] rounded-xl bg-gray-100 border border-gray-100 mb-2"></div>
              <div className="w-16 h-4 bg-gray-100 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-4 text-center text-red-500">{error}</div>
    );
  }

  return (
    <div className="relative pt-5">
      <div className="flex overflow-x-auto gap-4 py-4 scrollbar-hide">
        {categories.map((category, index) => (
          <CategoryItem
            key={category.id}
            id={category.id}
            name={category.name}
            imageUrl={category.imageUrl}
            isActive={category.id === activeCategory}
            index={index}
            onClick={() => handleCategoryClick(category.id, category.name)}
          />
        ))}
      </div>
    </div>
  );
};

export default FoodCategories;
