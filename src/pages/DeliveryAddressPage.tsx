import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AddressSelector from '../components/AddressSelector';
import { toast } from 'sonner';

const DeliveryAddressPage = () => {
  const navigate = useNavigate();

  const handleContinueAsGuest = () => {
    const savedAddress = localStorage.getItem('deliveryAddress');
    if (savedAddress) {
      const address = JSON.parse(savedAddress);
      
      // Store delivery method and address in localStorage
      localStorage.setItem('orderDetails', JSON.stringify({
        deliveryMethod: 'deliver',
        address: address,
        timestamp: new Date().toISOString()
      }));

      // Navigate to app or checkout
      navigate('/app');
    } else {
      toast.error('Please select a delivery address to continue');
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Background Layer */}
      <div className="absolute inset-0">
        <img
          src="/bg-home.png"
          alt="background"
          className="w-full h-full object-cover opacity-50 blur-sm"
        />
        <div className="absolute inset-0 bg-black/85" />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 min-h-screen p-4 sm:p-6">
        {/* Back Button */}
        <button
          onClick={() => {
            // Clear any partially entered delivery info
            localStorage.removeItem('deliveryAddress');
            navigate(-1);
          }}
          className="px-4 py-2 font-semibold rounded-md border border-white/20 flex items-center space-x-1 text-white hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-base uppercase">Back</span>
        </button>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto mt-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">
              Enter Your Delivery Address
            </h1>
            <p className="text-white/70 text-lg">
              Please enter your UK delivery address to continue
            </p>
          </div>

          {/* Address Selector */}
          <AddressSelector />

   
        </div>
      </div>
    </div>
  );
};

export default DeliveryAddressPage; 