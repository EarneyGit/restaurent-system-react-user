
import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface CategoryProps {
  color: string;
  name: string;
}

const CategoryItem: React.FC<CategoryProps> = ({ color, name }) => {
  return (
    <Link to="/category" className="flex flex-col items-center">
      <div className={`rounded-full ${color} w-[60px] h-[60px] mb-2`}></div>
      <span className="text-xs text-center">{name}</span>
    </Link>
  );
};

const FoodCategories = () => {
  const categories = [
    { name: "New", color: "bg-red-300" },
    { name: "Discounts", color: "bg-orange-300" },
    { name: "Sets", color: "bg-yellow-300" },
    { name: "Cheesecakes", color: "bg-lime-300" },
    { name: "Bread", color: "bg-green-300" },
    { name: "Cakes", color: "bg-teal-300" },
    { name: "Cookies", color: "bg-cyan-300" },
    { name: "Pies", color: "bg-sky-300" },
    { name: "Semi products", color: "bg-blue-300" },
    { name: "Macarons", color: "bg-indigo-300" },
  ];

  return (
    <div className="mt-4 relative">
      <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
        {categories.map((category, index) => (
          <CategoryItem 
            key={index}
            name={category.name}
            color={category.color}
          />
        ))}
      </div>
      <button className="absolute right-0 top-1/2 -translate-y-1/2 bg-white rounded-full shadow-md p-1">
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default FoodCategories;
