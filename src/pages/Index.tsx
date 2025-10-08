import React from "react";
import FoodCategories from "@/components/home/FoodCategories";
import PromotionalBanners from "@/components/home/PromotionalBanners";
import RecommendedItems from "@/components/home/RecommendedItems";
import RestaurantBanner from "@/components/home/RestaurantBanner";
import RasoieFoodSection from "@/components/home/VietnamFoodSection";

const Index = () => {
  return (
    <div className="flex-grow bg-white">
      <div className="container mx-auto px-4">
        {/* Categories Section */}
        <section className="">
          <FoodCategories />
        </section>

        {/* Promotional Banners Section */}
        <section className="">
          {/* <PromotionalBanners /> */}
        </section>

        {/* Recommended Items Section */}
        {/* <section className="mb-20">
          <RecommendedItems />
        </section> */}

        <section className="mb-20">
          <RasoieFoodSection />
        </section>

        {/* Restaurant Banner Section */}
        <section className="mb-20">
          {/* <RestaurantBanner /> */}
        </section>
      </div>
    </div>
  );
};

export default Index;
