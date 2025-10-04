import React from 'react';
import { X, Trash2, Plus, Minus, UtensilsCrossed } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../shared/EmptyState';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const FoodPlaceholderSVG = () => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    className="w-12 h-12 mx-auto text-gray-400"
    stroke="currentColor" 
    strokeWidth="1.5"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M18.35 19.85a9.5 9.5 0 1 1 0-15.7"
    />
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M12 6v12M15 8v8M9 8v8"
    />
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M3.5 12h17"
    />
  </svg>
);

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleCheckout = () => {
    onClose(); // Close the drawer first
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      navigate('/checkout');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop with transition */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
        onClick={onClose}
        style={{ opacity: isOpen ? 1 : 0 }}
      />

      {/* Drawer with transition */}
      <div 
        className={`fixed top-0 right-0 w-full md:w-[400px] h-[80vh] rounded-xl md:m-3 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-300">
            <h2 className="text-xl font-semibold">Your Cart</h2>
            <button
              onClick={onClose}
              className="rounded-full p-2 hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-grow overflow-y-auto">
            {cartItems.length === 0 ? (
              <EmptyState 
                title="Your cart is empty"
                description="Browse our menu and discover delicious items!"
                action={{ 
                  label: "Start Ordering", 
                  to: "/" 
                }}
              />
            ) : (
              <div className="p-4 max-h[40vh] overflow-y-auto" >  
                <ul className="space-y-4">
                  {cartItems.map((item) => (
                    <li key={`${item.id}-${JSON.stringify(item.selectedOptions)}`} className="flex border-b border-gray-300 pb-4">
                      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-50 flex items-center justify-center">
                        {item.images && item.images.length > 0 && item.images[0] ? (
                          <img
                            src={item.images[0]}
                            alt={item.name}
                            className="h-full w-full object-cover object-center"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.parentElement?.classList.add('bg-gray-100');
                              target.parentElement?.appendChild(document.createElement('div')).appendChild(FoodPlaceholderSVG());
                            }}
                          />
                        ) : (
                          <FoodPlaceholderSVG />
                        )}
                      </div>

                      <div className="ml-4 flex flex-1 flex-col">
                        <div className="flex justify-between text-base font-medium">
                          <h3>{item.name}</h3>
                          <p className="ml-4">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                        
                        {/* Selected Options */}
                        {item.selectedOptions && Object.entries(item.selectedOptions).length > 0 && (
                          <div className="mt-1 text-sm text-gray-500">
                            {Object.entries(item.selectedOptions).map(([optionId, choiceId]) => (
                              <div key={optionId} className="flex items-center gap-1">
                                <span className="font-medium">{optionId}:</span>
                                <span>{choiceId}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Special Requirements */}
                        {item.specialRequirements && (
                          <div className="mt-1 text-sm text-gray-500">
                            <p className="font-medium">Special Requirements:</p>
                            <p className="italic">{item.specialRequirements}</p>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-gray-200 rounded-full">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1 rounded-full hover:bg-gray-100"
                              disabled={item.quantity <= 1}
                            >
                              <Minus size={16} className={item.quantity <= 1 ? "text-gray-300" : "text-gray-600"} />
                            </button>
                            <span className="px-3 text-sm">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 rounded-full hover:bg-gray-100"
                            >
                              <Plus size={16} className="text-gray-600" />
                            </button>
                          </div>
                          
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-600 p-1"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Footer - Order Summary */}
          {cartItems.length > 0 && (
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${getCartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span>$5.00</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>${(getCartTotal() + 5).toFixed(2)}</span>
                </div>
              </div>
              
              <button
                onClick={handleCheckout}
                className="w-full bg-yellow-700 text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                {isAuthenticated ? 'Proceed to Checkout' : 'Proceed to Checkout'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer; 