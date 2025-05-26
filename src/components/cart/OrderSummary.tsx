import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';

const OrderSummary = () => {
  const navigate = useNavigate();
  const { 
    cartItems, 
    getCartTotal, 
    getDeliveryFee, 
    getTaxAmount, 
    getOrderTotal 
  } = useCart();

  const subtotal = getCartTotal();
  const deliveryFee = getDeliveryFee();
  const tax = getTaxAmount();
  const total = getOrderTotal();

  const handleCheckout = () => {
    navigate('/checkout');
  };

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
      
      {/* Price Breakdown */}
      <div className="space-y-3">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Delivery Fee</span>
          <span>${deliveryFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Tax (10%)</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="h-px bg-gray-200 my-4"></div>
        <div className="flex justify-between text-lg font-semibold text-gray-900">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Checkout Button */}
      <button
        onClick={handleCheckout}
        disabled={cartItems.length === 0}
        className={`w-full mt-6 py-3 px-4 rounded-xl font-medium text-white 
          ${cartItems.length === 0 
            ? 'bg-gray-300 cursor-not-allowed' 
            : 'bg-black hover:bg-gray-800'} 
          transition-colors`}
      >
        Proceed to Checkout
      </button>

      {/* Empty Cart Message */}
      {cartItems.length === 0 && (
        <p className="text-sm text-center text-gray-500 mt-3">
          Add items to your cart to proceed
        </p>
      )}
    </div>
  );
};

export default OrderSummary; 