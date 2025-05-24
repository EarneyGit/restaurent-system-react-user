import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Product } from '@/services/api';
import { toast } from 'react-toastify';

interface CartItem extends Product {
  quantity: number;
  selectedOptions?: Record<string, string>;
  specialRequirements?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product & { selectedOptions?: Record<string, string>; specialRequirements?: string }) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  increaseQuantity: (productId: string) => Promise<void>;
  decreaseQuantity: (productId: string) => Promise<void>;
  getItemQuantity: (productId: string) => number;
  clearCart: () => Promise<void>;
  getCartCount: () => number;
  getCartTotal: () => number;
  isLoading: boolean;
  isUpdating: Record<string, boolean>;
  updateCartItemQuantity: (productId: string, quantity: number) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'cart_items';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  }, [cartItems]);

  const setItemUpdating = (itemId: string, updating: boolean) => {
    setIsUpdating(prev => ({
      ...prev,
      [itemId]: updating
    }));
  };

  const addToCart = useCallback(async (product: Product & { selectedOptions?: Record<string, string>; specialRequirements?: string }) => {
    try {
      setItemUpdating(product.id, true);
      
      // Check if item already exists with same options
      const existingItemIndex = cartItems.findIndex(item => 
        item.id === product.id && 
        JSON.stringify(item.selectedOptions) === JSON.stringify(product.selectedOptions)
      );

      if (existingItemIndex !== -1) {
        // Update quantity if item exists
        const updatedItems = [...cartItems];
        updatedItems[existingItemIndex].quantity += 1;
        setCartItems(updatedItems);
      } else {
        // Add new item
        setCartItems(prev => [...prev, { ...product, quantity: 1 }]);
      }

      toast.success(`Added to cart: ${product.name}`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    } finally {
      setItemUpdating(product.id, false);
    }
  }, [cartItems]);

  const removeFromCart = useCallback(async (productId: string) => {
    try {
      setItemUpdating(productId, true);
      setCartItems(prev => prev.filter(item => item.id !== productId));
      toast.info('Item removed from cart');
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove item from cart');
    } finally {
      setItemUpdating(productId, false);
    }
  }, []);

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    try {
      setItemUpdating(productId, true);
      if (quantity <= 0) {
        await removeFromCart(productId);
        return;
      }

      setCartItems(prev => 
        prev.map(item => 
          item.id === productId ? { ...item, quantity } : item
        )
      );
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    } finally {
      setItemUpdating(productId, false);
    }
  }, [removeFromCart]);

  const increaseQuantity = useCallback(async (productId: string) => {
    const item = cartItems.find(item => item.id === productId);
    if (item) {
      await updateQuantity(productId, item.quantity + 1);
    }
  }, [cartItems, updateQuantity]);

  const decreaseQuantity = useCallback(async (productId: string) => {
    const item = cartItems.find(item => item.id === productId);
    if (item) {
      await updateQuantity(productId, item.quantity - 1);
    }
  }, [cartItems, updateQuantity]);

  const getItemQuantity = useCallback((productId: string) => {
    return cartItems.reduce((total, item) => 
      item.id === productId ? total + item.quantity : total, 0
    );
  }, [cartItems]);

  const clearCart = useCallback(async () => {
    try {
      setIsLoading(true);
      setCartItems([]);
      localStorage.removeItem(CART_STORAGE_KEY);
      toast.info('Cart cleared');
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCartCount = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  const getCartTotal = useCallback(() => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cartItems]);

  const updateCartItemQuantity = async (productId: string, quantity: number) => {
    try {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
      // You can add API call here if needed
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
      throw error;
    }
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      increaseQuantity,
      decreaseQuantity,
      getItemQuantity,
      clearCart,
      getCartCount,
      getCartTotal,
      isLoading,
      isUpdating,
      updateCartItemQuantity
    }}>
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