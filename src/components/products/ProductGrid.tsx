import React, { useEffect, useState, useCallback, useMemo } from "react";
import ProductCard from "./ProductCard";
import { getProducts, Product } from "@/services/api";
import { ShoppingBag } from "lucide-react";

interface ProductGridProps {
  category: string;
  filters: string[];
  onProductCountUpdate?: (count: number) => void;
}

// Cache for storing products
const productsCache = {
  data: null as Product[] | null,
  timestamp: 0,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
};

const ProductGrid: React.FC<ProductGridProps> = React.memo(({ 
  category, 
  filters,
  onProductCountUpdate 
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLoadingState, setShowLoadingState] = useState(true);

  // Helper function to check if a product matches the selected category
  const isCategoryMatch = useCallback((product: Product, selectedCategory: string) => {
    if (selectedCategory === 'All') return true;
    
    const productCategory = product.category;
    if (typeof productCategory === 'object' && productCategory !== null) {
      return productCategory.name === selectedCategory;
    }
    return String(productCategory) === selectedCategory;
  }, []);

  // Function to check if cache is valid
  const isCacheValid = useCallback(() => {
    return (
      productsCache.data !== null &&
      Date.now() - productsCache.timestamp < productsCache.CACHE_DURATION
    );
  }, []);

  // Fetch all products and filter based on category
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setShowLoadingState(true);
      setError(null);

      let fetchedProducts: Product[];

      // Check if we can use cached data
      if (isCacheValid()) {
        console.log('Using cached products data');
        fetchedProducts = productsCache.data!;
      } else {
        console.log('Fetching fresh products data');
        fetchedProducts = await getProducts();
        // Update cache
        productsCache.data = fetchedProducts;
        productsCache.timestamp = Date.now();
      }
      
      // Filter products based on category and other filters
      const filteredProducts = fetchedProducts
        .filter(product => !product.hideItem)
        .filter(product => isCategoryMatch(product, category))
        .filter(product => {
          if (filters.length === 0) return true;
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
        });

      // Ensure loading state shows for at least 500ms for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProducts(filteredProducts);
      onProductCountUpdate?.(filteredProducts.length);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load products';
      console.error('Error fetching products:', err);
      setError(errorMessage);
      onProductCountUpdate?.(0);
    } finally {
      setLoading(false);
      setShowLoadingState(false);
    }
  }, [category, filters, onProductCountUpdate, isCategoryMatch, isCacheValid]);

  // Initial fetch on mount and when category/filters change
  useEffect(() => {
    let isSubscribed = true;

    const loadProducts = async () => {
      if (isSubscribed) {
        await fetchProducts();
      }
    };

    loadProducts();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isSubscribed = false;
    };
  }, [category, filters, fetchProducts]);

  // Memoize the loading skeleton
  const LoadingSkeleton = useMemo(() => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
          <div className="w-full aspect-square bg-gray-100 rounded-lg mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-100 rounded w-3/4"></div>
            <div className="h-4 bg-gray-100 rounded w-1/2"></div>
            <div className="flex justify-between items-center pt-2">
              <div className="h-6 bg-gray-100 rounded w-20"></div>
              <div className="h-8 bg-gray-100 rounded w-24"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  ), []);

  if (showLoadingState) {
    return LoadingSkeleton;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-red-500 text-2xl">!</span>
        </div>
        <h3 className="text-lg font-medium text-[#2e7d32] mb-2">Error Loading Products</h3>
        <p className="text-[#4caf50]">{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-[#e8f5e9] rounded-full flex items-center justify-center mb-4">
          <ShoppingBag className="w-12 h-12 text-[#4caf50]" />
        </div>
        <h3 className="text-lg font-medium text-[#2e7d32] mb-2">No Products Available</h3>
        <p className="text-[#4caf50]">
          {category === 'All' 
            ? 'No products available at the moment'
            : `No products found in ${category}`}
        </p>
        {filters.length > 0 && (
          <p className="text-sm text-[#4caf50] mt-2">
            Try adjusting your filters
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
});

ProductGrid.displayName = 'ProductGrid';

export default ProductGrid; 