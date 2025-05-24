import axios, { AxiosError } from 'axios';

export const BASE_URL = 'http://localhost:5000';
export const API_URL = `${BASE_URL}/api`;

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

export interface Product {
  id: string | number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images?: string[];
  category?: string | { id: string | number; name: string };
  calorificValue?: string | number;
  brand?: string;
  rating?: number;
  selectedOptions?: Record<string, string>;
  specialRequirements?: string;
  quantity?: number;
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
export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await axios.get<ApiResponse<Category[]>>(`${API_URL}/categories`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch categories');
    }
    
    console.log('Raw categories:', response.data.data);
    
    // Add color to each category and fix image URLs
    const categoriesWithColors = response.data.data.map(category => {
      const cleanCategory = {
        ...category,
        name: typeof category.name === 'object' ? category.name.name || '' : String(category.name),
        color: getCategoryColor(typeof category.name === 'object' ? category.name.name || '' : String(category.name)),
        imageUrl: category.imageUrl ? `${BASE_URL}${category.imageUrl}` : '/placeholder.svg'
      };
      console.log('Cleaned category:', cleanCategory);
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
    console.log('Fetching all products from URL:', url.toString());

    const response = await axios.get<ApiResponse<Product[]>>(url.toString());
    console.log('API Response:', response.data);

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