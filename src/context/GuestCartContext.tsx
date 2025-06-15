import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { API_BASE_URL, CART_ENDPOINTS } from '@/config/api.config';
import { toast } from 'sonner';

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  selectedOptions: Record<string, string | number>;
  specialRequirements?: string;
  images: string[];
  itemTotal: number;
  category: string;
  branchId?: string;
  selectedAttributes?: Array<{
    attributeId: string;
    attributeName: string;
    attributeType: string;
    selectedItems: Array<{
      itemId: string;
      itemName: string;
      itemPrice: number;
      quantity: number;
    }>;
  }>;
}

interface CartData {
  id: string;
  sessionId: string;
  userId: string | null;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  itemCount: number;
  orderType: 'delivery' | 'pickup';
  branchId: string;
  status: string;
}

interface GuestCartContextType {
  sessionId: string | null;
  cartData: CartData | null;
  getGuestCart: () => Promise<CartData>;
  addItemToGuestCart: (item: Partial<CartItem>) => Promise<void>;
  updateGuestCartItem: (itemId: string, updates: Partial<CartItem>) => Promise<void>;
  removeGuestCartItem: (itemId: string) => Promise<void>;
  clearGuestCart: () => Promise<void>;
  getGuestCartSummary: () => Promise<CartData>;
  mergeGuestCart: (token: string) => Promise<void>;
  updateDeliverySettings: (settings: { orderType: 'delivery' | 'pickup'; branchId: string; deliveryFee: number }) => Promise<void>;
}

const GuestCartContext = createContext<GuestCartContextType | undefined>(undefined);

