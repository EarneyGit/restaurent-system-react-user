import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Product, ProductAttribute } from '@/services/api';
import { useBranch } from './BranchContext';
import { useAuth } from './AuthContext';
import { useGuestCart } from './GuestCartContext';
import axios from 'axios';
import { CART_ENDPOINTS } from '@/config/api.config';
import { useNavigate } from 'react-router-dom';

// Constants for calculations
const DELIVERY_FEE = 5.00;
const TAX_RATE = 0.10;

export interface PriceStructure {
  base: number;
  currentEffectivePrice: number;
  attributes: number;
  total: number;
}

interface SelectedAttributeItem {
  itemId: string;
  itemName: string;
  itemPrice: number;
  quantity: number;
}

interface SelectedAttribute {
  attributeId: string;
  attributeName: string;
  attributeType: string;
  selectedItems: SelectedAttributeItem[];
}

export interface CartItem extends Omit<Product, 'price'> {
  quantity: number;
  selectedOptions?: Record<string, string>;
  specialRequirements?: string;
  attributes?: ProductAttribute[];
  branchId: string;
  productId?: string;
  itemTotal?: number;
  price: PriceStructure;
  selectedAttributes?: SelectedAttribute[];
}

interface BranchCart {
  [branchId: string]: CartItem[];
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: CartItem) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateCartItemQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartTotal: () => number; 
  getCartItemCount: () => number;
  getDeliveryFee: () => number;
  getTaxAmount: () => number;
  getOrderTotal: () => number;
  clearBranchCart: (branchId: string) => Promise<void>;
  formatCurrency: (amount: number) => string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [branchCarts, setBranchCarts] = useState<BranchCart>({});
  const { selectedBranch } = useBranch();
  const { isAuthenticated, token, user } = useAuth();
  const { sessionId, cartData: guestCartData } = useGuestCart();
  const navigate = useNavigate();

  // Get current branch's cart items
  const cartItems = selectedBranch ? (branchCarts[selectedBranch.id] || []) : [];

  // Load cart data on mount and when auth state or branch changes
  useEffect(() => {
    const loadCart = async () => {
      if (!selectedBranch) return;

      try {
        let response;
        const headers = isAuthenticated ? {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        } : {
          'x-session-id': sessionId,
          'Content-Type': 'application/json'
        };

        // Clear existing cart data for this branch
        setBranchCarts(prev => {
          const newCarts = { ...prev };
          delete newCarts[selectedBranch.id];
          return newCarts;
        });

        if (isAuthenticated && token) {
          response = await axios.get(`${CART_ENDPOINTS.USER_CART}?branchId=${selectedBranch.id}`, { headers });
        } else if (sessionId) {
          response = await axios.get(`${CART_ENDPOINTS.GUEST_CART}?branchId=${selectedBranch.id}`, { headers });
        }

        if (response?.data?.data?.items) {
          setBranchCarts(prevCarts => ({
            ...prevCarts,
            [selectedBranch.id]: response.data.data.items.map((item: CartItem) => ({
              ...item,
              branchId: selectedBranch.id
            }))
          }));
        }
      } catch (error) {
        console.error('Error loading cart:', error);
        toast.error('Failed to load cart');
      }
    };

    loadCart();
  }, [isAuthenticated, token, sessionId, selectedBranch?.id]);

  const addToCart = async (product: CartItem) => {
    if (!selectedBranch) {
      toast.error('Please select a branch first');
      return;
    }

    // Check if item from different branch exists in cart
    const otherBranchItems = Object.entries(branchCarts).find(([branchId, items]) => 
      branchId !== selectedBranch.id && items.length > 0
    );

    if (otherBranchItems) {
      const [existingBranchId] = otherBranchItems;
      const confirmChange = window.confirm(
        'Adding items from a different branch will clear your current cart. Would you like to proceed?'
      );

      if (confirmChange) {
        // Clear other branch cart
        await clearBranchCart(existingBranchId);
      } else {
        return;
      }
    }

    // If user is not authenticated and no guest session exists, redirect to login
    if (!isAuthenticated && !sessionId) {
      // Store the current path to redirect back after login
      localStorage.setItem('returnUrl', window.location.pathname);
      navigate('/login');
      return;
    }

    try {
      const payload = {
        productId: product.id,
        quantity: product.quantity,
        branchId: selectedBranch.id,
        specialRequirements: product.specialRequirements,
        selectedAttributes: product.attributes?.map(attr => ({
          attributeId: attr.id,
          selectedItems: product.selectedOptions?.[attr.id] ? [{
            itemId: product.selectedOptions[attr.id],
            quantity: 1
          }] : []
        }))
      };

      const headers = isAuthenticated ? {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      } : {
        'x-session-id': sessionId,
        'Content-Type': 'application/json'
      };

      let response;
      if (isAuthenticated) {
        response = await axios.post(CART_ENDPOINTS.USER_CART_ITEMS, payload, { headers });
      } else {
        response = await axios.post(CART_ENDPOINTS.GUEST_CART_ITEMS, payload, { headers });
      }

      // Update cart with the response data which includes the correct IDs
      if (response.data?.data?.items) {
        setBranchCarts(prevCarts => ({
          ...prevCarts,
          [selectedBranch.id]: response.data.data.items
        }));
      }

      // toast.success('Added to cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
      throw error;
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!selectedBranch) return;

    try {
      const headers = isAuthenticated ? {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      } : {
        'x-session-id': sessionId,
        'Content-Type': 'application/json'
      };

      if (isAuthenticated) {
        await axios.delete(`${CART_ENDPOINTS.USER_CART_ITEMS}/${productId}?branchId=${selectedBranch.id}`, { headers });
      } else {
        await axios.delete(`${CART_ENDPOINTS.GUEST_CART_ITEMS}/${productId}?branchId=${selectedBranch.id}`, { headers });
      }

      setBranchCarts(prevCarts => ({
        ...prevCarts,
        [selectedBranch.id]: (prevCarts[selectedBranch.id] || []).filter(item => item.id !== productId)
      }));
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove item');
      throw error;
    }
  };

  const updateCartItemQuantity = async (cartItemId: string, quantity: number) => {
    if (!selectedBranch) return;

    try {
      if (quantity < 1) {
        await removeFromCart(cartItemId);
        return;
      }

      const headers = isAuthenticated ? {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      } : {
        'x-session-id': sessionId,
        'Content-Type': 'application/json'
      };

      const updates = { 
        cartItemId,
        quantity,
        branchId: selectedBranch.id
      };

      if (isAuthenticated) {
        const response = await axios.put(`${CART_ENDPOINTS.USER_CART_ITEMS}/${cartItemId}`, updates, { headers });
        if (response.data?.data) {
          setBranchCarts(prevCarts => ({
            ...prevCarts,
            [selectedBranch.id]: response.data.data.items
          }));
        }
      } else {
        const response = await axios.put(`${CART_ENDPOINTS.GUEST_CART_ITEMS}/${cartItemId}`, updates, { headers });
        if (response.data?.data) {
          setBranchCarts(prevCarts => ({
            ...prevCarts,
            [selectedBranch.id]: response.data.data.items
          }));
        }
      }
      
      // toast.success('Cart updated');
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      const headers = isAuthenticated ? {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      } : {
        'x-session-id': sessionId,
        'Content-Type': 'application/json'
      };

      if (isAuthenticated) {
        await axios.delete(CART_ENDPOINTS.USER_CART, { headers });
      } else {
        await axios.delete(CART_ENDPOINTS.GUEST_CART, { headers });
      }

      setBranchCarts({});
      toast.success('Cart cleared');
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
      throw error;
    }
  };

  const clearBranchCart = async (branchId: string) => {
    try {
      const headers = isAuthenticated ? {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      } : {
        'x-session-id': sessionId,
        'Content-Type': 'application/json'
      };

      if (isAuthenticated) {
        await axios.delete(`${CART_ENDPOINTS.USER_CART}?branchId=${branchId}`, { headers });
      } else {
        await axios.delete(`${CART_ENDPOINTS.GUEST_CART}?branchId=${branchId}`, { headers });
      }

      setBranchCarts(prevCarts => {
        const newCarts = { ...prevCarts };
        delete newCarts[branchId];
        return newCarts;
      });
      toast.success('Branch cart cleared');
    } catch (error) {
      console.error('Error clearing branch cart:', error);
      toast.error('Failed to clear branch cart');
      throw error;
    }
  };

  const getCartTotal = () => {
    if (!selectedBranch) return 0;
    return cartItems.reduce((total, item) => {
      // Use the total from price object and multiply by quantity
      return total + (item.price.total * item.quantity);
    }, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  const getCartItemCount = () => {
    if (!selectedBranch) return 0;
    return cartItems.length;
  };

  const getDeliveryFee = () => {
    return DELIVERY_FEE;
  };

  const getTaxAmount = () => {
    return getCartTotal() * TAX_RATE;
  };

  const getOrderTotal = () => {
    return getCartTotal() + getDeliveryFee() + getTaxAmount();
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        clearCart,
        getCartTotal,
        getCartItemCount,
        getDeliveryFee,
        getTaxAmount,
        getOrderTotal,
        clearBranchCart,
        formatCurrency
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};