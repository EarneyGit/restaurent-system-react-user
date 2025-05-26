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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0 group"
    >
      {/* Product Image */}
      <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden transform transition-transform group-hover:scale-105">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null; // Prevent infinite loop
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                const noImageDiv = document.createElement('div');
                noImageDiv.className = 'w-full h-full flex items-center justify-center bg-gray-100';
                const noImage = document.createElement('div');
                noImage.innerHTML = '<NoImage />';
                noImageDiv.appendChild(noImage);
                parent.appendChild(noImageDiv);
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
      <div className="flex-1">
        <h3 className="text-base font-medium text-gray-900 group-hover:text-green-600 transition-colors">
          {name}
        </h3>
        {description && (
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">
            {description}
          </p>
        )}
        <div className="mt-1 space-y-1">
          {variant && (
            <p className="text-xs text-gray-400">
              Variant: {variant}
            </p>
          )}
          {size && (
            <p className="text-xs text-gray-400">
              Size: {size}
            </p>
          )}
          {color && (
            <p className="text-xs text-gray-400">
              Color: {color}
            </p>
          )}
        </div>
      </div>

      {/* Price and Actions */}
      <div className="text-right space-y-2">
        <p className="text-base font-medium text-gray-900">
          ${(price * quantity).toFixed(2)}
        </p>
        
        {/* Quantity Controls */}
        <div className="flex items-center justify-end gap-2 border border-gray-200 rounded-lg">
          <button
            onClick={() => onUpdateQuantity(id, Math.max(1, quantity - 1))}
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-green-600 transition-colors"
            disabled={quantity === 1}
          >
            <Minus size={16} />
          </button>
          <span className="w-8 text-center font-medium text-sm">{quantity}</span>
          <button
            onClick={() => onUpdateQuantity(id, quantity + 1)}
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-green-600 transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Remove Button */}
        <button
          onClick={() => onRemove(id)}
          className="flex items-center gap-1 text-gray-400 hover:text-red-600 transition-colors text-sm ml-auto"
        >
          <Trash2 size={16} />
          <span className="font-medium">Remove</span>
        </button>
      </div>
    </motion.div>
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
            className="inline-flex items-center justify-center gap-3 bg-black text-white font-medium px-8 py-4 rounded-xl hover:bg-gray-800 transition-all transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 shadow-md"
          >
            <ShoppingBag size={20} />
            Browse Menu
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen"
    >
      <div className="mx-auto px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
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
              <ArrowLeft
                size={18}
                className="mr-2 group-hover:-translate-x-1 transition-transform"
              />
              <span>Continue Shopping</span>
            </button>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="bg-white rounded-3xl shadow-md border p-8 space-y-6">
                <h2 className="text-2xl font-semibold mb-6 flex items-center">
                  <span className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-lg mr-3">
                    1
                  </span>
                  Cart Items
                </h2>
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
            </motion.div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-1"
            >
              <div className="sticky top-24">
                <OrderSummary />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CartPage;
