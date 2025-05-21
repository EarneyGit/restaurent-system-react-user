import React, { useState } from "react";
import { Product } from "@/services/api";
import { useCart } from "@/context/CartContext";
import { BaggageClaim, Minus, Plus } from "lucide-react";
import ProductOptionsModal from "../modals/ProductOptionsModal";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, updateQuantity, getItemQuantity } = useCart();
  const quantity = getItemQuantity(product.id);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);

  // Sample product options - you can replace these with actual product options
  const productOptions = [
    {
      id: "size",
      name: "Size",
      choices: [
        { id: "small", name: "Small", price: 0 },
        { id: "medium", name: "Medium", price: 2 },
        { id: "large", name: "Large", price: 4 },
      ],
    },
    {
      id: "extras",
      name: "Extra Toppings",
      choices: [
        { id: "cheese", name: "Extra Cheese", price: 1.5 },
        { id: "sauce", name: "Special Sauce", price: 1 },
        { id: "spicy", name: "Make it Spicy", price: 0.5 },
      ],
    },
  ];

  // Helper function to get category name
  const getCategoryName = (category: string | { name: string }): string => {
    return typeof category === "object" ? category.name : category;
  };

  // Helper function to get first image URL
  const getFirstImageUrl = (images: string[]): string => {
    if (!images || !images.length) return "/placeholder.svg";
    return images[0];
  };

  const handleAddToCart = (selectedOptions: Record<string, string>, specialRequirements: string) => {
    // Calculate additional cost from selected options
    const additionalCost = Object.entries(selectedOptions).reduce((total, [optionId, choiceId]) => {
      const option = productOptions.find(opt => opt.id === optionId);
      const choice = option?.choices.find(c => c.id === choiceId);
      return total + (choice?.price || 0);
    }, 0);

    // Create a modified product with selected options and special requirements
    const modifiedProduct = {
      ...product,
      price: product.price + additionalCost,
      selectedOptions,
      specialRequirements,
    };

    addToCart(modifiedProduct);
  };

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden transition-all hover:shadow-md">
        <div className="relative">
          <img
            src={getFirstImageUrl(product.images)}
            alt={product.name}
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-2 right-2 bg-[#e8f5e9] px-2 py-1 rounded-full text-xs font-medium text-black/80">
            {getCategoryName(product.category)}
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-medium text-black">{product.name}</h3>
          <p className="text-sm text-gray-700 mt-1 line-clamp-2">
            {product.description}
          </p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-lg font-bold text-black">
              ${product.price.toFixed(2)}
            </span>
            {quantity === 0 ? (
              <button
                onClick={() => setIsOptionsModalOpen(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <BaggageClaim size={18} />
                <span>Add</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(product.id, quantity - 1)}
                  className="w-8 h-8 flex items-center justify-center border-2 border-[#4caf50] rounded-full hover:bg-[#e8f5e9] text-[#2e7d32] transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus size={16} />
                </button>
                <span className="w-8 text-center font-medium text-[#2e7d32]">
                  {quantity}
                </span>
                <button
                  onClick={() => updateQuantity(product.id, quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center border-2 border-[#4caf50] rounded-full hover:bg-[#e8f5e9] text-[#2e7d32] transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus size={16} />
                </button>
              </div>
            )}
          </div>
          {product.calorificValue && (
            <div className="text-xs text-gray-700 mt-2">
              {product.calorificValue} kcal
            </div>
          )}
        </div>
      </div>

      <ProductOptionsModal
        isOpen={isOptionsModalOpen}
        onClose={() => setIsOptionsModalOpen(false)}
        onAddToCart={handleAddToCart}
        productName={product.name}
        options={productOptions}
      />
    </>
  );
};

export default ProductCard;
