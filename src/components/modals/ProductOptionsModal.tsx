import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { ProductAttribute } from '@/services/api';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useGuestCart } from '@/context/GuestCartContext';
import { useNavigate } from 'react-router-dom';

interface SelectedAttributeItem {
  itemId: string;
  itemName: string;
  itemPrice: number;
  quantity: number;
}

interface SelectedAttribute {
  attributeId: string;
  attributeName: string;
  attributeType: 'single' | 'multiple' | 'multiple-times';
  selectedItems: SelectedAttributeItem[];
}

interface ProductOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (selectedAttributes: SelectedAttribute[], specialRequirements: string) => void;
  productName: string;
  options: ProductAttribute[];
  productId?: string;
}

const ProductOptionsModal = ({
  isOpen,
  onClose,
  onAddToCart,
  productName,
  options,
  productId
}: ProductOptionsModalProps) => {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string | string[]>>({});
  const [specialRequirements, setSpecialRequirements] = useState('');
  const { isAuthenticated } = useAuth();
  const { sessionId } = useGuestCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setSelectedOptions({});
      setSpecialRequirements('');
    }
  }, [isOpen]);

  const handleOptionSelect = (option: ProductAttribute, choiceId: string) => {
    setSelectedOptions(prev => {
      const current = prev[option.id];
      if (option.type === 'single') {
        return { ...prev, [option.id]: choiceId };
      }
      if (option.type === 'multiple') {
        const currentArray = Array.isArray(current) ? current : [];
        const exists = currentArray.includes(choiceId);
        const next = exists ? currentArray.filter(id => id !== choiceId) : [...currentArray, choiceId];
        return { ...prev, [option.id]: next };
      }
      // multiple-times: toggle selection and manage quantities
      const currentArray = Array.isArray(current) ? current : [];
      const exists = currentArray.includes(choiceId);
      const next = exists ? currentArray.filter(id => id !== choiceId) : [...currentArray, choiceId];
      // Update quantities to ensure selected starts at 1 and deselected is removed
      setQuantities(prevQty => {
        const attr = prevQty[option.id] || {};
        if (!exists) {
          // newly selected -> start at 1
          return { ...prevQty, [option.id]: { ...attr, [choiceId]: attr[choiceId] && attr[choiceId] > 0 ? attr[choiceId] : 1 } };
        }
        // deselected -> remove entry
        const { [choiceId]: _removed, ...rest } = attr as Record<string, number>;
        return { ...prevQty, [option.id]: rest };
      });
      return { ...prev, [option.id]: next };
    });
  };

  const [quantities, setQuantities] = useState<Record<string, Record<string, number>>>({});

  const updateQuantity = (attributeId: string, choiceId: string, delta: number) => {
    setQuantities(prev => {
      const attr = prev[attributeId] || {};
      const current = attr[choiceId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [attributeId]: { ...attr, [choiceId]: next } };
    });
  };

  const validateForm = (): boolean => {
    const missingOptions = options
      .filter(option => {
        const sel = selectedOptions[option.id];
        if (!option.requiresSelection) return false;
        if (option.type === 'single') return !sel;
        const arr = Array.isArray(sel) ? sel : [];
        return arr.length === 0;
      })
      .map(option => option.name);
    
    if (missingOptions.length > 0) {
      toast.error(`Please select ${missingOptions.join(' and ')} before adding to cart`);
      return false;
    }
    return true;
  };

  const handleAddToCart = () => {
    if (!validateForm()) {
      return;
    }

    // If user is not authenticated and no guest session exists, redirect to login
    if (!isAuthenticated && !sessionId) {
      localStorage.setItem('returnUrl', window.location.pathname);
      navigate('/login');
      onClose();
      return;
    }

    // Build SelectedAttribute[] structure
    const selectedAttributes: SelectedAttribute[] = options.map(option => {
      const sel = selectedOptions[option.id];
      let selectedItems: SelectedAttributeItem[] = [];
      if (option.type === 'single' && typeof sel === 'string') {
        const choice = option.choices.find(c => c.id === sel);
        if (choice) {
          selectedItems = [{ itemId: choice.id, itemName: choice.name, itemPrice: choice.price, quantity: 1 }];
        }
      } else {
        const ids = Array.isArray(sel) ? sel : [];
        selectedItems = ids.map(id => {
          const choice = option.choices.find(c => c.id === id)!;
          const qty = option.type === 'multiple-times' ? Math.max(1, quantities[option.id]?.[id] || 1) : 1;
          return { itemId: id, itemName: choice?.name || '', itemPrice: choice?.price || 0, quantity: qty };
        });
      }
      return {
        attributeId: option.id,
        attributeName: option.name,
        attributeType: option.type,
        selectedItems
      };
    }).filter(attr => attr.selectedItems.length > 0);

    onAddToCart(selectedAttributes, specialRequirements);
    onClose();
  };

  // Add price formatting function
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with more blur for modern feel */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      
      {/* Modal with softer shadow and rounded corners */}
      <div className="relative bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden">
        {/* Header with gray background */}
        <div className="flex items-center justify-between px-8 py-6 bg-gray-50">
          <h2 className="text-xl font-medium text-gray-800">{productName}</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/80 rounded-full transition-all duration-200"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Content with reduced height and scroll */}
        <div className="max-h-[60vh] overflow-y-auto">
          {/* Options wrapper with padding */}
          <div className="px-8 py-6">
            {/* Options with refined spacing */}
            <div className="space-y-6">
              {options.map(option => (
                <div key={option.id} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-medium text-gray-800">
                      {option.name}
                      {option.requiresSelection && <span className="text-red-500 ml-1">*</span>}
                    </h3>
                  </div>
                  {option.description && (
                    <p className="text-sm text-gray-500 leading-relaxed">{option.description}</p>
                  )}
                  <div className="grid gap-2.5">
                    {option.choices.map(choice => (
                      <label
                        key={choice.id}
                        className={`flex items-center justify-between px-4 py-3.5 border rounded-xl cursor-pointer
                          transition-all duration-200 hover:border-yellow-600/50 hover:bg-yellow-50/30
                          ${option.type === 'single' ? (selectedOptions[option.id] === choice.id) : (Array.isArray(selectedOptions[option.id]) && (selectedOptions[option.id] as string[]).includes(choice.id)) 
                            ? 'border-yellow-600/50 bg-yellow-50/30 shadow-sm' 
                            : 'border-gray-200'}`}
                      >
                        <div className="flex items-center gap-3">
                          {option.type === 'single' ? (
                            <input
                              type="radio"
                              name={option.id}
                              value={choice.id}
                              checked={selectedOptions[option.id] === choice.id}
                              onChange={() => handleOptionSelect(option, choice.id)}
                              className="w-4 h-4 text-yellow-600 border-gray-300 focus:ring-yellow-400 focus:ring-offset-1"
                            />
                          ) : (
                            <input
                              type="checkbox"
                              name={`${option.id}-${choice.id}`}
                              value={choice.id}
                              checked={Array.isArray(selectedOptions[option.id]) && (selectedOptions[option.id] as string[]).includes(choice.id)}
                              onChange={() => handleOptionSelect(option, choice.id)}
                              className="w-4 h-4 text-yellow-600 border-gray-300 focus:ring-yellow-400 focus:ring-offset-1"
                            />
                          )}
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-700">{choice.name}</span>
                            {choice.price > 0 && (
                              <span className="text-xs font-medium text-gray-500">+{formatPrice(choice.price)}</span>
                            )}
                          </div>
                        </div>
                        {option.type === 'multiple-times' && Array.isArray(selectedOptions[option.id]) && (selectedOptions[option.id] as string[]).includes(choice.id) && (
                          <div className="flex items-center gap-2">
                            <button type="button" onClick={() => updateQuantity(option.id, choice.id, -1)} className="px-2 py-1 rounded bg-gray-100">-</button>
                            <span className="min-w-[24px] text-center">{Math.max(1, quantities[option.id]?.[choice.id] || 1)}</span>
                            <button type="button" onClick={() => updateQuantity(option.id, choice.id, 1)} className="px-2 py-1 rounded bg-gray-100">+</button>
                          </div>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              {/* Special Requirements with modern styling */}
              <div className="space-y-3 pt-2">
                <h3 className="text-base font-medium text-gray-800">Special Requirements</h3>
                <textarea
                  placeholder="E.g., allergies, special preparation instructions..."
                  value={specialRequirements}
                  onChange={(e) => setSpecialRequirements(e.target.value)}
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl resize-none
                    placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-600/50 
                    focus:border-transparent transition-all duration-200 min-h-[90px]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer with gradient background */}
        <div className="px-8 py-6 bg-gradient-to-r from-yellow-50 to-yellow-100/50 border-t border-gray-100">
          <button
            onClick={handleAddToCart}
            className="w-full py-3 bg-yellow-700 text-white text-sm font-medium rounded-xl
              hover:bg-yellow-700 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Add to Basket
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductOptionsModal; 