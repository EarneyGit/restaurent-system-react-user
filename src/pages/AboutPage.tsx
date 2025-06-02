import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, Clock, Phone, Mail, ArrowLeft, X, Calendar, Info, Truck, Users, ShoppingBag } from 'lucide-react';
import axios from '@/config/axios.config';
import { toast } from 'sonner';

interface BranchDetails {
  id: string;
  name: string;
  aboutUs: string;
  email: string;
  contactNumber: string;
  telephone?: string;
  address: {
    street: string;
    addressLine2?: string;
    city: string;
    county?: string;
    state: string;
    postcode: string;
    country: string;
  };
  orderingTimes: {
    weeklySchedule: {
      [key: string]: {
        defaultTimes: {
          start: string;
          end: string;
        };
        breakTime: {
          enabled: boolean;
          start: string;
          end: string;
        };
        isCollectionAllowed: boolean;
        isDeliveryAllowed: boolean;
        isTableOrderingAllowed: boolean;
      };
    };
    closedDates: Array<{
      date: string;
      type: string;
      endDate?: string;
      reason: string;
    }>;
  };
}

interface TabState {
  [branchId: string]: 'info' | 'hours' | 'closed';
}

const AboutPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const branchId = searchParams.get('branchId');
  const initialTab = searchParams.get('tab') as 'info' | 'hours' | 'closed' || 'info';
  const [branchDetails, setBranchDetails] = useState<BranchDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTabs, setActiveTabs] = useState<TabState>(() => ({
    [branchId || '']: initialTab
  }));

  useEffect(() => {
    const fetchBranchDetails = async () => {
      try {
        const response = branchId 
          ? await axios.get(`/api/branches/public-outlet-settings/${branchId}`)
          : await axios.get('/api/branches/public-outlet-settings');

        if (response.data?.success) {
          if (branchId) {
            setBranchDetails([response.data.data]);
          } else {
            setBranchDetails(response.data.data);
          }
        }
      } catch (error) {
        console.error('Error fetching branch details:', error);
        toast.error('Failed to load branch details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBranchDetails();
  }, [branchId]);

  useEffect(() => {
    // Update active tab when URL params change
    if (branchId) {
      setActiveTabs(prev => ({
        ...prev,
        [branchId]: initialTab
      }));
    }
  }, [branchId, initialTab]);

  const formatTime = (time: string) => {
    try {
      return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-GB', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });
    } catch {
      return time;
    }
  };

  const getUpcomingClosedDates = (closedDates: BranchDetails['orderingTimes']['closedDates']) => {
    const now = new Date();
    return closedDates
      .filter(date => new Date(date.date) > now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);
  };

  const handleTabChange = (branchId: string, tab: 'info' | 'hours' | 'closed') => {
    setActiveTabs(prev => ({
      ...prev,
      [branchId]: tab
    }));
    
    // Update URL with new tab
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('tab', tab);
    navigate(`/about?${newSearchParams.toString()}`, { replace: true });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-black">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="flex justify-between items-center mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/80 hover:text-white"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
        </div>

        {/* Restaurant Description */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Welcome to Restroman</h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Experience the perfect blend of taste and tradition at Restroman. We pride ourselves on serving 
            delicious meals made with the finest ingredients, creating memorable dining experiences for our guests.
          </p>
        </div>

        {branchDetails.map((branch) => {
          const currentTab = activeTabs[branch.id] || 'info';
          
          return (
            <div key={branch.id} className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden mb-8">
              {/* Branch Header */}
              <div className="p-6 border-b border-white/10">
                <h2 className="text-2xl font-bold text-white mb-2">{branch.name}</h2>
                <p className="text-white/70">{branch.aboutUs}</p>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-white/10">
                <button
                  onClick={() => handleTabChange(branch.id, 'info')}
                  className={`flex-1 px-4 py-3 text-sm font-medium ${
                    currentTab === 'info' 
                      ? 'text-green-400 border-b-2 border-green-400' 
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Info size={18} />
                    <span>Information</span>
                  </div>
                </button>
                <button
                  onClick={() => handleTabChange(branch.id, 'hours')}
                  className={`flex-1 px-4 py-3 text-sm font-medium ${
                    currentTab === 'hours' 
                      ? 'text-green-400 border-b-2 border-green-400' 
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Clock size={18} />
                    <span>Opening Hours</span>
                  </div>
                </button>
                <button
                  onClick={() => handleTabChange(branch.id, 'closed')}
                  className={`flex-1 px-4 py-3 text-sm font-medium ${
                    currentTab === 'closed' 
                      ? 'text-green-400 border-b-2 border-green-400' 
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Calendar size={18} />
                    <span>Closed Dates</span>
                  </div>
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {currentTab === 'info' && (
                  <div className="space-y-6">
                    {/* Contact Info */}
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-green-600/20">
                        <MapPin className="text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium mb-1">Address</h3>
                        <p className="text-white/70">
                          {branch.address.street}
                          {branch.address.addressLine2 && `, ${branch.address.addressLine2}`}
                          <br />
                          {branch.address.city}, {branch.address.postcode}
                          <br />
                          {branch.address.state}, {branch.address.country}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-green-600/20">
                        <Phone className="text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium mb-1">Contact</h3>
                        <p className="text-white/70">
                          {branch.contactNumber}
                          {branch.telephone && (
                            <>
                              <br />
                              {branch.telephone}
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-green-600/20">
                        <Mail className="text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium mb-1">Email</h3>
                        <p className="text-white/70">{branch.email}</p>
                      </div>
                    </div>

                    {/* Ordering Options */}
                    <div className="grid grid-cols-3 gap-4 mt-6">
                      <div className="bg-white/5 rounded-xl p-4 text-center">
                        <Truck className="w-6 h-6 text-green-400 mx-auto mb-2" />
                        <h4 className="text-white font-medium">Delivery</h4>
                        <p className="text-white/70 text-sm">Available</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4 text-center">
                        <ShoppingBag className="w-6 h-6 text-green-400 mx-auto mb-2" />
                        <h4 className="text-white font-medium">Collection</h4>
                        <p className="text-white/70 text-sm">Available</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4 text-center">
                        <Users className="w-6 h-6 text-green-400 mx-auto mb-2" />
                        <h4 className="text-white font-medium">Table Service</h4>
                        <p className="text-white/70 text-sm">Available</p>
                      </div>
                    </div>
                  </div>
                )}

                {currentTab === 'hours' && (
                  <div className="space-y-4">
                    {branch.orderingTimes?.weeklySchedule ? (
                      Object.entries(branch.orderingTimes.weeklySchedule).map(([day, times]) => (
                        <div key={day} className="flex justify-between items-center py-3 border-b border-white/10">
                          <div>
                            <h4 className="text-white capitalize">{day}</h4>
                            {times.breakTime?.enabled && (
                              <p className="text-amber-400/80 text-sm mt-1">
                                Break: {formatTime(times.breakTime.start)} - {formatTime(times.breakTime.end)}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-white/70">
                              {formatTime(times.defaultTimes.start)} - {formatTime(times.defaultTimes.end)}
                            </p>
                            <div className="flex gap-2 mt-1">
                              {times.isDeliveryAllowed && (
                                <span className="text-xs bg-green-600/20 text-green-400 px-2 py-0.5 rounded">
                                  Delivery
                                </span>
                              )}
                              {times.isCollectionAllowed && (
                                <span className="text-xs bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded">
                                  Collection
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Clock className="w-12 h-12 text-white/20 mx-auto mb-3" />
                        <p className="text-white/60">No opening hours information available</p>
                      </div>
                    )}
                  </div>
                )}

                {currentTab === 'closed' && (
                  <div className="space-y-4">
                    {branch.orderingTimes?.closedDates ? (
                      branch.orderingTimes.closedDates.length > 0 ? (
                        getUpcomingClosedDates(branch.orderingTimes.closedDates).map((date, index) => (
                          <div key={index} className="bg-white/5 rounded-xl p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-white font-medium">
                                  {new Date(date.date).toLocaleDateString('en-GB', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                  })}
                                </h4>
                                {date.endDate && (
                                  <p className="text-white/70 text-sm mt-1">
                                    Until {new Date(date.endDate).toLocaleDateString('en-GB', {
                                      weekday: 'long',
                                      day: 'numeric',
                                      month: 'long',
                                      year: 'numeric'
                                    })}
                                  </p>
                                )}
                              </div>
                              <span className="text-red-400 text-sm font-medium">
                                {date.reason}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <Calendar className="w-12 h-12 text-white/20 mx-auto mb-3" />
                          <p className="text-white/60">No upcoming closed dates</p>
                        </div>
                      )
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="w-12 h-12 text-white/20 mx-auto mb-3" />
                        <p className="text-white/60">No closed dates information available</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AboutPage; 