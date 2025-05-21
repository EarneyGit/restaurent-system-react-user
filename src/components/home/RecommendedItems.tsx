import React from "react";
import { ArrowRight, BaggageClaim } from "lucide-react";
import { Link } from "react-router-dom";

interface ProductProps {
  name: string;
  color: string;
  description: string;
  price: number;
}

const ProductCard: React.FC<ProductProps> = ({
  name,
  color,
  description,
  price,
}) => {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm">
      <div className="relative">
        <div className={`w-full h-[150px] ${color}`}></div>
      </div>
      <div className="p-4">
        <h3 className="font-medium mb-1">{name}</h3>
        <p className="text-xs text-gray-500 mb-3">{description}</p>
        <div className="flex justify-between items-center">
          <span className="font-semibold">${price.toFixed(2)}</span>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
            <BaggageClaim size={18} />
            <span>Add</span>
          </button>{" "}
        </div>
      </div>
    </div>
  );
};

const RecommendedItems = () => {
  const products = [
    {
      name: "Caesar salad with chicken",
      color: "bg-gradient-to-r from-emerald-200 to-emerald-100",
      description:
        "Romano salad, cherry tomatoes, croutons, parmesan, crunchy garlic croutons",
      price: 45.99,
    },
    {
      name: "Dumplings with potatoes",
      color: "bg-gradient-to-r from-amber-200 to-amber-100",
      description:
        "Homemade dumplings with potatoes. The cake consists of berry jam.",
      price: 40.0,
    },
    {
      name: "Cutlets in Kiev",
      color: "bg-gradient-to-r from-rose-200 to-rose-100",
      description:
        "Homemade cutlets with potatoes. The cake consists of berry jam.",
      price: 60.0,
    },
    {
      name: "Nuggets (12 pcs)",
      color: "bg-gradient-to-r from-orange-200 to-orange-100",
      description:
        "Homemade nuggets with potatoes. The cake consists of berry jam.",
      price: 28.0,
    },
    {
      name: "Pizza Margherita",
      color: "bg-gradient-to-r from-red-200 to-red-100",
      description:
        "Classic pizza with tomato sauce, mozzarella, oregano, tomato sauce.",
      price: 17.99,
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {products.map((product, index) => (
          <ProductCard
            key={index}
            name={product.name}
            color={product.color}
            description={product.description}
            price={product.price}
          />
        ))}
      </div>
    </div>
  );
};

export default RecommendedItems;
