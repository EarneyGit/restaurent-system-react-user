import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  name: string;
  color: string;
  count: number;
  category: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ name, color, count, category }) => {
  return (
    <Link to={`/products/${encodeURIComponent(category)}`} className="block">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border">
        <div className="relative">
          <div className="absolute top-2 left-2 bg-gray-100 text-xs px-2 py-1 rounded-full">
            {count} food
          </div>
          <div className={`w-full h-[130px] ${color}`}></div>
        </div>
        <div className="p-3">
          <h3 className="font-medium">{name}</h3>
        </div>
      </div>
    </Link>
  );
};

const ProductSection = () => {
  const categories = [
    { name: "Desserts", color: "bg-gradient-to-r from-pink-200 to-pink-100", count: 40, category: "Desserts" },
    { name: "Cakes", color: "bg-gradient-to-r from-yellow-200 to-yellow-100", count: 38, category: "Cakes" },
    { name: "Ice Cream", color: "bg-gradient-to-r from-blue-200 to-blue-100", count: 24, category: "Ice cream" },
    { name: "Coffee", color: "bg-gradient-to-r from-brown-300 to-brown-200", count: 15, category: "Coffee" }
  ];

  return (
    <div className="mt-10">
      <div className="px-4 flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Box</h2>
        <Link to="/products/All" className="flex items-center gap-1 text-sm text-gray-500">
          <span>See all</span>
          <ArrowRight size={16} />
        </Link>
      </div>
      
      <div className="px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category, index) => (
            <ProductCard 
              key={index}
              name={category.name} 
              color={category.color} 
              count={category.count}
              category={category.category}
            />
          ))}
        </div>
      </div>
      
      <div className="mt-8 px-4 flex items-center justify-between">
        <button className="bg-gray-100 text-gray-800 rounded-full px-5 py-2 font-medium">
          All
        </button>
        
        <Button variant="ghost" className="flex items-center gap-1 text-gray-500">
          <ArrowUpDown size={16} />
          <span>Sorted by</span>
        </Button>
      </div>
    </div>
  );
};

export default ProductSection;
