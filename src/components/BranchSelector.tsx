import React, { useState, useEffect, useRef } from 'react';
import { MapPin, ChevronDown, Store } from 'lucide-react';
import axios from '../config/axios.config';
import { BRANCH_ENDPOINTS } from '../config/api.config';
import { Branch, BranchResponse } from '../types/branch.types';
import { useBranch } from '../context/BranchContext';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';

const BranchSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const { selectedBranch, setSelectedBranch } = useBranch();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch initial branch data on mount if we have a branchId
  useEffect(() => {
    const storedBranchId = localStorage.getItem('selectedBranchId');
    if (storedBranchId && !selectedBranch) {
      fetchBranchData(storedBranchId);
    }
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch branches when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchBranches();
    }
  }, [isOpen]);

  const fetchBranchData = async (branchId: string) => {
    try {
      const response = await axios.get<{ success: boolean; data: Branch }>(`${BRANCH_ENDPOINTS.GET_ALL_BRANCHES}/${branchId}`);
      if (response.data.success && response.data.data) {
        setSelectedBranch(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching branch data:', error);
      toast.error('Failed to load branch information');
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await axios.get<BranchResponse>(BRANCH_ENDPOINTS.GET_ALL_BRANCHES);
      if (response.data.success && response.data.data) {
        setBranches(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
      toast.error('Failed to load outlets');
    }
  };

  const handleBranchSelect = async (branch: Branch) => {
    setSelectedBranch(branch);
    setIsOpen(false);
    
    // Store branchId in localStorage
    localStorage.setItem('selectedBranchId', branch.id);

    // If we're on the outlet selection or order method page, navigate to home
    if (location.pathname === '/select-outlet' || location.pathname === '/order-method') {
    // if (location.pathname === '/outlet-selection' || location.pathname === '/order-method') {
      navigate('/');
    } else {
      // Update URL with new branchId
      const searchParams = new URLSearchParams(location.search);
      searchParams.set('branchId', branch.id);
      
      // Navigate to the same path with updated branchId
      navigate({
        pathname: location.pathname,
        search: searchParams.toString()
      }, { replace: true });
    }
  };

  const handleStartOver = () => {
    setSelectedBranch(null);
    localStorage.removeItem('selectedBranchId');
    navigate('/select-outlet');
    // navigate('/outlet-selection');
  };

  if (!selectedBranch) {
    return (
      <button
        onClick={handleStartOver}
        className="flex items-center gap-2 px-3 py-1.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Store size={20} />
        <span className="hidden md:inline">Select Branch</span>
      </button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-semibold hover:bg-gray-100 bg-gradient-to-br from-black/70 via-neutral-800 to-neutral-800 text-white rounded-lg transition-colors"
      >
        <MapPin size={20} />
        <span className="hidden md:inline">{selectedBranch.name}</span>
        <ChevronDown size={16} className="hidden md:block" />
      </button>

      {isOpen && (
        <div className="absolute top-full md:right-0 -right-10 border border-gray-300 mt-2 w-72 bg-white rounded-lg shadow-lg overflow-hidden z-50">
          <div className="p-4 bg-gray-50 border-b">
            <h3 className="font-semibold text-gray-900">Select Branch</h3>
            <p className="text-sm text-gray-600">Choose your preferred outlet</p>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {branches.map((branch) => (
              <button
                key={branch.id}
                onClick={() => handleBranchSelect(branch)}
                className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors ${
                  selectedBranch.id === branch.id ? 'bg-gray-50' : ''
                }`}
              >
                <div className="p-2 rounded-lg bg-green-100">
                  <MapPin size={20} className="text-green-600" />
                </div>
                <div className="text-left">
                  <h4 className="font-medium text-gray-900">{branch.name}</h4>
                  <p className="text-sm text-gray-600">
                    {branch.address.street}, {branch.address.city}
                  </p>
                </div>
              </button>
            ))}
          </div>
          
          <div className="p-4 bg-gray-50 border-t">
            <button
              onClick={handleStartOver}
              className="w-full py-2 text-center text-green-600 hover:text-green-700 font-medium"
            >
              Start Over
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchSelector; 