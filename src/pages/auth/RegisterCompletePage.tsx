import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Search, MapPin, Loader2, AlertCircle, X } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';
import axios from 'axios';
import { AUTH_ENDPOINTS } from '../../config/api.config';

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

const RegisterCompletePage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get user details from location state
  const { email, firstName, lastName, token, type = 'register' } = location.state || {};

  // Redirect if missing required data
  React.useEffect(() => {
    if (!email || !token) {
      navigate('/register');
    }
  }, [email, token, navigate]);

  const validationSchema = Yup.object({
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      )
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], 'Passwords must match')
      .required('Confirm password is required'),
    phone: Yup.string()
      .matches(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number')
      .required('Phone number is required'),
    address: Yup.string()
      .min(5, 'Address must be at least 5 characters')
      .required('Address is required'),
  });

  // Address search state
  const [addressSearchValue, setAddressSearchValue] = useState('');
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [addressResults, setAddressResults] = useState<AddressResult[]>([]);
  const [isAddressLoading, setIsAddressLoading] = useState(false);
  const [addressError, setAddressError] = useState<string>('');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<AddressResult | null>(null);

  // Address search function
  const handleAddressSearch = (query: string) => {
    console.log(query)
    setAddressSearchValue(query);
    formik.setFieldValue('address', query);
    
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
        setShowAddressSuggestions(false);
      }
    }, 500);

    setSearchTimeout(timeout);
  };

  const searchAddresses = async (query: string) => {
    try {
      setIsAddressLoading(true);
      setAddressError('');
      
      // Try to search by postcode first
      const cleanQuery = query.trim().toUpperCase().replace(/\s+/g, '');
      const response = await axios.get(`/api/addresses/postcode/${cleanQuery}`);
      
      console.log("response",response)
      if (response.data.success && response.data.data) {
        setAddressResults(response.data.data);
        setShowAddressSuggestions(true);
      } else {
        setAddressResults([]);
        setShowAddressSuggestions(false);
      }
    } catch (error: unknown) {
      console.error('Error searching addresses:', error);
      setAddressResults([]);
      setShowAddressSuggestions(false);
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setAddressError(errorMessage);
    } finally {
      setIsAddressLoading(false);
    }
  };

  const handleSelectAddress = (selectedAddress: AddressResult) => {
    console.log("selectedAddress",selectedAddress)
    const formattedAddress = selectedAddress.line_1 || 
      `${selectedAddress.building_number} ${selectedAddress.thoroughfare}`.trim();
    
      const addressPayload = `${result.line_1 || `${result.building_number} ${result.thoroughfare}`.trim()}, ${result.post_town}, ${result.postcode}`;

    formik.setFieldValue('address', formattedAddress);
    setAddressSearchValue(formattedAddress);
    setSelectedAddress(selectedAddress);
    setShowAddressSuggestions(false);
    setAddressResults([]);
  };

  const handleClearAddress = () => {
    setSelectedAddress(null);
    setAddressSearchValue('');
    formik.setFieldValue('address', '');
  };

  // Add click outside handler
  // useEffect(() => {
  //   const handleClickOutside = (event: MouseEvent) => {
  //     const target = event.target as Node;
  //     if (!target || !(target as Element).closest('.address-search-container')) {
  //       setShowAddressSuggestions(false);
  //     }
  //   };

  //   document.addEventListener('mousedown', handleClickOutside);
  //   return () => {
  //     document.removeEventListener('mousedown', handleClickOutside);
  //     if (searchTimeout) {
  //       clearTimeout(searchTimeout);
  //     }
  //   };
  // }, [searchTimeout]);

  const formik = useFormik({
    initialValues: {
      password: '',
      confirmPassword: '',
      phone: '',
      address: '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const response = await axios.post(AUTH_ENDPOINTS.REGISTER, {
          email,
          firstName,
          lastName,
          token,
          password: values.password,
          phone: values.phone,
          address: values.address,
        });

        if (response.data.success) {
          // Store token and redirect
          localStorage.setItem('token', response.data.token);
          toast.success(response.data.message || 'Registration successful');
          navigate('/');
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Registration failed';
        toast.error(errorMessage);
      } finally {
        setSubmitting(false);
      }
    },
  });

  if (!email || !token) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left side - Form */}
      <div className="w-full md:w-1/2 lg:w-2/5 p-6 md:p-12 flex flex-col">
        {/* Logo and Back Button */}
        <div className="flex justify-between items-center md:px-6 py-6">
          <Link to="/" className="flex items-center">
            <div className="h-8 w-8 bg-gradient-to-r from-foodyman-lime to-foodyman-green rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="ml-2 uppercase font-mono font-semibold text-2xl text-gray-800">
              Restroman
            </span>
          </Link>
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
        </div>

        {/* Registration Form */}
        <div className="flex-grow flex flex-col justify-center max-w-md mx-auto w-full">
          <h1 className="text-3xl font-medium text-gray-900 mb-2">
            Complete your profile
          </h1>
          <p className="text-gray-600 mb-8">
            Just a few more details to get you started
          </p>

          <form onSubmit={formik.handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="password"
                className="block text-xs uppercase font-medium text-gray-500 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                {...formik.getFieldProps('password')}
                className={`mt-1 block w-full border ${
                  formik.touched.password && formik.errors.password
                    ? 'border-red-500'
                    : 'border-gray-300'
                } rounded-md shadow-sm py-3 px-3 focus:outline-none focus:ring-foodyman-lime focus:border-foodyman-lime sm:text-sm`}
                placeholder="Create a strong password"
              />
              {formik.touched.password && formik.errors.password && (
                <div className="text-red-500 text-xs mt-1">
                  {formik.errors.password}
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs uppercase font-medium text-gray-500 mb-2"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                {...formik.getFieldProps('confirmPassword')}
                className={`mt-1 block w-full border ${
                  formik.touched.confirmPassword && formik.errors.confirmPassword
                    ? 'border-red-500'
                    : 'border-gray-300'
                } rounded-md shadow-sm py-3 px-3 focus:outline-none focus:ring-foodyman-lime focus:border-foodyman-lime sm:text-sm`}
                placeholder="Confirm your password"
              />
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <div className="text-red-500 text-xs mt-1">
                  {formik.errors.confirmPassword}
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-xs uppercase font-medium text-gray-500 mb-2"
              >
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                {...formik.getFieldProps('phone')}
                className={`mt-1 block w-full border ${
                  formik.touched.phone && formik.errors.phone
                    ? 'border-red-500'
                    : 'border-gray-300'
                } rounded-md shadow-sm py-3 px-3 focus:outline-none focus:ring-foodyman-lime focus:border-foodyman-lime sm:text-sm`}
                placeholder="Enter your phone number"
              />
              {formik.touched.phone && formik.errors.phone && (
                <div className="text-red-500 text-xs mt-1">
                  {formik.errors.phone}
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="address"
                className="block text-xs uppercase font-medium text-gray-500 mb-2"
              >
                Delivery Address
              </label>
              <div className="relative address-search-container">
                <input
                  id="address"
                  type="text"
                  value={addressSearchValue}
                  onChange={(e) => handleAddressSearch(e.target.value)}
                  onFocus={() => {
                    if (addressResults.length > 0) {
                      setShowAddressSuggestions(true);
                    }
                  }}
                  className={`mt-1 block w-full border ${
                    formik.touched.address && formik.errors.address
                      ? 'border-red-500'
                      : 'border-gray-300'
                  } rounded-md shadow-sm py-3 px-3 pl-10 focus:outline-none focus:ring-foodyman-lime focus:border-foodyman-lime sm:text-sm`}
                  placeholder="Search by postcode or address..."
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  {isAddressLoading ? (
                    <Loader2 size={16} className="text-gray-400 animate-spin" />
                  ) : (
                    <Search size={16} className="text-gray-400" />
                  )}
                </div>
                {selectedAddress && (
                  <button
                    onClick={handleClearAddress}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              
              {/* Error Message */}
              {addressError && (
                <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <span>{addressError}</span>
                </div>
              )}

              {/* Selected Address Display */}
              {selectedAddress && (
                <div className="mt-3 p-3 bg-gray-50 border border-gray-300 rounded-md flex items-start gap-3">
                  <MapPin size={18} className="text-green-600 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-neutral-900">
                      {selectedAddress.line_1 || `${selectedAddress.building_number} ${selectedAddress.thoroughfare}`.trim()}
                    </p>
                    <p className="text-sm text-neutral-700">
                      {selectedAddress.post_town}, {selectedAddress.county}
                    </p>
                    <p className="text-sm text-neutral-700">
                      {selectedAddress.postcode}
                    </p>
                  </div>
                </div>
              )}
              
              {showAddressSuggestions && addressResults.length > 0 && (
                <div className="absolute z-50 w-full max-h-60 overflow-y-auto mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                  {addressResults?.map((result, index) => (
                    <button
                      key={index}
                      type='button'
                      onClick={() => handleSelectAddress(result)}
                      className="w-full px-4 py-3 hover:bg-gray-50 cursor-pointer text-left border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-start gap-3">
                        <MapPin size={16} className="text-green-500 mt-1 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {result.line_1 || `${result.building_number} ${result.thoroughfare}`.trim()}
                          </div>
                          <div className="text-sm text-gray-600 truncate mt-0.5">
                            {result.post_town}, {result.postcode}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              {formik.touched.address && formik.errors.address && (
                <div className="text-red-500 text-xs mt-1">
                  {formik.errors.address}
                </div>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={formik.isSubmitting}
                className="w-full bg-foodyman-lime text-white font-medium py-3 rounded-md hover:bg-foodyman-lime/70 transition-colors disabled:opacity-50"
              >
                {formik.isSubmitting ? 'Creating Account...' : 'Complete Registration'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right side - Image with overlay and content */}
      <div className="hidden md:block md:w-1/2 lg:w-3/5 bg-gray-100 relative">
        <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-10"></div>
        <img
          src="/delivery-courier.jpg"
          alt="Delivery courier"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col justify-center items-start z-20 p-12">
          <div className="max-w-xl">
            <h2 className="text-4xl font-bold text-white mb-6">
              Final Step!
            </h2>
            <p className="text-white/90 text-lg mb-8">
              We need a few more details to personalize your experience and ensure
              smooth delivery of your orders.
            </p>
            <div className="bg-black/30 backdrop-blur-sm p-6 rounded-lg">
              <h3 className="text-foodyman-lime font-bold text-xl mb-4">
                Why we need this information
              </h3>
              <ul className="space-y-3 text-white/80">
                <li>• Secure your account with a strong password</li>
                <li>• Contact you about your orders via phone</li>
                <li>• Deliver your food to the correct address</li>
                <li>• Provide personalized recommendations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterCompletePage; 