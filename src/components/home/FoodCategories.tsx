import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getCategories, Category } from "@/services/api";
import {
  Pizza,
  UtensilsCrossed,
  Fish,
  Beef,
  Apple,
  Coffee,
  Sandwich,
  IceCream2,
  Soup,
  ChefHat,
  LucideIcon,
  Candy,
  Drumstick,
  CupSoda,
  Salad,
  EggFried,
  Shrub,
} from "lucide-react";
import { useBranch } from "@/context/BranchContext";

// Expanded icon mapping
const CATEGORY_ICONS: { [key: string]: { icon: LucideIcon; color: string } } = {
  Desserts: { icon: IceCream2, color: "text-pink-400" },
  Cakes: { icon: Coffee, color: "text-amber-500" },
  Sandwiches: { icon: Sandwich, color: "text-yellow-600" },
  Chocolates: { icon: Candy, color: "text-rose-400" },
  "Chicken Wings": { icon: Drumstick, color: "text-red-500" },
  Drinks: { icon: CupSoda, color: "text-blue-500" },
  Salads: { icon: Salad, color: "text-green-500" },
  Breakfast: { icon: EggFried, color: "text-orange-400" },
  Smoothies: { icon: Shrub, color: "text-teal-500" },
  // "Rice Bowls": { icon: BowlRice, color: "text-yellow-500" },
  // "Cupcakes": { icon: Cupcake, color: "text-pink-500" },
  Pizza: { icon: Pizza, color: "text-red-500" },
  Fish: { icon: Fish, color: "text-cyan-600" },
  Beef: { icon: Beef, color: "text-stone-500" },
  Soups: { icon: Soup, color: "text-emerald-500" },
  Specials: { icon: ChefHat, color: "text-indigo-500" },
  default: { icon: UtensilsCrossed, color: "text-gray-400" },
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
}) => {
  const [imageError, setImageError] = useState(false);
  const IconComponent = CATEGORY_ICONS[name] || CATEGORY_ICONS.default;

  const getImageUrl = (url: string): string | null => {
    if (!url || url.trim() === "") return null;

    try {
      if (url.startsWith("http")) return url;

      const cleanUrl = url.trim().replace(/^\/+/, "").replace(/\\/g, "/");
      const encodedUrl = cleanUrl
        .split("/")
        .map((segment) => encodeURIComponent(segment))
        .join("/");

      return `${import.meta.env.VITE_API_URL}/${encodedUrl}`;
    } catch (error) {
      console.error("Error processing image URL:", error);
      return null;
    }
  };

  const processedImageUrl = getImageUrl(imageUrl ?? "");
  const shouldShowImage = processedImageUrl && !imageError;

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center min-w-[90px] shrink-0 snap-start"
    >
      <div className="w-[80px] h-[80px] border-gray-200 border rounded-xl shadow-sm transition-all duration-300 mb-2 flex items-center justify-center bg-white overflow-hidden">
        {shouldShowImage ? (
          <img
            src={processedImageUrl}
            alt={name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <IconComponent.icon className={`w-6 h-6 ${IconComponent.color}`} />
        )}
      </div>
      <span
        className={`text-sm text-center font-medium break-words ${
          isActive ? "text-neutral-700" : "text-neutral-600"
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
  const { selectedBranch } = useBranch();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getCategories(selectedBranch?.id);
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

    if (selectedBranch?.id) {
      fetchCategories();
    }
  }, [selectedBranch]);

  const handleCategoryClick = (categoryId: string, categoryName: string) => {
    setActiveCategory(categoryId);
    const branchId =
      selectedBranch?.id ||
      new URLSearchParams(location.search).get("branchId");
    if (!branchId) {
      navigate("/select-outlet");
      return;
    }
    navigate(
      `/app/products/${encodeURIComponent(categoryName)}?branchId=${branchId}`
    );
  };

  if (loading) {
    return (
      <div className="py-4">
        <div className="flex overflow-x-auto gap-4 scrollbar-hide px-4">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="flex flex-col items-center animate-pulse w-[90px]"
            >
              <div className="w-[80px] h-[80px] rounded-xl bg-gray-100 border border-gray-100 mb-2"></div>
              <div className="w-16 h-4 bg-gray-100 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="py-4 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="relative pt-5">
      <div className="flex overflow-x-auto space-x-4 px-4 py-4 scrollbar-hide snap-x snap-mandatory">
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
