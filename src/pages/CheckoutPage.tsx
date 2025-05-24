import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Clock,
  CreditCard,
  Wallet,
  Check,
  ShoppingBag,
  Loader2,
  ArrowLeft,
  Image as ImageIcon,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

// NoImage SVG Component
const NoImage = () => (
  <div className="w-full h-full flex flex-col items-center min-h-20 justify-center bg-gray-50 text-gray-400">
    <ImageIcon size={24} />
    <span className="text-xs mt-1">No image</span>
  </div>
);

// Image with Fallback Component
const ImageWithFallback = ({ src, alt }: { src: string; alt: string }) => {
  const [error, setError] = useState(false);

  if (error) {
    return <NoImage />;
  }

  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover"
      onError={() => setError(true)}
    />
  );
};

const CheckoutPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState("card");
  const navigate = useNavigate();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  // Guest user form state
  const [guestInfo, setGuestInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  // Calculate delivery fee and total
  const subtotal = getCartTotal();
  const deliveryFee = 5.99;
  const total = subtotal + deliveryFee;

  // Handle empty cart
  if (cartItems.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-[80vh] flex items-center justify-center px-4 bg-gradient-to-br from-green-50 via-white to-green-50"
      >
        <div className="max-w-md w-full text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative w-64 h-64 mx-auto mb-8 bg-white rounded-full shadow-xl p-8"
          >
            <img
              src="/not-found.png"
              alt="Empty cart"
              className="w-full h-full object-contain"
            />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-semibold text-gray-900 mb-3"
          >
            Your cart is empty
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-600 text-base mb-6 max-w-sm mx-auto"
          >
            Browse our menu to discover delicious options for your next meal.
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onClick={() => navigate("/app")}
            className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-green-600 to-green-500 text-white font-medium px-8 py-4 rounded-full hover:from-green-700 hover:to-green-600 transition-all transform hover:scale-105 shadow-md border hover:shadow-xl"
          >
            <ShoppingBag size={20} />
            Browse Menu
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // Handle guest info change
  const handleGuestInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGuestInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle order placement
  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      // Validate guest information
      const { name, email, phone, address } = guestInfo;
      if (!name || !email || !phone || !address) {
        toast.error("Please fill in all required fields");
        return;
      }
    }

    try {
      setIsProcessing(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success("Order placed successfully!");
      clearCart();
      navigate("/app");
    } catch (error) {
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen "
    >
      <div className=" mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center border border-gray-200 rounded-md px-4 py-2 mb-4 hover:border-green-600 hover:bg-green-50 text-gray-600 hover:text-gray-900 transition-colors "
          >
            <ArrowLeft
              size={18}
              className="mr-2 group-hover:-translate-x-1 transition-transform"
            />
            <span>Back</span>
          </button>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="md:text-4xl text-2xl font-bold text-gray-900 mb-2">
                Checkout
              </h1>
              <p className="text-gray-500">
                Complete your order in just a few steps
              </p>
            </div>
            <div className="hidden md:block">
              <div className="flex items-center gap-8">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-semibold">
                    1
                  </div>
                  <span className="ml-2 text-gray-600">Order Summary</span>
                </div>
                <div className="h-[2px] w-12 bg-gray-200"></div>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-semibold">
                    2
                  </div>
                  <span className="ml-2 text-gray-600">Delivery Details</span>
                </div>
                <div className="h-[2px] w-12 bg-gray-200"></div>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-semibold">
                    3
                  </div>
                  <span className="ml-2 text-gray-600">Payment</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Summary - Left Column */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 space-y-6"
            >
              <div className="bg-white rounded-3xl shadow-md border p-8">
                <h2 className="text-2xl font-semibold mb-6 flex items-center">
                  <span className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-lg mr-3">
                    1
                  </span>
                  Order Summary
                </h2>

                <div className="space-y-6">
                  {cartItems.map((item, index) => (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      key={item.id}
                      className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0 group"
                    >
                      <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden transform transition-transform group-hover:scale-105">
                        {item.images && item.images[0] ? (
                          <ImageWithFallback
                            src={item.images[0]}
                            alt={item.name}
                          />
                        ) : (
                          <NoImage />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-medium text-gray-900 group-hover:text-green-600 transition-colors">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-0.5">
                          Quantity: {item.quantity}
                        </p>
                        {item.selectedOptions &&
                          Object.entries(item.selectedOptions).map(
                            ([key, value]) => (
                              <p key={key} className="text-xs text-gray-400">
                                {key}: {value}
                              </p>
                            )
                          )}
                      </div>
                      <div className="text-right">
                        <p className="text-base font-medium text-gray-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-dashed border-gray-200">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Delivery fee</span>
                      <span>${deliveryFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-base font-medium pt-2 border-t border-gray-100">
                      <span>Total</span>
                      <span className="text-green-600">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Details */}
              <div className="bg-white rounded-3xl shadow-md border p-8">
                <h2 className="text-2xl font-semibold mb-6 flex items-center">
                  <span className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-lg mr-3">
                    2
                  </span>
                  Delivery Details
                </h2>

                {isAuthenticated ? (
                  <div className="space-y-6">
                    <div className="flex items-start p-4 rounded-2xl border-2 border-gray-100 hover:border-green-100 transition-colors">
                      <MapPin className="text-green-600 mt-1 mr-4" size={24} />
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Delivery Address
                        </h3>
                        <p className="text-gray-600 mt-1">
                          {user?.address || "No address provided"}
                        </p>
                        <button className="text-green-600 text-sm mt-2 hover:text-green-700 flex items-center gap-1">
                          <span>Change</span>
                          <ArrowLeft
                            size={16}
                            className="transform rotate-180"
                          />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-start p-4 rounded-2xl border-2 border-gray-100 hover:border-green-100 transition-colors">
                      <Clock className="text-green-600 mt-1 mr-4" size={24} />
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Delivery Time
                        </h3>
                        <p className="text-gray-600 mt-1">Today, 30-40 min</p>
                        <button className="text-green-600 text-sm mt-2 hover:text-green-700 flex items-center gap-1">
                          <span>Change</span>
                          <ArrowLeft
                            size={16}
                            className="transform rotate-180"
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={guestInfo.name}
                        onChange={handleGuestInfoChange}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={guestInfo.email}
                        onChange={handleGuestInfoChange}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={guestInfo.phone}
                        onChange={handleGuestInfoChange}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Delivery Address *
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={guestInfo.address}
                        onChange={handleGuestInfoChange}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Payment Section - Right Column */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-1"
            >
              <div className="bg-white rounded-3xl shadow-md border p-8 sticky top-24">
                <h2 className="text-2xl font-semibold mb-6 flex items-center">
                  <span className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-lg mr-3">
                    3
                  </span>
                  Payment Method
                </h2>

                <div className="space-y-4">
                  <label className="block p-4 border-2 rounded-2xl cursor-pointer transition-all hover:border-green-100 hover:bg-green-50/50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={() => setPaymentMethod("card")}
                      className="sr-only"
                    />
                    <div className="flex items-center">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === "card"
                            ? "border-green-600"
                            : "border-gray-300"
                        }`}
                      >
                        {paymentMethod === "card" && (
                          <div className="w-3 h-3 rounded-full bg-green-600"></div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <CreditCard
                            className="text-gray-400 mr-2"
                            size={20}
                          />
                          <span className="font-medium text-gray-900">
                            Credit/Debit Card
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Pay securely with your card
                        </p>
                      </div>
                    </div>
                  </label>

                  <label className="block p-4 border-2 rounded-2xl cursor-pointer transition-all hover:border-green-100 hover:bg-green-50/50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={paymentMethod === "cash"}
                      onChange={() => setPaymentMethod("cash")}
                      className="sr-only"
                    />
                    <div className="flex items-center">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === "cash"
                            ? "border-green-600"
                            : "border-gray-300"
                        }`}
                      >
                        {paymentMethod === "cash" && (
                          <div className="w-3 h-3 rounded-full bg-green-600"></div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <Wallet className="text-gray-400 mr-2" size={20} />
                          <span className="font-medium text-gray-900">
                            Cash on Delivery
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Pay when your order arrives
                        </p>
                      </div>
                    </div>
                  </label>
                </div>

                {paymentMethod === "card" && (
                  <div className="mt-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Card Number
                      </label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CVC
                        </label>
                        <input
                          type="text"
                          placeholder="123"
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  className="w-full mt-8 bg-gradient-to-r from-green-600 to-green-500 text-white font-medium py-4 rounded-xl flex items-center justify-center gap-2 hover:from-green-700 hover:to-green-600 transition-all transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-md border hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Check size={20} />
                      <span>Place Order • ${total.toFixed(2)}</span>
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-400 text-center mt-4">
                  By placing your order, you agree to our Terms of Service and
                  Privacy Policy
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CheckoutPage;
