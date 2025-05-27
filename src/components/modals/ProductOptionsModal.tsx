import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { ProductAttribute } from '@/services/api';
import { toast } from 'sonner';

interface ProductOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (selectedOptions: Record<string, string>, specialRequirements: string) => void;
  productName: string;
  options: ProductAttribute[];
}

const ProductOptionsModal = ({
  isOpen,
  onClose,
  onAddToCart,
  productName,
  options
}: ProductOptionsModalProps) => {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [specialRequirements, setSpecialRequirements] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedOptions({});
      setSpecialRequirements('');
    }
  }, [isOpen]);

  const handleOptionSelect = (optionId: string, choiceId: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionId]: choiceId
    }));
  };

  const validateForm = (): boolean => {
    const missingOptions = options
      .filter(option => option.requiresSelection && !selectedOptions[option.id])
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

    onAddToCart(selectedOptions, specialRequirements);
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
                          transition-all duration-200 hover:border-green-500/50 hover:bg-green-50/30
                          ${selectedOptions[option.id] === choice.id 
                            ? 'border-green-500/50 bg-green-50/30 shadow-sm' 
                            : 'border-gray-200'}`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type={option.type === 'multiple' ? 'checkbox' : 'radio'}
                            name={option.id}
                            value={choice.id}
                            checked={selectedOptions[option.id] === choice.id}
                            onChange={() => handleOptionSelect(option.id, choice.id)}
                            className="w-4 h-4 text-green-500 border-gray-300 focus:ring-green-400 focus:ring-offset-1"
                          />
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-700">{choice.name}</span>
                            {choice.price > 0 && (
                              <span className="text-xs font-medium text-gray-500">+₹{choice.price.toFixed(2)}</span>
                            )}
                          </div>
                        </div>
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
                    placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 
                    focus:border-transparent transition-all duration-200 min-h-[90px]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer with gradient background */}
        <div className="px-8 py-6 bg-gradient-to-r from-green-50 to-green-100/50 border-t border-gray-100">
          <button
            onClick={handleAddToCart}
            className="w-full py-3 bg-green-600 text-white text-sm font-medium rounded-xl
              hover:bg-green-700 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Add to Basket
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductOptionsModal; 