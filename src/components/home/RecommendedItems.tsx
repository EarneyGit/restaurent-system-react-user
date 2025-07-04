import React, { useState, useEffect } from "react";
import { ArrowRight, Heart, Minus, Plus, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { Product as BaseProduct, getProducts } from "@/services/api";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import '@/styles/carousel.css';

interface Product extends Omit<BaseProduct, 'category' | 'id'> {
  originalPrice?: number;
  category: string;
  id: string;
}

const API_URL = (import.meta.env.VITE_API_URL || 'http://82.25.104.117:5001').replace(/\/?$/, '/');

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

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addToCart, updateCartItemQuantity, cartItems = [] } = useCart();
  const [imageError, setImageError] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Check if product is in cart
  const cartItem = cartItems.find(item => item.id === product.id);
  const isInCart = Boolean(cartItem);

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
        if (newQuantity < 1) {
          return; // Prevent quantity from going below 1
        }
        await updateCartItemQuantity(cartItem.id, newQuantity);
        toast.success('Cart updated');
      } catch (error) {
        console.error('Error updating cart:', error);
        toast.error('Failed to update cart');
      }
    } else {
      setQuantity(Math.max(1, newQuantity));
    }
  };

  const handleAddToCart = async () => {
    try {
      setIsAddingToCart(true);
      // Prepare the cart item with all necessary fields matching CartItem interface
      const cartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        description: product.description,
        images: product.images,
        category: product.category,
      };
      await addToCart(cartItem);
      toast.success('Added to cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const imageUrl = getImageUrl(product.images?.[selectedVariant]);
  const hasMultipleImages = (product.images?.length || 0) > 2;

  console.log("imageUrl",imageUrl)
  console.log("imageError",imageError)
  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 relative flex flex-col h-[400px] w-full">
      {/* Category Badge */}
      <div className="absolute top-5 left-4 z-10">
        <span className="px-3 py-1 bg-neutral-900 text-white rounded-full text-xs font-medium">
          {product.category}
        </span>
      </div>

      {/* Main Image Container */}
      <div className="w-full h-[180px] bg-white border-b border-gray-100">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-contain p-4 transition-transform hover:scale-95"
            onError={() => setImageError(true)}
            loading="eager"
          />
        ) : (
          <div className="w-full h-full bg-gray-50 flex items-center justify-center">
            <div className="p-8 rounded-full bg-gray-100">
              <svg className="w-12 h-12 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2Z" fill="currentColor" fillOpacity="0.2"/>
                <path d="M15 8H9C7.895 8 7 8.895 7 10V14C7 15.105 7.895 16 9 16H15C16.105 16 17 15.105 17 14V10C17 8.895 16.105 8 15 8Z" fill="currentColor"/>
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Variants Container - Fixed height and separate from main image */}
      {/* {hasMultipleImages && (
        <div className="w-full h-[70px] bg-white  p-2">
          <div className="flex gap-2 overflow-x-auto h-full items-center">
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
        </div>
      )} */}

      {/* Product Info Container - Takes remaining space */}
      <div className="flex flex-col h-full">
        <div className="flex-1 p-4 pt-2">
          <h3 className="font-medium text-left text-neutral-700 line-clamp-1">{product.name}</h3>
          <p className="text-left text-sm text-neutral-500 mt-1 line-clamp-2 break-words">{product?.description}</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-bold text-lg">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="text-sm text-gray-400 line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Cart Controls - Fixed at bottom */}
        <div className="p-4 pt-0 mt-auto border-t border-gray-100">
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
              className="w-full bg-gray-900 text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
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
    </div>
  );
};

const RecommendedItems = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await getProducts();
        const transformedProducts: Product[] = response.map(product => ({
          ...product,
          id: String(product.id),
          category: typeof product.category === 'string' 
            ? product.category 
            : product.category.name
        }));
        setProducts(transformedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (isLoading) {
    return (
      <div className="mt-10 flex justify-center items-center min-h-[200px]">
        <Loader2 size={40} className="animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-10 text-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="mt-10">
      <div className="px-4 flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-neutral-800">Recommended Products</h2>
        {/* <Link to="/products/All" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <span>See all</span>
          <ArrowRight size={16} />
        </Link> */}
      </div>
      
      <div className="py-4">
        <Swiper
          modules={[Navigation, Autoplay]}
          spaceBetween={24}
          slidesPerView={1.2}
          navigation={true}
          updateOnWindowResize={true}
          observer={true}
          observeParents={true}
          // autoplay={{
          //   delay: 3000,
          //   disableOnInteraction: true,
          // }}
          breakpoints={{
            640: {
              slidesPerView: 2,
              spaceBetween: 24,
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 24,
            },
            1280: {
              slidesPerView: 4,
              spaceBetween: 24,
            },
          }}
          className="recommended-swiper"
        >
          {products.map(product => (
            <SwiperSlide key={product.id} className="!h-auto ">
              <ProductCard product={product} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default RecommendedItems;
