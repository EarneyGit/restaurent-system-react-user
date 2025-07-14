import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://82.25.104.117:5001';

interface CartItem {
  productId: string;
  quantity: number;
  branchId: string;
  itemTotal: number;
  price: number;
  selectedOptions?: Record<string, any>;
  specialRequirements?: string;
  selectedAttributes?: Array<{
    attributeId: string;
    selectedItems: Array<{
      itemId: string;
      quantity: number;
    }>;
  }>;
}

interface CartResponse {
  items: Array<{
    id: string;
    productId: string;
    quantity: number;
    price: number;
    itemTotal: number;
    name: string;
    images?: string[];
    description?: string;
  }>;
  total: number;
  subtotal: number;
  tax: number;
  deliveryFee?: number;
}

const getSessionId = () => {
  let sessionId = localStorage.getItem('guest_session_id');
  if (!sessionId) {
    sessionId = `guest_${Math.random().toString(36).substring(2)}`;
    localStorage.setItem('guest_session_id', sessionId);
  }
  return sessionId;
};

const getHeaders = () => {
  const token = localStorage.getItem('auth_token');
  const sessionId = getSessionId();
  
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    'x-session-id': sessionId,
  };
};

export const cartService = {
  // Get cart contents
  getCart: async (): Promise<CartResponse> => {
    const response = await axios.get(`${API_URL}/api/cart`, {
      headers: getHeaders(),
    });
    return response.data;
  },

  // Add item to cart
  addToCart: async (item: { productId: string; quantity: number; branchId: string; price: number }): Promise<CartResponse> => {
    // Ensure price and quantity are numbers
    const price = Number(item.price);
    const quantity = Number(item.quantity);
    
    // Calculate itemTotal
    const itemTotal = price * quantity;

    // Create the request payload with items array structure
    const payload = {
      items: [{
        productId: item.productId,
        quantity: quantity,
        branchId: item.branchId,
        price: price,
        itemTotal: itemTotal,
        selectedOptions: {},
        specialRequirements: "",
        selectedAttributes: []
      }]
    };
    
    try {
      console.log('Adding to cart with payload:', JSON.stringify(payload, null, 2));
      const response = await axios.post(`${API_URL}/api/cart/items`, payload, {
        headers: getHeaders(),
      });
      console.log('Cart response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error adding to cart:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      throw error;
    }
  },

  // Update cart item
  updateCartItem: async (cartItemId: string, quantity: number, specialRequirements?: string): Promise<CartResponse> => {
    const response = await axios.put(
      `${API_URL}/api/cart/items/${cartItemId}`,
      { quantity, specialRequirements },
      { headers: getHeaders() }
    );
    return response.data;
  },

  // Remove item from cart
  removeFromCart: async (cartItemId: string): Promise<CartResponse> => {
    const response = await axios.delete(`${API_URL}/api/cart/items/${cartItemId}`, {
      headers: getHeaders(),
    });
    return response.data;
  },

  // Clear entire cart
  clearCart: async (): Promise<void> => {
    await axios.delete(`${API_URL}/api/cart`, {
      headers: getHeaders(),
    });
  },

  // Get cart summary
  getCartSummary: async (): Promise<{
    itemCount: number;
    total: number;
  }> => {
    const response = await axios.get(`${API_URL}/api/cart/summary`, {
      headers: getHeaders(),
    });
    return response.data;
  },

  // Merge guest cart with user cart after login
  mergeCart: async (sessionId: string): Promise<CartResponse> => {
    const response = await axios.post(
      `${API_URL}/api/cart/merge`,
      { sessionId },
      { headers: getHeaders() }
    );
    return response.data;
  },
}; 