import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, MapPin } from 'lucide-react';

const OutletSelectionPage = () => {
  const navigate = useNavigate();

  const handleOutletSelect = (outlet: string) => {
    localStorage.setItem('selectedOutlet', outlet);
    navigate('/order-method');
  };

  return (
    <div className="min-h-screen relative xl:pt-10 md:pt-5 pt-3 font-sans">
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
      <div className="relative z-10 max-w-4xl mx-auto px-4">
        {/* Close Button */}
        <button 
          onClick={() => navigate(-1)}
          className="absolute right-4 top-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <X size={24} className="text-white" />
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Select Your Outlet</h1>
          <p className="text-white/80 text-lg">Choose the nearest outlet for your order</p>
        </div>

        {/* Outlet Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Dunfermline Outlet */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20 hover:bg-white/20 transition-colors group">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-green-600/20">
                  <MapPin size={24} className="text-green-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">Dunfermline</h3>
                  <p className="text-white/70 mb-4">123 High Street, Dunfermline KY12 7DR</p>
                  <div className="flex items-center gap-3 text-sm text-white/60">
                    <span>Open 9AM - 10PM</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-white/60"></span>
                    <span>Delivery Available</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleOutletSelect('Dunfermline')}
                className="mt-6 w-full py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors uppercase tracking-wide"
              >
                Select Outlet
              </button>
            </div>
          </div>

          {/* Edinburgh Outlet */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20 hover:bg-white/20 transition-colors group">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-green-600/20">
                  <MapPin size={24} className="text-green-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">Edinburgh</h3>
                  <p className="text-white/70 mb-4">456 Princes Street, Edinburgh EH1 2AB</p>
                  <div className="flex items-center gap-3 text-sm text-white/60">
                    <span>Open 9AM - 11PM</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-white/60"></span>
                    <span>Delivery Available</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleOutletSelect('Edinburgh')}
                className="mt-6 w-full py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors uppercase tracking-wide"
              >
                Select Outlet
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutletSelectionPage; 