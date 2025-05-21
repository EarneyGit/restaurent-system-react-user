import React from 'react';
import FoodCategories from "@/components/home/FoodCategories";
import PromotionalBanners from "@/components/home/PromotionalBanners";
import EmptyState from '@/components/shared/EmptyState';

const LikedProductsPage = () => {
  // This would typically come from some context or state management
  const likedProductsCount = 0;

  return (
    <div className="container mx-auto px-4 pb-20">
      <FoodCategories />
      <PromotionalBanners />
      
      <div className="flex flex-col items-center justify-center mt-10">
        {likedProductsCount === 0 ? (
          <EmptyState 
            title="You don't have any liked products yet"
            action={{ 
              label: "Go to menu", 
              to: "/" 
            }}
          />
        ) : (
          <div className="w-full">
            {/* This would be the grid of liked products if any */}
            <h2 className="text-2xl font-bold mb-6">Your Liked Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Liked products would go here */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LikedProductsPage; 