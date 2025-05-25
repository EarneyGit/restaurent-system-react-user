import React from "react";
import { Minus, Plus, Heart, Trash2, ArrowLeft, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import OrderSummary from "@/components/cart/OrderSummary";
import NoImage from "@/components/common/NoImage";
import { motion } from 'framer-motion';

interface CartItemProps {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  description?: string;
  variant?: string;
  size?: string;
  color?: string;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  onToggleWishlist: (id: string) => void;
}

const CartItem: React.FC<CartItemProps> = ({
  id,
  name,
  price,
  quantity,
  image,
  description,
  variant,
  size,
  color,
  onUpdateQuantity,
  onRemove,
  onToggleWishlist,
}) => {
  return (
    <div className="flex gap-4 py-4 border-b border-gray-100">
      {/* Product Image */}
      <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
        {image && image !== "" ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              const parent = e.currentTarget.parentElement;
              if (parent) {
                const svg = document.createElement("div");
                svg.className = "w-full h-full";
                svg.innerHTML =
                  '<div class="w-full h-full flex items-center justify-center bg-gray-100"><NoImage /></div>';
                parent.appendChild(svg);
              }
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <NoImage />
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-base font-medium text-gray-900">{name}</h3>
            {description && (
              <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                {description}
              </p>
            )}
            <div className="mt-1 space-y-1">
              {variant && (
                <p className="text-sm text-gray-500">
                  Variant: <span className="text-gray-700">{variant}</span>
                </p>
              )}
              {size && (
                <p className="text-sm text-gray-500">
                  Size: <span className="text-gray-700">{size}</span>
                </p>
              )}
              {color && (
                <p className="text-sm text-gray-500">
                  Color: <span className="text-gray-700">{color}</span>
                </p>
              )}
            </div>
          </div>
          <span className="text-lg font-semibold">${price.toFixed(2)}</span>
        </div>

        {/* Actions Row */}
        <div className="flex justify-between items-center mt-4">
          {/* Quantity Controls */}
          <div className="flex items-center">
            <button
              onClick={() => onUpdateQuantity(id, Math.max(1, quantity - 1))}
              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700"
              disabled={quantity === 1}
            >
              <Minus size={18} />
            </button>
            <span className="w-10 text-center font-medium">{quantity}</span>
            <button
              onClick={() => onUpdateQuantity(id, quantity + 1)}
              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700"
            >
              <Plus size={18} />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            {/* <button
              onClick={() => onToggleWishlist(id)}
              className="text-gray-400 hover:text-gray-600"
            >
              <Heart size={20} />
            </button> */}
            <button
              onClick={() => onRemove(id)}
              className="flex items-center gap-1 text-red-500 hover:text-red-600"
            >
              <Trash2 size={20} />
              <span className="text-sm font-medium">Remove</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CartPage = () => {
  const { cartItems, updateCartItemQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  const handleUpdateQuantity = (id: string, quantity: number) => {
    updateCartItemQuantity(id, quantity);
  };

  const handleRemove = (id: string) => {
    removeFromCart(id);
  };

  const handleToggleWishlist = (id: string) => {
    // Implement wishlist functionality
    console.log("Toggle wishlist:", id);
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back button section */}
      <div className="flex justify-between items-center max-w-7xl mx-auto px-4 pt-8 sm:px-6 lg:px-8 ">
        {/* Page Title */}
        <h1 className="text-2xl font-semibold text-neutral-900">My Cart</h1>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center border text-sm border-gray-200 rounded-md p-2 hover:border-gray-300 hover:bg-green-50/90 text-gray-600 hover:text-gray-900 transition-colors "
        >
          <ArrowLeft
            size={18}
            className="mr-2 group-hover:-translate-x-1 transition-transform"
          />
          <span>Back</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg p-6">
              {cartItems.map((item) => (
                <CartItem
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  price={item.price}
                  quantity={item.quantity}
                  image={item.images?.[0]}
                  description={item.description}
                  variant={item.variant}
                  size={item.size}
                  color={item.color}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleRemove}
                  onToggleWishlist={handleToggleWishlist}
                />
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
