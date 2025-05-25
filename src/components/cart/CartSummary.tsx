import React from 'react';
import { useCart } from '@/context/CartContext';
import { ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CartSummaryProps {
  className?: string;
}

export const CartSummary: React.FC<CartSummaryProps> = ({ className }) => {
  const { cartItems, totalItems, subtotal } = useCart();
  const navigate = useNavigate();

  if (cartItems.length === 0) return null;

  return (
    <button
      onClick={() => navigate('/cart')}
      className={`flex items-center gap-2 text-gray-700 hover:text-black transition-colors duration-200 ${className}`}
      aria-label={`View cart with ${totalItems} items`}
    >
      <div className="relative">
        <ShoppingBag size={20} />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-foodyman-lime to-foodyman-green shadow-md text-white rounded-full w-4 h-4 text-[10px] font-bold flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </div>
      <span className="font-medium">${subtotal.toFixed(2)}</span>
    </button>
  );
};
