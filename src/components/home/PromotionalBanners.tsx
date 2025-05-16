
import React from "react";
import { Badge } from "@/components/ui/badge";

const PromotionalBanners = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
      {/* New items banner */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-pink-200 to-pink-300">
        <div className="absolute top-2 left-2">
          <Badge className="bg-pink-500">NEW</Badge>
        </div>
        <div className="p-6 pt-10 relative z-10">
          <h3 className="text-xl font-bold">New items of the week</h3>
          <p className="text-sm mt-1">Chocolate Pasta Cake with Caramel</p>
        </div>
      </div>

      {/* Discount banner */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-green-100 to-green-200">
        <div className="absolute top-2 left-2">
          <Badge className="bg-green-500">APRIL 29-30</Badge>
        </div>
        <div className="p-6 pt-10 relative z-10">
          <h3 className="text-xl font-bold">Favorite cakes with 8% discount</h3>
          <p className="text-sm mt-1">$85 for making the order</p>
        </div>
        <div className="absolute right-4 bottom-4 bg-green-400 rounded-full w-12 h-12 flex items-center justify-center text-white font-bold z-10">
          8%
        </div>
      </div>

      {/* App banner */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-amber-50 to-amber-100">
        <div className="p-6 relative z-10">
          <h3 className="text-xl font-bold">Install the app</h3>
          <p className="text-sm mt-1">and get free shipping</p>
        </div>
      </div>
    </div>
  );
};

export default PromotionalBanners;
