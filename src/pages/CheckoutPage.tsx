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
import { CartItem as CartItemType } from "@/context/CartContext";

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

// Calculate total price for an item including options
const calculateItemTotal = (item: CartItemType) => {
  let itemTotal = item.price;
  
  // Add option prices if they exist
  if (item.selectedOptions && item.attributes) {
    item.attributes.forEach(attr => {
      const selectedChoiceId = item.selectedOptions?.[attr.id];
      if (selectedChoiceId) {
        const choice = attr.choices.find(c => c.id === selectedChoiceId);
        if (choice) {
          itemTotal += choice.price;
        }
      }
    });
  }
  
  return itemTotal * item.quantity;
};

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

// Add Address interface at the top with other interfaces
interface Address {
  street: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// Add new interface for credit card
interface CreditCardDetails {
  number: string;
  expiry: string;
  cvc: string;
  name: string;
}

const CheckoutPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { selectedBranch } = useBranch();
  const [paymentMethod, setPaymentMethod] = useState("card");
  const navigate = useNavigate();
  const { 
    cartItems, 
    getDeliveryFee,
    clearCart 
  } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState("");

  // Check authentication
  React.useEffect(() => {
    const isGuest = localStorage.getItem('isGuest') === 'true';
    if (!isAuthenticated && !isGuest) {
      toast.error("Please login or continue as guest");
      navigate('/login', { state: { returnUrl: '/checkout' } });
    }
  }, [isAuthenticated, navigate]);

  // Delivery address state
  const [deliveryAddress, setDeliveryAddress] = useState<Address>({
    street: user?.address?.street || "",
    street2: user?.address?.street2 || "",
    city: user?.address?.city || "",
    state: user?.address?.state || "",
    postalCode: user?.address?.postalCode || "",
    country: user?.address?.country || "UK"
  });

  // Calculate order totals
  const subtotal = cartItems.reduce((total, item) => total + calculateItemTotal(item), 0);
  const deliveryFee = getDeliveryFee();
  const tax = subtotal * 0.05; // 5% tax
  const total = subtotal + deliveryFee + tax;

