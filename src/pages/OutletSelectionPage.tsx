import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

const OutletSelectionPage = () => {
  const navigate = useNavigate();

  const handleOutletSelect = (outlet: string) => {
    localStorage.setItem('selectedOutlet', outlet);
    navigate('/order-method');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden relative animate-fade-in">
        {/* Close Button */}
        <button 
          onClick={() => navigate(-1)}
          className="absolute right-4 top-4 p-2 rounded-full hover:bg-black/5"
        >
          <X size={24} className="text-gray-600" />
        </button>

        {/* Header */}
        <div className="p-6 text-center border-b">
          <h1 className="text-2xl font-bold">Please Select An Outlet</h1>
        </div>

        {/* Outlet List */}
        <div className="p-4 space-y-3">
          {/* Dunfermline Outlet */}
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="p-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Dunfermline</h3>
              </div>
              <button
                onClick={() => handleOutletSelect('Dunfermline')}
                className="px-4 py-2 bg-[#2e7d32] text-white text-sm font-semibold rounded-lg uppercase"
              >
                Choose
              </button>
            </div>
          </div>

          {/* Edinburgh Outlet */}
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="p-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Edinburgh</h3>
              </div>
              <button
                onClick={() => handleOutletSelect('Edinburgh')}
                className="px-4 py-2 bg-[#2e7d32] text-white text-sm font-semibold rounded-lg uppercase"
              >
                Choose
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutletSelectionPage; 