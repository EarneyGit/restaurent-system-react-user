import React from "react";
import FoodCategories from "@/components/home/FoodCategories";
import ProductBoxes from "@/components/home/ProductBoxes";
import PromotionalBanners from "@/components/home/PromotionalBanners";
import RecommendedItems from "@/components/home/RecommendedItems";

const Index = () => {
  return (
    <div className="flex-grow bg-gray-50">
      <div className="container mx-auto px-4 pb-20">
        <FoodCategories />
        <PromotionalBanners />
        <ProductBoxes />
        <RecommendedItems />
      </div>
    </div>
  );
};

export default Index;
