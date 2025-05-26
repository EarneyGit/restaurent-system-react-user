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
import { toast } from 'sonner';
import { motion } from "framer-motion";
import DeliveryAddressForm from '@/components/cart/DeliveryAddressForm';
import { useBranch } from '@/context/BranchContext';

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
  const { selectedBranch } = useBranch();
  const [paymentMethod, setPaymentMethod] = useState("card");
  const navigate = useNavigate();
  const { 
    cartItems, 
    getCartTotal, 
    getDeliveryFee, 
    getTaxAmount, 
    getOrderTotal,
    clearCart 
  } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState("");

  // Delivery address state
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: user?.address?.street || "",
    city: user?.address?.city || "",
    state: user?.address?.state || "",
    zipCode: user?.address?.zipCode || "",
    country: user?.address?.country || "USA"
  });

  // Calculate order totals
  const subtotal = getCartTotal();
  const deliveryFee = getDeliveryFee();
  const tax = getTaxAmount();
  const total = getOrderTotal();

  const handleAddressChange = (field: string, value: string) => {
    setDeliveryAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePlaceOrder = async () => {
    if (!selectedBranch?.id) {
      toast.error("Please select a branch first");
      return;
    }

    // Validate delivery address
    const addressFields = Object.entries(deliveryAddress);
    const emptyFields = addressFields.filter(([_, value]) => !value.trim());
    if (emptyFields.length > 0) {
      toast.error(`Please fill in all address fields: ${emptyFields.map(([field]) => field).join(', ')}`);
      return;
    }

    try {
      setIsProcessing(true);

      // Prepare order data according to API schema
      const orderData = {
        customerId: user?._id, // From authenticated user
        branchId: selectedBranch.id,
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
          selectedOptions: item.selectedOptions || {},
          specialRequirements: item.specialRequirements || ""
        })),
        orderType: "delivery",
        deliveryAddress,
        paymentMethod,
        paymentStatus: "pending",
        specialInstructions,
        subtotal,
        tax,
        deliveryFee,
        total
      };

      // Make API call to create order
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add any auth headers if needed
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const data = await response.json();

      if (data.success) {
        toast.success("Order placed successfully!");
        clearCart();
        navigate("/app");
      } else {
        throw new Error(data.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Order creation error:', error);
      toast.error(error.message || "Failed to place order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Guest user form state
  const [guestInfo, setGuestInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  // Handle guest info change
  const handleGuestInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGuestInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle empty cart
  if (cartItems.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-[70vh] flex items-center justify-center px-4 pb-10 bg-gradient-to-br from-green-50 via-white to-green-50"
      >
        <div className="max-w-md w-full text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative w-64 h-64 mx-auto bg-white"
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
            Unable to proceed to checkout
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-600 text-base mb-6 max-w-sm mx-auto"
          >
            Looks like your cart is empty. Please add items to your cart before proceeding to checkout.
          </motion.p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen "
    >
      <div className=" mx-auto px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex text-sm items-center border border-gray-200 rounded-md px-4 py-2 mb-4 hover:border-green-600 hover:bg-green-50 text-gray-600 hover:text-gray-900 transition-colors "
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
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Tax (10%)</span>
                      <span>${tax.toFixed(2)}</span>
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

                <div className="space-y-6">
                  <DeliveryAddressForm 
                    address={deliveryAddress}
                    onChange={handleAddressChange}
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Instructions (Optional)
                    </label>
                    <textarea
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      placeholder="Any special delivery instructions?"
                      rows={3}
                    />
                  </div>
                </div>
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
                  className="w-full mt-8 bg-black text-white font-medium py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-800 transition-all transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
