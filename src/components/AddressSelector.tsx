import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, X, Loader2, AlertCircle, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';

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

// Helper to format address as string
function formatAddress(addr: string | { street?: string; city?: string; state?: string; zipCode?: string; postcode?: string; country?: string }): string {
  if (!addr) return '';
  if (typeof addr === 'string') return addr;
  if (typeof addr === 'object') {
    // Try to join known fields
    return [addr.street, addr.city, addr.state, addr.zipCode || addr.postcode, addr.country]
      .filter(Boolean)
      .join(', ');
  }
  return '';
}

const AddressSelector = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const { user } = useAuth();
  const [selectedAddress, setSelectedAddress] = useState<AddressResult | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [addressResults, setAddressResults] = useState<AddressResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [selectedSearchedAddress, setSelectedSearchedAddress] = useState<AddressResult | null>(null);
  const [selectedAddressType, setSelectedAddressType] = useState<'user' | 'search'>('user');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLDivElement>(null);

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close suggestions if clicking outside dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      // Close search input if clicking outside search input area
      if (showSearchInput && searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSearchInput(false);
        setSearchValue('');
        setAddressResults([]);
        setError('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSearchInput]);

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
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to search addresses';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (address: AddressResult) => {
    setSelectedAddress(address);
    setSelectedSearchedAddress(address);
    setSearchValue(address.line_1 || `${address.building_number} ${address.thoroughfare}`.trim());
    setShowSuggestions(false);
    setShowSearchInput(false);
    setSelectedAddressType('search');
    
    // Call handleGoToMenu logic when address is selected from dropdown
    const formattedAddress = {
      fullAddress: address.line_1 || `${address.building_number} ${address.thoroughfare}`.trim(),
      street: address.thoroughfare,
      city: address.post_town,
      state: address.county,
      postcode: address.postcode,
      country: address.country,
      longitude: address.longitude,
      latitude: address.latitude
    };
    
    localStorage.setItem('deliveryAddress', JSON.stringify(formattedAddress));
    localStorage.setItem('orderDetails', JSON.stringify({
      deliveryMethod: 'deliver',
      address: formattedAddress,
      timestamp: new Date().toISOString()
    }));
    navigate('/app');
  };

  const handleClear = () => {
    setSelectedAddress(null);
    setSearchValue('');
    setShowSuggestions(false);
  };

  const handleClearSearchedAddress = () => {
    setSelectedSearchedAddress(null);
    setSelectedAddress(null);
    setSearchValue('');
    setSelectedAddressType('user');
    
    // Clear the localStorage saved address
    localStorage.removeItem('deliveryAddress');
    localStorage.removeItem('orderDetails');
  };

  const handleClearUserAddress = () => {
    setSelectedAddress(null);
    setSelectedAddressType('search');
  };

  // Initialize with user address or localStorage address if available
  useEffect(() => {
    // First check if there's a saved address in localStorage
    const savedDeliveryAddress = localStorage.getItem('deliveryAddress');
    const savedOrderDetails = localStorage.getItem('orderDetails');
    
    if (savedDeliveryAddress && savedOrderDetails) {
      try {
        const parsedAddress = JSON.parse(savedDeliveryAddress);
        const parsedOrderDetails = JSON.parse(savedOrderDetails);
        
        // Only use localStorage data if it's a delivery order and has valid address
        if (parsedOrderDetails.deliveryMethod === 'deliver' && parsedAddress) {
          // Create an AddressResult object from the saved address
          const localStorageAddress: AddressResult = {
            postcode: parsedAddress.postcode || '',
            post_town: parsedAddress.city || '',
            thoroughfare: parsedAddress.street || '',
            building_number: '',
            building_name: '',
            line_1: parsedAddress.fullAddress || '',
            line_2: '',
            line_3: '',
            premise: '',
            longitude: parsedAddress.longitude || 0,
            latitude: parsedAddress.latitude || 0,
            country: parsedAddress.country || 'GB',
            county: parsedAddress.state || '',
            district: '',
            ward: '',
            id: '',
            dataset: ''
          };
          
          // Only set from localStorage if user address is not available
          if (!user?.address) {
            setSelectedAddress(localStorageAddress);
            setSelectedSearchedAddress(localStorageAddress);
            setSelectedAddressType('search');
          }
        }
      } catch (error) {
        console.error('Error parsing saved address from localStorage:', error);
      }
    }
    
    // Then check for user address if no address is selected yet
    if (user?.address && !selectedAddress) {
      if (typeof user.address === 'string') {
        setSelectedAddressType('user');
      } else {
        // Handle user address as object (legacy support)
        const userAddress: AddressResult = {
          postcode: user.address.zipCode || '',
          post_town: user.address.city || '',
          thoroughfare: user.address.street || '',
          building_number: '',
          building_name: '',
          line_1: user.address.street || '',
          line_2: '',
          line_3: '',
          premise: '',
          longitude: 0,
          latitude: 0,
          country: user.address.country || 'GB',
          county: user.address.state || '',
          district: '',
          ward: '',
          id: '',
          dataset: ''
        };
        setSelectedAddress(userAddress);
        setSelectedAddressType('user');
      }
    }
  }, [user, selectedAddress]);

  const handleUserAddressSelect = () => {
    if (user?.address) {
      if (typeof user.address === 'string') {
        setSelectedAddressType('user');
        setShowSearchInput(false);
        setSelectedSearchedAddress(null);
        setSelectedAddress(null);
      } else {
        // Handle user address as object (legacy support)
        const userAddress: AddressResult = {
          postcode: user.address.zipCode || '',
          post_town: user.address.city || '',
          thoroughfare: user.address.street || '',
          building_number: '',
          building_name: '',
          line_1: user.address.street || '',
          line_2: '',
          line_3: '',
          premise: '',
          longitude: 0,
          latitude: 0,
          country: user.address.country || 'GB',
          county: user.address.state || '',
          district: '',
          ward: '',
          id: '',
          dataset: ''
        };
        setSelectedAddress(userAddress);
        setSelectedAddressType('user');
        setShowSearchInput(false);
      }
    }
  };

  const handleSearchAddressSelect = () => {
    setSelectedAddressType('search');
    setShowSearchInput(true);
    setSelectedSearchedAddress(null);
    setSelectedAddress(null);
    setSearchValue('');
  };

  const handleGoToMenu = () => {
    if (selectedAddress) {
      const formattedAddress = {
        fullAddress: selectedAddress.line_1 || `${selectedAddress.building_number} ${selectedAddress.thoroughfare}`.trim(),
        street: selectedAddress.thoroughfare,
        city: selectedAddress.post_town,
        state: selectedAddress.county,
        postcode: selectedAddress.postcode,
        country: selectedAddress.country,
        longitude: selectedAddress.longitude,
        latitude: selectedAddress.latitude
      };
      
      localStorage.setItem('deliveryAddress', JSON.stringify(formattedAddress));
      localStorage.setItem('orderDetails', JSON.stringify({
        deliveryMethod: 'deliver',
        address: formattedAddress,
        timestamp: new Date().toISOString()
      }));
      navigate('/app');
    }
  };

  const handleUserAddressGoToMenu = () => {
    if (user?.address && typeof user.address === 'string') {
      const formattedAddress = {
        fullAddress: user.address,
        street: user.address,
        city: '',
        state: '',
        postcode: '',
        country: 'GB',
        longitude: 0,
        latitude: 0
      };
      
      localStorage.setItem('deliveryAddress', JSON.stringify(formattedAddress));
      localStorage.setItem('orderDetails', JSON.stringify({
        deliveryMethod: 'deliver',
        address: formattedAddress,
        timestamp: new Date().toISOString()
      }));
      navigate('/app');
    }
  };

  // Filter valid addresses
  const validAddressResults = addressResults.filter(addr => (
    addr.line_1 || addr.thoroughfare || addr.post_town || addr.postcode
  ));

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
          <p className="text-white/80">Choose your delivery address</p>
        </div>

        {/* Address Selection UI */}
        {user?.address ? (
          <div className={`border rounded-xl p-4 mb-4 shadow-sm transition-all ${selectedAddressType === 'user' ? 'border-yellow-700 bg-yellow-900/10' : 'border-white/20 bg-white/5'}`}>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="addressType"
                checked={selectedAddressType === 'user'}
                onChange={handleUserAddressSelect}
                className="accent-yellow-700 h-5 w-5"
              />
              <div>
                <div className="font-semibold text-white">Use my saved address</div>
                <div className="text-white/80">
                  {typeof user.address === 'string' ? user.address : formatAddress(user.address)}
                </div>
              </div>
            </label>
            {selectedAddressType === 'user' && (
              <button
                onClick={handleUserAddressGoToMenu}
                className="mt-4 flex items-center gap-2 text-xs font-bold bg-yellow-700 text-white px-2.5 py-2 rounded-lg hover:bg-yellow-700 transition"
              >
                Go to Menu
              </button>
            )}
          </div>
        ) : selectedAddress && selectedAddressType === 'search' ? (
          <div className={`border rounded-xl p-4 mb-4 shadow-sm transition-all border-yellow-700 bg-yellow-900/10`}>
            <div className="flex items-start gap-3">
              <MapPin size={18} className="text-yellow-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-semibold text-white">Previously used address</div>
                <div className="text-white/80">
                  {selectedAddress.line_1 || `${selectedAddress.building_number} ${selectedAddress.thoroughfare}`.trim()}
                </div>
                <div className="text-white/80">
                  {selectedAddress.post_town}, {selectedAddress.county}, {selectedAddress.postcode}
                </div>
              </div>
            </div>
            <div className="flex justify-between mt-4">
              <button
                onClick={handleGoToMenu}
                className="flex items-center gap-2 text-xs font-bold bg-yellow-700 text-white px-2.5 py-2 rounded-lg hover:bg-yellow-700 transition"
              >
                Use this address
              </button>
              <button
                onClick={handleClearSearchedAddress}
                className="flex items-center gap-2 text-xs font-bold bg-white/10 text-white px-2.5 py-2 rounded-lg hover:bg-white/20 transition"
              >
                <X size={16} /> Clear
              </button>
            </div>
          </div>
        ) : (
          <div className="border border-white/20 bg-white/5 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-3">
              <MapPin size={18} className="text-white/50" />
              <div>
                <div className="font-semibold text-white/70">No saved address found</div>
                <div className="text-white/50 text-sm">Please search for a new address</div>
              </div>
            </div>
          </div>
        )}
        {/* Search new address button */}
        <button
          type="button"
          onClick={handleSearchAddressSelect}
          className="flex items-center gap-2 text-xs font-bold bg-yellow-700 text-white px-2.5 py-2 rounded-lg  hover:bg-yellow-700 transition"
          >
          <Plus size={18} /> Search new address
        </button>
        {/* Only show search input if showSearchInput is true */}
        {showSearchInput && (
          <div ref={searchInputRef} className="relative mb-4">
            <div className="relative">
              <input
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search by postcode or address..."
                className="w-full px-4 py-3 pl-12 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-yellow-600"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                {isLoading ? (
                  <Loader2 size={20} className="text-white/50 animate-spin" />
                ) : (
                  <Search size={20} className="text-white/50" />
                )}
              </div>
              {selectedSearchedAddress && (
                <button
                  onClick={() => setSelectedSearchedAddress(null)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
                >
                  <X size={20} />
                </button>
              )}
            </div>
            {/* Error Message */}
            {error && (
              <div className="mt-2 flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {/* Only show dropdown if there are valid results and no error */}
            {showSuggestions && searchValue && !error && validAddressResults.length > 0 && (
              <div className="absolute z-50 w-full max-h-[40vh] overflow-y-auto mt-1 bg-black/90 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden shadow-xl">
                {validAddressResults?.map((address, index) => (
                  <button
                    key={index}
                    type='button'
                    onClick={() => handleSelect(address)}
                    className="w-full px-6 py-4 hover:bg-white/10 cursor-pointer text-white flex items-start gap-3 border-b border-white/10 last:border-b-0"
                  >
                    <MapPin size={20} className="text-yellow-600 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-base truncate">
                        {address.line_1 || `${address.building_number} ${address.thoroughfare}`.trim()}
                      </div>
                      <div className="text-sm text-white/70 truncate mt-0.5">
                        {address.post_town}, {address.county}
                      </div>
                      <div className="text-sm text-white/70 mt-0.5">{address.postcode}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {/* Only show the selected searched address card if a valid address is selected from search */}
        {selectedSearchedAddress && selectedAddressType === 'search' && showSearchInput && (
          <div className="mt-4 p-4 bg-white/10 rounded-xl flex items-start gap-2 border border-white/20 relative">
            <MapPin size={18} className="text-yellow-600 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-white font-medium">{selectedSearchedAddress.line_1 || `${selectedSearchedAddress.building_number} ${selectedSearchedAddress.thoroughfare}`.trim()}</p>
              <p className="text-white/80">{selectedSearchedAddress.post_town}, {selectedSearchedAddress.county}</p>
              <p className="text-white/80">{selectedSearchedAddress.postcode}</p>
            </div>
            <button
              onClick={handleClearSearchedAddress}
              className="absolute top-2 right-2 text-white/50 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}
        {/* {selectedAddress && selectedAddressType === 'user' && (
          <div className="mt-4 p-4 bg-white/10 rounded-xl flex items-start gap-2 border border-white/20">
            <MapPin size={18} className="text-yellow-600 mt-1 flex-shrink-0" />
            <div>
              <p className="text-white font-medium">{formatAddress(user.address)}</p>
            </div>
          </div>
        )} */}
        
        {selectedAddress && selectedAddressType === 'search' && !showSearchInput && (
          <div className="mt-4 p-4 bg-white/10 rounded-xl flex items-start gap-2 border border-white/20 relative">
            <MapPin size={18} className="text-yellow-600 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-white font-medium">{selectedAddress.line_1 || `${selectedAddress.building_number} ${selectedAddress.thoroughfare}`.trim()}</p>
              <p className="text-white/80">{selectedAddress.post_town}, {selectedAddress.county}</p>
              <p className="text-white/80">{selectedAddress.postcode}</p>
            </div>
            <button
              onClick={handleGoToMenu}
              className="mt-2 flex items-center gap-2 text-xs font-bold bg-yellow-700 text-white px-2.5 py-2 rounded-lg hover:bg-yellow-700 transition"
            >
              Use this address
            </button>
          </div>
        )}

        {/* {selectedAddress && (
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
            <h3 className="text-white font-semibold mb-2">Selected Address:</h3>
            <div className="flex items-start gap-2">
              <MapPin size={18} className="text-yellow-600 mt-1 flex-shrink-0" />
              <div>
                <p className="text-white/90 font-medium">
                  {selectedAddress.line_1 || `${selectedAddress.building_number} ${selectedAddress.thoroughfare}`.trim()}
                </p>
                <p className="text-white/80">
                  {selectedAddress.post_town}, {selectedAddress.county}
                </p>
                <p className="text-white/80">
                  {selectedAddress.postcode}
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex gap-4">
              <button
                onClick={handleGoToMenu}
                className="flex-1 px-4 py-3 bg-yellow-700 text-white font-semibold rounded-xl hover:bg-yellow-700 transition-colors"
              >
                Go to Menu
              </button>
              <button
                onClick={handleSearchAddressSelect}
                className="flex-1 px-4 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors"
              >
                Choose Another Address
              </button>
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default AddressSelector;