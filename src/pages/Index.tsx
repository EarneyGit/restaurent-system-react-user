import React from "react";
import FoodCategories from "@/components/home/FoodCategories";
// import ProductBoxes from "@/components/home/ProductBoxes";
import PromotionalBanners from "@/components/home/PromotionalBanners";
import RecommendedItems from "@/components/home/RecommendedItems";

const Index = () => {
  return (
    <div className="flex-grow bg-white">
      <div className="container mx-auto px-4">
        {/* Welcome Message */}
        {/* <div className="py-6">
          <h1 className="md:text-3xl text-2xl font-bold text-foodyman-green">Welcome to Restroman</h1>
          <p className="text-green-800 mt-1">Choose from our delicious menu</p>
        </div> */}

        {/* Categories Section */}
        <section className="">
          <FoodCategories />
        </section>

        {/* Promotional Banners Section */}
        <section className="mb-8">
          <PromotionalBanners />
        </section>

        {/* Recommended Items Section */}
        <section className="mb-20">
          <RecommendedItems />
        </section>
      </div>

    </div>
  );
};

export default Index;
