import React, { useState, useEffect } from 'react';
import { Search, MapPin, Loader2, AlertCircle, X } from 'lucide-react';
import axios from 'axios';

interface AddressInputProps {
  address: string;
  city: string;
  postcode: string;
  onAddressChange: (address: string) => void;
  onCityChange: (city: string) => void;
  onPostcodeChange: (postcode: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

interface AddressResult {
  postcode: string;
  post_town: string;
  thoroughfare: string;
  building_number: string;
  building_name: string;
  line_1: string;
  line_2: string;
  line_3: string;
  premise: string;
  longitude: number;
  latitude: number;
  country: string;
  county: string;
  district: string;
  ward: string;
  id: string;
  dataset: string;
}

const AddressInput: React.FC<AddressInputProps> = ({
  address,
  city,
  postcode,
  onAddressChange,
  onCityChange,
  onPostcodeChange,
  placeholder = "Search by postcode or address...",
  className = "",
  disabled = false
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [addressResults, setAddressResults] = useState<AddressResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<AddressResult | null>(null);
  const [error, setError] = useState<string>('');

  // Update search value when address prop changes
  useEffect(() => {
    if (address && !selectedAddress) {
      setSearchValue(address);
    }
  }, [address, selectedAddress]);

  // Debounced search function
  const handleSearch = (query: string) => {
    setSearchValue(query);
    
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout for debounced search
    const timeout = setTimeout(async () => {
      if (query.trim().length >= 3) {
        await searchAddresses(query);
      } else {
        setAddressResults([]);
        setShowSuggestions(false);
      }
    }, 500);

    setSearchTimeout(timeout);
  };

  const searchAddresses = async (query: string) => {
    try {
      setIsLoading(true);
      setError('');
      
      // Try to search by postcode first
      const cleanQuery = query.trim().toUpperCase().replace(/\s+/g, '');
      const response = await axios.get(`/api/addresses/postcode/${cleanQuery}`);
      
      if (response.data.success && response.data.data) {
        setAddressResults(response.data.data);
        setShowSuggestions(true);
      } else {
        setAddressResults([]);
        setShowSuggestions(false);
      }
    } catch (error: unknown) {
      console.error('Error searching addresses:', error);
      setAddressResults([]);
      setShowSuggestions(false);
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAddress = (selectedAddress: AddressResult) => {
    // Format the address
    const formattedAddress = selectedAddress.line_1 || 
      `${selectedAddress.building_number} ${selectedAddress.thoroughfare}`.trim();
    
    onAddressChange(formattedAddress);
    onCityChange(selectedAddress.post_town || '');
    onPostcodeChange(selectedAddress.postcode || '');
    
    setSearchValue(formattedAddress);
    setSelectedAddress(selectedAddress);
    setShowSuggestions(false);
    setAddressResults([]);
  };

  const handleClearAddress = () => {
    setSelectedAddress(null);
    setSearchValue('');
    onAddressChange('');
    onCityChange('');
    onPostcodeChange('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    onAddressChange(value);
    handleSearch(value);
  };

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!target || !(target as Element).closest('.address-input-container')) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  return (
    <div className={`relative address-input-container ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={searchValue}
          onChange={handleInputChange}
          onFocus={() => {
            if (addressResults.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-4 py-2.5 pl-12 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50"
        />
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
          {isLoading ? (
            <Loader2 size={20} className="text-neutral-400 animate-spin" />
          ) : (
            <Search size={20} className="text-neutral-400" />
          )}
        </div>
        {selectedAddress && (
          <button
            onClick={handleClearAddress}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Selected Address Display */}
      {selectedAddress && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
          <MapPin size={18} className="text-green-600 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-900">
              {selectedAddress.line_1 || `${selectedAddress.building_number} ${selectedAddress.thoroughfare}`.trim()}
            </p>
            <p className="text-sm text-green-700">
              {selectedAddress.post_town}, {selectedAddress.county}
            </p>
            <p className="text-sm text-green-700">
              {selectedAddress.postcode}
            </p>
          </div>
        </div>
      )}

      {showSuggestions && addressResults.length > 0 && (
        <div className="absolute z-50 w-full max-h-60 overflow-y-auto mt-1 bg-white border border-neutral-200 rounded-xl shadow-lg">
          {addressResults.map((result, index) => (
            <button
              key={index}
              onClick={() => handleSelectAddress(result)}
              className="w-full px-4 py-3 hover:bg-neutral-50 cursor-pointer text-left border-b border-neutral-100 last:border-b-0"
            >
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-green-500 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-neutral-900 truncate">
                    {result.line_1 || `${result.building_number} ${result.thoroughfare}`.trim()}
                  </div>
                  <div className="text-sm text-neutral-600 truncate mt-0.5">
                    {result.post_town}, {result.postcode}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressInput; 