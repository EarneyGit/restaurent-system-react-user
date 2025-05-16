import React from "react";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  category: string;
  filters: string[];
}

// Sample product data
const products = [
  {
    id: 1,
    name: "Oreo cheesecake",
    description: "A fruit-flavored cake. The filling of the cake consists of berry jam",
    image: "/placeholder.svg",
    price: 15.99,
    category: "Desserts"
  },
  {
    id: 2,
    name: "Honey cheesecake",
    description: "A fruit-flavored cake. The filling of the cake consists of berry jam",
    image: "/placeholder.svg",
    price: 11.99,
    category: "Desserts"
  },
  {
    id: 3,
    name: "Honey glass",
    description: "A fruit-flavored cake. The filling of the cake consists of berry jam",
    image: "/placeholder.svg",
    price: 10.50,
    category: "Desserts"
  },
  {
    id: 4,
    name: "Pistachio cake",
    description: "A fruit-flavored cake. The filling of the cake consists of berry jam",
    image: "/placeholder.svg",
    price: 18.99,
    category: "Desserts"
  },
  {
    id: 5,
    name: "Berry opera cake",
    description: "Пирожное со фруктовым вкусом. Начинка из ягодного джема",
    image: "/placeholder.svg",
    price: 17.99,
    category: "Desserts"
  },
  {
    id: 6,
    name: "Berry cake cake round",
    description: "A fruit-flavored cake. The filling of the cake consists of berry jam",
    image: "/placeholder.svg",
    price: 105.99,
    category: "Cakes"
  },
  {
    id: 7,
    name: "Ice cream cake",
    description: "A fruit-flavored cake. The filling of the cake consists of berry jam",
    image: "/placeholder.svg",
    price: 180.99,
    category: "Cakes"
  },
  {
    id: 8,
    name: "Juliet cake",
    description: "A fruit-flavored cake. The filling of the cake consists of berry jam",
    image: "/placeholder.svg",
    price: 110.00,
    category: "Cakes"
  },
  {
    id: 9,
    name: "Toffee cake",
    description: "A fruit-flavored cake. The filling of the cake consists of berry jam",
    image: "/placeholder.svg",
    price: 80.00,
    category: "Cakes"
  },
  {
    id: 10,
    name: "Michelle cake",
    description: "Пирожное со фруктовым вкусом. Начинка из ягодного джема",
    image: "/placeholder.svg",
    price: 170.99,
    category: "Cakes"
  },
  {
    id: 11,
    name: "Cappuccino",
    description: "Espresso with steamed milk and a deep layer of foam",
    image: "/placeholder.svg",
    price: 4.99,
    category: "Coffee"
  },
  {
    id: 12,
    name: "Latte",
    description: "Espresso with steamed milk and a light layer of foam",
    image: "/placeholder.svg",
    price: 5.49,
    category: "Coffee"
  },
  {
    id: 13,
    name: "Bubble Tea",
    description: "Tea-based drink with chewy tapioca pearls",
    image: "/placeholder.svg",
    price: 6.99,
    category: "Bubble tea"
  }
];

const ProductGrid: React.FC<ProductGridProps> = ({ category, filters }) => {
  console.log("ProductGrid - Received category:", category);
  
  // Filter products based on selected category (case-insensitive)
  const filteredProducts = category.toLowerCase() === "all" 
    ? products 
    : products.filter(product => 
        product.category.toLowerCase() === category.toLowerCase());
  
  console.log("ProductGrid - Filtered products:", filteredProducts.length);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredProducts.length > 0 ? (
        filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))
      ) : (
        <div className="col-span-full text-center py-10">
          <div className="mx-auto w-[150px] h-[150px] bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
            <span className="text-4xl">🍽️</span>
          </div>
          <p className="mt-4 text-gray-800 font-medium">
            No products found for this category
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductGrid; 