  // Validate delivery address
  const validateAddress = (address: Address): boolean => {
    const requiredFields = ['street', 'city', 'state', 'postalCode', 'country'];
    const emptyFields = requiredFields.filter(field => !address[field as keyof Address]?.trim());
    
    if (emptyFields.length > 0) {
      toast.error(`Please fill in all required address fields: ${emptyFields.join(', ')}`);
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!selectedBranch?.id) {
      toast.error("Please select a branch first");
      return;
    }

    // Validate delivery address
    if (!validateAddress(deliveryAddress)) {
      return;
    }

    try {
      setIsProcessing(true);

      // Prepare order data according to backend API schema
      const orderData = {
        branchId: selectedBranch.id,
        products: cartItems.map(item => ({
          product: item.id,
          quantity: item.quantity,
          price: item.price,
          notes: item.specialRequirements || "",
          selectedAttributes: []
        })),
        deliveryMethod: "delivery",
        deliveryAddress: {
          street: deliveryAddress.street,
          street2: deliveryAddress.street2,
          city: deliveryAddress.city,
          state: deliveryAddress.state,
          postalCode: deliveryAddress.postalCode,
          country: deliveryAddress.country,
          notes: specialInstructions
        },
        paymentMethod,
        paymentStatus: "pending",
        customerNotes: specialInstructions,
        totalAmount: total,
        isGuestOrder: !isAuthenticated
      };

      console.log('Sending order data:', orderData);

      const response = await axios.post('/api/orders', orderData);

      if (response.data.success) {
        toast.success("Order placed successfully!");
        clearCart();
        // Clear guest status after successful order
        localStorage.removeItem('isGuest');
        navigate("/app");
      } else {
        throw new Error(response.data.message || 'Failed to place order');
      }
    } catch (error: unknown) {
      console.error('Order creation error:', error);
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.message || apiError.message || "Failed to place order. Please try again.";
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

  // Handle credit card change
  const [creditCardDetails, setCreditCardDetails] = useState<CreditCardDetails>({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });

  const handleCreditCardChange = (field: keyof CreditCardDetails, value: string) => {
    setCreditCardDetails(prev => ({
      ...prev,
      [field]: value
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
      className="min-h-screen bg-gray-50"
    >
      <div className="mx-auto px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex text-sm items-center border border-gray-200 rounded-lg px-4 py-2 mb-6 hover:border-green-600 hover:bg-green-50 text-gray-600 hover:text-gray-900 transition-colors bg-white"
          >
            <ArrowLeft
              size={18}
              className="mr-2 group-hover:-translate-x-1 transition-transform"
            />
            <span>Back to Cart</span>
          </button>

          <div className="flex flex-col md:flex-row items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Checkout
              </h1>
              <p className="text-gray-600">
                Complete your order in just a few steps
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Forms */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Order Summary Section */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-lg mr-3">
                      1
                    </span>
                    Order Summary
                  </h2>
                </div>
                <div className="p-6 space-y-6">
                  {cartItems.map((item, index) => (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      key={item.id}
                      className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0 group"
                    >
                      <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden transform transition-transform group-hover:scale-105">
                        {item.images?.[0] ? (
                          <ImageWithFallback src={item.images[0]} alt={item.name} />
                        ) : (
                          <NoImage />
                        )}
                      </div>

                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1 max-w-md">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-500 mb-2 max-w-md">
                          {item.description}
                        </p>
                        
                        {/* Display selected options */}
                        {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                          <div className="space-y-1 mb-2">
                            {item.attributes?.map(attr => {
                              const selectedChoiceId = item.selectedOptions?.[attr.id];
                              if (!selectedChoiceId) return null;
                              
                              const choice = attr.choices.find(c => c.id === selectedChoiceId);
                              if (!choice) return null;

                              return (
                                <div key={attr.id} className="text-sm text-gray-500">
                                  <span>{attr.name}:</span>
                                  <span className="ml-1 font-medium">{choice.name}</span>
                                  {choice.price > 0 && (
                                    <span className="ml-1 text-gray-400">(+₹{choice.price.toFixed(2)})</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Qty: {item.quantity}
                          </span>
                          <span className="font-semibold text-green-600">
                            ₹{calculateItemTotal(item).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Delivery Address Section */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-lg mr-3">
                      2
                    </span>
                    Delivery Address
                  </h2>
                </div>
                <div className="p-6">
                  <DeliveryAddressForm
                    address={deliveryAddress}
                    onChange={(field, value) => setDeliveryAddress(prev => ({
                      ...prev,
                      [field]: value
                    }))}
                  />
                </div>
              </div>

              {/* Special Instructions Section */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50">
                  <h3 className="text-xl font-semibold text-gray-900">Special Instructions</h3>
                </div>
                <div className="p-6">
                  <textarea
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="Any special requests or instructions for your order..."
                    className="w-full p-4 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
              </div>
            </motion.div>

            {/* Right Column - Payment and Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-1"
            >
              <div className="sticky top-24 space-y-6">
                {/* Payment Method Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 bg-gray-50">
                    <h3 className="text-xl font-semibold text-gray-900">Payment Method</h3>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
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

                    {/* Credit Card Form */}
                    {paymentMethod === 'card' && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4 border-t pt-4"
                      >
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Card Holder Name
                          </label>
                          <input
                            type="text"
                            value={creditCardDetails.name}
                            onChange={(e) => handleCreditCardChange('name', e.target.value)}
                            placeholder="Name on card"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Card Number
                          </label>
                          <input
                            type="text"
                            value={creditCardDetails.number}
                            onChange={(e) => handleCreditCardChange('number', e.target.value.replace(/\D/g, '').slice(0, 16))}
                            placeholder="1234 5678 9012 3456"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            maxLength={16}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Expiry Date
                            </label>
                            <input
                              type="text"
                              value={creditCardDetails.expiry}
                              onChange={(e) => {
                                let value = e.target.value.replace(/\D/g, '');
                                if (value.length >= 2) {
                                  value = value.slice(0, 2) + '/' + value.slice(2, 4);
                                }
                                handleCreditCardChange('expiry', value);
                              }}
                              placeholder="MM/YY"
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              maxLength={5}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              CVC
                            </label>
                            <input
                              type="text"
                              value={creditCardDetails.cvc}
                              onChange={(e) => handleCreditCardChange('cvc', e.target.value.replace(/\D/g, '').slice(0, 3))}
                              placeholder="123"
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              maxLength={3}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 bg-gray-50">
                    <h3 className="text-xl font-semibold text-gray-900">Order Total</h3>
                  </div>
                  <div className="p-6">
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
                      onClick={handlePlaceOrder}
                      disabled={isProcessing || (paymentMethod === 'card' && (!creditCardDetails.number || !creditCardDetails.expiry || !creditCardDetails.cvc || !creditCardDetails.name))}
                      className="w-full bg-black text-white py-4 rounded-xl font-semibold hover:bg-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
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

                    <div className="mt-6">
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                        <Clock size={16} />
                        <span>Estimated delivery: 30-45 minutes</span>
                      </div>
                    </div>
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