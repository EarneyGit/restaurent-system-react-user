import React, { useState, useEffect } from "react";
import { Product } from "@/services/api";
import { useCart } from "@/context/CartContext";
import { Minus, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import ProductOptionsModal from "../modals/ProductOptionsModal";
import axios from "axios";
import { CART_ENDPOINTS } from "@/config/api.config";
import { useAuth } from "@/context/AuthContext";
import { useGuestCart } from "@/context/GuestCartContext";
import { useBranch } from "@/context/BranchContext";
import { useNavigate } from "react-router-dom";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  isOutletAvailable?: boolean;
  isBranchAvailable?: boolean;
  disableAddToCart?: boolean;
}

interface PriceChange {
  _id: string;
  tempPrice: number;
  originalPrice: number;
  endDate: string;
  active: boolean;
}
const getActivePriceChange = (
  priceChanges?: PriceChange[]
): PriceChange | null => {
  if (!priceChanges?.length) return null;
  const now = new Date();
  return (
    priceChanges.find(
      (change) => change.active && new Date(change.endDate) > now
    ) || null
  );
};

const getDaysLeft = (endDate: string): number => {
  const now = new Date();
  const end = new Date(endDate);
  const diffTime = end.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Utility function to check if category is available at current time
const isCategoryAvailable = (category: any): boolean => {
  if (!category?.availability) return true; // If no availability data, assume available

  const now = new Date();
  const currentDay = now.toLocaleDateString("en-US", { weekday: "long" }); // Get full day name (Monday, Tuesday, etc.)
  const currentTime = now.toTimeString().substring(0, 5); // Get time in HH:MM format

  const dayAvailability = category.availability[currentDay];
  if (!dayAvailability) return true;

  // If not available for this day
  if (dayAvailability.type === "Not Available") {
    return false;
  }

  // If available all day
  if (dayAvailability.type === "All Day") {
    return true;
  }

  // If specific times, check if current time falls within the time slot
  if (dayAvailability.type === "Specific Times") {
    if (!dayAvailability.startTime || !dayAvailability.endTime) {
      return false;
    }

    return (
      currentTime >= dayAvailability.startTime &&
      currentTime <= dayAvailability.endTime
    );
  }

  return true;
};

// Utility function to check if product is available at current time
const isProductAvailable = (product: Product): boolean => {
  // First check if the category is available - if not, product is not available
  if (
    product.category &&
    typeof product.category === "object" &&
    product.category.availability
  ) {
    if (!isCategoryAvailable(product.category)) {
      return false;
    }
  }

  if (!product.availability) return true; // If no availability data, assume available

  const now = new Date();
  const currentDay = now
    .toLocaleDateString("en-US", { weekday: "short" })
    .toLowerCase(); // Get day name (mon, tue, etc.)
  const currentTime = now.toTimeString().substring(0, 5); // Get time in HH:MM format

  // Map day names to availability keys
  const dayMap: { [key: string]: keyof typeof product.availability } = {
    mon: "monday",
    tue: "tuesday",
    wed: "wednesday",
    thu: "thursday",
    fri: "friday",
    sat: "saturday",
    sun: "sunday",
  };

  const dayKey = dayMap[currentDay];
  if (!dayKey || !product.availability[dayKey]) return true;

  const dayAvailability = product.availability[dayKey];

  // If not available for this day - type takes priority over isAvailable
  if (dayAvailability.type === "Not Available") {
    return false;
  }

  // If available all day
  if (dayAvailability.type === "All Day") {
    return dayAvailability.isAvailable;
  }

  // If specific times, check if current time falls within any time slot
  if (dayAvailability.type === "Specific Times") {
    // For specific times, we need both isAvailable to be true AND have valid time slots
    if (
      !dayAvailability.isAvailable ||
      !dayAvailability.times ||
      dayAvailability.times.length === 0
    ) {
      return false;
    }

    return dayAvailability.times.some((timeSlot) => {
      return currentTime >= timeSlot.start && currentTime <= timeSlot.end;
    });
  }

  return true;
};

// Utility function to get availability message
const getAvailabilityMessage = (product: Product): string => {
  // First check if the category is available - if not, show category unavailable message
  if (
    product.category &&
    typeof product.category === "object" &&
    product.category.availability
  ) {
    if (!isCategoryAvailable(product.category)) {
      return "Category not available";
    }
  }

  if (!product.availability) return "";

  const now = new Date();
  const currentDay = now
    .toLocaleDateString("en-US", { weekday: "short" })
    .toLowerCase();

  const dayMap: { [key: string]: keyof typeof product.availability } = {
    mon: "monday",
    tue: "tuesday",
    wed: "wednesday",
    thu: "thursday",
    fri: "friday",
    sat: "saturday",
    sun: "sunday",
  };

  const dayKey = dayMap[currentDay];
  if (!dayKey || !product.availability[dayKey]) return "";

  const dayAvailability = product.availability[dayKey];

  if (dayAvailability.type === "Not Available") {
    return "Not available today";
  }

  if (dayAvailability.type === "All Day") {
    return dayAvailability.isAvailable ? "" : "Not available today";
  }

  if (dayAvailability.type === "Specific Times") {
    if (
      !dayAvailability.isAvailable ||
      !dayAvailability.times ||
      dayAvailability.times.length === 0
    ) {
      return "Not available today";
    }

    const timeRanges = dayAvailability.times
      .map((slot) => `${slot.start} - ${slot.end}`)
      .join(", ");
    return `Available ${timeRanges}`;
  }

  return "";
};

const VariantPlaceholderSVG = ({ color }: { color: string }) => (
  <svg
    viewBox="0 0 40 40"
    className="w-full h-full p-2"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="40" height="40" fill="#f3f4f6" />
    <path
      d="M20 10 L30 20 L20 30 L10 20 Z"
      fill={color.toLowerCase()}
      stroke="#9ca3af"
      strokeWidth="1"
    />
    <circle
      cx="20"
      cy="20"
      r="6"
      fill="white"
      stroke="#9ca3af"
      strokeWidth="1"
    />
  </svg>
);

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isOutletAvailable = true,
  isBranchAvailable = true,
  disableAddToCart,
}) => {
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const { addToCart, updateCartItemQuantity, cartItems, removeFromCart } =
    useCart();
  const [imageError, setImageError] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { isAuthenticated, token } = useAuth();
  const { sessionId } = useGuestCart();
  const { selectedBranch } = useBranch();
  const navigate = useNavigate();
  // const [isBranchAvailable, setIsBranchAvailable] = useState<boolean>(true);

  const activePriceChange = getActivePriceChange(product.priceChanges);
  const daysLeft = activePriceChange
    ? getDaysLeft(activePriceChange.endDate)
    : 0;

  // Check product availability
  const isAvailable = isProductAvailable(product);
  const availabilityMessage = getAvailabilityMessage(product);

  // Get delivery method from localStorage
  const deliveryMethod = localStorage.getItem("deliveryMethod");

  // Check if product supports the selected delivery method
  const isDeliverySupported = (() => {
    if (!deliveryMethod) return true; // If no delivery method selected, assume supported

    switch (deliveryMethod.toLowerCase()) {
      case "deliver":
        return product.delivery === true;
      case "pickup":
      case "collect":
        return product.collection === true;
      case "dine_in":
      case "table_ordering":
        return product.dineIn === true;
      default:
        return true;
    }
  })();

  // Get delivery method message
  const getDeliveryMethodMessage = () => {
    if (!deliveryMethod) return "";

    switch (deliveryMethod.toLowerCase()) {
      case "deliver":
        return product.delivery === false ? "Not available for delivery" : "";
      case "pickup":
      case "collect":
        return product.collection === false
          ? "Not available for collection"
          : "";
      case "dine_in":
      case "table_ordering":
        return product.dineIn === false ? "Not available for dine-in" : "";
      default:
        return "";
    }
  };

  const deliveryMethodMessage = getDeliveryMethodMessage();

  // Stock management functions
  const getStockStatus = () => {
    // Use the stockManagement from product data, or create mock data for demo
    const mockStockData = {
      isManaged: true,
      quantity: 10, // Mock available quantity
      lowStockThreshold: 3,
      lastUpdated: new Date().toISOString(),
    };

    // Use provided product.stockManagement or fall back to mock data for demo
    const stockData = product.stockManagement || mockStockData;

    if (!stockData.isManaged) {
      return {
        isInStock: true,
        availableQuantity: Infinity,
        isLowStock: false,
      };
    }

    const { quantity: stockQuantity, lowStockThreshold } = stockData;
    return {
      isInStock: stockQuantity > 0,
      availableQuantity: stockQuantity,
      isLowStock: stockQuantity <= lowStockThreshold && stockQuantity > 0,
    };
  };

  const { isInStock, availableQuantity, isLowStock } = getStockStatus();

  // Overall availability - product must be available AND support the selected delivery method
  const isOverallAvailable = isAvailable && isDeliverySupported;

  // Combined message for both availability and delivery method
  const combinedMessage = availabilityMessage || deliveryMethodMessage;

  const cartItem = cartItems.find((item) => item.productId === product.id);
  const isInCart = Boolean(cartItem);

  // Get the API URL from environment variable and ensure it ends with a slash
  const API_URL = (
    import.meta.env.VITE_API_URL || "http://82.25.104.117:5001"
  ).replace(/\/?$/, "/");

  const getImageUrl = (url: string | undefined): string | null => {
    if (!url) return null;
    try {
      if (url.startsWith("http")) return url;
      const cleanUrl = url.trim().replace(/^\/+/, "").replace(/\\/g, "/");
      return `${API_URL}${cleanUrl}`;
    } catch (error) {
      console.error("Error processing image URL:", error);
      return null;
    }
  };

  const handleQuantityChange = async (newQuantity: number) => {
    if (!selectedBranch) {
      toast.error("Please select a branch first");
      return;
    }

    // Only check stock availability for increases, allow decreases
    const currentCartQuantity = cartItem?.quantity || 0;
    if (newQuantity > currentCartQuantity && newQuantity > availableQuantity) {
      toast.error(`Only ${availableQuantity} items available in stock`);
      return;
    }

    if (isInCart && cartItem) {
      try {
        setIsAddingToCart(true);
        // Use the existing options and special requirements when updating quantity
        await updateCartItemQuantity(cartItem.id, newQuantity);
        toast.success("Cart updated successfully");
      } catch (error) {
        console.error("Error updating cart:", error);
        if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Failed to update cart");
        }
      } finally {
        setIsAddingToCart(false);
      }
    } else {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedBranch) {
      toast.error("Please select a branch first");
      return;
    }

    // Check overall availability (time + delivery method)
    if (!isOverallAvailable) {
      const errorMessage =
        combinedMessage || `${product.name} is not available`;
      toast.error(errorMessage);
      return;
    }

    // Check stock availability
    if (!isInStock) {
      toast.error("This item is out of stock");
      return;
    }

    if (quantity > availableQuantity) {
      toast.error(`Only ${availableQuantity} items available in stock`);
      return;
    }

    // Check if user is authenticated or has a valid guest session
    const isGuest = localStorage.getItem("isGuest") === "true";
    if (!isAuthenticated && !isGuest) {
      // Save current path for redirect after login
      localStorage.setItem("returnUrl", window.location.pathname);
      toast.error("Please login or continue as guest");
      navigate("/login");
      return;
    }

    // If the item is already in cart, just update the quantity
    if (isInCart && cartItem) {
      await handleQuantityChange(cartItem.quantity + 1);
      return;
    }

    // If product has attributes and it's a new addition, show options modal
    if (product.attributes && product.attributes.length > 0) {
      setIsOptionsModalOpen(true);
      return;
    }

    try {
      setIsAddingToCart(true);

      // Create proper price structure
      const effectivePrice = activePriceChange
        ? activePriceChange.tempPrice
        : product.price;
      const priceStructure = {
        base: product.price,
        currentEffectivePrice: effectivePrice,
        attributes: 0,
        total: effectivePrice,
      };

      // Get delivery method from localStorage
      const deliveryMethod =
        localStorage.getItem("deliveryMethod") || "delivery";

      await addToCart({
        ...product,
        productId: product.id,
        quantity,
        selectedOptions: {},
        specialRequirements: "",
        itemTotal: effectivePrice * quantity,
        branchId: selectedBranch.id,
        orderType: deliveryMethod,
        price: priceStructure,
      });
      toast.success("Added to cart successfully");
    } catch (error) {
      console.error("Error adding to cart:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to add item to cart");
      }
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleOptionsSubmit = async (
    selectedOptions: Record<string, string>,
    specialRequirements: string
  ) => {
    if (!selectedBranch) {
      toast.error("Please select a branch first");
      return;
    }

    // Check overall availability (time + delivery method)
    if (!isOverallAvailable) {
      const errorMessage =
        combinedMessage || `${product.name} is not available`;
      toast.error(errorMessage);
      return;
    }

    // Check stock availability
    if (!isInStock) {
      toast.error("This item is out of stock");
      return;
    }

    if (quantity > availableQuantity) {
      toast.error(`Only ${availableQuantity} items available in stock`);
      return;
    }

    // Check if user is authenticated or has a valid guest session
    const isGuest = localStorage.getItem("isGuest") === "true";
    if (!isAuthenticated && !isGuest) {
      // Save current path for redirect after login
      localStorage.setItem("returnUrl", window.location.pathname);
      toast.error("Please login or continue as guest");
      navigate("/login");
      return;
    }

    try {
      setIsAddingToCart(true);

      // Calculate attributes price from selected options
      let attributesTotal = 0;
      if (product.attributes) {
        product.attributes.forEach((attr) => {
          const selectedChoiceId = selectedOptions[attr.id];
          if (selectedChoiceId) {
            const choice = attr.choices.find((c) => c.id === selectedChoiceId);
            if (choice) {
              attributesTotal += choice.price;
            }
          }
        });
      }

      // Create proper price structure
      const effectivePrice = activePriceChange
        ? activePriceChange.tempPrice
        : product.price;
      const priceStructure = {
        base: product.price,
        currentEffectivePrice: effectivePrice,
        attributes: attributesTotal,
        total: effectivePrice + attributesTotal,
      };

      // Get delivery method from localStorage
      const deliveryMethod =
        localStorage.getItem("deliveryMethod") || "delivery";

      await addToCart({
        ...product,
        productId: product.id,
        quantity,
        selectedOptions,
        specialRequirements,
        itemTotal: (effectivePrice + attributesTotal) * quantity,
        branchId: selectedBranch.id,
        orderType: deliveryMethod,
        price: priceStructure,
      });
      setIsOptionsModalOpen(false);
    } catch (error) {
      console.error("Error adding to cart:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to add item to cart");
      }
    } finally {
      setIsAddingToCart(false);
    }
  };

  const imageUrl = getImageUrl(product.images?.[selectedVariant]);
  const hasMultipleImages = (product.images?.length || 0) > 2;
  const category =
    typeof product.category === "string"
      ? product.category
      : product.category?.name || "";

  const handleRemoveFromCart = () => {
    removeFromCart(product.id);
    toast.success("Removed from cart");
  };

  function MenuDisplay({
    description,
    isOverallAvailable,
  }: {
    description?: string;
    isOverallAvailable?: boolean;
  }) {
    if (!description) return null;

    const normalized = description
      .replace(/\\r\\n/g, "|")
      .replace(/\r\n/g, "|")
      .replace(/\n/g, "|")
      .replace(/\+/g, "|")
      .replace(/,/g, "|")
      .replace(/\s*\|\s*/g, "|")
      .replace(/\|{2,}/g, "|");

    const parts = normalized
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean);

    return (
      <div
        className={`text-left text-sm mt-1 break-words ${
          !isOverallAvailable ? "text-gray-400" : "text-neutral-500"
        }`}
      >
        {parts.map((line, idx) => (
          <p key={idx} className="mb-1 flex items-start">
            <span className="mr-2">•</span> {line}
          </p>
        ))}
      </div>
    );
  }

  return (
    <>
      <div
        className={`bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 relative flex flex-col h-full ${
          !isOverallAvailable ? "opacity-60" : ""
        }`}
      >
        {/* Category Badge */}
        <div className="absolute top-5 left-4 z-10">
          <span className="px-3 py-1 bg-green-900 text-white rounded-full text-xs font-medium">
            {category}
          </span>
        </div>

        {/* Main Image */}
        <div className="relative h-[200px] rounded-lg bg-gray-50">
          {imageUrl && !imageError ? (
            <img
              src={imageUrl}
              alt={product.name}
              className={`w-full p-3 rounded-xl h-full ${
                !isOverallAvailable ? "grayscale" : ""
              }`}
              onError={() => setImageError(true)}
              loading="eager"
            />
          ) : (
            <div
              className={`w-full h-full bg-gray-100 flex items-center justify-center ${
                !isOverallAvailable ? "grayscale" : ""
              }`}
            >
              <svg
                className="w-12 h-12 text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2Z"
                  fill="currentColor"
                  fillOpacity="0.2"
                />
                <path
                  d="M15 8H9C7.895 8 7 8.895 7 10V14C7 15.105 7.895 16 9 16H15C16.105 16 17 15.105 17 14V10C17 8.895 16.105 8 15 8Z"
                  fill="currentColor"
                />
              </svg>
            </div>
          )}
          {!isOverallAvailable && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                Not Available
              </span>
            </div>
          )}
        </div>

        {/* Variants - Only show if more than 2 images exist */}
        {hasMultipleImages && (
          <div className="flex gap-2 p-2 overflow-x-auto bg-white border-t border-gray-100">
            {product.images?.map((image, index) => {
              const variantImageUrl = getImageUrl(image);
              return (
                <button
                  key={index}
                  onClick={() => setSelectedVariant(index)}
                  className={`flex-shrink-0 w-12 h-12 rounded-lg border transition-all ${
                    selectedVariant === index
                      ? "border-2 border-gray-900"
                      : "border border-gray-200"
                  }`}
                >
                  {variantImageUrl ? (
                    <img
                      src={variantImageUrl}
                      alt={`${product.name} variant ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <VariantPlaceholderSVG color="#9ca3af" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Product Info */}
        <div className="flex-1 p-4">
          <h3
            className={`font-medium ${
              !isOverallAvailable ? "text-gray-500" : "text-gray-900"
            }`}
          >
            {product.name}
          </h3>
          {/* <p
            className={`text-left text-sm mt-1 break-words ${
              !isOverallAvailable ? "text-gray-400" : "text-neutral-500"
            }`}
          >
            {MenuDisplay(product?.description)}
          </p> */}
          <MenuDisplay
            description={product?.description}
            isOverallAvailable={isOverallAvailable}
          />

          {/* Availability Status */}
          {combinedMessage && (
            <div
              className={`text-xs mt-2 px-2 py-1 rounded ${
                !isOverallAvailable
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {combinedMessage}
            </div>
          )}

          {/* Stock Status */}
          <div className="mt-2 mb-1">
            {(() => {
              const currentCartQuantity = cartItem?.quantity || 0;
              const remainingStock = availableQuantity - currentCartQuantity;
              const isAtMaxQuantity =
                isInCart && currentCartQuantity >= availableQuantity;

              if (!isInStock) {
                return (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 w-fit">
                    Out of Stock
                  </span>
                );
              }

              if (isAtMaxQuantity) {
                return (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 w-fit">
                    Max Quantity Reached
                  </span>
                );
              }

              return (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 w-fit">
                    In Stock
                  </span>
                  {/* {availableQuantity !== Infinity && (
                    <span className="text-xs text-gray-500 font-bold">
                      {isInCart ? `${remainingStock} more` : `${availableQuantity} left`}
                    </span>
                  )} */}
                </div>
              );
            })()}
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            {activePriceChange ? (
              <>
                <span
                  className={`font-bold text-lg ${
                    !isOverallAvailable ? "text-gray-500" : "text-black"
                  }`}
                >
                  {formatPrice(activePriceChange.tempPrice)}
                </span>
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(activePriceChange.originalPrice)}
                </span>
                <span className="text-xs text-green-600 font-medium">
                  {daysLeft} {daysLeft === 1 ? "day" : "days"} left
                </span>
              </>
            ) : (
              <span
                className={`font-bold text-lg ${
                  !isOverallAvailable ? "text-gray-500" : ""
                }`}
              >
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </div>

        {/* Sticky Cart Controls */}
        <div className="sticky bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
          {isBranchAvailable && !disableAddToCart ? (
            (() => {
              const currentCartQuantity = cartItem?.quantity || 0;
              const isAtMaxQuantity =
                isInCart && currentCartQuantity >= availableQuantity;

              // Check overall availability first
              if (!isOverallAvailable) {
                return (
                  <div className="text-center text-sm text-red-600 bg-red-50 py-2.5 rounded-xl">
                    {combinedMessage || "Not Available"}
                  </div>
                );
              }

              if (!isInStock) {
                return (
                  <div className="text-center text-sm text-red-600 bg-red-50 py-2.5 rounded-xl">
                    Out of Stock
                  </div>
                );
              }

              if (isInCart) {
                return (
                  <div className="w-full bg-gray-100 rounded-xl flex items-center">
                    <button
                      onClick={() =>
                        handleQuantityChange(
                          Math.max(1, currentCartQuantity - 1)
                        )
                      }
                      className="p-3 hover:text-gray-700 text-gray-500 flex-shrink-0 disabled:cursor-not-allowed"
                      disabled={currentCartQuantity === 1}
                      title={
                        currentCartQuantity === 1
                          ? "Minimum quantity is 1"
                          : "Decrease quantity"
                      }
                    >
                      <Minus size={20} />
                    </button>
                    <span className="flex-1 text-center font-medium">
                      {isAddingToCart ? (
                        <Loader2 size={16} className="animate-spin mx-auto" />
                      ) : (
                        currentCartQuantity
                      )}
                    </span>
                    <button
                      onClick={handleAddToCart}
                      className="p-3 hover:text-gray-700 text-gray-500 flex-shrink-0 disabled:cursor-not-allowed"
                      disabled={
                        isAddingToCart ||
                        currentCartQuantity >= availableQuantity
                      }
                      title={
                        currentCartQuantity >= availableQuantity
                          ? "Maximum quantity reached"
                          : "Increase quantity"
                      }
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                );
              }

              return (
                <button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || !isInStock}
                  className="w-full bg-neutral-800 text-white py-2.5 rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAddingToCart ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add to Cart"
                  )}
                </button>
              );
            })()
          ) : (
            <div className="text-center text-sm text-gray-500">
              Currently unavailable for ordering
            </div>
          )}
        </div>
      </div>

      {/* Product Options Modal */}
      {product.attributes && product.attributes.length > 0 && (
        <ProductOptionsModal
          isOpen={isOptionsModalOpen}
          onClose={() => setIsOptionsModalOpen(false)}
          onAddToCart={handleOptionsSubmit}
          productName={product.name}
          options={product.attributes}
        />
      )}
    </>
  );
};

export default React.memo(ProductCard);
