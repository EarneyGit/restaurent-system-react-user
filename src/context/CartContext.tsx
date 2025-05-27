import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Product, ProductAttribute } from '@/services/api';
import { useBranch } from './BranchContext';

// Constants for calculations
const DELIVERY_FEE = 5.00;
const TAX_RATE = 0.10;

export interface CartItem extends Product {
  quantity: number;
  selectedOptions?: Record<string, string>;
  specialRequirements?: string;
  attributes?: ProductAttribute[];
  branchId: string;
}

interface BranchCart {
  [branchId: string]: CartItem[];
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: CartItem) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateCartItemQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
  getDeliveryFee: () => number;
  getTaxAmount: () => number;
  getOrderTotal: () => number;
  clearBranchCart: (branchId: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [branchCarts, setBranchCarts] = useState<BranchCart>(() => {
    const savedCart = localStorage.getItem('branchCarts');
    return savedCart ? JSON.parse(savedCart) : {};
  });

  const { selectedBranch } = useBranch();

  // Get current branch's cart items
  const cartItems = selectedBranch ? (branchCarts[selectedBranch.id] || []) : [];

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('branchCarts');
    if (savedCart) {
      try {
        setBranchCarts(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        localStorage.removeItem('branchCarts');
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('branchCarts', JSON.stringify(branchCarts));
  }, [branchCarts]);

  const addToCart = async (product: CartItem) => {
    if (!selectedBranch) {
      toast.error('Please select a branch first');
      return;
    }

    try {
      setBranchCarts(prevCarts => {
        const currentBranchCart = prevCarts[selectedBranch.id] || [];
        const existingItem = currentBranchCart.find(item => item.id === product.id);
        
        const updatedBranchCart = existingItem
          ? currentBranchCart.map(item =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + (product.quantity || 1) }
                : item
            )
          : [...currentBranchCart, { ...product, branchId: selectedBranch.id, quantity: product.quantity || 1 }];

        return {
          ...prevCarts,
          [selectedBranch.id]: updatedBranchCart
        };
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
      throw error;
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!selectedBranch) return;

    try {
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

  const updateCartItemQuantity = async (productId: string, quantity: number) => {
    if (!selectedBranch) return;

    try {
      if (quantity < 1) {
        await removeFromCart(productId);
        return;
      }

      setBranchCarts(prevCarts => ({
        ...prevCarts,
        [selectedBranch.id]: (prevCarts[selectedBranch.id] || []).map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      }));
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
      throw error;
    }
  };

  const clearCart = () => {
    setBranchCarts({});
    localStorage.removeItem('branchCarts');
  };

  const clearBranchCart = (branchId: string) => {
    setBranchCarts(prevCarts => {
      const newCarts = { ...prevCarts };
      delete newCarts[branchId];
      return newCarts;
    });
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      let itemTotal = item.price;
      
      // Add option prices if they exist
      if (item.selectedOptions && item.attributes) {
        item.attributes.forEach(attr => {
          const selectedChoiceId = item.selectedOptions?.[attr.id];
          if (selectedChoiceId) {
            const choice = attr.choices.find(c => c.id === selectedChoiceId);
            if (choice) {
              itemTotal += choice.price;
            }
          }
        });
      }
      
      return total + (itemTotal * item.quantity);
    }, 0);
  };

  const getCartItemCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getDeliveryFee = () => {
    return DELIVERY_FEE;
  };

  const getTaxAmount = () => {
    const subtotal = getCartTotal();
    return subtotal * TAX_RATE;
  };

  const getOrderTotal = () => {
    const subtotal = getCartTotal();
    const tax = getTaxAmount();
    return subtotal + getDeliveryFee() + tax;
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

export default CartContext; 