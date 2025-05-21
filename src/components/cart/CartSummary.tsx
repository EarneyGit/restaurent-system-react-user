import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { ShoppingBag } from 'lucide-react';
import CartDrawer from './CartDrawer';

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
      <CartDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
      
      <button
        onClick={() => setIsDrawerOpen(true)}
        className={`bg-green-600 text-white rounded-full shadow-sm md:px-3 md:py-3 px-2 py-2 flex items-center text-sm ${className}`}
        aria-label={`Open cart with ${itemCount} items`}
      >
        <div className="relative">
          <ShoppingBag size={18} />
          <span className="absolute -top-1 -right-1 bg-white text-foodyman-lime rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">
            {itemCount}
          </span>
        </div>
        <span className="ml-2 mr-1 md:block hidden font-medium">${total.toFixed(2)}</span>
      </button>
    </>
  );
};

export default CartSummary; 