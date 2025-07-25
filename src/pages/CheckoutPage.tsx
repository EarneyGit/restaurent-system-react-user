import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Clock,
  CreditCard,
  Wallet,
  Check,
  ShoppingBag,
  ArrowLeft,
  Image as ImageIcon,
  Plus,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import DeliveryAddressForm from "@/components/cart/DeliveryAddressForm";
import { useBranch } from "@/context/BranchContext";
import axios from "@/config/axios.config";
import { CartItem as CartItemType } from "@/context/CartContext";
import { CART_ENDPOINTS, ORDER_ENDPOINTS, BASE_URL } from "@/config/api.config";
import { useGuestCart } from "@/context/GuestCartContext";
import { Address, searchAddresses } from "@/data/addresses";
import { Search, MapPin, Loader2, AlertCircle, X } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51OqX8X2eZvKYlo2C1gQJ8X8X');

// Check if Stripe is properly configured
if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
  console.warn('Stripe publishable key is missing. Using test key.');
}

// Validate that we're using a publishable key (starts with pk_)
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51OqX8X2eZvKYlo2C1gQJ8X8X';
if (stripeKey && !stripeKey.startsWith('pk_')) {
  console.error('Invalid Stripe key format. Expected publishable key (pk_*), got:', stripeKey);
}

