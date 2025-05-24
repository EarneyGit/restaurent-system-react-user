import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import { ShoppingCart } from "lucide-react";
import CartDrawer from "./CartDrawer";

interface CartSummaryProps {
  className?: string;
}

const CartSummary: React.FC<CartSummaryProps> = ({ className }) => {
  const { cartItems, getCartTotal } = useCart();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  if (cartItems.length === 0) return null;

  const total = getCartTotal();
  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      <CartDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />

      <button
        onClick={() => setIsDrawerOpen(true)}
        title="My Cart"
        className={`text-gray-700 hover:text-black transition-colors duration-200 rounded-full px-2 py-2 flex items-center relative ${className}`}
        aria-label={`Open cart with ${itemCount} items`}
      >
        <ShoppingCart size={20} />
        {itemCount > 0 && (
          <span className="absolute top-0 right-0.5 bg-gradient-to-r from-foodyman-lime to-foodyman-green shadow-md text-white rounded-full w-4 h-4 text-[10px] font-bold flex items-center justify-center">
          {itemCount}
          </span>
        )}
      </button>
    </>
  );
};

export default CartSummary;
