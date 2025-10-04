import React from "react";
import { X, Check } from "lucide-react";
import usePreventScroll from "../../hooks/usePreventScroll";

interface CurrencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const currencies = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "RUB", name: "Russian Ruble", symbol: "₽" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "KRW", name: "South Korean Won", symbol: "₩" },
  { code: "CHF", name: "Swiss Franc", symbol: "Fr" },
];

const CurrencyModal = ({ isOpen, onClose }: CurrencyModalProps) => {
  usePreventScroll(isOpen);
  const [selectedCurrency, setSelectedCurrency] = React.useState("USD");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="relative bg-white w-full max-w-md rounded-lg shadow-lg overflow-hidden m-4">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Select Currency</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>
        
        {/* Currency List */}
        <div className="py-2 max-h-[60vh] overflow-y-auto">
          {currencies.map((currency) => (
            <button
              key={currency.code}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              onClick={() => {
                setSelectedCurrency(currency.code);
              }}
            >
              <div className="flex items-center">
                <span className="w-8 text-center font-medium text-gray-600 mr-3">{currency.symbol}</span>
                <span>{currency.name} ({currency.code})</span>
              </div>
              {selectedCurrency === currency.code && (
                <Check size={18} className="text-yellow-700" />
              )}
            </button>
          ))}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t flex justify-end">
          <button 
            className="px-6 py-2 bg-brand-yellow text-white rounded-md"
            onClick={() => {
              // Here would go the logic to change the app's currency
              onClose();
            }}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default CurrencyModal; 
