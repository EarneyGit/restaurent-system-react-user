import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { MapPin, CreditCard, Truck, Clock, ChevronRight, AlertCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
  const { cartItems, getCartTotal } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle order submission
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  const subtotal = getCartTotal();
  const deliveryFee = 5.99;
  const total = subtotal + deliveryFee;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            <span>Back to Menu</span>
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-500 mb-8">Complete your order in just a few steps</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Summary */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl shadow-lg p-8 transform transition-all duration-300 hover:shadow-xl">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                  <span className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center text-lg mr-3">1</span>
                  Order Summary
                </h2>
                <div className="divide-y divide-gray-100">
                  {cartItems.map((item) => (
                    <div key={item.id} className="py-6 flex items-center gap-6 group">
                      <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 transform transition-transform group-hover:scale-105">
                        {item.images?.[0] ? (
                          <img
                            src={item.images[0]}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <AlertCircle className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-lg text-gray-900 group-hover:text-yellow-700 transition-colors">
                          {item.name}
                        </h3>
                        <div className="text-sm text-gray-500 mt-1 space-y-1">
                          <p>Quantity: {item.quantity}</p>
                          {item.selectedOptions && Object.entries(item.selectedOptions).map(([key, value]) => (
                            <p key={key} className="text-gray-400">{key}: {String(value)}</p>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Details */}
              <div className="bg-white rounded-3xl shadow-lg p-8 transform transition-all duration-300 hover:shadow-xl">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                  <span className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center text-lg mr-3">2</span>
                  Delivery Details
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Address
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-600 focus:border-transparent transition-all"
                        placeholder="Enter your delivery address"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Delivery Time
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <select
                        value={deliveryTime}
                        onChange={(e) => setDeliveryTime(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-600 focus:border-transparent appearance-none bg-white"
                      >
                        <option value="">Select delivery time</option>
                        <option value="asap">As soon as possible</option>
                        <option value="30-45">30-45 minutes</option>
                        <option value="45-60">45-60 minutes</option>
                        <option value="60-90">60-90 minutes</option>
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl shadow-lg p-8 sticky top-8 transform transition-all duration-300 hover:shadow-xl">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                  <span className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center text-lg mr-3">3</span>
                  Payment
                </h2>
                
                {/* Payment Method Selection */}
                <div className="space-y-4 mb-8">
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === 'card'
                        ? 'border-yellow-600 bg-yellow-50 shadow-md'
                        : 'border-gray-200 hover:border-yellow-200 hover:bg-yellow-50/50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      paymentMethod === 'card' ? 'bg-yellow-100' : 'bg-gray-100'
                    }`}>
                      <CreditCard className={`w-5 h-5 ${
                        paymentMethod === 'card' ? 'text-yellow-700' : 'text-gray-400'
                      }`} />
                    </div>
                    <span className="font-medium">Credit/Debit Card</span>
                  </button>
                  
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === 'cash'
                        ? 'border-yellow-600 bg-yellow-50 shadow-md'
                        : 'border-gray-200 hover:border-yellow-200 hover:bg-yellow-50/50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      paymentMethod === 'cash' ? 'bg-yellow-100' : 'bg-gray-100'
                    }`}>
                      <Truck className={`w-5 h-5 ${
                        paymentMethod === 'cash' ? 'text-yellow-700' : 'text-gray-400'
                      }`} />
                    </div>
                    <span className="font-medium">Cash on Delivery</span>
                  </button>
                </div>

                {paymentMethod === 'card' && (
                  <div className="space-y-4 mb-8">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        maxLength={19}
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-600 focus:border-transparent transition-all"
                        placeholder="1234 5678 9012 3456"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                          maxLength={5}
                          className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-600 focus:border-transparent transition-all"
                          placeholder="MM/YY"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CVC
                        </label>
                        <input
                          type="text"
                          value={cvc}
                          onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
                          maxLength={3}
                          className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-600 focus:border-transparent transition-all"
                          placeholder="123"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Summary */}
                <div className="border-t-2 border-dashed border-gray-100 pt-6 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Delivery Fee</span>
                    <span className="font-medium text-gray-900">${deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold pt-4 border-t-2 border-gray-100">
                    <span className="text-gray-900">Total</span>
                    <span className="text-yellow-700">${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  onClick={handleSubmit}
                  className="w-full mt-8 bg-gradient-to-r from-yellow-700 to-yellow-600 text-white py-4 px-6 rounded-xl font-medium hover:from-yellow-700 hover:to-yellow-700 transition-all transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  Place Order
                </button>

                <p className="text-xs text-gray-400 text-center mt-4">
                  By placing your order, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 