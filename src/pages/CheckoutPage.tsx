import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
import { motion, AnimatePresence } from "framer-motion";
import DeliveryAddressForm from '@/components/cart/DeliveryAddressForm';
import { useBranch } from '@/context/BranchContext';
import axios from '@/config/axios.config';
import { CartItem as CartItemType } from "@/context/CartContext";
import { CART_ENDPOINTS, ORDER_ENDPOINTS } from '@/config/api.config';

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

// Format price in GBP
const formatPrice = (amount: number) => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
  }).format(amount);
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

// Update the Address interface
interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// Add new interface for credit card
interface CreditCardDetails {
  number: string;
  expiry: string;
  cvc: string;
  name: string;
}

// Generate time slots from 10:00 to 22:00 with 30-minute intervals
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 10; hour < 22; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(time);
    }
  }
  return slots;
};

const timeSlots = generateTimeSlots();

// Mock UK addresses for demo
const mockUKAddresses = [
  "10 Downing Street, London, SW1A 2AA",
  "221B Baker Street, London, NW1 6XE",
  "48 Leicester Square, London, WC2H 7LU",
  "Tower Bridge Road, London, SE1 2UP",
  "1 Cathedral Square, Glasgow, G1 2EN",
];

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  orderDetails: {
    items: CartItemType[];
    total: number;
    address: string;
    deliveryTime: string;
  };
}

