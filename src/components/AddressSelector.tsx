import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Address, searchAddresses } from '@/data/addresses';

const AddressSelector = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredAddresses, setFilteredAddresses] = useState<Address[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (query: string) => {
    setSearchValue(query);
    const results = searchAddresses(query);
    setFilteredAddresses(results);
    setShowSuggestions(true);
  };

  const handleSelect = (address: Address) => {
    setSelectedAddress(address);
    setSearchValue(address.fullAddress);
    setShowSuggestions(false);
  };

  const handleClear = () => {
    setSelectedAddress(null);
    setSearchValue('');
    setShowSuggestions(false);
  };

  const handleGoToMenu = () => {
    if (selectedAddress) {
      localStorage.setItem('deliveryAddress', JSON.stringify(selectedAddress));
      localStorage.setItem('orderDetails', JSON.stringify({
        deliveryMethod: 'deliver',
        address: selectedAddress,
        timestamp: new Date().toISOString()
      }));
      navigate('/app');
    }
  };

  return (
    <div className="relative md:py-20 py-10 rounded-xl font-sans"> 
      {/* Background Layer */}
      <div className="absolute inset-0">
        <img
          src="/bg-home.png"
          alt="background"
          className="w-full h-full object-cover opacity-50 blur-sm"
        />
        <div className="absolute inset-0 bg-black/85" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-2xl rounded-xl mx-auto space-y-4 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Delivery Address</h1>
          <p className="text-white/80">Enter your delivery address to continue</p>
        </div>

        <div ref={dropdownRef} className="relative">
          <div className="relative">
            <input
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by postcode or address..."
              className="w-full px-4 py-3 pl-12 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-green-500"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50" />
            {selectedAddress && (
              <button
                onClick={handleClear}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {showSuggestions && searchValue && (
            <div className="absolute z-50 w-full max-h-[40vh] overflow-y-auto mt-1 bg-black/90 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden shadow-xl">
              {filteredAddresses.length > 0 ? (
                filteredAddresses.map((address, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelect(address)}
                    className="w-full px-6 py-4 hover:bg-white/10 cursor-pointer text-white flex items-start gap-3 border-b border-white/10 last:border-b-0"
                  >
                    <MapPin size={20} className="text-green-500 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-base truncate">{address.street}</div>
                      <div className="text-sm text-white/70 truncate mt-0.5">
                        {address.city}, {address.state}
                      </div>
                      <div className="text-sm text-white/70 mt-0.5">{address.postcode}</div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-6 py-4 text-white/70 text-center">
                  No addresses found
                </div>
              )}
            </div>
          )}
        </div>

        {selectedAddress && (
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
            <h3 className="text-white font-semibold mb-2">Selected Address:</h3>
            <div className="flex items-start gap-2">
              <MapPin size={18} className="text-green-500 mt-1 flex-shrink-0" />
              <div>
                <p className="text-white/90 font-medium">{selectedAddress.street}</p>
                <p className="text-white/80">
                  {selectedAddress.city}, {selectedAddress.state}
                </p>
                <p className="text-white/80">
                  {selectedAddress.postcode}
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex gap-4">
              <button
                onClick={handleGoToMenu}
                className="flex-1 px-4 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors"
              >
                Go to Menu
              </button>
              <button
                onClick={handleClear}
                className="flex-1 px-4 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors"
              >
                Choose Another Address
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressSelector; 