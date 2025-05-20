import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Clock, CreditCard, Wallet, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";

const CheckoutPage = () => {
  const [paymentMethod, setPaymentMethod] = useState("card");
  const navigate = useNavigate();
  const { cartItems, getCartTotal, clearCart } = useCart();
  
  // Calculate delivery fee and total
  const subtotal = getCartTotal();
  const deliveryFee = 5.99;
  const total = subtotal + deliveryFee;
  
  // Handle empty cart
  if (cartItems.length === 0) {
    return (
      <div className="flex-grow flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 max-w-md">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="32" 
              height="32" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <circle cx="8" cy="21" r="1"/>
              <circle cx="19" cy="21" r="1"/>
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">
            Looks like you haven't added anything to your cart yet. Go back to the menu to explore our delicious options.
          </p>
          <button 
            onClick={() => navigate("/")}
            className="bg-green-600 text-white font-medium py-3 px-6 rounded-md"
          >
            Explore Menu
          </button>
        </div>
      </div>
    );
  }

  // Handle order placement
  const handlePlaceOrder = () => {
    // In a real app, you would submit order details to an API here
    alert("Order placed successfully!");
    clearCart();
    navigate("/");
  };

  return (
    <div className="flex-grow bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Summary - Left Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between pb-3 border-b">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gray-100 rounded-md mr-4 flex items-center justify-center">
                        <span className="text-xl">{item.name.charAt(0)}</span>
                      </div>
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Delivery fee</span>
                  <span>${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            {/* Delivery Details */}
            <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Delivery Details</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPin className="text-green-600 mt-1 mr-3" size={20} />
                  <div>
                    <h3 className="font-medium">Delivery Address</h3>
                    <p className="text-gray-600">San Francisco 14 St.</p>
                    <button className="text-green-600 text-sm mt-1">Change</button>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Clock className="text-green-600 mt-1 mr-3" size={20} />
                  <div>
                    <h3 className="font-medium">Delivery Time</h3>
                    <p className="text-gray-600">Today, 30-40 min</p>
                    <button className="text-green-600 text-sm mt-1">Change</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Payment Section - Right Column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-6 sticky top-6">
              <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
              
              <div className="space-y-3">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50">
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="card" 
                    checked={paymentMethod === "card"} 
                    onChange={() => setPaymentMethod("card")} 
                    className="sr-only" 
                  />
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    paymentMethod === "card" ? "border-green-600" : "border-gray-300"
                  }`}>
                    {paymentMethod === "card" && (
                      <div className="w-3 h-3 rounded-full bg-green-600"></div>
                    )}
                  </div>
                  <CreditCard className="ml-3 mr-3 text-gray-500" size={20} />
                  <span>Credit/Debit Card</span>
                </label>
                
                <label className="flex items-center p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50">
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="cash" 
                    checked={paymentMethod === "cash"} 
                    onChange={() => setPaymentMethod("cash")} 
                    className="sr-only" 
                  />
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    paymentMethod === "cash" ? "border-green-600" : "border-gray-300"
                  }`}>
                    {paymentMethod === "cash" && (
                      <div className="w-3 h-3 rounded-full bg-green-600"></div>
                    )}
                  </div>
                  <Wallet className="ml-3 mr-3 text-gray-500" size={20} />
                  <span>Cash on Delivery</span>
                </label>
              </div>
              
              {paymentMethod === "card" && (
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-green-600"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-green-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                      <input
                        type="text"
                        placeholder="123"
                        className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-green-600"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              <button 
                onClick={handlePlaceOrder}
                className="w-full mt-6 bg-green-600 text-white font-medium py-3 rounded-md flex items-center justify-center"
              >
                <Check size={18} className="mr-2" />
                Place Order
              </button>
              
              <p className="text-xs text-gray-500 text-center mt-4">
                By placing your order, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage; 