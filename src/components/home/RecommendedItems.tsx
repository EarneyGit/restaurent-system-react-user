import React, { useState } from "react";
import { ArrowRight, BaggageClaim } from "lucide-react";
import { Link } from "react-router-dom";
import ProductOptionsModal from "../modals/ProductOptionsModal";

interface ProductProps {
  id: string;
  name: string;
  color: string;
  description: string;
  price: number;
}

const ProductCard: React.FC<ProductProps> = ({
  id,
  name,
  color,
  description,
  price,
}) => {
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

  const handleAddToCart = (selectedOptions: Record<string, string>, specialRequirements: string) => {
    // Calculate additional cost from selected options
    const additionalCost = Object.entries(selectedOptions).reduce((total, [optionId, choiceId]) => {
      const option = productOptions.find(opt => opt.id === optionId);
      const choice = option?.choices.find(c => c.id === choiceId);
      return total + (choice?.price || 0);
    }, 0);

    // Create a modified product with selected options and special requirements
    const modifiedProduct = {
      id,
      name,
      price: price + additionalCost,
      selectedOptions,
      specialRequirements,
    };

    // Here you would typically call your cart context's addToCart function
    console.log('Adding to cart:', modifiedProduct);
  };

  return (
    <>
      <div className="bg-white rounded-lg overflow-hidden shadow-sm">
        <div className="relative">
          <div className={`w-full h-[150px] ${color}`}></div>
        </div>
        <div className="p-4">
          <h3 className="font-medium mb-1">{name}</h3>
          <p className="text-xs text-gray-500 mb-3">{description}</p>
          <div className="flex justify-between items-center">
            <span className="font-semibold">${price.toFixed(2)}</span>
            <button 
              onClick={() => setIsOptionsModalOpen(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <BaggageClaim size={18} />
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>

      <ProductOptionsModal
        isOpen={isOptionsModalOpen}
        onClose={() => setIsOptionsModalOpen(false)}
        onAddToCart={handleAddToCart}
        productName={name}
        options={productOptions}
      />
    </>
  );
};

const RecommendedItems = () => {
  const items = [
    {
      id: "1",
      name: "Classic Cheesecake",
      color: "bg-gradient-to-r from-yellow-100 to-yellow-200",
      description: "Rich and creamy New York style cheesecake",
      price: 12.99,
    },
    {
      id: "2",
      name: "Chocolate Truffle",
      color: "bg-gradient-to-r from-brown-100 to-brown-200",
      description: "Decadent chocolate truffle cake",
      price: 15.99,
    },
    {
      id: "3",
      name: "Strawberry Shortcake",
      color: "bg-gradient-to-r from-red-100 to-red-200",
      description: "Light and fluffy with fresh strawberries",
      price: 14.99,
    },
    {
      id: "4",
      name: "Matcha Green Tea",
      color: "bg-gradient-to-r from-green-100 to-green-200",
      description: "Japanese inspired matcha cake",
      price: 16.99,
    },
  ];

  return (
    <div className="my-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Recommended</h2>
        <Link
          to="/all-recommended"
          className="flex items-center gap-1 text-sm text-gray-500"
        >
          <span>See all</span>
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4">
        {items.map((item) => (
          <ProductCard key={item.id} {...item} />
        ))}
      </div>
    </div>
  );
};

export default RecommendedItems;
