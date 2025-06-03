import React, { useState, useEffect } from "react";
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
import { toast } from "sonner";
import DeliveryAddressForm from "@/components/cart/DeliveryAddressForm";
import { useBranch } from "@/context/BranchContext";
import axios from "@/config/axios.config";
import { CartItem as CartItemType } from "@/context/CartContext";
import { CART_ENDPOINTS, ORDER_ENDPOINTS, BASE_URL } from "@/config/api.config";
import { useGuestCart } from "@/context/GuestCartContext";

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

// Calculate total price for an item including options
const calculateItemTotal = (item: CartItemType) => {
  let itemTotal = item.price;

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
      const time = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
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
  orderDetails,
}) => {
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
                <span>{formatPrice(item.price * item.quantity)}</span>
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
              <span>{formatPrice(orderDetails.total)}</span>
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
  const [filteredAddresses, setFilteredAddresses] = useState(mockUKAddresses);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discount: number;
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

        const cartData = cartResponse.data.data;

        // Then calculate service charges
        let serviceCharges = {
          totalMandatory: 0,
          totalOptional: 0,
          totalAll: 0,
          breakdown: [],
        };

        // Get deliveryMethod from localStorage and determine orderType
        const deliveryMethod = localStorage.getItem("deliveryMethod");
        let orderType = "dine_in"; // default value

        if (deliveryMethod === "deliver") {
          orderType = "delivery";
        } else if (deliveryMethod === "collect") {
          orderType = "pickup";
        }

        if (selectedBranch?.id) {
          try {
            const serviceChargeResponse = await axios.post(
              "/api/settings/service-charges/calculate",
              {
                branchId: selectedBranch.id,
                orderType,
                orderTotal: cartData.subtotal,
                includeOptional: true,
              },
              { headers }
            );

            if (serviceChargeResponse.data?.success) {
              serviceCharges = serviceChargeResponse.data.data;
            }
          } catch (error) {
            console.error("Error calculating service charges:", error);
            toast.error(
              "Failed to calculate service charges. Please try again."
            );
          }
        }

        // Calculate final total including all charges
        const subtotal = cartData.subtotal || 0;
        const deliveryFee = cartData.deliveryFee || 0;
        const mandatoryCharges = serviceCharges.totalMandatory || 0;
        const optionalCharges = serviceCharges.totalOptional || 0;
        const taxRate = cartData.taxRate || 0; // Get tax rate from response
        const taxAmount = (subtotal * taxRate) / 100;
        const total =
          subtotal + deliveryFee + mandatoryCharges + optionalCharges + taxAmount;

        setCartSummary({
          subtotal,
          deliveryFee,
          total,
          itemCount: cartData.itemCount || 0,
          taxRate,
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
  }, [isAuthenticated, token, sessionId, cartItems, selectedBranch?.id]);

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

  // Update the delivery address state initialization
  const [deliveryAddress, setDeliveryAddress] = useState<Address>({
    street: user?.address?.street || "",
    city: user?.address?.city || "",
    state: user?.address?.state || "",
    zipCode: user?.address?.zipCode || "",
    country: "GB",
  });

  // Handle address search
  const handleAddressSearch = (query: string) => {
    setAddressSearchQuery(query);
    const filtered = mockUKAddresses.filter((addr) =>
      addr.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredAddresses(filtered);
  };

  // Handle address selection
  const handleAddressSelect = (address: string) => {
    const [street, city, postcode] = address.split(", ");
    setDeliveryAddress((prev) => ({
      ...prev,
      street,
      city,
      zipCode: postcode,
      state: city.split(" ")[0], // Simplified for demo
    }));
    setShowAddressSearch(false);
  };

  // Calculate order totals using CartContext methods
  const subtotal = cartSummary.subtotal;
  const deliveryFee = cartSummary.deliveryFee;
  const total = cartSummary.total;

  // Update the validateAddress function
  const validateAddress = (address: Address): boolean => {
    const requiredFields = ["street", "city", "state", "zipCode", "country"];
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

    setIsApplyingPromo(true);
    try {
      // Mock API call - replace with actual API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setAppliedPromo({ code: promoCode, discount: 10 }); // Mock 10% discount
      toast.success("Promo code applied successfully!");
    } catch (error) {
      toast.error("Invalid promo code");
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (
      !selectedTimeSlot ||
      !deliveryAddress.street ||
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
        !deliveryAddress.street
      ) {
        toast.error("Please fill in all required fields");
        setIsProcessing(false);
        return;
      }

      // Format products data according to backend requirements
      const formattedProducts = cartItems.map((item) => {
        const productId = item.productId || item.id;

        // Format selected attributes according to backend schema
        const selectedAttributes =
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
          }) || [];

        return {
          product: productId,
          quantity: item.quantity,
          price: item.price,
          notes: item.specialRequirements || "",
          selectedAttributes,
        };
      });

      // Calculate totals
      const subtotal = cartSummary.subtotal;
      const deliveryFeeAmount = cartSummary.deliveryFee;
      const taxAmount = 0;
      const discountAmount = appliedPromo
        ? (subtotal * appliedPromo.discount) / 100
        : 0;
      const finalTotal =
        subtotal + deliveryFeeAmount + taxAmount - discountAmount;

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
        deliveryAddress: orderType === "delivery" ? {
          street: deliveryAddress.street,
          city: deliveryAddress.city,
          postalCode: deliveryAddress.zipCode,
          country: deliveryAddress.country || "GB",
        } : undefined,
        contactNumber: personalDetails.phone,
        paymentMethod: paymentMethod,
        specialInstructions: orderNotes,
        selectedTimeSlot,
        personalDetails: {
          firstName: personalDetails.firstName,
          lastName: personalDetails.lastName,
          phone: personalDetails.phone,
          email: personalDetails.email,
        },
        promoCode: appliedPromo?.code,
        subtotal,
        deliveryFee: deliveryFeeAmount,
        tax: taxAmount,
        discount: discountAmount,
        totalAmount: finalTotal,
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
        // Clear cart
        await clearCart();

        // Store necessary data for order tracking
        localStorage.setItem("selectedBranchId", selectedBranch.id);

        const createdOrder = response.data.data;

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
            onClick={() => navigate(-1)}
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
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[100px]"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Personal Info & Delivery */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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
                      First Name
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
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
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
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
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
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                {/* Delivery Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Address
                  </label>
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
                      <p className="text-sm text-gray-600">
                        {deliveryAddress.street}
                      </p>
                      <p className="text-sm text-gray-600">
                        {deliveryAddress.city}, {deliveryAddress.state}
                      </p>
                      <p className="text-sm text-gray-600">
                        {deliveryAddress.zipCode}
                      </p>
                    </div>
                  )}
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
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
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
                        {item.selectedOptions &&
                          Object.keys(item.selectedOptions).length > 0 && (
                            <div className="mt-1">
                              {item.attributes?.map((attr) => {
                                const selectedChoiceId =
                                  item.selectedOptions?.[attr.id];
                                if (!selectedChoiceId) return null;
                                const choice = attr.choices.find(
                                  (c) => c.id === selectedChoiceId
                                );
                                if (!choice) return null;
                                return (
                                  <p
                                    key={attr.id}
                                    className="text-xs text-gray-500"
                                  >
                                    {attr.name}: {choice.name}
                                  </p>
                                );
                              })}
                            </div>
                          )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {formatCurrency(item.price * item.quantity)}
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
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "card", label: "Card", icon: CreditCard },
                      { id: "cash", label: "Cash", icon: Wallet },
                      { id: "online", label: "Online", icon: Check },
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

                  {paymentMethod === "card" && (
                    <div className="mt-4 space-y-3">
                      <input
                        type="text"
                        value={creditCardDetails.name}
                        onChange={(e) =>
                          handleCreditCardChange("name", e.target.value)
                        }
                        placeholder="Card holder name"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                        "Apply"
                      )}
                    </button>
                  </div>
                  {appliedPromo && (
                    <div className="mt-2 p-2 bg-green-50 text-green-700 rounded-lg text-xs">
                      Promo code "{appliedPromo.code}" applied -{" "}
                      {appliedPromo.discount}% off
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
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Subtotal</span>
                      <span>{formatCurrency(cartSummary.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Delivery Fee</span>
                      <span>{formatCurrency(cartSummary.deliveryFee)}</span>
                    </div>

                    {/* Tax Rate Display - Only show if tax data is available */}
                    {cartSummary.taxRate > 0 && (
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Tax ({cartSummary.taxRate}%)</span>
                        <span>{formatCurrency((cartSummary.subtotal * cartSummary.taxRate) / 100)}</span>
                      </div>
                    )}

                    {/* Service Charges */}
                    {/* {cartSummary.serviceCharges.breakdown.map((charge) => (
                      <div
                        key={charge.id}
                        className="flex justify-between text-sm text-gray-600"
                      >
                        <span>
                          {charge.name}
                          {charge.type === "Fixed" ? " (Fixed)" : ` (${charge.value}%)`}
                          {charge.optional ? " (Optional)" : ""}
                        </span>
                        <span>{formatCurrency(charge.amount)}</span>
                      </div>
                    ))} */}

                    {/* Show total service charges if there are multiple charges */}
                    {cartSummary.serviceCharges.breakdown.length > 1 && (
                      <div className="flex justify-between text-sm font-medium text-gray-700 pt-1">
                        <span>Total tax charges</span>
                        <span>{formatCurrency(cartSummary.serviceCharges.totalAll)}</span>
                      </div>
                    )}

                    {appliedPromo && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount ({appliedPromo.discount}%)</span>
                        <span>
                          -
                          {formatCurrency(
                            (cartSummary.subtotal * appliedPromo.discount) / 100
                          )}
                        </span>
                      </div>
                    )}

                    <div className="border-t pt-3">
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span className="text-green-600">
                          {formatCurrency(
                            cartSummary.total -
                              (appliedPromo
                                ? (cartSummary.subtotal *
                                    appliedPromo.discount) /
                                  100
                                : 0)
                          )}
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
          total:
            cartSummary.total -
            (appliedPromo
              ? (cartSummary.subtotal * appliedPromo.discount) / 100
              : 0),
          address: `${deliveryAddress.street}, ${deliveryAddress.city}, ${deliveryAddress.zipCode}`,
          deliveryTime: selectedTimeSlot,
        }}
      />
    </div>
  );
};

export default CheckoutPage;
