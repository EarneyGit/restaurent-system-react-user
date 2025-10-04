import React, { useState } from "react";
import { Minus, Plus } from "lucide-react";

interface Product {
  id: number;
  name: string;
  description: string;
  image: string;
  price: number;
  category: string;
}

interface ProductDetailProps {
  product: Product;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product }) => {
  const [quantity, setQuantity] = useState(1);

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-lg p-6">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Product Image */}
        <div className="w-full md:w-1/2">
          <img 
            src={product.image || "https://via.placeholder.com/500x500?text=Product+Image"} 
            alt={product.name} 
            className="w-full h-auto object-cover rounded-lg"
          />
        </div>
        
        {/* Product Details */}
        <div className="w-full md:w-1/2">
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <div className="text-gray-600 mb-6">
            {product.description}
          </div>
          
          <div className="border-t border-b py-4 my-6">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">${product.price.toFixed(2)}</div>
              
              <div className="flex items-center">
                <button 
                  onClick={decrementQuantity}
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-l-md"
                >
                  <Minus size={20} />
                </button>
                <div className="w-14 h-10 flex items-center justify-center border-t border-b border-gray-300">
                  {quantity}
                </div>
                <button 
                  onClick={incrementQuantity}
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-r-md"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>
          </div>
          
          <button className="w-full py-3 bg-brand-yellow text-white rounded-md font-medium">
            Add to Cart - ${(product.price * quantity).toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 
