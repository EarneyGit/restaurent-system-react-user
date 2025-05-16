import React, { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { useCart } from "@/lib/context/CartContext";

interface Product {
  id: number;
  name: string;
  description: string;
  image: string;
  price: number;
  category: string;
}

interface ProductCardProps {
  product: Product;
}

const getCategoryColor = (category: string): string => {
  switch (category) {
    case "Desserts":
      return "bg-gradient-to-r from-pink-200 to-pink-100";
    case "Cakes":
      return "bg-gradient-to-r from-yellow-200 to-yellow-100";
    case "Coffee":
      return "bg-gradient-to-r from-amber-300 to-amber-200";
    case "Bubble tea":
      return "bg-gradient-to-r from-purple-200 to-purple-100";
    case "Ice cream":
      return "bg-gradient-to-r from-blue-200 to-blue-100";
    default:
      return "bg-gradient-to-r from-gray-200 to-gray-100";
  }
};

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [imageError, setImageError] = useState(false);
  const { cartItems, addToCart, updateQuantity } = useCart();

  // Check if product is in cart and get its quantity
  const cartItem = cartItems.find(item => item.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category
    });
  };

  const incrementQuantity = () => {
    if (cartItem) {
      updateQuantity(product.id, cartItem.quantity + 1);
    } else {
      handleAddToCart();
    }
  };

  const decrementQuantity = () => {
    if (cartItem && cartItem.quantity > 0) {
      updateQuantity(product.id, cartItem.quantity - 1);
    }
  };

  const categoryColor = getCategoryColor(product.category);

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow hover:shadow-md transition-shadow duration-300">
      {/* Product Image */}
      <div className="relative h-48 overflow-hidden">
        {imageError || product.image === "/placeholder.svg" ? (
          <div className={`w-full h-full flex items-center justify-center ${categoryColor}`}>
            <div className="text-3xl">{product.name.charAt(0)}</div>
          </div>
        ) : (
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        )}
        <div className="absolute top-2 right-2 bg-white text-xs px-2 py-1 rounded-full shadow-sm">
          {product.category}
        </div>
      </div>
      
      {/* Product Details */}
      <div className="p-4">
        <h3 className="font-semibold text-lg">{product.name}</h3>
        <p className="text-gray-600 text-sm mt-1 line-clamp-2">{product.description}</p>
        
        {/* Price and Controls */}
        <div className="mt-4 flex items-center justify-between">
          <span className="font-bold">${product.price.toFixed(2)}</span>
          
          {quantity === 0 ? (
            <button 
              onClick={handleAddToCart}
              className="px-3 py-1 bg-foodyman-lime text-white rounded-md flex items-center space-x-1"
            >
              <span>Add</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button 
                onClick={decrementQuantity}
                className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded-md"
              >
                <Minus size={16} />
              </button>
              <span className="w-6 text-center">{quantity}</span>
              <button 
                onClick={incrementQuantity}
                className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded-md"
              >
                <Plus size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 