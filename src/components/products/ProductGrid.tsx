import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { getProducts, Product, getCategories } from "@/services/api";
import { ShoppingBag } from "lucide-react";

interface ProductGridProps {
  category: string;
  filters: string[];
  onProductCountUpdate?: (count: number) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ 
  category, 
  filters,
  onProductCountUpdate 
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLoadingState, setShowLoadingState] = useState(true);

  // Helper function to compare categories
  const isCategoryMatch = (productCategory: string | { name: string }, selectedCategory: string): boolean => {
    if (selectedCategory === 'All') return true;
    const categoryName = typeof productCategory === 'object' ? productCategory.name : productCategory;
    return categoryName === selectedCategory;
  };

  // Fetch products based on category
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setShowLoadingState(true);
        setError(null);

        // Get all products first
        const allProducts = await getProducts();
        
        // Filter products based on category
        const filteredProducts = category === 'All'
          ? allProducts
          : allProducts.filter(product => isCategoryMatch(product.category, category));

        // Filter out hidden items
        const visibleProducts = filteredProducts.filter(product => !product.hideItem);
        
        // Ensure loading state shows for at least 500ms
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setProducts(visibleProducts);
        onProductCountUpdate?.(visibleProducts.length);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load products';
        setError(errorMessage);
        console.error('Error loading products:', err);
        onProductCountUpdate?.(0);
      } finally {
        setLoading(false);
        setShowLoadingState(false);
      }
    };

    fetchProducts();
  }, [category, onProductCountUpdate]);

  if (showLoadingState) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
            <div className="w-full aspect-square bg-gray-200 rounded-lg mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="flex justify-between items-center pt-2">
                <div className="h-6 bg-gray-200 rounded w-20"></div>
                <div className="h-8 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-red-500 text-2xl">!</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Products</h3>
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  // Apply additional filters if any
  const filteredProducts = filters.length > 0
    ? products.filter(product => {
        return filters.every(filter => {
          switch (filter) {
            case 'delivery':
              return product.delivery;
            case 'collection':
              return product.collection;
            case 'dineIn':
              return product.dineIn;
            default:
              return true;
          }
        });
      })
    : products;

  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <ShoppingBag className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Products Available</h3>
        <p className="text-gray-500">
          {category === 'All' 
            ? 'No products available at the moment'
            : `No products found in ${category}`}
        </p>
        {filters.length > 0 && (
          <p className="text-sm text-gray-400 mt-2">
            Try adjusting your filters
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredProducts.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid; 