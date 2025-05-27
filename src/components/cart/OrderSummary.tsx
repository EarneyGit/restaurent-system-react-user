import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { motion } from 'framer-motion';

interface OrderSummaryProps {
  onCheckout?: () => void;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ onCheckout }) => {
  const { getCartTotal, getDeliveryFee, getTaxAmount, getOrderTotal } = useCart();

  const subtotal = getCartTotal();
  const deliveryFee = getDeliveryFee();
  const tax = getTaxAmount();
  const total = getOrderTotal();

  return (
    <div className="bg-white rounded-3xl shadow-md border p-8">
      <h3 className="text-xl font-semibold mb-6">Order Summary</h3>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Delivery Fee</span>
          <span>₹{deliveryFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Tax (5%)</span>
          <span>₹{tax.toFixed(2)}</span>
        </div>
        <div className="border-t pt-4">
          <div className="flex justify-between text-xl font-semibold">
            <span>Total</span>
            <span className="text-green-600">₹{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onCheckout}
        className="w-full bg-neutral-800 text-white py-4 rounded-xl font-semibold hover:bg-neutral-900 transition-all transform flex items-center justify-center gap-2"
      >
        <ShoppingBag size={20} />
        Proceed to Checkout
      </motion.button>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Prices include all applicable taxes
        </p>
      </div>
    </div>
  );
};

export default OrderSummary; 