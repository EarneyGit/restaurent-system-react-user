
import React from "react";
import { ShoppingCart } from "lucide-react";

const OrderButton = () => {
  return (
    <div className="fixed bottom-24 right-4 z-20">
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full p-4 shadow-lg flex items-center gap-2">
        <div className="bg-black rounded-full p-2">
          <ShoppingCart className="text-white" size={20} />
        </div>
        <div className="text-white font-bold">
          Order $130
        </div>
      </div>
    </div>
  );
};

export default OrderButton;
