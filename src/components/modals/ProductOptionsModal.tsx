import React, { useState } from 'react';
import { X } from 'lucide-react';

interface Option {
  id: string;
  name: string;
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

  if (!isOpen) return null;

  const handleOptionSelect = (optionId: string, choiceId: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionId]: choiceId
    }));
  };

  const handleAddToCart = () => {
    // Check if all required options are selected
    const allOptionsSelected = options.every(option => selectedOptions[option.id]);
    
    if (!allOptionsSelected) {
      alert('Please select all required options');
      return;
    }

    onAddToCart(selectedOptions, specialRequirements);
    // Reset form
    setSelectedOptions({});
    setSpecialRequirements('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-white w-full max-w-md rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">{productName}</h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {/* Options */}
          <div className="space-y-6">
            {options.map(option => (
              <div key={option.id} className="space-y-3">
                <h3 className="font-medium text-gray-800">{option.name}</h3>
                <div className="grid gap-2">
                  {option.choices.map(choice => (
                    <label
                      key={choice.id}
                      className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:border-green-500 transition-colors"
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name={option.id}
                          value={choice.id}
                          checked={selectedOptions[option.id] === choice.id}
                          onChange={() => handleOptionSelect(option.id, choice.id)}
                          className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                        />
                        <span className="ml-3">{choice.name}</span>
                      </div>
                      {choice.price > 0 && (
                        <span className="text-gray-600">+${choice.price.toFixed(2)}</span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            ))}

            {/* Special Requirements */}
            <div className="space-y-2">
              <label htmlFor="special-requirements" className="block font-medium text-gray-800">
                Have any other requirements?
              </label>
              <textarea
                id="special-requirements"
                rows={3}
                placeholder="E.g., allergies, special preparation instructions..."
                value={specialRequirements}
                onChange={(e) => setSpecialRequirements(e.target.value)}
                className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t">
          <button
            onClick={handleAddToCart}
            className="w-full py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            Add to Basket
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductOptionsModal; 