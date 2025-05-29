import React, { useState } from 'react';
import { Search, MapPin, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Mock UK addresses for demonstration
const mockAddresses = {
  'SW1A': [
    { fullAddress: '10 Downing Street, London SW1A 2AA', postcode: 'SW1A 2AA' },
    { fullAddress: '12 Downing Street, London SW1A 2AA', postcode: 'SW1A 2AA' },
    { fullAddress: 'Houses of Parliament, London SW1A 0AA', postcode: 'SW1A 0AA' },
  ],
  'E1': [
    { fullAddress: '123 Brick Lane, London E1 6QL', postcode: 'E1 6QL' },
    { fullAddress: '45 Commercial Street, London E1 6LT', postcode: 'E1 6LT' },
    { fullAddress: '78 Whitechapel High Street, London E1 7QX', postcode: 'E1 7QX' },
  ],
  'M1': [
    { fullAddress: '15 Portland Street, Manchester M1 4GX', postcode: 'M1 4GX' },
    { fullAddress: '25 Piccadilly, Manchester M1 1LY', postcode: 'M1 1LY' },
    { fullAddress: '100 Oxford Road, Manchester M1 5QA', postcode: 'M1 5QA' },
  ],
  'B1': [
    { fullAddress: '45 New Street, Birmingham B1 2AA', postcode: 'B1 2AA' },
    { fullAddress: '88 Corporation Street, Birmingham B1 3AB', postcode: 'B1 3AB' },
    { fullAddress: '120 Broad Street, Birmingham B1 1AB', postcode: 'B1 1AB' },
  ],
};

interface Address {
  fullAddress: string;
  postcode: string;
}

const AddressSelector = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const getSuggestions = () => {
    const searchUpper = searchValue.toUpperCase();
    for (const [postcode, addresses] of Object.entries(mockAddresses)) {
      if (postcode.startsWith(searchUpper)) {
        return addresses;
      }
    }
    return [];
  };

  const handleSelect = (address: Address) => {
    setSelectedAddress(address);
    setShowSuggestions(false);
    setSearchValue(address.fullAddress);
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
    <div className="relative  md:py-20 py-10  rounded-xl font-sans"> 
      {/* Background Layer */}
      <div className="absolute inset-0">
        <img
          src="/bg-home.png"
          alt="background"
          className="w-full h-full object-cover opacity-50 blur-sm"
        />
        <div className="absolute inset-0 bg-black/85 " />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-2xl rounded-xl mx-auto space-y-4 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Delivery Address</h1>
          <p className="text-white/80">Enter your delivery address to continue</p>
        </div>

        <div className="relative">
          <div className="relative">
            <input
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
                setShowSuggestions(true);
              }}
              placeholder="Enter UK postcode (e.g., SW1A, E1, M1, B1)..."
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
            <ul className="absolute z-10 w-full bg-black/90 backdrop-blur-sm mt-1 rounded-xl border border-white/20 overflow-hidden">
              {getSuggestions().map((address, index) => (
                <li
                  key={index}
                  onClick={() => handleSelect(address)}
                  className="px-4 py-3 hover:bg-white/10 cursor-pointer text-white flex items-center gap-2"
                >
                  <MapPin size={18} className="text-green-500" />
                  <span>{address.fullAddress}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {selectedAddress && (
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
            <h3 className="text-white font-semibold mb-2">Selected Address:</h3>
            <p className="text-white/80">{selectedAddress.fullAddress}</p>
            <p className="text-white/80 mt-1">Postcode: {selectedAddress.postcode}</p>
            
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