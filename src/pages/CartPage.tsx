import React, { useState, useEffect } from "react";
import {
  Minus,
  Plus,
  Heart,
  Trash2,
  ArrowLeft,
  ShoppingBag,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import OrderSummary from "@/components/cart/OrderSummary";
import NoImage from "@/components/common/NoImage";
import { ProductAttribute } from "@/services/api";
import { CartItem as CartItemType } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useGuestCart } from "@/context/GuestCartContext";
import axios from "@/config/axios.config";
import { CART_ENDPOINTS } from "@/config/api.config";
import { ChevronDown, ChevronUp } from "lucide-react";

interface CartSummary {
  subtotal: number;
  deliveryFee: number;
  total: number;
  itemCount: number;
}

interface PriceStructure {
  base: number;
  currentEffectivePrice: number;
  attributes: number;
  total: number;
  priceChanges?: PriceChange[];
}

interface PriceChange {
  active: boolean;
  endDate: string;
  originalPrice: number;
  tempPrice: number;
}

interface StockManagement {
  isManaged: boolean;
  quantity: number;
  lowStockThreshold: number;
  lastUpdated: string;
}

interface CartItemProps {
  id: string;
  name: string;
  price: PriceStructure;
  quantity: number;
  images?: string[];
  description?: string;
  selectedOptions?: Record<string, string>;
  specialRequirements?: string;
  attributes?: ProductAttribute[];
  selectedAttributes?: {
    attributeId: string;
    attributeName: string;
    attributeType: string;
    selectedItems: {
      itemId: string;
      itemName: string;
      itemPrice: number;
      quantity: number;
    }[];
  }[];
  itemTotal: number;
  stockManagement?: StockManagement;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  onToggleWishlist: (id: string) => void;
}

