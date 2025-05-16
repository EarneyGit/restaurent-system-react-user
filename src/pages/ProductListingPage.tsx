import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BottomNavigation from "@/components/layout/BottomNavigation";
import ProductFilters from "@/components/products/ProductFilters";
import ProductGrid from "@/components/products/ProductGrid";

const ProductListingPage = () => {
  const { category = "All" } = useParams<{ category: string }>();
  const decodedCategory = decodeURIComponent(category);
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(decodedCategory);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // Update selected category when URL parameter changes
  useEffect(() => {
    setSelectedCategory(decodedCategory);
  }, [decodedCategory]);

  const handleCategoryChange = (newCategory: string) => {
    setSelectedCategory(newCategory);
    navigate(`/products/${encodeURIComponent(newCategory)}`);
  };

  const handleFilterToggle = (filter: string) => {
    if (activeFilters.includes(filter)) {
      setActiveFilters(activeFilters.filter((f) => f !== filter));
    } else {
      setActiveFilters([...activeFilters, filter]);
    }
  };

  // Get category title for display
  const getCategoryTitle = () => {
    return selectedCategory === "All" ? "All Products" : selectedCategory;
  };

  console.log("Current category:", selectedCategory);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">{getCategoryTitle()}</h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">15 items</span>
            </div>
          </div>

          <ProductFilters 
            selectedCategory={selectedCategory} 
            onCategoryChange={handleCategoryChange}
            activeFilters={activeFilters}
            onFilterToggle={handleFilterToggle}
          />
          
          <ProductGrid category={selectedCategory} filters={activeFilters} />
        </div>
      </main>
      <BottomNavigation />
      <Footer />
    </div>
  );
};

export default ProductListingPage; 