import React from "react";
import { X, Check } from "lucide-react";

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "tr", name: "Türkçe", flag: "🇹🇷" },
];

const LanguageModal = ({ isOpen, onClose }: LanguageModalProps) => {
  const [selectedLanguage, setSelectedLanguage] = React.useState("en");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="relative bg-white w-full max-w-md rounded-lg shadow-lg overflow-hidden m-4">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Select Language</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>
        
        {/* Language List */}
        <div className="py-2 max-h-[60vh] overflow-y-auto">
          {languages.map((language) => (
            <button
              key={language.code}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              onClick={() => {
                setSelectedLanguage(language.code);
              }}
            >
              <div className="flex items-center">
                <span className="text-xl mr-3">{language.flag}</span>
                <span>{language.name}</span>
              </div>
              {selectedLanguage === language.code && (
                <Check size={18} className="text-foodyman-lime" />
              )}
            </button>
          ))}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t flex justify-end">
          <button 
            className="px-6 py-2 bg-foodyman-lime text-white rounded-md"
            onClick={() => {
              // Here would go the logic to change the app's language
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

export default LanguageModal; 