const CartItem: React.FC<CartItemProps> = ({
  id,
  name,
  price,
  quantity,
  images,
  description,
  selectedOptions = {},
  specialRequirements,
  attributes = [],
  selectedAttributes = [],
  itemTotal,
  stockManagement,
  onUpdateQuantity,
  onRemove,
  onToggleWishlist,
}) => {
  const { formatCurrency } = useCart();
  const [showAttributes, setShowAttributes] = useState(false);

  const getActivePriceChange = (priceChanges?: PriceChange[]): PriceChange | null => {
    if (!priceChanges?.length) return null;
    const now = new Date();
    return priceChanges.find(change => 
      change.active && 
      new Date(change.endDate) > now
    ) || null;
  };

  const activePriceChange = getActivePriceChange(price.priceChanges);

  // Stock management functions
  const getStockStatus = () => {
    // For demonstration purposes, let's create mock stock data
    // In a real implementation, this would come from the API
    const mockStockData: StockManagement = {
      isManaged: true,
      quantity: 5, // Mock available quantity
      lowStockThreshold: 2,
      lastUpdated: new Date().toISOString()
    };
    
    // Use provided stockManagement or fall back to mock data for demo
    const stockData = stockManagement || mockStockData;
    
    if (!stockData.isManaged) {
      return { isInStock: true, availableQuantity: Infinity, isLowStock: false };
    }
    
    const { quantity: stockQuantity, lowStockThreshold } = stockData;
    return {
      isInStock: stockQuantity > 0,
      availableQuantity: stockQuantity,
      isLowStock: stockQuantity <= lowStockThreshold && stockQuantity > 0
    };
  };

  const { isInStock, availableQuantity, isLowStock } = getStockStatus();

  return (
    <div className="flex flex-col p-4 rounded-xl border border-gray-200 shadow-sm bg-white">
      <div className="flex gap-3">
        {/* Image */}
        <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
          {images?.[0] ? (
            <img
              src={`${import.meta.env.VITE_API_URL}${images[0]}`}
              alt={name}
              className="w-full h-full object-cover"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
              No Image
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900">{name}</h3>
          {description && (
            <p className="text-sm text-gray-600 flex-wrap line-clamp-2">{description}</p>
          )}
          <div className="mt-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-black">
                {formatCurrency(activePriceChange ? activePriceChange.tempPrice : price.base)}
              </span>
              {activePriceChange && (
                <span className="text-sm line-through text-gray-400">
                  {formatCurrency(activePriceChange.originalPrice)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stock Status */}
      <div className="mt-3">
        {(() => {
          const isAtMaxQuantity = quantity >= availableQuantity;
          
          if (!isInStock) {
            return (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 w-fit">
                  Out of Stock
                </span>
              </div>
            );
          }
          
          if (isAtMaxQuantity) {
            return (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 w-fit">
                  Max Quantity Reached
                </span>
              </div>
            );
          }
          
          return (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 w-fit">
                In Stock
              </span>
              {availableQuantity !== Infinity && (
                <span className="text-xs text-gray-500 font-bold">
                  {availableQuantity} left
                </span>
              )}
            </div>
          );
        })()}
      </div>

      {/* Quantity Controls - Below Image and Info */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
          <button
            onClick={() => onUpdateQuantity(id, Math.max(1, quantity - 1))}
            className="w-8 h-8 flex items-center justify-center text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={quantity === 1}
            title={quantity === 1 ? "Minimum quantity is 1" : "Decrease quantity"}
          >
            −
          </button>
          <span className="w-8 text-center font-medium text-gray-800">{quantity}</span>
          <button
            onClick={() => {
              if (quantity >= availableQuantity) {
                alert(`Only ${availableQuantity} items available in stock`);
                return;
              }
              onUpdateQuantity(id, quantity + 1);
            }}
            className="w-8 h-8 flex items-center justify-center text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!isInStock || quantity >= availableQuantity}
            title={quantity >= availableQuantity ? "Maximum quantity reached" : "Increase quantity"}
          >
            +
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="font-medium text-gray-900">
              Total: {formatCurrency(price.total)}
            </span>
          </div>
          <button
            onClick={() => onRemove(id)}
            className="flex items-center gap-1.5 text-sm text-gray-500"
          >
            <Trash2 size={16} />
            Remove
          </button>
        </div>
      </div>

      {/* Attribute Dropdown */}
      {selectedAttributes?.length > 0 && (
        <div className="text-sm mt-3 border-t border-gray-100 pt-3">
          <button
            type="button"
            onClick={() => setShowAttributes((prev) => !prev)}
            className="flex items-center gap-1 text-gray-600 underline"
          >
            {showAttributes ? "Hide Selected Attributes" : "See Selected Attributes"}
            {showAttributes ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {showAttributes && (
            <div className="mt-2 space-y-3 border rounded-lg p-4 bg-gray-50">
              {selectedAttributes.map((attr) => (
                <div key={attr.attributeId}>
                  <span className="font-medium text-gray-800">
                    {attr.attributeName}:
                  </span>{" "}
                  {attr.selectedItems?.map((item, index) => (
                    <span key={item.itemId} className="ml-1 inline-block">
                      {item.itemName}
                      {item.itemPrice > 0 && (
                        <span className="ml-1 text-gray-500 font-medium">
                          (+{formatCurrency(item.itemPrice)})
                        </span>
                      )}
                      {index < attr.selectedItems.length - 1 && ", "}
                    </span>
                  ))}
                </div>
              ))}

              {/* Price Breakdown */}
              <div className="pt-2 border-t text-sm text-gray-700 space-y-1">
                <div className="flex justify-between">
                  <span>Base Price:</span>
                  <span className="font-medium">
                    {formatCurrency(activePriceChange ? activePriceChange.tempPrice : price.base)}
                  </span>
                </div>
                {activePriceChange && (
                  <div className="flex justify-between text-green-600">
                    <span>Original Price:</span>
                    <span className="font-medium line-through">
                      {formatCurrency(activePriceChange.originalPrice)}
                    </span>
                  </div>
                )}
                {price.attributes > 0 && (
                  <div className="flex justify-between">
                    <span>Add-ons:</span>
                    <span className="font-medium">{formatCurrency(price.attributes)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1 border-t">
                  <span className="font-medium">Item Total:</span>
                  <span className="font-medium">
                    {formatCurrency((activePriceChange ? activePriceChange.tempPrice : price.base) * quantity + (price.attributes * quantity))}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t text-black">
                  <span className="font-semibold">Final Total (× {quantity}):</span>
                  <span className="font-semibold">
                    {formatCurrency((activePriceChange ? activePriceChange.tempPrice : price.base) * quantity + (price.attributes * quantity))}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Special Requirements */}
      {specialRequirements && (
        <p className="text-sm text-gray-500 italic mt-3 pt-3 border-t border-gray-100">
          <span className="not-italic font-medium">Special Instructions:</span>{" "}
          {specialRequirements}
        </p>
      )}
    </div>
  );
};

const CartPage = () => {
  const {
    cartItems,
    updateCartItemQuantity,
    removeFromCart,
    formatCurrency,
    getCartItemCount,
  } = useCart();
  const { isAuthenticated, token } = useAuth();
  const { sessionId } = useGuestCart();
  const navigate = useNavigate();
  const [cartSummary, setCartSummary] = useState<CartSummary>({
    subtotal: 0,
    deliveryFee: 0,
    total: 0,
    itemCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

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

        const response = await axios.get(
          isAuthenticated
            ? CART_ENDPOINTS.USER_CART
            : CART_ENDPOINTS.GUEST_CART,
          { headers }
        );

        if (response.data?.data) {
          setCartSummary({
            subtotal: response.data.data.subtotal || 0,
            deliveryFee: response.data.data.deliveryFee || 0,
            total: response.data.data.total || 0,
            itemCount: response.data.data.itemCount || 0,
          });
        }
      } catch (error) {
        console.error("Error fetching cart summary:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCartSummary();
  }, [isAuthenticated, token, sessionId, cartItems]);

  const handleUpdateQuantity = async (id: string, newQuantity: number) => {
    try {
      // Find the cart item to check its stock
      const cartItem = cartItems.find(item => item.id === id);
      if (!cartItem) return;

      // Only check stock availability for increases, allow decreases
      const currentQuantity = cartItem.quantity;
      const stockData = cartItem.stockManagement || { isManaged: true, quantity: 5, lowStockThreshold: 2, lastUpdated: new Date().toISOString() };
      const availableQuantity = stockData.isManaged ? stockData.quantity : Infinity;
      
      if (newQuantity > currentQuantity && newQuantity > availableQuantity) {
        toast.error(`Only ${availableQuantity} items available in stock`);
        return;
      }

      await updateCartItemQuantity(id, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
      // The error will be handled by the cart context
    }
  };

  const handleRemove = (id: string) => {
    removeFromCart(id);
  };

  const handleToggleWishlist = (id: string) => {
    console.log("Toggle wishlist:", id);
  };

  const handleProceedToCheckout = () => {
    // Check if user is authenticated or has a guest session
    if (!isAuthenticated && !sessionId) {
      // Store return URL and cart state
      localStorage.setItem("returnUrl", "/checkout");

      // Redirect to login
      navigate("/login", {
        state: { from: "/checkout" },
        replace: false,
      });
      return;
    }

    // If user is authenticated or has a guest session, proceed to checkout
    navigate("/checkout");
  };

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
            Your cart is empty
          </h2>

          <p className="text-gray-600 text-base mb-6 max-w-sm mx-auto">
            Browse our menu to discover delicious options for your next meal.
          </p>

          <button
            onClick={() => navigate("/app")}
            className="inline-flex items-center justify-center gap-3 bg-black text-white font-medium px-8 py-4 rounded-xl hover:bg-gray-800 transition-all transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 shadow-md"
          >
            <ShoppingBag size={20} />
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto px-4 py-10">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="md:text-4xl text-2xl font-bold text-gray-900 mb-2">
                Shopping Cart
              </h1>
              <p className="text-gray-500">
                Review your items and proceed to checkout
              </p>
            </div>
            <button
              onClick={() => navigate("/app")}
              className="flex text-sm items-center border border-gray-200 rounded-md px-4 py-2 hover:text-gray-900 font-medium text-gray-600 transition-colors"
            >
              <ArrowLeft size={18} className="mr-2" />
              <span>Continue Shopping</span>
            </button>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl shadow-md border p-8 space-y-6">
                <h2 className="text-2xl font-semibold mb-6 flex items-center">
                  <span className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-lg mr-3">
                    1
                  </span>
                  Cart Items ({getCartItemCount()})
                </h2>
                {cartItems.map((item) => (
                  <CartItem
                    key={item.id}
                    {...item}
                    price={item.price}
                    itemTotal={item.itemTotal}
                    stockManagement={item.stockManagement}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemove={handleRemove}
                    onToggleWishlist={handleToggleWishlist}
                  />
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4">Order Summary</h3>

                  <div className="space-y-3">
                    {/* Items Summary */}
                    <div className="space-y-2">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {item.name} × {item.quantity}
                          </span>
                          <span className="font-medium">
                            {formatCurrency(item.price.total)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-3 space-y-2">
                      {/* Base Total */}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Items Subtotal</span>
                        <span className="font-medium">
                          {formatCurrency(cartItems.reduce((total, item) => total + item.price.total, 0))}
                        </span>
                      </div>

                      {/* Attributes Total */}
                      {cartItems.some(item => item.price.attributes > 0) && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Add-ons Total</span>
                          <span className="font-medium">
                            {formatCurrency(cartItems.reduce((total, item) => 
                              total + (item.price.attributes * item.quantity), 0
                            ))}
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

                      {/* Total Savings */}
                      {cartItems.some(item => item.price.base > item.price.currentEffectivePrice) && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Total Savings</span>
                          <span className="font-medium">
                            {formatCurrency(cartItems.reduce((total, item) => 
                              total + ((item.price.base - item.price.currentEffectivePrice) * item.quantity), 0
                            ))}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Final Total */}
                    <div className="pt-3 border-t">
                      <div className="flex justify-between">
                        <span className="font-semibold">Total</span>
                        <div className="text-right">
                          <span className="font-bold text-neutral-900 text-xl">
                            {formatCurrency(cartItems.reduce((total, item) => total + item.price.total, 0) + cartSummary.deliveryFee)}
                          </span>
                          {cartItems.some(item => item.price.base > item.price.currentEffectivePrice) && (
                            <div className="text-xs text-green-600 font-medium">
                              You saved {formatCurrency(cartItems.reduce((total, item) => 
                                total + ((item.price.base - item.price.currentEffectivePrice) * item.quantity), 0
                              ))}!
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate("/checkout")}
                    disabled={isLoading || cartItems.length === 0}
                    className="w-full mt-6 bg-neutral-800 text-white py-3 rounded-xl font-semibold hover:bg-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={20} />
                        Proceed to Checkout
                      </>
                    )}
                  </button>

                  <p className="mt-4 text-xs text-gray-500 text-center">
                    Delivery fees and taxes will be calculated at checkout
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
