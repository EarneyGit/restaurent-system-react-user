import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, MapPin, Loader2 } from 'lucide-react';
import axios from '../config/axios.config';
import { BRANCH_ENDPOINTS } from '../config/api.config';
import { Branch, BranchResponse } from '../types/branch.types';
import { toast } from 'sonner';
import { useBranch } from '../context/BranchContext';

const OutletSelectionPage = () => {
  const navigate = useNavigate();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { setSelectedBranch } = useBranch();

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const response = await axios.get<BranchResponse>(BRANCH_ENDPOINTS.GET_ALL_BRANCHES);
      if (response.data.success && response.data.data) {
        setBranches(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
      toast.error('Failed to load outlets. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOutletSelect = (branch: Branch) => {
    setSelectedBranch(branch);
    localStorage.setItem('selectedBranchId', branch.id);
    navigate('/order-method');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 size={40} className="text-green-500 animate-spin" />
      </div>
    );
  }

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
          {branches.map((branch) => (
            <div 
              key={branch.id}
              className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20 hover:bg-white/20 transition-colors group"
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-green-600/20">
                    <MapPin size={24} className="text-green-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">{branch.name}</h3>
                    <p className="text-white/70 mb-4">
                      {branch.address.street}, {branch.address.city} {branch.address.postalCode}
                    </p>
                    <div className="flex flex-col gap-3 text-sm text-white/60">
                      <span>{branch.contact.phone}</span>
                      {/* <span className="w-1.5 h-1.5 rounded-full bg-white/60"></span> */}
                      <span>{branch.contact.email}</span>
                    </div>
                    {branch.settings && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {branch.settings.isDeliveryEnabled && (
                          <span className="text-xs bg-green-600/20 text-green-500 px-2 py-1 rounded">
                            Delivery Available
                          </span>
                        )}
                        {branch.settings.isCollectionEnabled && (
                          <span className="text-xs bg-blue-600/20 text-blue-500 px-2 py-1 rounded">
                            Collection Available
                          </span>
                        )}
                        {branch.settings.isTableOrderingEnabled && (
                          <span className="text-xs bg-purple-600/20 text-purple-500 px-2 py-1 rounded">
                            Table Ordering
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleOutletSelect(branch)}
                  className="mt-6 w-full py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors uppercase tracking-wide"
                  disabled={!branch.isActive}
                >
                  {branch.isActive ? 'Select Outlet' : 'Currently Unavailable'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {branches.length === 0 && (
          <div className="text-center text-white/70 mt-8">
            No outlets available at the moment. Please try again later.
          </div>
        )}
      </div>
    </div>
  );
};

export default OutletSelectionPage; 