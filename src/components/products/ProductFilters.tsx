import React from "react";
import { Category } from "@/services/api";

interface ProductFiltersProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  activeFilters: string[];
  onFilterToggle: (filter: string) => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  activeFilters,
  onFilterToggle,
}) => {
  const filters = [
    { id: "delivery", label: "Delivery" },
    { id: "collection", label: "Collection" },
    { id: "dineIn", label: "Dine In" },
  ];

  return (
    <div className="mb-8">
      {/* Categories */}
      <div className="flex overflow-x-auto gap-3 pb-4 no-scrollbar">
        <button
          onClick={() => onCategoryChange("All")}
          className={`px-6 py-2 rounded-full border border-gray-300 whitespace-nowrap transition-all ${
            selectedCategory === "All"
              ? "bg-yellow-800 text-white hover:opacity-90"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(String(category.name))}
            className={`px-4 py-2 rounded-full border border-gray-300 text-sm whitespace-nowrap transition-all ${
              selectedCategory === String(category.name)
                ? "bg-yellow-800 text-white font-semibold hover:opacity-80"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            {String(category.name)}
          </button>
        ))}
      </div>

      {/* Filters */}
      {/* <div className="flex flex-wrap gap-3 mt-4">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onFilterToggle(filter.id)}
            className={`px-4 py-2 rounded-md text-sm transition-colors ${
              activeFilters.includes(filter.id)
                ? "bg-yellow-700 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div> */}
    </div>
  );
};

export default ProductFilters; 