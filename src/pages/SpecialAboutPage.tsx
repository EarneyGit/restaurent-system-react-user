import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { X, MapPin, Clock, Phone, Mail, ArrowLeft } from 'lucide-react';
import axios from '@/config/axios.config';
import { toast } from 'sonner';

interface BranchDetails {
  name: string;
  aboutUs: string;
  contact: {
    email: string;
    phone: string;
    telephone?: string;
  };
  address: {
    street: string;
    city: string;
    postalCode: string;
    state: string;
    country: string;
  };
  openingTimes: {
    [key: string]: {
      open: string;
      close: string;
      isOpen: boolean;
    };
  };
  orderingOptions: {
    collection: {
      displayFormat: string;
      timeslotLength: number;
    };
    delivery: {
      displayFormat: string;
      timeslotLength: number;
    };
  };
  preOrdering: {
    allowCollectionPreOrders: boolean;
    allowDeliveryPreOrders: boolean;
  };
}

const SpecialAboutPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const branchId = searchParams.get('branchId');
  const [branchDetails, setBranchDetails] = useState<BranchDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBranchDetails = async () => {
      if (!branchId) {
        navigate('/select-outlet');
        return;
      }

      try {
        const response = await axios.get(`/api/branches/outlet-settings`);
        if (response.data?.success) {
          setBranchDetails(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching branch details:', error);
        toast.error('Failed to load branch details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBranchDetails();
  }, [branchId, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!branchDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white text-center">
          <p className="text-xl">Branch details not found</p>
          <button
            onClick={() => navigate('/outlet-selection')}
            className="mt-4 px-6 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
          >
            Back to Outlets
          </button>
        </div>
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
        {/* Navigation */}
        <div className="flex justify-between items-center mb-8">
          <button 
            onClick={() => navigate('/outlet-selection')}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Outlets</span>
          </button>
          <button 
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X size={24} className="text-white" />
          </button>
        </div>

        {/* Branch Details */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20">
          <div className="p-8">
            {/* Header */}
            <div className="flex items-start gap-6 mb-8">
              <div className="p-4 rounded-xl bg-green-600/20">
                <MapPin size={32} className="text-green-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{branchDetails.name}</h1>
                <p className="text-white/70">
                  {branchDetails.address.street}, {branchDetails.address.city} {branchDetails.address.postalCode}
                </p>
              </div>
            </div>

            {/* About Section */}
            {branchDetails.aboutUs && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">About Us</h2>
                <p className="text-white/70">{branchDetails.aboutUs}</p>
              </div>
            )}

            {/* Contact Information */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Contact Information</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-white/70">
                  <Phone size={18} />
                  <span>{branchDetails.contact.phone}</span>
                </div>
                {branchDetails.contact.telephone && (
                  <div className="flex items-center gap-3 text-white/70">
                    <Phone size={18} />
                    <span>{branchDetails.contact.telephone}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-white/70">
                  <Mail size={18} />
                  <span>{branchDetails.contact.email}</span>
                </div>
              </div>
            </div>

            {/* Opening Hours */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Opening Hours</h2>
              <div className="grid gap-3">
                {Object.entries(branchDetails.openingTimes).map(([day, times]) => (
                  <div key={day} className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-white/70 capitalize">{day}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white">
                        {times.isOpen ? `${times.open} - ${times.close}` : 'Closed'}
                      </span>
                      {times.isOpen && (
                        <Clock size={16} className="text-green-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ordering Options */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Ordering Options</h2>
              <div className="grid gap-4">
                {/* Delivery */}
                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="text-lg font-medium text-white mb-2">Delivery</h3>
                  <div className="text-white/70">
                    <p>Time Slot Length: {branchDetails.orderingOptions.delivery.timeslotLength} minutes</p>
                    <p>Pre-ordering: {branchDetails.preOrdering.allowDeliveryPreOrders ? 'Available' : 'Not Available'}</p>
                  </div>
                </div>

                {/* Collection */}
                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="text-lg font-medium text-white mb-2">Collection</h3>
                  <div className="text-white/70">
                    <p>Time Slot Length: {branchDetails.orderingOptions.collection.timeslotLength} minutes</p>
                    <p>Pre-ordering: {branchDetails.preOrdering.allowCollectionPreOrders ? 'Available' : 'Not Available'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecialAboutPage;