// Stripe Form Component
const StripeForm: React.FC<{ clientSecret: string; orderId: string; onSuccess: () => void; onCancel: () => void }> = ({ 
  clientSecret, 
  orderId, 
  onSuccess, 
  onCancel 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayNow = async () => {
    if (!stripe || !elements) {
      setError('Payment system not ready. Please refresh and try again.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + `/order-status/${orderId}`,
        },
        redirect: 'if_required',
      });
      
      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment succeeded, check payment status with our API
        await checkPaymentStatus(orderId, onSuccess);
      } else if (paymentIntent && paymentIntent.status === 'requires_payment_method') {
        // Payment requires additional action or was not confirmed
        setError('Payment was not completed. Please try again.');
      } else {
        setError('Payment failed. Please try again.');
      }
    } catch (err) {
      setError('Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    // Just close the modal without calling cancel order API
    onCancel();
  };

  // Function to check payment status
  const checkPaymentStatus = async (orderId: string, onSuccess: () => void) => {
    try {
      const response = await axios.post('/api/orders/check-payment-status', { orderId });
      
      if (response.data?.success) {
        const { orderStatus, message } = response.data.data;
        
        if (orderStatus === 'processing' || orderStatus === 'completed') {
          toast.success('Payment successful!');
          onSuccess();
        } else if (orderStatus === 'cancelled') {
          toast.error('Payment failed. Order cancelled.');
          navigate(`/order-failure/${orderId}`);
        } else {
          toast.error(message || 'Payment status unclear. Please contact support.');
          navigate(`/order-failure/${orderId}`);
        }
      } else {
        toast.error('Failed to verify payment status.');
        navigate(`/order-failure/${orderId}`);
      }
    } catch (err) {
      console.error('Error checking payment status:', err);
      toast.error('Failed to verify payment status.');
      navigate(`/order-failure/${orderId}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Complete Payment</h3>
        <PaymentElement />
      </div>
      {error && <div className="text-red-600 text-sm text-center">{error}</div>}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={handleCancel}
          className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handlePayNow}
          disabled={isLoading}
          className="flex-1 px-4 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Processing...
            </>
          ) : (
            "Pay Now"
          )}
        </button>
      </div>
    </div>
  );
};

// Stripe Modal Component
const StripeModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  orderId: string | null;
  clientSecret: string | null;
  onPaymentSuccess: (orderId: string) => void;
  onPaymentCancel: (orderId: string) => void;
}> = ({ isOpen, onClose, orderId, clientSecret, onPaymentSuccess, onPaymentCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setLoading(false);
    }
  }, [isOpen]);

  const handleCancel = async () => {
    // Just close the modal without calling cancel order API
    onClose();
  };

  const handlePaymentSuccess = () => {
    if (orderId) {
      onPaymentSuccess(orderId);
    }
  };

  const handlePaymentCancel = () => {
    if (orderId) {
      onPaymentCancel(orderId);
    }
  };

  if (!isOpen) {
    return null;
  }



  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        {loading ? (
          <div className="text-center">
            <Loader2 size={32} className="animate-spin text-green-600 mx-auto mb-4" />
            <p>Processing...</p>
          </div>
        ) : clientSecret ? (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <StripeForm 
              clientSecret={clientSecret} 
              orderId={orderId!} 
              onSuccess={handlePaymentSuccess}
              onCancel={onClose}
            />
          </Elements>
        ) : (
          <div className="text-center">
            <div className="text-red-600 text-sm mb-4 p-3 bg-red-50 rounded-lg">
              Invalid payment configuration. Please try again.
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="flex-1 px-4 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface AddressResult {
  postcode: string;
  post_town: string;
  thoroughfare: string;
  building_number: string;
  building_name: string;
  line_1: string;
  line_2: string;
  line_3: string;
  premise: string;
  longitude: number;
  latitude: number;
  country: string;
  county: string;
  district: string;
  ward: string;
  id: string;
  dataset: string;
}

type Addresses = {
  street: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  fullAddress: string;
};

// Update the NoImage component to be more cart-friendly
const NoImage = () => (
  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-400">
    <div className="rounded-lg p-2">
      <ImageIcon size={24} />
    </div>
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
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
  }).format(amount);
};

interface CartData {
  subtotal: number;
  deliveryFee: number;
  taxRate: number;
  itemCount: number;
  serviceCharges?: {
    totalMandatory: number;
    totalOptional: number;
    totalAll: number;
    breakdown: Array<{
      name: string;
      amount: number;
      type: string;
    }>;
  };
}

interface OrderTotals {
  subtotal: number;
  attributesTotal: number;
  deliveryFee: number;
  taxAmount: number;
  taxRate: number;
  mandatoryCharges: number;
  optionalCharges: number;
  discountAmount: number;
  totalSavings: number;
  total: number;
}

// Calculate total price for an item including options
const calculateItemTotal = (item: CartItemType) => {
  if (typeof item.itemTotal === "number") {
    return item.itemTotal;
  }

  if (isPriceObject(item.price)) {
    // Include attributes in total calculation
    return item.price.total * item.quantity;
  }

  if (typeof item.price === "number") {
    let itemTotal: number = item.price;

    // Add option prices if they exist
    if (item.selectedOptions && item.attributes) {
      item.attributes.forEach((attr) => {
        const selectedChoiceId = item.selectedOptions?.[attr.id];
        if (selectedChoiceId) {
          const choice = attr.choices.find((c) => c.id === selectedChoiceId);
          if (choice) {
            itemTotal += choice.price;
          }
        }
      });
    }

    return itemTotal * item.quantity;
  }

  return 0;
};

// Helper for safe item total calculation
function getItemTotal(item: CartItemType): number {
  return calculateItemTotal(item);
}

// Calculate order totals using CartContext methods
const calculateOrderTotals = (
  cartData: CartData,
  items: CartItemType[],
  promoDiscountAmount?: number
): OrderTotals => {
  // Calculate base subtotal from items
  const subtotal = items.reduce(
    (total, item) =>
      total +
      (isPriceObject(item.price)
        ? item.price.currentEffectivePrice * item.quantity
        : 0),
    0
  );

  // Calculate attributes total
  const attributesTotal = items.reduce(
    (total, item) =>
      total +
      (isPriceObject(item.price) ? item.price.attributes * item.quantity : 0),
    0
  );

  // Get delivery fee from cart response
  const deliveryFee = cartData.deliveryFee || 0;

  // Calculate tax if rate is provided
  const taxRate = cartData.taxRate || 0;
  const taxAmount = (subtotal * taxRate) / 100;

  // Get service charges
  const mandatoryCharges = cartData.serviceCharges?.totalMandatory || 0;
  const optionalCharges = cartData.serviceCharges?.totalOptional || 0;

  // Calculate total savings
  const totalSavings = items.reduce(
    (total, item) =>
      total +
      (isPriceObject(item.price)
        ? (item.price.base - item.price.currentEffectivePrice) * item.quantity
        : 0),
    0
  );

  // Use actual discount amount from API response
  const discountAmount = promoDiscountAmount || 0;

  // Calculate final total
  const total =
    subtotal +
    attributesTotal +
    deliveryFee +
    taxAmount +
    mandatoryCharges +
    optionalCharges -
    discountAmount;

  return {
    subtotal,
    attributesTotal,
    deliveryFee,
    taxAmount,
    taxRate,
    mandatoryCharges,
    optionalCharges,
    discountAmount,
    totalSavings,
    total,
  };
};

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
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
      const time = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
      slots.push(time);
    }
  }
  return slots;
};

const timeSlots = generateTimeSlots();

interface PriceObject {
  base: number;
  attributes: number;
  total: number;
}

// Add the type guard function
function isPriceObject(price: unknown): price is PriceObject {
  return (
    price !== null &&
    typeof price === "object" &&
    "base" in price &&
    "attributes" in price &&
    "total" in price
  );
}

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  orderDetails: {
    items: CartItemType[];
    total: number;
    originalTotal?: number;
    discountAmount?: number;
    address: string;
    deliveryTime: string;
  };
}

const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  orderDetails,
}) => {
  const { formatCurrency } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full">
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
                <span>
                  {item.quantity}x {item.name}
                </span>
                <span>{formatCurrency(item.price.total)}</span>
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
          <div className="border-t pt-2 space-y-2">
            {orderDetails.originalTotal && orderDetails.discountAmount && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span>{formatCurrency(orderDetails.originalTotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount:</span>
                  <span>-{formatCurrency(orderDetails.discountAmount)}</span>
                </div>
              </>
            )}
            <div className="flex justify-between font-medium">
              <span>Total Amount:</span>
              <span className="text-green-600">{formatCurrency(orderDetails.total)}</span>
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
              "Confirm Order"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const CheckoutPage = () => {
  const { user, isAuthenticated, token } = useAuth();
  const { selectedBranch } = useBranch();
  const [paymentMethod, setPaymentMethod] = useState("card");
  const navigate = useNavigate();
  const { cartItems, formatCurrency, clearCart } = useCart();
  const { sessionId } = useGuestCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(timeSlots[0]);
  const [orderNotes, setOrderNotes] = useState("");
  const [showAddressSearch, setShowAddressSearch] = useState(false);
  const [addressSearchQuery, setAddressSearchQuery] = useState("");
  const [filteredAddresses, setFilteredAddresses] = useState<Address[]>([]);
  const [addressSearchResults, setAddressSearchResults] = useState<AddressResult[]>([]);
  const [isAddressLoading, setIsAddressLoading] = useState(false);
  const [addressError, setAddressError] = useState<string>('');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [selectedAddressType, setSelectedAddressType] = useState<'user' | 'delivery' | 'search'>('user');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<{
    discountId: string;
    code: string;
    name: string;
    discountType: string;
    discountValue: number;
    discountAmount: number;
    originalTotal: number;
    newTotal: number;
    savings: number;
  } | null>(null);
  const [cartSummary, setCartSummary] = useState({
    subtotal: 0,
    deliveryFee: 0,
    total: 0,
    itemCount: 0,
    taxRate: 0,
    serviceCharges: {
      totalMandatory: 0,
      totalOptional: 0,
      totalAll: 0,
      breakdown: [],
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const addressDropdownRef = useRef<HTMLDivElement>(null);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [selectedSearchedAddress, setSelectedSearchedAddress] = useState<AddressResult | null>(null);

  // Stripe modal state
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);



  const [creditCardDetails, setCreditCardDetails] = useState<CreditCardDetails>(
    {
      number: "",
      expiry: "",
      cvc: "",
      name: "",
    }
  );

  const handleCreditCardChange = (
    field: keyof CreditCardDetails,
    value: string
  ) => {
    setCreditCardDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  useEffect(() => {
    if (selectedAddressType === 'user' && user?.address) {
       setAddressError('')
    }
  }, [selectedAddressType]);

  // Fetch cart summary
  useEffect(() => {
    const fetchCartSummary = async () => {
      try {
        const headers = isAuthenticated
          ? {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            }
          : {
              "x-session-id": sessionId,
              "Content-Type": "application/json",
            };

        // First get cart data
        const cartResponse = await axios.get(
          isAuthenticated
            ? CART_ENDPOINTS.USER_CART
            : CART_ENDPOINTS.GUEST_CART,
          { headers }
        );

        if (!cartResponse.data?.data) {
          throw new Error("Failed to fetch cart data");
        }

        const cartData: CartData = cartResponse.data.data;

        // Get service charges from cart response
        const serviceCharges = {
          totalMandatory: cartData.serviceCharges?.totalMandatory || 0,
          totalOptional: cartData.serviceCharges?.totalOptional || 0,
          totalAll: cartData.serviceCharges?.totalAll || 0,
          breakdown: cartData.serviceCharges?.breakdown || [],
        };

        // Calculate all totals
        const totals = calculateOrderTotals(
          cartData,
          cartItems,
          appliedPromo?.discountAmount
        );

        setCartSummary({
          subtotal: totals.subtotal,
          deliveryFee: totals.deliveryFee,
          total: totals.total,
          itemCount: cartData.itemCount || cartItems.length,
          taxRate: totals.taxRate,
          serviceCharges,
        });
      } catch (error) {
        console.error("Error fetching cart summary:", error);
        toast.error("Failed to fetch cart details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCartSummary();
  }, [
    isAuthenticated,
    token,
    sessionId,
    cartItems,
    selectedBranch?.id,
    appliedPromo?.discountAmount,
  ]);

  // Check authentication
  React.useEffect(() => {
    const isGuest = localStorage.getItem("isGuest") === "true";
    if (!isAuthenticated && !isGuest) {
      localStorage.setItem("returnUrl", "/checkout");
      toast.error("Please login or continue as guest to proceed");
      navigate("/login", { state: { returnUrl: "/checkout" } });
    }
  }, [isAuthenticated, navigate]);

  // Personal details state
  const [personalDetails, setPersonalDetails] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
    email: user?.email || "",
  });

  // Update personal details when user data changes
  useEffect(() => {
    if (user) {
      setPersonalDetails({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        email: user.email || "",
      });
    }
  }, [user]);

  // Helper function to parse full address into components
  // ✅ Helper: Parse full string address like "Street, City, Postcode, [State?]"
const parseFullAddress = (fullAddress: string) => {
  const parts = fullAddress.split(',').map(part => part.trim());

  return {
    street: parts[0] || '',
    city: parts[1] || '',
    postcode: parts[2] || '',
    state: parts[3] || '',
    country: 'GB',
    fullAddress
  };
};

// ✅ Helper: Format full address from parts
const formatFullAddress = (street: string, city: string, postcode: string) => {
  return [street, city, postcode].filter(Boolean).join(', ');
};

// ✅ useState based on user.address string
const [deliveryAddress, setDeliveryAddress] = useState<Addresses>(() => {
  // 1. If user has address (as string), parse it
  if (user?.address && typeof user.address === 'string') {
    setSelectedAddressType('user');
    const parsed = parseFullAddress(user.address);
    return parsed;
  }

  // 2. Try from localStorage
  const storedAddress = localStorage.getItem('deliveryAddress');
  if (storedAddress) {
    try {
      const parsedAddress = JSON.parse(storedAddress);
      setSelectedAddressType('delivery');
      return parsedAddress;
    } catch (e) {
      console.error('Error parsing stored address:', e);
    }
  }

  // 3. Fallback default
  return {
    street: '',
    city: '',
    state: '',
    postcode: '',
    country: 'GB',
    fullAddress: '',
  };
});

  // Update delivery address when user data changes
  useEffect(() => {
    // Only update if we don't already have a valid address
    if (!deliveryAddress.street && !deliveryAddress.city && !deliveryAddress.postcode) {
      const storedAddress = localStorage.getItem("deliveryAddress");
      if (storedAddress) {
        try {
          const parsedAddress = JSON.parse(storedAddress);
          // Ensure the address has proper formatting
          if (parsedAddress.fullAddress) {
            const parsedComponents = parseFullAddress(parsedAddress.fullAddress);
            const updatedAddress = {
              ...parsedAddress,
              ...parsedComponents
            };
            setDeliveryAddress(updatedAddress);
          } else {
            setDeliveryAddress(parsedAddress);
          }
        } catch (e) {
          console.error("Error parsing stored address:", e);
        }
      } else if (user?.address && typeof user.address === 'string') {
        // Only parse user address if it's a string and we don't have an address yet
        const parsed = parseFullAddress(user.address);
        setDeliveryAddress(parsed);
        setSelectedAddressType('user');
      }
    }
  }, [user, deliveryAddress.street, deliveryAddress.city, deliveryAddress.postcode]);

  // Add click outside handler and cleanup timeout
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        addressDropdownRef.current &&
        !addressDropdownRef.current.contains(event.target as Node)
      ) {
        setShowAddressSearch(false);
      }
    };

    if (showAddressSearch) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [showAddressSearch, searchTimeout]);

  // Address search function with API integration
  const handleAddressSearch = (query: string) => {
    setAddressSearchQuery(query);
    
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout for debounced search
    const timeout = setTimeout(async () => {
      if (query.trim().length >= 3) {
        await searchAddressesAPI(query);
      } else {
        setAddressSearchResults([]);
        setShowAddressSearch(false);
      }
    }, 500);

    setSearchTimeout(timeout);
  };

  const searchAddressesAPI = async (query: string) => {
    try {
      setIsAddressLoading(true);
      setAddressError('');
      
      // Try to search by postcode first
      const cleanQuery = query.trim().toUpperCase().replace(/\s+/g, '');
      const response = await axios.get(`/api/addresses/postcode/${cleanQuery}`);
      
      if (response.data.success && response.data.data) {
        setAddressSearchResults(response.data.data);
        setShowAddressSearch(true);
      } else {
        setAddressSearchResults([]);
        setShowAddressSearch(false);
      }
    } catch (error: unknown) {
      console.error('Error searching addresses:', error);
      setAddressSearchResults([]);
      setShowAddressSearch(false);
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to search addresses';
      setAddressError(errorMessage);
    } finally {
      setIsAddressLoading(false);
    }
  };

  // Handle address selection from API results
  const handleAddressSelect = (address: AddressResult) => {
    const street = address.line_1 || `${address.building_number} ${address.thoroughfare}`.trim();
    const city = address.post_town || '';
    const postcode = address.postcode || '';
    
    const fullAddress = formatFullAddress(street, city, postcode);
    
    const formattedAddress: Address = {
      street,
      city,
      state: address.county || '',
      postcode,
      country: address.country || 'GB',
      fullAddress,
    };
    
    setDeliveryAddress(formattedAddress);
    setAddressSearchQuery(formattedAddress.fullAddress);
    setShowAddressSearch(false);
    setShowSearchInput(false);
    setSelectedAddressType('search');
    setSelectedSearchedAddress(address);
    // Update localStorage with the new address
    localStorage.setItem("deliveryAddress", JSON.stringify(formattedAddress));
  };

  const handleClearSearchedAddress = () => {
    setSelectedSearchedAddress(null);
    setDeliveryAddress({ street: '', city: '', state: '', postcode: '', country: '', fullAddress: '' });
    setAddressSearchQuery('');
    setSelectedAddressType('user');
  };

  // Handle user address selection
  const handleUserAddressSelect = () => {
    if (user?.address && typeof user.address === 'string') {
      const parsed = parseFullAddress(user.address);
      setDeliveryAddress(parsed);
      setSelectedAddressType('user');
      localStorage.setItem("deliveryAddress", JSON.stringify(parsed));
    }
  };

  // Handle delivery address selection
  const handleDeliveryAddressSelect = () => {
    const storedAddress = localStorage.getItem("deliveryAddress");
    if (storedAddress) {
      try {
        const parsedAddress = JSON.parse(storedAddress);
        // Ensure the address has proper formatting
        if (parsedAddress.fullAddress) {
          const parsedComponents = parseFullAddress(parsedAddress.fullAddress);
          const updatedAddress = {
            ...parsedAddress,
            ...parsedComponents
          };
          setDeliveryAddress(updatedAddress);
        } else {
          setDeliveryAddress(parsedAddress);
        }
        setSelectedAddressType('delivery');
      } catch (e) {
        console.error("Error parsing stored address:", e);
      }
    }
  };

  // Handle search for new address
  const handleSearchAddressSelect = () => {
    setSelectedAddressType('search');
    setShowSearchInput(true);
    setSelectedSearchedAddress(null);
    setDeliveryAddress({ street: '', city: '', state: '', postcode: '', country: '', fullAddress: '' });
    setAddressSearchQuery('');
  };

  // Calculate order totals using CartContext methods
  const subtotal = cartSummary.subtotal;
  const deliveryFee = cartSummary.deliveryFee;
  const total = cartSummary.total;

  // Update the validateAddress function
  const validateAddress = (address: Address): boolean => {
    const requiredFields = ["street", "city", "state", "postcode", "country"];
    const emptyFields = requiredFields.filter(
      (field) => !address[field as keyof Address]?.trim()
    );

    if (emptyFields.length > 0) {
      toast.error(
        `Please fill in all required address fields: ${emptyFields.join(", ")}`
      );
      return false;
    }
    return true;
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;

    if (!selectedBranch?.id) {
      toast.error("Please select a branch first");
      return;
    }

    setIsApplyingPromo(true);
    try {
      // Calculate current order total for validation
      const currentOrderTotal = cartItems.reduce(
        (total, item) =>
          total +
          (isPriceObject(item.price)
            ? item.price.total * item.quantity
            : 0),
        0
      ) + cartSummary.deliveryFee + (cartSummary.serviceCharges?.totalAll || 0);

      // Get delivery method from localStorage
      const deliveryMethod = localStorage.getItem("deliveryMethod") || "delivery";

      // Prepare validation request
      const validationData = {
        code: promoCode.trim(),
        branchId: selectedBranch.id,
        orderTotal: currentOrderTotal,
        deliveryMethod: deliveryMethod === "deliver" ? "delivery" : deliveryMethod === "collect" ? "pickup" : "dine_in",
        orderType: deliveryMethod === "deliver" ? "delivery" : deliveryMethod === "collect" ? "pickup" : "dine_in",
        userId: user?._id || null
      };

      // Make API call to validate discount
      const response = await axios.post(
        "/api/discounts/validate", 
        validationData,
        {
          headers: {
            "Content-Type": "application/json",
          }
        }
      );

      if (response.data?.success && response.data?.data) {
        const discountData = response.data.data;
        setAppliedPromo({
          discountId: discountData.discountId,
          code: discountData.code,
          name: discountData.name,
          discountType: discountData.discountType,
          discountValue: discountData.discountValue,
          discountAmount: discountData.discountAmount,
          originalTotal: discountData.originalTotal,
          newTotal: discountData.newTotal,
          savings: discountData.savings
        });
        toast.success(response.data.message || "Promo code applied successfully!");
      } else {
        setAppliedPromo(null);
        throw new Error("Invalid promo code");
      }
    } catch (error: unknown) {
      console.error("Promo code validation error:", error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = "Invalid promo code";
      toast.error(errorMessage);
      setAppliedPromo(null);
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (
      !selectedTimeSlot ||
      !deliveryAddress.fullAddress ||
      !personalDetails.firstName
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!acceptedTerms) {
      toast.error("Please accept the terms and conditions");
      return;
    }

    if (!selectedBranch?.id) {
      toast.error("Please select a branch first");
      return;
    }

    // Show confirmation modal
    setShowConfirmation(true);
  };

  const handleConfirmOrder = async () => {
    setIsProcessing(true);
    try {
      if (!selectedBranch?.id) {
        toast.error("Please select a branch first");
        navigate("/outlet-selection");
        return;
      }

      // Validate required fields
      if (
        !personalDetails.firstName ||
        !personalDetails.phone ||
        !deliveryAddress.fullAddress
      ) {
        toast.error("Please fill in all required fields");
        setIsProcessing(false);
        return;
      }
      // Format products data according to backend requirements
      const formattedProducts = cartItems.map((item) => {
        const productId = item.productId || item.id;

        // Use selectedAttributes from cart if present, fallback to reconstructing
        const selectedAttributes =
          item.selectedAttributes && Array.isArray(item.selectedAttributes)
            ? item.selectedAttributes
            : (
                item.attributes?.map((attr) => {
                  const selectedChoiceId = item.selectedOptions?.[attr.id];
                  return {
                    attributeId: attr.id,
                    selectedItems: selectedChoiceId
                      ? [
                          {
                            itemId: selectedChoiceId,
                            quantity: 1,
                          },
                        ]
                      : [],
                  };
                }) || []
              );

        return {
          product: productId,
          quantity: item.quantity,
          price: item.price,
          notes: item.specialRequirements || "",
          selectedAttributes,
        };
      });

      // Use the originalTotal and newTotal from discount validation if available
      let subtotal, deliveryFeeAmount, taxAmount, discountAmount, finalTotal;
      
      if (appliedPromo && appliedPromo.originalTotal && appliedPromo.newTotal) {
        // Use values from discount validation API
        subtotal = appliedPromo.originalTotal - cartSummary.deliveryFee; // Subtract delivery fee to get items subtotal
        deliveryFeeAmount = cartSummary.deliveryFee;
        taxAmount = 0; // Tax is typically included in the originalTotal
        discountAmount = appliedPromo.discountAmount;
        finalTotal = appliedPromo.newTotal;
      } else {
        // Fallback to manual calculation
        subtotal = cartSummary.subtotal;
        deliveryFeeAmount = cartSummary.deliveryFee;
        taxAmount = 0;
        discountAmount = appliedPromo ? appliedPromo.discountAmount : 0;
        finalTotal = subtotal + deliveryFeeAmount + taxAmount - discountAmount;
      }

      // Get deliveryMethod from localStorage and determine orderType
      const deliveryMethod = localStorage.getItem("deliveryMethod");
      let orderType = "dine_in"; // default value

      if (deliveryMethod === "deliver") {
        orderType = "delivery";
      } else if (deliveryMethod === "collect") {
        orderType = "pickup";
      }

      // Prepare order data according to backend schema
      const orderData = {
        branchId: selectedBranch.id,
        products: formattedProducts,
        deliveryMethod: orderType,
        deliveryAddress:
          orderType === "delivery"
            ? {
                street: deliveryAddress.street,
                city: deliveryAddress.city,
                postalCode: deliveryAddress.postcode,
                country: deliveryAddress.country || "GB",
              }
            : undefined,
        contactNumber: personalDetails.phone,
        paymentMethod: paymentMethod === "cash" ? "cash_on_delivery" : paymentMethod,
        specialInstructions: orderNotes,
        selectedTimeSlot,
        personalDetails: {
          firstName: personalDetails.firstName,
          lastName: personalDetails.lastName,
          phone: personalDetails.phone,
          email: personalDetails.email,
        },
        couponCode: appliedPromo?.code,
        subtotal,
        deliveryFee: deliveryFeeAmount,
        tax: taxAmount,
        discount: discountAmount,
        totalAmount: appliedPromo?.originalTotal || (subtotal + deliveryFeeAmount + taxAmount), // Use originalTotal from API
        finalTotal: finalTotal,
        status: "pending", // Set initial status
      };

      // Set up headers based on authentication status
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (isAuthenticated && token) {
        headers.Authorization = `Bearer ${token}`;
      } else if (sessionId) {
        headers["x-session-id"] = sessionId;
      }

      // Make the API call with branchId in query params
      const response = await axios.post(
        `${ORDER_ENDPOINTS.CREATE}?branchId=${selectedBranch.id}`,
        orderData,
        { headers }
      );

              if (response.data?.success && response.data?.data) {
          const createdOrder = response.data.data;

          // If payment method is card, show Stripe modal
          if (paymentMethod === "card") {
            // Extract clientSecret from the order creation response
            const clientSecret = response.data.payment?.clientSecret;
            
            if (!clientSecret) {
              toast.error("Failed to create payment intent. Please try again.");
              setIsProcessing(false);
              return;
            }

            // Validate client secret format
            if (!clientSecret.includes('_secret_')) {
              toast.error("Invalid payment configuration. Please try again.");
              setIsProcessing(false);
              return;
            }
            

            
            setCreatedOrderId(createdOrder._id);
            setStripeClientSecret(clientSecret);
            setShowStripeModal(true);
            setShowConfirmation(false);
            setIsProcessing(false);
            return;
          } else {
            // For cash payments, proceed normally
            // Clear cart
            await clearCart();

            // Store necessary data for order tracking
            localStorage.setItem("selectedBranchId", selectedBranch.id);

            // Navigate to order status with complete order details
            navigate(`/order-status/${createdOrder._id}`, {
              state: {
                orderDetails: {
                  ...createdOrder,
                  branchId: {
                    _id: selectedBranch.id,
                    name: selectedBranch.name,
                  },
                },
              },
              replace: true, // Prevent back navigation to checkout
            });

            setShowConfirmation(false);
            toast.success("Order placed successfully!");
          }
        } else {
          throw new Error(response.data?.message || "Failed to create order");
        }
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string }; status?: number };
      };
      console.error("Order placement error:", error);

      // Handle specific error cases
      if (err.response?.status === 401) {
        localStorage.setItem("returnUrl", "/checkout");
        toast.error("Please login or continue as guest to place your order");
        navigate("/login", { state: { returnUrl: "/checkout" } });
      } else if (err.response?.status === 400) {
        // Handle validation errors
        toast.error(
          err.response.data?.message || "Please check your order details"
        );
      } else if (err.response?.status === 500) {
        // Handle server errors
        toast.error("Server error. Please try again later.");
      } else {
        toast.error(
          err.response?.data?.message ||
            "Failed to place order. Please try again."
        );
      }
    } finally {
      setIsProcessing(false);
      setShowConfirmation(false);
    }
  };

  // Handle empty cart
  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 pb-10 bg-gradient-to-br from-green-50 via-white to-green-50">
        <div className="max-w-md w-full text-center">
          <div className="relative w-64 h-64 mx-auto bg-white">
            <img
              src="/not-found.png"
              alt="Empty cart"
              className="w-full h-full object-contain"
            />
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            Unable to proceed to checkout
          </h2>

          <p className="text-gray-600 text-base mb-6 max-w-sm mx-auto">
            Looks like your cart is empty. Please add items to your cart before
            proceeding to checkout.
          </p>
        </div>
      </div>
    );
  }

  // Filter valid addresses for search results
  const validAddressSearchResults = addressSearchResults.filter(addr => (
    addr.line_1 || addr.thoroughfare || addr.post_town || addr.postcode
  ));

  // Helper to format address as string
  function formatAddress(addr: Address | string | { street?: string; city?: string; state?: string; zipCode?: string; postcode?: string; country?: string }): string {
    if (!addr) return '';
    if (typeof addr === 'string') return addr;
    if (typeof addr === 'object') {
      // Try to join known fields
      const addressObj = addr as { street?: string; city?: string; state?: string; zipCode?: string; postcode?: string; country?: string };
      const fields = [
        addressObj.street, 
        addressObj.city, 
        addressObj.state, 
        addressObj.zipCode || addressObj.postcode, 
        addressObj.country
      ];
      return fields.filter(Boolean).join(', ');
    }
    return '';
  }

  // Payment success handler
  const handlePaymentSuccess = (orderId: string) => {
    setShowStripeModal(false);
    setStripeClientSecret(null);
    setCreatedOrderId(null);
    // Clear cart
    clearCart();
    // Navigate to order status
    navigate(`/order-status/${orderId}`, {
      state: {
        orderDetails: {
          _id: orderId,
          status: "processing", // Order moves to processing after successful payment
          branchId: {
            _id: selectedBranch?.id || "",
            name: selectedBranch?.name || "",
          },
        },
      },
    });
  };

  // Payment cancel handler
  const handlePaymentCancel = (orderId: string) => {
    setShowStripeModal(false);
    setStripeClientSecret(null);
    setCreatedOrderId(null);
    // Just close the modal, don't redirect to failure page
    toast.info("Payment cancelled. You can try again later.");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Add Header with Back Button */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
            <p className="text-gray-500">
              Complete your order in just a few steps
            </p>
          </div>
          <button
            onClick={() => navigate("/cart")}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Checkout Steps */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Order Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-lg mr-3">
                    1
                  </span>
                  Order Details
                </h2>
              </div>
              <div className="p-6">
                {/* Time Slot Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choose your timeslot
                  </label>
                  <select
                    value={selectedTimeSlot}
                    onChange={(e) => setSelectedTimeSlot(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 "
                  >
                    {timeSlots.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Order Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add your notes
                  </label>
                  <textarea
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Add any special instructions or notes for your order..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200  min-h-[100px]"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Personal Info & Delivery */}
            <div className="relative z-0">
              {" "}
              {/* Ensures stacking context */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-visible">
                {" "}
                {/* changed overflow-hidden → overflow-visible */}
                <div className="p-6 border-b border-gray-100 bg-gray-50">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-lg mr-3">
                      2
                    </span>
                    Personal Information & Delivery
                  </h2>
                </div>
                <div className="p-6 space-y-6">
                  {/* Personal Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={personalDetails.firstName}
                        onChange={(e) =>
                          setPersonalDetails((prev) => ({
                            ...prev,
                            firstName: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 rounded-xl border border-gray-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={personalDetails.lastName}
                        onChange={(e) =>
                          setPersonalDetails((prev) => ({
                            ...prev,
                            lastName: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 rounded-xl border border-gray-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={personalDetails.phone}
                      onChange={(e) =>
                        setPersonalDetails((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 rounded-xl border border-gray-200"
                    />
                  </div>

                  {/* Delivery Address */}
                  <div className="relative z-30">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Delivery Address <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleSearchAddressSelect}
                        className="flex items-center gap-2 text-xs font-bold bg-green-600 text-white px-2.5 py-2 rounded-lg  hover:bg-green-700 transition"
                      >
                        <Plus size={16} /> Search new address
                      </button>
                    </div>
                    {/* Saved Address Card */}
                    {user?.address && (
                      <div className={`border rounded-xl p-4 mb-4 shadow-sm transition-all ${selectedAddressType === 'user' ? 'border-gray-300 bg-gray-100' : 'border-gray-200 bg-white'}`}>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="addressType"
                            checked={selectedAddressType === 'user'}
                            onChange={handleUserAddressSelect}
                            className="accent-gray-700 h-4 w-4"
                          />
                          <div>

                            <div className="font-semibold text-gray-900">Use my saved address</div>
                            <div className="text-gray-700">
                              {user?.address ? deliveryAddress.fullAddress : ""}
                            </div>
                          </div>
                        </label>
                      </div>
                    )}
                    {/* Address Search - Only show when search is selected */}
                    {showSearchInput && (
                      <div ref={addressDropdownRef} className="relative mb-4">
                        <div className="relative">
                          <input
                            type="text"
                            value={addressSearchQuery}
                            onChange={(e) => handleAddressSearch(e.target.value)}
                            placeholder="Search by postcode or address..."
                            className="w-full px-4 py-3 pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                            {isAddressLoading ? (
                              <Loader2 size={20} className="text-gray-400 animate-spin" />
                            ) : (
                              <Search size={20} className="text-gray-400" />
                            )}
                          </div>
                        </div>
                        {/* Error Message */}
                        {addressError && (
                          <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                            <AlertCircle size={16} className="flex-shrink-0" />
                            <span>{addressError}</span>
                          </div>
                        )}
                        {/* Only show dropdown if there are valid results and no error */}
                        {showAddressSearch && validAddressSearchResults.length > 0 && !addressError && (
                          <div className="absolute z-50 w-full max-h-60 overflow-y-auto mt-1 bg-white border border-gray-200 rounded-xl shadow-lg">
                            {validAddressSearchResults.map((result, index) => (
                              <button
                                key={index}
                                onClick={() => handleAddressSelect(result)}
                                className="w-full px-4 py-3 hover:bg-gray-50 cursor-pointer text-left border-b border-gray-100 last:border-b-0"
                              >
                                <div className="flex items-start gap-3">
                                  <MapPin size={16} className="text-green-500 mt-1 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-gray-900 truncate">
                                      {formatFullAddress(
                                        result.line_1 || `${result.building_number} ${result.thoroughfare}`.trim(),
                                        result.post_town || '',
                                        result.postcode || ''
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {/* Only show the selected searched address card if a valid address is selected from search */}
                    {selectedSearchedAddress && selectedAddressType === 'search' && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-xl flex items-start gap-2 relative">
                        <MapPin size={18} className="text-green-500 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {formatFullAddress(
                              selectedSearchedAddress.line_1 || `${selectedSearchedAddress.building_number} ${selectedSearchedAddress.thoroughfare}`.trim(),
                              selectedSearchedAddress.post_town || '',
                              selectedSearchedAddress.postcode || ''
                            )}
                          </p>
                        </div>
                        <button
                          onClick={handleClearSearchedAddress}
                          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Update Cart Items Display */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900">
                  Order Items ({cartItems.length})
                </h2>
              </div>
              <div className="p-4">
                <div className="space-y-3 max-h-[300px] ">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0"
                    >
                      <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                        {item.images?.[0] ? (
                          <img
                            src={
                              item.images[0].startsWith("http")
                                ? item.images[0]
                                : `${BASE_URL}${item.images[0]}`
                            }
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML =
                                  '<div class="w-full h-full flex items-center justify-center bg-gray-100"><div class="text-gray-400"><NoImage /></div></div>';
                              }
                            }}
                          />
                        ) : (
                          <NoImage />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-0.5">
                          Qty: {item.quantity}
                        </p>
                        {isPriceObject(item.price) && (
                          <div className="mt-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900">
                                {formatCurrency(
                                  item.price.currentEffectivePrice
                                )}
                              </span>
                              {item.price.base !==
                                item.price.currentEffectivePrice && (
                                <span className="text-xs line-through text-gray-400">
                                  {formatCurrency(item.price.base)}
                                </span>
                              )}
                            </div>
                            {item.price.attributes > 0 && (
                              <div className="text-xs text-gray-500">
                                + {formatCurrency(item.price.attributes)}{" "}
                                (add-ons)
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {formatCurrency(item.price.total)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-lg sticky top-24">
              {/* Payment Method - Compact Version */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Payment Method
                  </h2>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: "card", label: "Card", icon: CreditCard },
                      { id: "cash", label: "Cash", icon: Wallet },
                      // { id: "online", label: "Online", icon: Check },
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

                  {/* {paymentMethod === "card" && (
                    <div className="mt-4 space-y-3">
                      <input
                        type="text"
                        value={creditCardDetails.name}
                        onChange={(e) =>
                          handleCreditCardChange("name", e.target.value)
                        }
                        placeholder="Card holder name"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 "
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={creditCardDetails.number}
                          onChange={(e) =>
                            handleCreditCardChange(
                              "number",
                              e.target.value.replace(/\D/g, "").slice(0, 16)
                            )
                          }
                          placeholder="Card number"
                          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 "
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={creditCardDetails.expiry}
                            onChange={(e) => {
                              let value = e.target.value.replace(/\D/g, "");
                              if (value.length >= 2) {
                                value =
                                  value.slice(0, 2) + "/" + value.slice(2, 4);
                              }
                              handleCreditCardChange("expiry", value);
                            }}
                            placeholder="MM/YY"
                            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 "
                          />
                          <input
                            type="text"
                            value={creditCardDetails.cvc}
                            onChange={(e) =>
                              handleCreditCardChange(
                                "cvc",
                                e.target.value.replace(/\D/g, "").slice(0, 3)
                              )
                            }
                            placeholder="CVC"
                            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 "
                          />
                        </div>
                      </div>
                    </div>
                  )} */}
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
                      className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg "
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
                        "Apply"
                      )}
                    </button>
                  </div>
                  {appliedPromo && (
                    <div className="mt-2 p-2 bg-green-50 text-green-700 rounded-lg text-xs">
                      Promo code "{appliedPromo.code}" applied -{" "}
                      {appliedPromo.discountType === 'percentage' ? `${appliedPromo.discountValue}% off` : `${formatCurrency(appliedPromo.discountAmount)} off`}
                    </div>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Order Summary
                  </h3>
                </div>
                <div className="p-4">
                  <div className="space-y-3 mb-4">
                    {/* Base Total */}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Items Subtotal</span>
                      <span className="font-medium">
                        {formatCurrency(
                          cartItems.reduce(
                            (total, item) =>
                              total +
                              (isPriceObject(item.price)
                                ? item.price.currentEffectivePrice *
                                  item.quantity
                                : 0),
                            0
                          )
                        )}
                      </span>
                    </div>

                    {/* Attributes Total */}
                    {cartItems.some(
                      (item) =>
                        isPriceObject(item.price) && item.price.attributes > 0
                    ) && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Add-ons Total</span>
                        <span className="font-medium">
                          {formatCurrency(
                            cartItems.reduce(
                              (total, item) =>
                                total +
                                (isPriceObject(item.price)
                                  ? item.price.attributes * item.quantity
                                  : 0),
                              0
                            )
                          )}
                        </span>
                      </div>
                    )}

                    {/* Delivery Fee */}
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-gray-600">Delivery Fee</span>
                      {cartSummary.deliveryFee === 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Free
                        </span>
                      ) : (
                        <span className="font-medium">
                          {formatCurrency(cartSummary.deliveryFee)}
                        </span>
                      )}
                    </div>

                    {/* Service Charges */}
                    {cartSummary.serviceCharges.totalMandatory > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          Service Charge (Mandatory)
                        </span>
                        <span className="font-medium">
                          {formatCurrency(
                            cartSummary.serviceCharges.totalMandatory
                          )}
                        </span>
                      </div>
                    )}

                    {cartSummary.serviceCharges.totalOptional > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          Service Charge (Optional)
                        </span>
                        <span className="font-medium">
                          {formatCurrency(
                            cartSummary.serviceCharges.totalOptional
                          )}
                        </span>
                      </div>
                    )}

                    {/* Tax */}
                    {cartSummary.taxRate > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          Tax ({cartSummary.taxRate}%)
                        </span>
                        <span className="font-medium">
                          {formatCurrency(
                            (cartSummary.subtotal * cartSummary.taxRate) / 100
                          )}
                        </span>
                      </div>
                    )}

                    {/* Total Savings */}
                    {cartItems.some(
                      (item) =>
                        isPriceObject(item.price) &&
                        item.price.base > item.price.currentEffectivePrice
                    ) && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Total Savings</span>
                        <span className="font-medium">
                          {formatCurrency(
                            cartItems.reduce(
                              (total, item) =>
                                total +
                                (isPriceObject(item.price)
                                  ? (item.price.base -
                                      item.price.currentEffectivePrice) *
                                    item.quantity
                                  : 0),
                              0
                            )
                          )}
                        </span>
                      </div>
                    )}

                    {/* Promo Discount */}
                    {appliedPromo && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Promo Discount ({appliedPromo.discountType === 'percentage' ? `${appliedPromo.discountValue}%` : appliedPromo.name})</span>
                        <span>
                          -{formatCurrency(appliedPromo.discountAmount)}
                        </span>
                      </div>
                    )}

                    {/* Final Total */}
                    <div className="border-t pt-3">
                      <div className="flex justify-between">
                        <span className="font-semibold uppercase">Total</span>
                        <div className="text-right">
                          <span className="text-neutral-800 text-lg font-bold">
                            {appliedPromo && appliedPromo.newTotal
                              ? formatCurrency(appliedPromo.newTotal)
                              : formatCurrency(
                                  cartItems.reduce(
                                    (total, item) =>
                                      total +
                                      (isPriceObject(item.price)
                                        ? item.price.total
                                        : 0),
                                    0
                                  ) +
                                    cartSummary.deliveryFee +
                                    (cartSummary.serviceCharges?.totalAll || 0) +
                                    (cartSummary.subtotal * cartSummary.taxRate) /
                                      100 -
                                    (appliedPromo ? appliedPromo.discountAmount : 0)
                                )}
                          </span>
                          {(cartItems.some(
                            (item) =>
                              isPriceObject(item.price) &&
                              item.price.base > item.price.currentEffectivePrice
                          ) || (appliedPromo && appliedPromo.savings > 0)) && (
                            <div className="text-xs text-neutral-600 font-medium">
                              You saved{" "}
                              {formatCurrency(
                                cartItems.reduce(
                                  (total, item) =>
                                    total +
                                    (isPriceObject(item.price)
                                      ? (item.price.base -
                                          item.price.currentEffectivePrice) *
                                        item.quantity
                                      : 0),
                                  0
                                ) + (appliedPromo ? appliedPromo.savings : 0)
                              )}
                              !
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handlePlaceOrder}
                    title={!acceptedTerms ? "Please accept the terms and conditions" : !deliveryAddress.fullAddress ? "Please select a delivery address" : ""}
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
                        className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 hover:cursor-pointer border-gray-300 rounded"
                      />
                      <span className="text-xs text-gray-600 hover:cursor-pointer">
                        By placing this order you're agreeing to our{" "}
                        <Link
                          to="/terms"
                          className="text-green-600 hover:text-green-700 underline"
                        >
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
      </div>

      {/* Order Confirmation Modal */}
      <OrderConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmOrder}
        isLoading={isProcessing}
        orderDetails={{
          items: cartItems,
          total: appliedPromo && appliedPromo.newTotal 
            ? appliedPromo.newTotal 
            : cartSummary.total - (appliedPromo ? appliedPromo.discountAmount : 0),
          originalTotal: appliedPromo?.originalTotal,
          discountAmount: appliedPromo?.discountAmount,
          address: `${deliveryAddress.street}, ${deliveryAddress.city}, ${deliveryAddress.postcode}`,
          deliveryTime: selectedTimeSlot,
        }}
      />

      {/* Stripe Modal */}
      <StripeModal
        isOpen={showStripeModal}
        onClose={() => {
          setShowStripeModal(false);
          setStripeClientSecret(null);
          setCreatedOrderId(null);
        }}
        orderId={createdOrderId}
        clientSecret={stripeClientSecret}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentCancel={() => {
          setShowStripeModal(false);
          setStripeClientSecret(null);
          setCreatedOrderId(null);
          toast.info("Payment cancelled. You can try again later.");
        }}
      />




    </div>
  );
};

export default CheckoutPage;
