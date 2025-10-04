
import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface BoxCardProps {
  name: string;
  color: string;
  count: number;
}

const BoxCard: React.FC<BoxCardProps> = ({ name, color, count }) => {
  return (
    <Link to="/product" className="block">
      <div className="bg-white rounded-lg overflow-hidden">
        <div 
          className={`w-full h-[120px] ${color}`}
        />
        <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
          {count} items
        </div>
      </div>
    </Link>
  );
};

const ProductBoxes = () => {
  const boxes = [
    { name: "Cheesecake", color: "bg-gradient-to-r from-red-100 to-red-200", count: 40 },
    { name: "Dessert", color: "bg-gradient-to-r from-yellow-100 to-yellow-200", count: 38 },
    { name: "Cookies", color: "bg-gradient-to-r from-orange-100 to-orange-200", count: 4 },
    { name: "Macarons", color: "bg-gradient-to-r from-blue-100 to-blue-200", count: 12 },
    { name: "Mini pies", color: "bg-gradient-to-r from-purple-100 to-purple-200", count: 28 },
    { name: "Assorted bread", color: "bg-gradient-to-r from-yellow-100 to-yellow-200", count: 8 },
  ];

  return (
    <div className="my-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Box</h2>
        <Link to="/all-boxes" className="flex items-center gap-1 text-sm text-gray-500">
          <span>See all</span>
          <ArrowRight size={16} />
        </Link>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {boxes.map((box, index) => (
          <div key={index} className="relative">
            <BoxCard 
              name={box.name}
              color={box.color}
              count={box.count}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductBoxes;
