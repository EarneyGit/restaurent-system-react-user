import axios, { AxiosError } from 'axios';

export const BASE_URL = import.meta.env.VITE_API_URL || 'http://82.25.104.117:5001';
export const API_URL = `${BASE_URL}/api`;



console.log("BASE_URL", import.meta.env.VITE_APP_URL);

// Types
export interface CategoryReference {
  _id: string;
  name: string;
  slug: string;
  id: string;
}

export interface Category {
  _id?: string;
  id: string;
  name: string;
  slug?: string;
  displayOrder: number;
  hidden: boolean;
  imageUrl: string;
  availability: {
    [key: string]: string;
  };
  printers: string[];
  color?: string;
}

export interface ProductAttribute {
  id: string;
  name: string;
  type: 'single' | 'multiple';
  requiresSelection: boolean;
  description?: string;
  choices: {
    id: string;
    name: string;
    price: number;
  }[];
}

export interface PriceChange {
  _id: string;
  id: string;
  productId: string;
  branchId: string;
  name: string;
  type: string;
  originalPrice: number;
  tempPrice: number;
  revertPrice: number;
  value: number;
  startDate: string;
  endDate: string;
  daysOfWeek: string[];
  active: boolean;
  autoRevert: boolean;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StockManagement {
  isManaged: boolean;
  quantity: number;
  lowStockThreshold: number;
  lastUpdated: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  currentEffectivePrice?: number;
  description: string;
  images?: string[];
  category?: {
    id: string;
    name: string;
  } | string;
  originalPrice?: number;
  rating?: number;
  attributes?: ProductAttribute[];
  hideItem?: boolean;
  delivery?: boolean;
  collection?: boolean;
  dineIn?: boolean;
  priceChanges?: PriceChange[];
  stockManagement?: StockManagement;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Helper function to get category color
export const getCategoryColor = (categoryName: string): string => {
  const colors: { [key: string]: string } = {
    "New": "bg-red-300",
    "Discounts": "bg-orange-300",
    "Sets": "bg-yellow-300",
    "Cheesecakes": "bg-lime-300",
    "Bread": "bg-green-300",
    "Cakes": "bg-teal-300",
    "Cookies": "bg-cyan-300",
    "Pies": "bg-sky-300",
    "Semi products": "bg-blue-300",
    "Macarons": "bg-indigo-300",
    // Add more categories and colors as needed
  };

  return colors[categoryName] || "bg-gray-300"; // Default color if category not found
};

// API calls
export const getCategories = async (branchId?: string): Promise<Category[]> => {
  try {
    const url = new URL(`${API_URL}/categories`);
    if (branchId) {
      url.searchParams.append('branchId', branchId);
    }
    
    const response = await axios.get<ApiResponse<Category[]>>(url.toString());
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch categories');
    }
    
    
    // Add color to each category and fix image URLs
    const categoriesWithColors = response.data.data.map(category => {
      const cleanCategory = {
        ...category,
        name: typeof category.name === 'object' ? category.name.name || '' : String(category.name),
        color: getCategoryColor(typeof category.name === 'object' ? category.name.name || '' : String(category.name)),
        imageUrl: category.imageUrl ? `${BASE_URL}${category.imageUrl}` : '/placeholder.svg'
      };
      return cleanCategory;
    });
    
    return categoriesWithColors;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(`Failed to fetch categories: ${error.response?.data?.message || error.message}`);
    }
    throw error;
  }
};

export const getProducts = async (): Promise<Product[]> => {
  try {
    const url = new URL(`${BASE_URL}/api/products`);

    const response = await axios.get<ApiResponse<Product[]>>(url.toString());

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch products');
    }

    // Clean and normalize the products data
    const cleanedProducts = response.data.data.map(product => {
      console.log('Processing product:', product);
      return {
        ...product,
        // Ensure category is properly handled
        category: typeof product.category === 'object' && product.category !== null
          ? product.category
          : { id: 'unknown', name: String(product.category) },
        // Clean up image URLs - preserve the full path structure
        images: (product.images || []).map(img => 
          img.startsWith('http') ? img : img.trim().replace(/^\/+/, '')
        )
      };
    });

    console.log('Cleaned products:', cleanedProducts);
    return cleanedProducts;
  } catch (error) {
    console.error('Error in getProducts:', error);
    if (error instanceof AxiosError) {
      throw new Error(`Failed to fetch products: ${error.response?.data?.message || error.message}`);
    }
    throw error;
  }
}; 