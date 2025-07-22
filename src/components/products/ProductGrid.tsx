import React, { useEffect, useState, useCallback, useMemo } from "react";
import ProductCard from "./ProductCard";
import { getProducts, Product } from "@/services/api";
import { ShoppingBag, Clock } from "lucide-react";
import axios from '@/config/axios.config';
import { toast } from 'sonner';
import { useBranch } from "@/context/BranchContext";

interface ProductGridProps {
  category: string;
  filters: string[];
  onProductCountUpdate?: (count: number) => void;
  branchId?: string;
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
  onProductCountUpdate,
  branchId
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLoadingState, setShowLoadingState] = useState(true);
  const [branchAvailability, setBranchAvailability] = useState<{
    isAvailable: boolean;
    reason?: string;
  }>({ isAvailable: false });
  const [isBranchAvailable, setIsBranchAvailable] = useState<boolean>(true);

  const { selectedBranch } = useBranch();

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

  // Check branch availability
  const checkBranchAvailability = useCallback(async (branchId: string) => {
    try {
      const currentDate = new Date();
      const formattedDate = currentDate.toISOString().split('T')[0];
      const formattedTime = currentDate.toTimeString().slice(0, 5);

      const response = await axios.post(`/api/ordering-times/${branchId}/check-availability`, {
        orderType: "delivery",
        date: formattedDate,
        time: formattedTime
      });

      setBranchAvailability(response.data);
    } catch (error) {
      console.error('Error checking branch availability:', error);
      setBranchAvailability({ isAvailable: false, reason: "Error checking availability" });
    }
  }, []);

  // Fetch products based on branch and category
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setShowLoadingState(true);
        setError(null);

        if (!branchId) {
          setProducts([]);
          onProductCountUpdate?.(0);
          return;
        }

        // Check branch availability
        const availabilityResponse = await axios.post(`/api/ordering-times/${branchId}/check-availability`, {
          orderType: "delivery",
          date: new Date().toISOString().split('T')[0],
          time: new Date().toTimeString().slice(0, 5)
        });

        // Set availability based on response
        setBranchAvailability({
          isAvailable: availabilityResponse.data.available ?? false,
          reason: availabilityResponse.data.reason
        });

        setIsBranchAvailable(availabilityResponse?.data.available);
        // Fetch products regardless of availability
        const response = await axios.get('/api/products', {
          params: { branchId }
        });

        if (response.data?.success) {
          let filteredProducts = response.data.data.filter((product: Product) => !product.hideItem);
          
          // Filter by category
          if (category !== 'All') {
            filteredProducts = filteredProducts.filter((product: Product) => {
              const productCategory = product.category;
              if (typeof productCategory === 'object' && productCategory !== null) {
                return productCategory.name === category;
              }
              return String(productCategory) === category;
            });
          }

          setProducts(filteredProducts);
          onProductCountUpdate?.(filteredProducts.length);
        } else {
          setError('Failed to load products');
          setProducts([]);
          onProductCountUpdate?.(0);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products');
        setProducts([]);
        onProductCountUpdate?.(0);
      } finally {
        setTimeout(() => {
          setLoading(false);
          setShowLoadingState(false);
        }, 500);
      }
    };

    fetchProducts();
  }, [category, filters, branchId, onProductCountUpdate]);

  // Memoize the loading skeleton
  const LoadingSkeleton = useMemo(() => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
          <div className="w-full aspect-square bg-gray-100 rounded-xl mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-100 rounded-full w-3/4"></div>
            <div className="h-4 bg-gray-100 rounded-full w-1/2"></div>
            <div className="flex justify-between items-center pt-2">
              <div className="h-6 bg-gray-100 rounded-full w-20"></div>
              <div className="h-8 bg-gray-100 rounded-full w-24"></div>
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

  if (!branchAvailability.isAvailable) {
    return (
      <>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <Clock className="text-amber-500" />
            <div>
              <h3 className="font-medium text-amber-900">Branch Currently Unavailable</h3>
              <p className="text-amber-700 text-sm">
                {branchAvailability.reason || "This branch is not accepting orders at the moment"}
              </p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              isOutletAvailable={false}
            />
          ))}
        </div>
      </>
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
        <ProductCard 
          key={product.id} 
          product={product} 
          isBranchAvailable={isBranchAvailable}
          isOutletAvailable={branchAvailability.isAvailable}
        />
      ))}
    </div>
  );
});

ProductGrid.displayName = 'ProductGrid';

export default ProductGrid; 