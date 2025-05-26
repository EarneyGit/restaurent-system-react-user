import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Option {
  id: string;
  name: string;
  type: 'single' | 'multiple';
  requiresSelection: boolean;
  description?: string;
  choices: {
    id: string;
    name: string;
    price: number;
  }[];
}

interface ProductOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (selectedOptions: Record<string, string>, specialRequirements: string) => void;
  productName: string;
  options: Option[];
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
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Reset form when modal opens
    if (isOpen) {
      setSelectedOptions({});
      setSpecialRequirements('');
      setValidationErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOptionSelect = (optionId: string, choiceId: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionId]: choiceId
    }));
    // Clear validation error when option is selected
    if (validationErrors[optionId]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[optionId];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    options.forEach(option => {
      if (option.requiresSelection && !selectedOptions[option.id]) {
        errors[option.id] = `Please select a ${option.name.toLowerCase()}`;
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddToCart = () => {
    if (!validateForm()) {
      return;
    }

    onAddToCart(selectedOptions, specialRequirements);
    // Reset form
    setSelectedOptions({});
    setSpecialRequirements('');
    setValidationErrors({});
    onClose();
  };

  const calculateTotalPrice = (basePrice: number): number => {
    let total = basePrice;
    Object.entries(selectedOptions).forEach(([optionId, choiceId]) => {
      const option = options.find(opt => opt.id === optionId);
      const choice = option?.choices.find(c => c.id === choiceId);
      if (choice) {
        total += choice.price;
      }
    });
    return total;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gray-50">
          <h2 className="text-2xl font-semibold text-gray-800">{productName}</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Options */}
          <div className="space-y-8">
            {options.map(option => (
              <div key={option.id} className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-semibold text-gray-800">{option.name}</h3>
                  {option.requiresSelection && (
                    <span className="text-red-500 text-sm">*Required</span>
                  )}
                </div>
                {option.description && (
                  <p className="text-sm text-gray-600">{option.description}</p>
                )}
                {validationErrors[option.id] && (
                  <p className="text-red-500 text-sm">{validationErrors[option.id]}</p>
                )}
                <div className="grid gap-3">
                  {option.choices.map(choice => (
                    <label
                      key={choice.id}
                      className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer hover:border-green-500 hover:bg-green-50/50 transition-colors ${
                        selectedOptions[option.id] === choice.id ? 'border-green-500 bg-green-50/50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <input
                          type={option.type === 'multiple' ? 'checkbox' : 'radio'}
                          name={option.id}
                          value={choice.id}
                          checked={selectedOptions[option.id] === choice.id}
                          onChange={() => handleOptionSelect(option.id, choice.id)}
                          className="w-5 h-5 text-green-600 border-gray-300 focus:ring-green-500"
                        />
                        <div>
                          <span className="font-medium text-gray-900">{choice.name}</span>
                          {choice.price > 0 && (
                            <span className="ml-2 text-sm text-gray-600">+${choice.price.toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            {/* Special Requirements */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800">Special Requirements</h3>
              <textarea
                placeholder="E.g., allergies, special preparation instructions..."
                value={specialRequirements}
                onChange={(e) => setSpecialRequirements(e.target.value)}
                className="w-full p-4 border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[100px]"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <button
            onClick={handleAddToCart}
            className="w-full py-2 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors text-lg"
          >
            Add to Basket
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductOptionsModal; 