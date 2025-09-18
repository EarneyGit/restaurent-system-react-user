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
    };
  };
  orderingOptions: {
    collection: {
      displayFormat: string;
      timeslotLength: number;
      isEnabled: boolean;
    };
    delivery: {
      displayFormat: string;
      timeslotLength: number;
      isEnabled: boolean;
    };
    tableOrdering: {
      isEnabled: boolean;
    };
  };
  preOrdering: {
    allowCollectionPreOrders: boolean;
    allowDeliveryPreOrders: boolean;
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
        collection: {
          leadTime: number;
          displayedTime: string;
        };
        delivery: {
          customTimes?: {
            start: string;
            end: string;
          };
          useDifferentTimes: boolean;
          leadTime: number;
          displayedTime: string;
        };
        tableOrdering: {
          customTimes?: {
            start: string;
            end: string;
          };
          useDifferentTimes: boolean;
          leadTime: number;
          displayedTime: string;
        };
        isCollectionAllowed: boolean;
        isDeliveryAllowed: boolean;
        isTableOrderingAllowed: boolean;
      };
    };
    closedDates?: {
      date: string;
      type: string;
      reason: string;
    }[];
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

  const renderNoDataMessage = (message: string) => (
    <div className="flex items-center gap-2 text-white/50 italic">
      <X size={16} />
      <span>{message}</span>
    </div>
  );

  const formatTime = (time: string) => {
    try {
      return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return time;
    }
  };

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
            onClick={() => navigate('/select-outlet')}
            // onClick={() => navigate('/outlet-selection')}
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
      <div className="relative z-10 max-w-4xl mx-auto px-4 pb-20">
        {/* Navigation */}
        <div className="flex justify-between items-center mb-8">
          <button 
            onClick={() => navigate('/select-outlet')}
            // onClick={() => navigate('/outlet-selection')}
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
                {branchDetails.contact?.phone ? (
                  <div className="flex items-center gap-3 text-white/70">
                    <Phone size={18} />
                    <span>{branchDetails.contact.phone}</span>
                  </div>
                ) : renderNoDataMessage("No phone number available")}
                
                {branchDetails.contact?.telephone && (
                  <div className="flex items-center gap-3 text-white/70">
                    <Phone size={18} />
                    <span>{branchDetails.contact.telephone}</span>
                  </div>
                )}
                
                {branchDetails.contact?.email ? (
                  <div className="flex items-center gap-3 text-white/70">
                    <Mail size={18} />
                    <span>{branchDetails.contact.email}</span>
                  </div>
                ) : renderNoDataMessage("No email available")}
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
                        {times.open && times.close ? 
                          `${formatTime(times.open)} - ${formatTime(times.close)}` : 
                          'Closed'}
                      </span>
                      {times.open && times.close && (
                        <Clock size={16} className="text-green-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ordering Times */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Ordering Times</h2>
              <div className="grid gap-4">
                {Object?.entries(branchDetails.orderingTimes.weeklySchedule)?.map(([day, schedule]) => (
                  <div key={day} className="bg-white/5 rounded-xl p-4">
                    <h3 className="text-lg font-medium text-white mb-3 capitalize">{day}</h3>
                    <div className="space-y-4">
                      {/* Default Times */}
                      <div className="text-white/70">
                        <p className="text-sm font-medium mb-1">Default Hours</p>
                        <p>{formatTime(schedule.defaultTimes.start)} - {formatTime(schedule.defaultTimes.end)}</p>
                      </div>

                      {/* Break Time */}
                      {schedule.breakTime.enabled && (
                        <div className="text-white/70">
                          <p className="text-sm font-medium mb-1 flex items-center gap-2">
                            Break Time
                            <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded">
                              {formatTime(schedule.breakTime.start)} - {formatTime(schedule.breakTime.end)}
                            </span>
                          </p>
                        </div>
                      )}

                      {/* Collection */}
                      <div className="text-white/70">
                        <p className="text-sm font-medium mb-2 flex items-center gap-2">
                          Collection
                          {schedule.isCollectionAllowed ? (
                            <span className="text-xs bg-green-600/20 text-green-500 px-2 py-0.5 rounded">
                              Available
                            </span>
                          ) : (
                            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">
                              Not Available
                            </span>
                          )}
                        </p>
                        {schedule.isCollectionAllowed ? (
                          <div className="bg-white/5 rounded-lg p-3 space-y-2">
                            <p className="flex items-center gap-2 text-sm">
                              <span>Hours:</span>
                              <span className="text-white">
                                {formatTime(schedule.defaultTimes.start)} - {formatTime(schedule.defaultTimes.end)}
                              </span>
                            </p>
                            {schedule.collection.leadTime > 0 && (
                              <p className="flex items-center gap-2 text-sm">
                                <span>Lead Time:</span>
                                <span className="text-green-500">{schedule.collection.leadTime} minutes</span>
                              </p>
                            )}
                            {schedule.collection.displayedTime && (
                              <p className="flex items-center gap-2 text-sm">
                                <span>First Available:</span>
                                <span className="text-green-500">{formatTime(schedule.collection.displayedTime)}</span>
                              </p>
                            )}
                          </div>
                        ) : null}
                      </div>

                      {/* Delivery */}
                      <div className="text-white/70">
                        <p className="text-sm font-medium mb-2 flex items-center gap-2">
                          Delivery
                          {schedule.isDeliveryAllowed ? (
                            <span className="text-xs bg-green-600/20 text-green-500 px-2 py-0.5 rounded">
                              Available
                            </span>
                          ) : (
                            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">
                              Not Available
                            </span>
                          )}
                        </p>
                        {schedule.isDeliveryAllowed ? (
                          <div className="bg-white/5 rounded-lg p-3 space-y-2">
                            <p className="flex items-center gap-2 text-sm">
                              <span>Hours:</span>
                              <span className="text-white">
                                {schedule.delivery.useDifferentTimes && schedule.delivery.customTimes ? (
                                  `${formatTime(schedule.delivery.customTimes.start)} - ${formatTime(schedule.delivery.customTimes.end)}`
                                ) : (
                                  `${formatTime(schedule.defaultTimes.start)} - ${formatTime(schedule.defaultTimes.end)}`
                                )}
                              </span>
                              {schedule.delivery.useDifferentTimes && schedule.delivery.customTimes && (
                                <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                                  Custom Times
                                </span>
                              )}
                            </p>
                            {schedule.delivery.leadTime > 0 && (
                              <p className="flex items-center gap-2 text-sm">
                                <span>Lead Time:</span>
                                <span className="text-green-500">{schedule.delivery.leadTime} minutes</span>
                              </p>
                            )}
                            {schedule.delivery.displayedTime && (
                              <p className="flex items-center gap-2 text-sm">
                                <span>First Available:</span>
                                <span className="text-green-500">{formatTime(schedule.delivery.displayedTime)}</span>
                              </p>
                            )}
                          </div>
                        ) : null}
                      </div>

                      {/* Table Ordering */}
                      <div className="text-white/70">
                        <p className="text-sm font-medium mb-2 flex items-center gap-2">
                          Table Ordering
                          {schedule.isTableOrderingAllowed ? (
                            <span className="text-xs bg-green-600/20 text-green-500 px-2 py-0.5 rounded">
                              Available
                            </span>
                          ) : (
                            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">
                              Not Available
                            </span>
                          )}
                        </p>
                        {schedule.isTableOrderingAllowed ? (
                          <div className="bg-white/5 rounded-lg p-3 space-y-2">
                            <p className="flex items-center gap-2 text-sm">
                              <span>Hours:</span>
                              <span className="text-white">
                                {schedule.tableOrdering.useDifferentTimes && schedule.tableOrdering.customTimes ? (
                                  `${formatTime(schedule.tableOrdering.customTimes.start)} - ${formatTime(schedule.tableOrdering.customTimes.end)}`
                                ) : (
                                  `${formatTime(schedule.defaultTimes.start)} - ${formatTime(schedule.defaultTimes.end)}`
                                )}
                              </span>
                            </p>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Closed Dates */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                Closed Dates
                {branchDetails.orderingTimes?.closedDates && branchDetails.orderingTimes.closedDates.length > 0 && (
                  <span className="text-sm bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
                    {branchDetails.orderingTimes.closedDates.length} dates
                  </span>
                )}
              </h2>
              {branchDetails.orderingTimes?.closedDates && branchDetails.orderingTimes.closedDates.length > 0 ? (
                <div className="grid gap-3">
                  {branchDetails.orderingTimes.closedDates.map((closedDate, index) => (
                    <div key={index} className="bg-white/5 rounded-xl p-4 border border-red-500/20">
                      <div className="text-white/70">
                        <p className="font-medium flex items-center gap-2">
                          <span>{new Date(closedDate.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}</span>
                          <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">
                            {closedDate.type}
                          </span>
                        </p>
                        <p className="text-sm mt-1 flex items-center gap-2">
                          <span className="text-red-400">Reason:</span> 
                          {closedDate.reason || 'No reason provided'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white/5 rounded-xl p-4 text-white/50 italic flex items-center gap-2">
                  <Clock size={16} />
                  <span>No closed dates scheduled</span>
                </div>
              )}
            </div>

            {/* Ordering Options */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Ordering Options</h2>
              <div className="grid gap-4">
                {/* Collection */}
                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="text-lg font-medium text-white mb-2">Collection</h3>
                  <div className="text-white/70">
                    <p>Status: {branchDetails.orderingOptions.collection.isEnabled ? 'Available' : 'Not Available'}</p>
                    <p>Time Slot Length: {branchDetails.orderingOptions.collection.timeslotLength} minutes</p>
                    <p>Pre-ordering: {branchDetails.preOrdering.allowCollectionPreOrders ? 'Available' : 'Not Available'}</p>
                  </div>
                </div>

                {/* Delivery */}
                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="text-lg font-medium text-white mb-2">Delivery</h3>
                  <div className="text-white/70">
                    <p>Status: {branchDetails.orderingOptions.delivery.isEnabled ? 'Available' : 'Not Available'}</p>
                    <p>Time Slot Length: {branchDetails.orderingOptions.delivery.timeslotLength} minutes</p>
                    <p>Pre-ordering: {branchDetails.preOrdering.allowDeliveryPreOrders ? 'Available' : 'Not Available'}</p>
                  </div>
                </div>

                {/* Table Ordering */}
                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="text-lg font-medium text-white mb-2">Table Ordering</h3>
                  <div className="text-white/70">
                    <p>Status: {branchDetails.orderingOptions.tableOrdering.isEnabled ? 'Available' : 'Not Available'}</p>
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
