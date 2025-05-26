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
import axios from '@/config/axios.config';

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

      // Prepare order data according to backend API schema
      const orderData = {
        branchId: selectedBranch.id,
        products: cartItems.map(item => ({
          product: item.id, // Backend expects 'product' not 'productId'
          quantity: item.quantity,
          price: item.price,
          notes: item.specialRequirements || "",
          selectedAttributes: [] // Convert selectedOptions to selectedAttributes if needed
        })),
        deliveryMethod: "delivery", // Backend expects 'deliveryMethod' not 'orderType'
        deliveryAddress: {
          street: deliveryAddress.street,
          city: deliveryAddress.city,
          state: deliveryAddress.state,
          postalCode: deliveryAddress.zipCode, // Backend expects 'postalCode' not 'zipCode'
          country: deliveryAddress.country,
          notes: specialInstructions
        },
        paymentMethod,
        paymentStatus: "pending",
        customerNotes: specialInstructions,
        totalAmount: total // Backend expects 'totalAmount' not 'total'
      };

      console.log('Sending order data:', orderData);

      // Make API call to create order using axios (includes auth headers automatically)
      const response = await axios.post('/api/orders', orderData);

      if (response.data.success) {
        toast.success("Order placed successfully!");
        clearCart();
        navigate("/app");
      } else {
        throw new Error(response.data.message || 'Failed to place order');
      }
    } catch (error: any) {
      console.error('Order creation error:', error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to place order. Please try again.";
      toast.error(errorMessage);
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
                        <ImageWithFallback
                          src={item.images?.[0] || "/placeholder-food.jpg"}
                          alt={item.name}
                        />
                      </div>

                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-500 mb-2">
                          {item.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Qty: {item.quantity}
                          </span>
                          <span className="font-semibold text-green-600">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-white rounded-3xl shadow-md border p-8">
                <h2 className="text-2xl font-semibold mb-6 flex items-center">
                  <span className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-lg mr-3">
                    2
                  </span>
                  Delivery Address
                </h2>

                <DeliveryAddressForm
                  address={deliveryAddress}
                  onChange={handleAddressChange}
                />
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-3xl shadow-md border p-8">
                <h2 className="text-2xl font-semibold mb-6 flex items-center">
                  <span className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-lg mr-3">
                    3
                  </span>
                  Payment Method
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { id: "card", label: "Credit Card", icon: CreditCard },
                    { id: "cash", label: "Cash on Delivery", icon: Wallet },
                    { id: "online", label: "Online Payment", icon: Check },
                  ].map(({ id, label, icon: Icon }) => (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      key={id}
                      onClick={() => setPaymentMethod(id)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        paymentMethod === id
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-gray-200 hover:border-green-300 text-gray-600"
                      }`}
                    >
                      <Icon size={24} className="mx-auto mb-2" />
                      <span className="text-sm font-medium">{label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Special Instructions */}
              <div className="bg-white rounded-3xl shadow-md border p-8">
                <h3 className="text-lg font-semibold mb-4">Special Instructions</h3>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="Any special requests or instructions for your order..."
                  className="w-full p-4 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                />
              </div>
            </motion.div>

            {/* Order Total - Right Column */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-1"
            >
              <div className="bg-white rounded-3xl shadow-md border p-8 sticky top-8">
                <h3 className="text-xl font-semibold mb-6">Order Total</h3>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee</span>
                    <span>${deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-xl font-semibold">
                      <span>Total</span>
                      <span className="text-green-600">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  className="w-full bg-green-600 text-white py-4 rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={20} />
                      Place Order
                    </>
                  )}
                </motion.button>

                <div className="mt-6 text-center">
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                    <Clock size={16} />
                    <span>Estimated delivery: 30-45 minutes</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CheckoutPage; 