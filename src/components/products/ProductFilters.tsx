import React, { useEffect } from "react";
import { Coffee, IceCream, Pizza, Utensils, Sandwich, EggFried } from "lucide-react";

interface ProductFiltersProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  activeFilters: string[];
  onFilterToggle: (filter: string) => void;
}

const categories = [
  { id: "All", label: "All", icon: null },
  { id: "Burger", label: "Burger", icon: Sandwich },
  { id: "Coffee", label: "Coffee", icon: Coffee },
  { id: "Bubble tea", label: "Bubble tea", icon: Coffee },
  { id: "Fries", label: "Fries", icon: Utensils },
  { id: "Gelato", label: "Gelato", icon: IceCream },
  { id: "Hot dog", label: "Hot dog", icon: EggFried },
  { id: "Ice cream", label: "Ice cream", icon: IceCream },
  { id: "Pizza", label: "Pizza", icon: Pizza },
  { id: "Cakes", label: "Cakes", icon: null },
  { id: "Desserts", label: "Desserts", icon: null }
];

const filters = [
  { id: "trust_you", label: "Trust you" },
  { id: "highly_rated", label: "Highly rated" },
  { id: "fast_delivery", label: "Fast delivery" },
  { id: "inexpensive", label: "Inexpensive" }
];

const ProductFilters: React.FC<ProductFiltersProps> = ({
  selectedCategory,
  onCategoryChange,
  activeFilters,
  onFilterToggle
}) => {
  console.log("ProductFilters - Current selected category:", selectedCategory);

  // Ensure the selected category exists in our list, default to "All" if not
  useEffect(() => {
    const categoryExists = categories.some(
      cat => cat.id.toLowerCase() === selectedCategory.toLowerCase()
    );
    
    if (!categoryExists && selectedCategory !== "All") {
      console.log("Category not found in list, defaulting to All");
      onCategoryChange("All");
    }
  }, [selectedCategory, onCategoryChange]);

  const isCategorySelected = (categoryId: string) => {
    return categoryId.toLowerCase() === selectedCategory.toLowerCase();
  };

  return (
    <div className="mb-8">
      {/* Category Tabs */}
      <div className="mb-4 overflow-x-auto pb-2 no-scrollbar">
        <div className="flex space-x-2 min-w-max">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={`px-4 py-2 rounded-full flex items-center whitespace-nowrap ${
                  isCategorySelected(category.id)
                    ? "bg-foodyman-lime text-white"
                    : "bg-white text-gray-700 border"
                }`}
              >
                {Icon && <Icon size={16} className="mr-2" />}
                {category.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Options */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold mb-3">Filters</h3>
        <div className="space-y-3">
          {filters.map((filter) => (
            <div key={filter.id} className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={activeFilters.includes(filter.id)}
                    onChange={() => onFilterToggle(filter.id)}
                  />
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      activeFilters.includes(filter.id)
                        ? "bg-foodyman-lime border-foodyman-lime"
                        : "border-gray-300"
                    }`}
                  >
                    {activeFilters.includes(filter.id) && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                </div>
                <span className="ml-3 text-sm">{filter.label}</span>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductFilters; 