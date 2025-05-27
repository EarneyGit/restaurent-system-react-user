import React, { useState } from "react";
import { Product } from "@/services/api";
import { useCart } from "@/context/CartContext";
import { Minus, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import ProductOptionsModal from "../modals/ProductOptionsModal";

interface ProductCardProps {
  product: Product;
}

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

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const { addToCart, updateCartItemQuantity, cartItems } = useCart();
  const [imageError, setImageError] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Check if product is in cart
  const cartItem = cartItems.find(item => item.id === String(product.id));
  const isInCart = Boolean(cartItem);

  // Get the API URL from environment variable and ensure it ends with a slash
  const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/?$/, '/');

  const getImageUrl = (url: string | undefined): string | null => {
    if (!url) return null;
    try {
      if (url.startsWith('http')) return url;
      const cleanUrl = url.trim()
        .replace(/^\/+/, '')
        .replace(/\\/g, '/');
      return `${API_URL}${cleanUrl}`;
    } catch (error) {
      console.error('Error processing image URL:', error);
      return null;
    }
  };

  const handleQuantityChange = async (newQuantity: number) => {
    if (isInCart && cartItem) {
      try {
        await updateCartItemQuantity(String(cartItem.id), newQuantity);
        toast.success('Cart updated');
      } catch (error) {
        console.error('Error updating cart:', error);
        toast.error('Failed to update cart');
      }
    } else {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    // If product has attributes, show options modal
    if (product.attributes && product.attributes.length > 0) {
      setIsOptionsModalOpen(true);
      return;
    }

    try {
      setIsAddingToCart(true);
      await addToCart({ ...product, quantity });
      toast.success('Added to cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleOptionsSubmit = async (selectedOptions: Record<string, string>, specialRequirements: string) => {
    try {
      setIsAddingToCart(true);
      await addToCart({ 
        ...product, 
        quantity,
        selectedOptions,
        specialRequirements 
      });
      toast.success('Added to cart');
      setIsOptionsModalOpen(false);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const imageUrl = getImageUrl(product.images?.[selectedVariant]);
  const hasMultipleImages = (product.images?.length || 0) > 2;
  const category = typeof product.category === 'string' ? product.category : product.category?.name || '';

  return (
    <>
      <div className="bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 relative flex flex-col h-full">
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
              className="w-full p-3 rounded-xl h-full object-contain"
              onError={() => setImageError(true)}
              loading="eager"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2Z" fill="currentColor" fillOpacity="0.2"/>
                <path d="M15 8H9C7.895 8 7 8.895 7 10V14C7 15.105 7.895 16 9 16H15C16.105 16 17 15.105 17 14V10C17 8.895 16.105 8 15 8Z" fill="currentColor"/>
              </svg>
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
                      ? 'border-2 border-gray-900' 
                      : 'border border-gray-200'
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
          <h3 className="font-medium text-gray-900">{product.name}</h3>
          <p className="text-left text-sm text-neutral-500 mt-1 line-clamp-2 break-words">{product?.description}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-bold text-lg">₹{product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="text-sm text-gray-400 line-through">
                ₹{product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Sticky Cart Controls */}
        <div className="sticky bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
          {isInCart ? (
            <div className="w-full bg-gray-100 rounded-xl flex items-center">
              <button
                onClick={() => handleQuantityChange(Math.max(1, (cartItem?.quantity || 1) - 1))}
                className="p-3 hover:text-gray-700 text-gray-500 flex-shrink-0"
                disabled={cartItem?.quantity === 1}
              >
                <Minus size={20} />
              </button>
              <span className="flex-1 text-center font-medium">{cartItem?.quantity || 1}</span>
              <button
                onClick={() => handleQuantityChange((cartItem?.quantity || 1) + 1)}
                className="p-3 hover:text-gray-700 text-gray-500 flex-shrink-0"
              >
                <Plus size={20} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className="w-full bg-neutral-800 text-white py-2.5 rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
            >
              {isAddingToCart ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Adding...
                </>
              ) : (
                'Add to Cart'
              )}
            </button>
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
