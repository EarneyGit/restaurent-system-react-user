import axios, { AxiosError } from 'axios';

export const BASE_URL = 'http://localhost:5000';
const API_URL = `${BASE_URL}/api`;

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
  _id?: string;
  id: string;
  name: string;
  description: string;
  price: number;
  category: string | CategoryReference;
  hideItem: boolean;
  delivery: boolean;
  collection: boolean;
  dineIn: boolean;
  weight: string;
  calorificValue: number;
  calorieDetails: string;
  imageUrl?: string;
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

export const getProducts = async (categoryId?: string): Promise<Product[]> => {
  try {
    const url = new URL(`${API_URL}/products`);
    if (categoryId && categoryId !== 'All') {
      url.searchParams.append('category', categoryId);
    }

    const response = await axios.get<ApiResponse<Product[]>>(url.toString());
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch products');
    }

    console.log('Raw products:', response.data.data);

    // Fix image URLs in products and ensure category is properly handled
    const productsWithFixedUrls = response.data.data.map(product => {
      const cleanProduct = {
        ...product,
        category: typeof product.category === 'object' 
          ? product.category.name 
          : String(product.category),
        imageUrl: product.imageUrl 
          ? `${BASE_URL}${product.imageUrl}` 
          : '/placeholder.svg'
      };
      console.log('Cleaned product:', cleanProduct);
      return cleanProduct;
    });

    return productsWithFixedUrls;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(`Failed to fetch products: ${error.response?.data?.message || error.message}`);
    }
    throw error;
  }
}; 