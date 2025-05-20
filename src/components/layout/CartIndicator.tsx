import React from "react";
import { ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";

const CartIndicator = () => {
  const navigate = useNavigate();
  const { getCartCount, getCartTotal } = useCart();
  
  const cartCount = getCartCount();
  const cartTotal = getCartTotal();
  
  return (
    <button 
      onClick={() => navigate("/checkout")}
      className="relative flex items-center gap-2 border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-50"
    >
      <div className="relative">
        <ShoppingCart size={18} />
        {cartCount > 0 && (
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-foodyman-lime text-white rounded-full flex items-center justify-center text-[10px] font-bold">
            {cartCount}
          </div>
        )}
      </div>
      {cartCount > 0 && (
        <span className="text-sm font-medium hidden md:inline-block">
          ${cartTotal.toFixed(2)}
        </span>
      )}
    </button>
  );
};

export default CartIndicator; 