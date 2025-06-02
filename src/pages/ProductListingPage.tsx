import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import ProductFilters from "@/components/products/ProductFilters";
import ProductGrid from "@/components/products/ProductGrid";
import { getCategories, Category } from "@/services/api";
import { useBranch } from "@/context/BranchContext";
import { toast } from "sonner";
import axios from "axios";

function ProductListingPage(): JSX.Element {
  const { category = "All" } = useParams<{ category: string }>();
  const decodedCategory = decodeURIComponent(category);
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedBranch, setSelectedBranch } = useBranch();
  
  // Get branchId from URL query params
  const queryParams = new URLSearchParams(location.search);
  const branchIdFromUrl = queryParams.get('branchId');
  
  const [selectedCategory, setSelectedCategory] = useState<string>(decodedCategory);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);

  // Update branch context if branchId in URL is different
  useEffect(() => {
    const updateBranch = async () => {
      if (branchIdFromUrl && (!selectedBranch || selectedBranch.id !== branchIdFromUrl)) {
        try {
          const response = await axios.get('/api/branches');
          if (response.data?.success) {
            const branches = response.data.data;
            const newBranch = branches.find(b => b.id === branchIdFromUrl);
            if (newBranch) {
              setSelectedBranch(newBranch);
              localStorage.setItem('selectedBranchId', newBranch.id);
            } else {
              toast.error('Selected branch not found');
              navigate('/select-outlet');
            }
          }
        } catch (error) {
          console.error('Error fetching branch:', error);
          toast.error('Failed to load branch details');
          navigate('/select-outlet');
        }
      }
    };

    updateBranch();
  }, [branchIdFromUrl, selectedBranch, setSelectedBranch, navigate]);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        // Filter out hidden categories and sort by displayOrder
        const visibleCategories = data
          .filter(cat => !cat.hidden)
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map(cat => ({
            ...cat,
            name: String(cat.name) // Ensure name is always a string
          }));
        setCategories(visibleCategories);
      } catch (err) {
        setError('Failed to load categories');
        console.error('Error loading categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Update selected category when URL parameter changes
  useEffect(() => {
    setSelectedCategory(decodedCategory);
  }, [decodedCategory]);

  const handleCategoryChange = (newCategory: string) => {
    setSelectedCategory(String(newCategory));
    navigate(`/app/products/${encodeURIComponent(String(newCategory))}${branchIdFromUrl ? `?branchId=${branchIdFromUrl}` : ''}`);
  };

  const handleFilterToggle = (filter: string) => {
    if (activeFilters.includes(filter)) {
      setActiveFilters(activeFilters.filter((f) => f !== filter));
    } else {
      setActiveFilters([...activeFilters, filter]);
    }
  };

  // Get category title for display
  const getCategoryTitle = () => {
    if (selectedCategory === "All") return "All Products";
    return selectedCategory;
  };

  // Update total items count
  const handleProductCountUpdate = (count: number) => {
    setTotalItems(count);
  };

  if (!branchIdFromUrl && !selectedBranch) {
    navigate('/select-outlet');
    return null;
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse">
          <div className="h-8 bg-[#e8f5e9] rounded w-1/4 mb-6"></div>
          <div className="h-12 bg-[#e8f5e9] rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-[#e8f5e9] h-64 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-red-500">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-10 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{getCategoryTitle()}</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#4caf50]">{totalItems} items</span>
          {selectedBranch && (
            <span className="text-sm text-gray-600">• {selectedBranch.name}</span>
          )}
        </div>
      </div>

      <ProductFilters 
        categories={categories}
        selectedCategory={selectedCategory} 
        onCategoryChange={handleCategoryChange}
        activeFilters={activeFilters}
        onFilterToggle={handleFilterToggle}
      />
      
      <ProductGrid 
        category={selectedCategory} 
        filters={activeFilters}
        onProductCountUpdate={handleProductCountUpdate}
        branchId={branchIdFromUrl || selectedBranch?.id}
      />
    </div>
  );
}

export default ProductListingPage; 