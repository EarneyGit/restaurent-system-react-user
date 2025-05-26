import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

// Constants for calculations
const DELIVERY_FEE = 5.00;
const TAX_RATE = 0.10;

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  description?: string;
  images?: string[];
  category?: string;
  variant?: string;
  size?: string;
  color?: string;
  selectedOptions?: {
    [key: string]: string;
  };
  specialRequirements?: string;
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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        localStorage.removeItem('cart');
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = async (product: CartItem) => {
    try {
      setCartItems(prevItems => {
        const existingItem = prevItems.find(item => item.id === product.id);
        
        if (existingItem) {
          return prevItems.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + (product.quantity || 1) }
              : item
          );
        }
        
        return [...prevItems, { ...product, quantity: product.quantity || 1 }];
      });
      
      // toast.success('Added to cart successfully');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
      throw error;
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove item');
      throw error;
    }
  };

  const updateCartItemQuantity = async (productId: string, quantity: number) => {
    try {
      if (quantity < 1) {
        await removeFromCart(productId);
        return;
      }

      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === productId
            ? { ...item, quantity }
            : item
        )
      );
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
      throw error;
    }
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
    // toast.success('Cart cleared');
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
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