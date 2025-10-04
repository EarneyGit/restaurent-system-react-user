
import React from "react";

const RestaurantInfo = () => {
  return (
    <div className="flex flex-col items-center mt-6">
      <div className="relative rounded-full overflow-hidden border-4 border-white shadow-lg bg-gradient-to-r from-brand-yellow to-yellow-700 w-[100px] h-[100px] flex items-center justify-center">
        <span className="text-white font-bold text-4xl">R</span>
      </div>
      <h2 className="mt-3 font-bold text-lg">Rasoie Bakery</h2>
      <p className="text-gray-500 text-sm">Fresh baked goods daily</p>
    </div>
  );
};

export default RestaurantInfo;
