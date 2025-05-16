
import React from "react";
import Header from "@/components/layout/Header";
import FoodCategories from "@/components/home/FoodCategories";
import ProductBoxes from "@/components/home/ProductBoxes";
import PromotionalBanners from "@/components/home/PromotionalBanners";
import RecommendedItems from "@/components/home/RecommendedItems";
import Footer from "@/components/layout/Footer";
import BottomNavigation from "@/components/layout/BottomNavigation";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 pb-20">
          <FoodCategories />
          <PromotionalBanners />
          <ProductBoxes />
          <RecommendedItems />
        </div>
      </main>
      <BottomNavigation />
      <Footer />
    </div>
  );
};

export default Index;