const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  orderDetails
}) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl p-6 max-w-lg w-full"
      >
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Confirm Your Order
          </h3>
          <p className="text-gray-600">
            Please review your order details before confirming
          </p>
        </div>

        <div className="space-y-4 mb-6">
          {/* Order Items */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Order Items:</h4>
            {orderDetails.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.quantity}x {item.name}</span>
                <span>£{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Delivery Details */}
          <div>
            <h4 className="font-medium text-gray-900">Delivery Address:</h4>
            <p className="text-sm text-gray-600">{orderDetails.address}</p>
          </div>

          <div>
            <h4 className="font-medium text-gray-900">Delivery Time:</h4>
            <p className="text-sm text-gray-600">{orderDetails.deliveryTime}</p>
          </div>

          {/* Total */}
          <div className="border-t pt-2">
            <div className="flex justify-between font-medium">
              <span>Total Amount:</span>
              <span>£{orderDetails.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Processing...
              </>
            ) : (
              'Confirm Order'
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const CheckoutPage = () => {
  const { user, isAuthenticated, token } = useAuth();
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
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(timeSlots[0]);
  const [orderNotes, setOrderNotes] = useState("");
  const [showAddressSearch, setShowAddressSearch] = useState(false);
  const [addressSearchQuery, setAddressSearchQuery] = useState("");
  const [filteredAddresses, setFilteredAddresses] = useState(mockUKAddresses);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);

  // Check authentication
  React.useEffect(() => {
    const isGuest = localStorage.getItem('isGuest') === 'true';
    if (!isAuthenticated && !isGuest) {
      toast.error("Please login or continue as guest");
      navigate('/login', { state: { returnUrl: '/checkout' } });
    }
  }, [isAuthenticated, navigate]);

  // Personal details state
  const [personalDetails, setPersonalDetails] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || ""
  });

  // Update the delivery address state initialization
  const [deliveryAddress, setDeliveryAddress] = useState<Address>({
    street: user?.address?.street || "",
    city: user?.address?.city || "",
    state: user?.address?.state || "",
    zipCode: user?.address?.zipCode || "",
    country: "GB"
  });

  // Handle address search
  const handleAddressSearch = (query: string) => {
    setAddressSearchQuery(query);
    const filtered = mockUKAddresses.filter(addr => 
      addr.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredAddresses(filtered);
  };

  // Handle address selection
  const handleAddressSelect = (address: string) => {
    const [street, city, postcode] = address.split(", ");
    setDeliveryAddress(prev => ({
      ...prev,
      street,
      city,
      zipCode: postcode,
      state: city.split(" ")[0], // Simplified for demo
    }));
    setShowAddressSearch(false);
  };

  // Calculate order totals using CartContext methods
  const subtotal = getCartTotal();
  const deliveryFee = getDeliveryFee();
  const tax = getTaxAmount();
  const total = getOrderTotal();

  // Update the validateAddress function
  const validateAddress = (address: Address): boolean => {
    const requiredFields = ['street', 'city', 'state', 'zipCode', 'country'];
    const emptyFields = requiredFields.filter(field => !address[field as keyof Address]?.trim());
    
    if (emptyFields.length > 0) {
      toast.error(`Please fill in all required address fields: ${emptyFields.join(', ')}`);
      return false;
    }
    return true;
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    
    setIsApplyingPromo(true);
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAppliedPromo({ code: promoCode, discount: 10 }); // Mock 10% discount
      toast.success('Promo code applied successfully!');
    } catch (error) {
      toast.error('Invalid promo code');
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedTimeSlot || !deliveryAddress.street || !personalDetails.firstName) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!acceptedTerms) {
      toast.error('Please accept the terms and conditions');
      return;
    }

    if (!selectedBranch?.id) {
      toast.error('Please select a branch first');
      return;
    }

    // Show confirmation modal
    setShowConfirmation(true);
  };

  const handleConfirmOrder = async () => {
    setIsProcessing(true);
    try {
      // Calculate totals
      const subtotal = getCartTotal();
      const deliveryFeeAmount = getDeliveryFee();
      const taxAmount = getTaxAmount();
      const discountAmount = appliedPromo ? (subtotal * appliedPromo.discount) / 100 : 0;
      const finalTotal = subtotal + deliveryFeeAmount + taxAmount - discountAmount;

      // Format products data according to API requirements
      const formattedProducts = cartItems.map(item => {
        const productId = item.productId || item.id;
        
        const selectedAttributes = item.attributes?.map(attr => {
          const selectedChoiceId = item.selectedOptions?.[attr.id];
          return {
            attributeId: attr.id,
            selectedItems: selectedChoiceId ? [
              {
                itemId: selectedChoiceId,
                quantity: 1
              }
            ] : []
          };
        }) || [];

        return {
          product: productId,
          quantity: item.quantity,
          notes: item.specialRequirements || '',
          selectedAttributes
        };
      });

      // Prepare order data according to API schema
      const orderData = {
        branchId: selectedBranch.id,
        products: formattedProducts,
        deliveryMethod: "delivery",
        deliveryAddress: {
          street: deliveryAddress.street,
          city: deliveryAddress.city,
          postalCode: deliveryAddress.zipCode,
          country: deliveryAddress.country
        },
        contactNumber: personalDetails.phone,
        paymentMethod: paymentMethod,
        specialInstructions: orderNotes,
        selectedTimeSlot,
        personalDetails: {
          firstName: personalDetails.firstName,
          lastName: personalDetails.lastName,
          phone: personalDetails.phone
        },
        promoCode: appliedPromo?.code,
        subtotal: subtotal,
        deliveryFee: deliveryFeeAmount,
        tax: taxAmount,
        discount: discountAmount,
        totalAmount: subtotal + deliveryFeeAmount + taxAmount,
        finalTotal: finalTotal
      };

      // Get auth token if user is authenticated
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (isAuthenticated && token) {
        headers.Authorization = `Bearer ${token}`;
      }

      // Call the order creation API
      const response = await axios.post(ORDER_ENDPOINTS.CREATE, orderData, { headers });

      if (response.data?.success) {
        // Clear cart after successful order
        await clearCart();
        
        navigate('/order-success', { 
          state: { 
            orderId: response.data.data.id || response.data.data.orderNumber,
            orderDetails: response.data.data
          } 
        });
        
        toast.success('Order placed successfully!');
      } else {
        throw new Error(response.data?.message || 'Failed to place order');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error('Order placement error:', error);
      toast.error(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
      setShowConfirmation(false);
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gray-50">
      <div className="mx-auto px-4 py-8">
        <motion.div className="max-w-7xl mx-auto">
          {/* Header with Timeline */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Checkout
              </h1>
              <p className="text-gray-600">
                Complete your order in just a few steps
              </p>
            </div>

            {/* Timeline */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-semibold">
                  1
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Order Details</p>
                  <p className="text-xs text-gray-500">Review your items</p>
                </div>
                <div className="w-12 h-1 bg-green-500 mx-4"></div>
              </div>

              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-semibold">
                  2
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Personal Info</p>
                  <p className="text-xs text-gray-500">Delivery details</p>
                </div>
                <div className="w-12 h-1 bg-gray-200 mx-4"></div>
              </div>

              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-semibold">
                  3
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Payment</p>
                  <p className="text-xs text-gray-500">Complete order</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Step 1: Order Details */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-lg mr-3">1</span>
                    Order Details
                  </h2>
                </div>
                <div className="p-6">
                  {/* Time Slot Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Choose your timeslot</label>
                    <select
                      value={selectedTimeSlot}
                      onChange={(e) => setSelectedTimeSlot(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      {timeSlots.map((time) => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>

                  {/* Order Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Add your notes</label>
                    <textarea
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder="Add any special instructions or notes for your order..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[100px]"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Personal Info & Delivery */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-lg mr-3">2</span>
                    Personal Information & Delivery
                  </h2>
                </div>
                <div className="p-6 space-y-6">
                  {/* Personal Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <input
                        type="text"
                        value={personalDetails.firstName}
                        onChange={(e) => setPersonalDetails(prev => ({ ...prev, firstName: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <input
                        type="text"
                        value={personalDetails.lastName}
                        onChange={(e) => setPersonalDetails(prev => ({ ...prev, lastName: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={personalDetails.phone}
                      onChange={(e) => setPersonalDetails(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  {/* Delivery Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Address</label>
                    <button
                      onClick={() => setShowAddressSearch(true)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-left text-gray-600 hover:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      {deliveryAddress.street || "Search for your address"}
                    </button>

                    {showAddressSearch && (
                      <div className="mt-2 border rounded-xl overflow-hidden">
                        <input
                          type="text"
                          value={addressSearchQuery}
                          onChange={(e) => handleAddressSearch(e.target.value)}
                          placeholder="Start typing your address..."
                          className="w-full px-4 py-3 border-b focus:outline-none"
                        />
                        <div className="max-h-60 overflow-y-auto">
                          {filteredAddresses.map((address, index) => (
                            <button
                              key={index}
                              onClick={() => handleAddressSelect(address)}
                              className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                            >
                              {address}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {deliveryAddress.street && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-600">{deliveryAddress.street}</p>
                        <p className="text-sm text-gray-600">{deliveryAddress.city}, {deliveryAddress.state}</p>
                        <p className="text-sm text-gray-600">{deliveryAddress.zipCode}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Cart Items Display */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                  <h2 className="text-lg font-semibold text-gray-900">Order Items ({cartItems.length})</h2>
                </div>
                <div className="p-4">
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                        <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                          {item.images?.[0] ? (
                            <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                              <NoImage />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
                          <p className="text-sm text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                          {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                            <div className="mt-1">
                              {item.attributes?.map(attr => {
                                const selectedChoiceId = item.selectedOptions?.[attr.id];
                                if (!selectedChoiceId) return null;
                                const choice = attr.choices.find(c => c.id === selectedChoiceId);
                                if (!choice) return null;
                                return (
                                  <p key={attr.id} className="text-xs text-gray-500">
                                    {attr.name}: {choice.name}
                                  </p>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">£{(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Payment Method - Compact Version */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-900">Payment Method</h2>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: "card", label: "Card", icon: CreditCard },
                        { id: "cash", label: "Cash", icon: Wallet },
                        { id: "online", label: "Online", icon: Check }
                      ].map(({ id, label, icon: Icon }) => (
                        <button
                          key={id}
                          onClick={() => setPaymentMethod(id)}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            paymentMethod === id
                              ? "border-green-500 bg-green-50 text-green-700"
                              : "border-gray-200 hover:border-green-300 text-gray-600"
                          }`}
                        >
                          <Icon size={20} className="mx-auto mb-1" />
                          <span className="text-xs font-medium">{label}</span>
                        </button>
                      ))}
                    </div>

                    {paymentMethod === 'card' && (
                      <div className="mt-4 space-y-3">
                        <input
                          type="text"
                          value={creditCardDetails.name}
                          onChange={(e) => handleCreditCardChange('name', e.target.value)}
                          placeholder="Card holder name"
                          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={creditCardDetails.number}
                            onChange={(e) => handleCreditCardChange('number', e.target.value.replace(/\D/g, '').slice(0, 16))}
                            placeholder="Card number"
                            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                          <div className="grid grid-cols-2 gap-2">
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
                              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                            <input
                              type="text"
                              value={creditCardDetails.cvc}
                              onChange={(e) => handleCreditCardChange('cvc', e.target.value.replace(/\D/g, '').slice(0, 3))}
                              placeholder="CVC"
                              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Promo Code Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="Enter promo code"
                        className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <button
                        onClick={handleApplyPromo}
                        disabled={isApplyingPromo || !promoCode.trim()}
                        className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isApplyingPromo ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            Applying...
                          </>
                        ) : (
                          'Apply'
                        )}
                      </button>
                    </div>
                    {appliedPromo && (
                      <div className="mt-2 p-2 bg-green-50 text-green-700 rounded-lg text-xs">
                        Promo code "{appliedPromo.code}" applied - {appliedPromo.discount}% off
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Subtotal</span>
                        <span>{formatPrice(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Delivery Fee</span>
                        <span>{formatPrice(deliveryFee)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Tax (5%)</span>
                        <span>{formatPrice(tax)}</span>
                      </div>
                      {appliedPromo && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Discount ({appliedPromo.discount}%)</span>
                          <span>-{formatPrice((subtotal * appliedPromo.discount) / 100)}</span>
                        </div>
                      )}
                      <div className="border-t pt-3">
                        <div className="flex justify-between font-semibold">
                          <span>Total</span>
                          <span className="text-green-600">
                            {formatPrice(total - (appliedPromo ? (subtotal * appliedPromo.discount) / 100 : 0))}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handlePlaceOrder}
                      disabled={isProcessing || !acceptedTerms}
                      className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={18} />
                          Place Order
                        </>
                      )}
                    </button>

                    <div className="mt-3">
                      <label className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          checked={acceptedTerms}
                          onChange={(e) => setAcceptedTerms(e.target.checked)}
                          className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <span className="text-xs text-gray-600">
                          By placing this order you're agreeing to our{' '}
                          <Link to="/terms" className="text-green-600 hover:text-green-700 underline">
                            Terms & Conditions
                          </Link>
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Order Confirmation Modal */}
      <OrderConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmOrder}
        isLoading={isProcessing}
        orderDetails={{
          items: cartItems,
          total: getOrderTotal(),
          address: `${deliveryAddress.street}, ${deliveryAddress.city}, ${deliveryAddress.zipCode}`,
          deliveryTime: selectedTimeSlot
        }}
      />
    </motion.div>
  );
};

export default CheckoutPage; 