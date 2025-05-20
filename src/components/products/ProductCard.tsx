import React from "react";
import { Product } from "@/services/api";
import { useCart } from "@/context/CartContext";
import { Minus, Plus } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, updateQuantity, getItemQuantity } = useCart();
  const quantity = getItemQuantity(product.id);

  // Helper function to get category name
  const getCategoryName = (category: string | { name: string }): string => {
    return typeof category === 'object' ? category.name : category;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative aspect-square">
        <img
          src={product.imageUrl || "/placeholder.svg"}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium">
          {getCategoryName(product.category)}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-medium text-gray-900">{product.name}</h3>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg font-semibold">${product.price.toFixed(2)}</span>
          {quantity === 0 ? (
            <button 
              onClick={() => addToCart(product)}
              className="bg-primary text-white px-4 py-2 rounded-full text-sm hover:bg-primary/90 transition-colors"
            >
              Add to Cart
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => updateQuantity(product.id, quantity - 1)}
                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-100"
              >
                <Minus size={16} />
              </button>
              <span className="w-8 text-center font-medium">{quantity}</span>
              <button 
                onClick={() => updateQuantity(product.id, quantity + 1)}
                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-100"
              >
                <Plus size={16} />
              </button>
            </div>
          )}
        </div>
        {product.calorificValue && (
          <div className="mt-2 text-xs text-gray-500">
            {product.calorificValue} kcal
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard; 