export const GuestCartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [cartData, setCartData] = useState<CartData | null>(null);

  useEffect(() => {
    // Initialize or retrieve session ID
    const existingSessionId = localStorage.getItem('guestSessionId');
    const isGuest = localStorage.getItem('isGuest') === 'true';
    
    if (existingSessionId && isGuest) {
      console.log('Using existing guest session:', existingSessionId);
      setSessionId(existingSessionId);
    } else if (isGuest) {
      const newSessionId = uuidv4();
      console.log('Creating new guest session:', newSessionId);
      localStorage.setItem('guestSessionId', newSessionId);
      localStorage.setItem('isGuest', 'true');
      setSessionId(newSessionId);
    } else {
      // Clear session if not a guest
      setSessionId(null);
    }
  }, []);

  useEffect(() => {
    // Load cart data when sessionId changes and user is guest
    if (sessionId && localStorage.getItem('isGuest') === 'true') {
      console.log('Loading guest cart for session:', sessionId);
      getGuestCart().catch(console.error);
    }
  }, [sessionId]);

  const getGuestCart = async () => {
    if (!sessionId || localStorage.getItem('isGuest') !== 'true') {
      console.log('No guest session or not a guest user');
      return null;
    }

    try {
      console.log('Fetching guest cart with session:', sessionId);
      const response = await axios.get<{ success: boolean; data: CartData }>(
        CART_ENDPOINTS.GUEST_CART,
        {
          headers: { 
            'x-session-id': sessionId,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data?.data) {
        console.log('Guest cart data received:', response.data.data);
        setCartData(response.data.data);
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching guest cart:', error);
      if (error.response?.status === 404) {
        // If cart not found, it's not an error for guests
        return null;
      }
      throw error;
    }
  };

  const addItemToGuestCart = async (item: Partial<CartItem>) => {
    if (!sessionId) {
      // Initialize guest session if not exists
      const newSessionId = uuidv4();
      localStorage.setItem('guestSessionId', newSessionId);
      localStorage.setItem('isGuest', 'true');
      setSessionId(newSessionId);
    }

    try {
      const payload = {
        productId: item.productId,
        quantity: item.quantity || 1,
        branchId: item.branchId,
        specialRequirements: item.specialRequirements,
        selectedAttributes: item.selectedAttributes
      };

      await axios.post(
        CART_ENDPOINTS.GUEST_CART_ITEMS,
        payload,
        {
          headers: { 
            'x-session-id': sessionId,
            'Content-Type': 'application/json'
          }
        }
      );
      await getGuestCart();
      // toast.success('Item added to cart');
    } catch (error) {
      console.error('Error adding item to guest cart:', error);
      toast.error('Failed to add item to cart');
      throw error;
    }
  };

  const updateGuestCartItem = async (itemId: string, updates: Partial<CartItem>) => {
    try {
      await axios.put(
        `${CART_ENDPOINTS.GUEST_CART_ITEMS}/${itemId}`,
        updates,
        {
          headers: { 
            'x-session-id': sessionId,
            'Content-Type': 'application/json'
          }
        }
      );
      await getGuestCart();
      toast.success('');
    } catch (error) {
      console.error('Error updating guest cart item:', error);
      toast.error('Failed to update cart');
      throw error;
    }
  };

  const removeGuestCartItem = async (itemId: string) => {
    try {
      await axios.delete(
        `${CART_ENDPOINTS.GUEST_CART_ITEMS}/${itemId}`,
        {
          headers: { 
            'x-session-id': sessionId,
            'Content-Type': 'application/json'
          }
        }
      );
      await getGuestCart();
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing guest cart item:', error);
      toast.error('Failed to remove item');
      throw error;
    }
  };

  const clearGuestCart = async () => {
    try {
      await axios.delete(
        CART_ENDPOINTS.GUEST_CART,
        {
          headers: { 
            'x-session-id': sessionId,
            'Content-Type': 'application/json'
          }
        }
      );
      setCartData(null);
      toast.success('Cart cleared');
    } catch (error) {
      console.error('Error clearing guest cart:', error);
      toast.error('Failed to clear cart');
      throw error;
    }
  };

  const getGuestCartSummary = async () => {
    try {
      const response = await axios.get<{ success: boolean; data: CartData }>(
        CART_ENDPOINTS.GUEST_CART_SUMMARY,
        {
          headers: { 
            'x-session-id': sessionId,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching guest cart summary:', error);
      throw error;
    }
  };

  const updateDeliverySettings = async (settings: { orderType: 'delivery' | 'pickup'; branchId: string; deliveryFee: number }) => {
    try {
      await axios.put(
        `${CART_ENDPOINTS.GUEST_CART}/delivery`,
        settings,
        {
          headers: { 
            'x-session-id': sessionId,
            'Content-Type': 'application/json'
          }
        }
      );
      await getGuestCart();
      toast.success('Delivery settings updated');
    } catch (error) {
      console.error('Error updating delivery settings:', error);
      toast.error('Failed to update delivery settings');
      throw error;
    }
  };

  const mergeGuestCart = async (token: string) => {
    try {
      await axios.post(
        CART_ENDPOINTS.GUEST_CART_MERGE,
        { sessionId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'x-session-id': sessionId,
            'Content-Type': 'application/json'
          }
        }
      );
      // Clear guest session after successful merge
      localStorage.removeItem('guestSessionId');
      localStorage.removeItem('isGuest');
      setSessionId(null);
      setCartData(null);
      toast.success('Cart merged successfully');
    } catch (error) {
      console.error('Error merging guest cart:', error);
      toast.error('Failed to merge cart');
      throw error;
    }
  };

  return (
    <GuestCartContext.Provider
      value={{
        sessionId,
        cartData,
        getGuestCart,
        addItemToGuestCart,
        updateGuestCartItem,
        removeGuestCartItem,
        clearGuestCart,
        getGuestCartSummary,
        mergeGuestCart,
        updateDeliverySettings
      }}
    >
      {children}
    </GuestCartContext.Provider>
  );
};

export const useGuestCart = () => {
  const context = useContext(GuestCartContext);
  if (context === undefined) {
    throw new Error('useGuestCart must be used within a GuestCartProvider');
  }
  return context;
}; 