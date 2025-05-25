import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useNavigate } from 'react-router-dom';

const OrderSummary = () => {
  const { subtotal } = useCart();
  const navigate = useNavigate();
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const deliveryFee = 12.99;
  const total = subtotal + deliveryFee;

  const handleCheckout = () => {
    navigate('/checkout');
  };

  return (
    <div className="bg-white rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span className="text-gray-900">${subtotal.toFixed(2)}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Delivery</span>
          <span className="text-gray-900">${deliveryFee.toFixed(2)}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Discount</span>
          <span className="text-gray-900">-</span>
        </div>
        
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="font-semibold text-gray-900">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {showPromoInput ? (
        <div className="mt-6 space-y-2">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            placeholder="Enter promo code"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setShowPromoInput(false)}
              className="flex-1 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              className="flex-1 bg-black text-white py-2 rounded-lg hover:bg-gray-900"
            >
              Apply
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowPromoInput(true)}
          className="w-full mt-6 py-2.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Use a promo code
        </button>
      )}

      <button
        onClick={handleCheckout}
        className="w-full mt-4 py-3 bg-neutral-800 text-white rounded-lg font-medium hover:bg-gray-900 transition-colors"
      >
        Checkout
      </button>
    </div>
  );
};

export default OrderSummary; 