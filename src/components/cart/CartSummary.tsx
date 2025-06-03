import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Link } from 'react-router-dom';

interface CartSummaryProps {
  className?: string;
}

export const CartSummary: React.FC<CartSummaryProps> = ({ className = '' }) => {
  const { cartItems, getCartTotal, getCartItemCount, formatCurrency } = useCart();
  const itemCount = getCartItemCount();
  const total = getCartTotal();

  return (
    <Link 
      to="/cart" 
      className={`relative flex items-center gap-2 ${className}`}
      aria-label="Shopping cart"
    >
      <div className="relative">
        <ShoppingCart size={20} className="text-gray-700" />
        {itemCount > 0 && (
          <div className="absolute -top-2 -right-2 bg-green-700 text-white text-xs min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1 font-medium">
            {itemCount}
          </div>
        )}
      </div>
      {total > 0 && (
        <span className="hidden md:inline-block font-medium">
          {formatCurrency(total)}
        </span>
      )}
    </Link>
  );
};

export default CartSummary;
