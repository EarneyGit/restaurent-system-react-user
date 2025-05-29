import React, { useState, useEffect } from "react";
import { Minus, Plus, Heart, Trash2, ArrowLeft, ShoppingBag, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import OrderSummary from "@/components/cart/OrderSummary";
import NoImage from "@/components/common/NoImage";
import { ProductAttribute } from "@/services/api";
import { CartItem as CartItemType } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useGuestCart } from '@/context/GuestCartContext';
import axios from '@/config/axios.config';
import { CART_ENDPOINTS } from '@/config/api.config';

interface CartSummary {
  subtotal: number;
  deliveryFee: number;
  total: number;
  itemCount: number;
}

interface CartItemProps extends CartItemType {
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  onToggleWishlist: (id: string) => void;
  images?: string[];
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
  onUpdateQuantity,
  onRemove,
  onToggleWishlist,
}) => {
  const { formatCurrency } = useCart();
  
  // Calculate total price including options
  const calculateTotalPrice = () => {
    let total = price;
    
    // Add option prices
    if (selectedOptions && attributes) {
      attributes.forEach(attr => {
        const selectedChoiceId = selectedOptions[attr.id];
        if (selectedChoiceId) {
          const choice = attr.choices.find(c => c.id === selectedChoiceId);
          if (choice) {
            total += choice.price;
          }
        }
      });
    }
    
    return total * quantity;
  };

  return (
    <div className="flex items-start gap-4 pb-6 border-b border-gray-100 last:border-0 last:pb-0 group">
      {/* Product Image */}
      <div className="w-24 h-24 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 transform transition-transform group-hover:scale-105">
        {images?.[0] ? (
          <img
            src={images[0]}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-100"><div class="text-gray-400"><NoImage /></div></div>';
              }
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <div className="text-gray-400">
              <NoImage />
            </div>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 py-2">
        <h3 className="text-lg font-medium text-gray-900 group-hover:text-green-600 transition-colors">
          {name}
        </h3>
        {description && (
          <p className="mt-2 text-sm text-gray-500 mb-3">
            {description}
          </p>
        )}
        
        {/* Selected Options */}
        {Object.keys(selectedOptions).length > 0 && (
          <div className="mt-4 space-y-2">
            {attributes.map(attr => {
              const selectedChoiceId = selectedOptions[attr.id];
              if (!selectedChoiceId) return null;
              
              const choice = attr.choices.find(c => c.id === selectedChoiceId);
              if (!choice) return null;

              return (
                <div key={attr.id} className="flex items-center text-sm text-gray-500">
                  <span className="font-medium">{attr.name}:</span>
                  <span className="ml-2">{choice.name}</span>
                  {choice.price > 0 && (
                    <span className="ml-2 text-gray-400">
                      (+{formatCurrency(choice.price)})
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Special Requirements */}
        {specialRequirements && (
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              <span className="font-medium">Special Instructions:</span>
              <span className="ml-2 italic">{specialRequirements}</span>
            </p>
          </div>
        )}
      </div>

      {/* Price and Actions */}
      <div className="text-right space-y-3">
        <p className="text-lg font-medium text-gray-900">
          {formatCurrency(calculateTotalPrice())}
        </p>
        
        {/* Quantity Controls */}
        <div className="flex items-center justify-end gap-2 border border-gray-200 rounded-lg p-1">
          <button
            onClick={() => onUpdateQuantity(id, Math.max(1, quantity - 1))}
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-green-600 transition-colors rounded-md hover:bg-gray-50"
            disabled={quantity === 1}
          >
            <Minus size={16} />
          </button>
          <span className="w-8 text-center font-medium text-sm">{quantity}</span>
          <button
            onClick={() => onUpdateQuantity(id, quantity + 1)}
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-green-600 transition-colors rounded-md hover:bg-gray-50"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Remove Button */}
        <button
          onClick={() => onRemove(id)}
          className="flex items-center gap-1.5 text-gray-400 hover:text-red-600 transition-colors text-sm ml-auto"
        >
          <Trash2 size={16} />
          <span className="font-medium">Remove</span>
        </button>
      </div>
    </div>
  );
};

const CartPage = () => {
  const { cartItems, updateCartItemQuantity, removeFromCart, formatCurrency } = useCart();
  const { isAuthenticated, token } = useAuth();
  const { sessionId } = useGuestCart();
  const navigate = useNavigate();
  const [cartSummary, setCartSummary] = useState<CartSummary>({
    subtotal: 0,
    deliveryFee: 0,
    total: 0,
    itemCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCartSummary = async () => {
      try {
        const headers = isAuthenticated ? {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        } : {
          'x-session-id': sessionId,
          'Content-Type': 'application/json'
        };

        const response = await axios.get(
          isAuthenticated ? CART_ENDPOINTS.USER_CART : CART_ENDPOINTS.GUEST_CART,
          { headers }
        );

        if (response.data?.data) {
          setCartSummary({
            subtotal: response.data.data.subtotal || 0,
            deliveryFee: response.data.data.deliveryFee || 0,
            total: response.data.data.total || 0,
            itemCount: response.data.data.itemCount || 0
          });
        }
      } catch (error) {
        console.error('Error fetching cart summary:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCartSummary();
  }, [isAuthenticated, token, sessionId, cartItems]);

  const handleUpdateQuantity = (id: string, quantity: number) => {
    updateCartItemQuantity(id, quantity);
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
      localStorage.setItem('returnUrl', '/checkout');
      
      // Redirect to login
      navigate('/login', { 
        state: { from: '/checkout' },
        replace: false 
      });
      return;
    }

    // If user is authenticated or has a guest session, proceed to checkout
    navigate('/checkout');
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
              onClick={() => navigate(-1)}
              className="flex text-sm items-center border border-gray-200 rounded-md px-4 py-2 hover:border-green-600 hover:bg-green-50 text-gray-600 hover:text-gray-900 transition-colors"
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
                  Cart Items ({cartSummary.itemCount})
                </h2>
                {cartItems.map((item) => (
                  <CartItem
                    key={item.id}
                    {...item}
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
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">{formatCurrency(cartSummary.subtotal)}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Delivery Fee</span>
                      <span className="font-medium">{formatCurrency(cartSummary.deliveryFee)}</span>
                    </div>

                    <div className="pt-3 border-t">
                      <div className="flex justify-between">
                        <span className="font-semibold">Total</span>
                        <span className="font-bold text-neutral-900 text-xl">{formatCurrency(cartSummary.total)}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/checkout')}
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
