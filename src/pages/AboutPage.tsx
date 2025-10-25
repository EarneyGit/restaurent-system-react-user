import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  MapPin,
  Clock,
  Phone,
  Mail,
  ArrowLeft,
  Calendar,
  Info,
  Truck,
  Users,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  LucideIcon,
} from "lucide-react";
import axios from "@/config/axios.config";
import { toast } from "sonner";

interface ServiceTimes {
  leadTime: number;
  displayedTime: string;
  customTimes?: {
    start: string;
    end: string;
  };
  useDifferentTimes: boolean;
}

interface DaySchedule {
  defaultTimes: {
    start: string;
    end: string;
  };
  breakTime: {
    enabled: boolean;
    start: string;
    end: string;
  };
  collection: ServiceTimes;
  delivery: ServiceTimes;
  tableOrdering: ServiceTimes;
  isCollectionAllowed: boolean;
  isDeliveryAllowed: boolean;
  isTableOrderingAllowed: boolean;
}

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
      [key: string]: DaySchedule;
    };
    closedDates: Array<{
      date: string;
      type: string;
      endDate?: string;
      reason: string;
      _id?: string;
      createdAt?: string;
      updatedAt?: string;
    }>;
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
}

interface TabState {
  [branchId: string]: "info" | "hours" | "closed";
}

const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const AboutPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const branchId = searchParams.get("branchId");
  const initialTab =
    (searchParams.get("tab") as "info" | "hours" | "closed") || "info";
  const [branchDetails, setBranchDetails] = useState<BranchDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTabs, setActiveTabs] = useState<TabState>(() => ({
    [branchId || ""]: initialTab,
  }));
  const todayDay = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
  });
  const [expandedDay, setExpandedDay] = useState<string | null>(todayDay.toLowerCase());

  useEffect(() => {
    const fetchBranchDetails = async () => {
      try {
        const response = branchId
          ? await axios.get(`/api/branches/public-outlet-settings/${branchId}`)
          : await axios.get("/api/branches/public-outlet-settings");

        if (response.data?.success) {
          if (branchId) {
            setBranchDetails([response.data.data]);
          } else {
            setBranchDetails(response.data.data);
          }
        }
      } catch (error) {
        console.error("Error fetching branch details:", error);
        toast.error("Failed to load branch details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBranchDetails();
  }, [branchId]);

  useEffect(() => {
    // Update active tab when URL params change
    if (branchId) {
      setActiveTabs((prev) => ({
        ...prev,
        [branchId]: initialTab,
      }));
    }
  }, [branchId, initialTab]);

  const formatTime = (time: string) => {
    try {
      return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-GB", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });
    } catch {
      return time;
    }
  };

  const getUpcomingClosedDates = (
    closedDates: BranchDetails["orderingTimes"]["closedDates"] | undefined
  ) => {
    if (!closedDates) return [];

    const now = new Date();
    const today = new Date(now.toDateString());

    return closedDates
      .filter((date) => {
        const closedDate = new Date(date.date);
        const closedDay = new Date(closedDate.toDateString());
        return closedDay >= today;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);
  };

  const handleTabChange = (
    branchId: string,
    tab: "info" | "hours" | "closed"
  ) => {
    setActiveTabs((prev) => ({
      ...prev,
      [branchId]: tab,
    }));

    // Update URL with new tab
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("tab", tab);
    navigate(`/about?${newSearchParams.toString()}`, { replace: true });
  };

  const formatTimeRange = (start: string, end: string) => {
    return `${formatTime(start)} - ${formatTime(end)}`;
  };

  const ServiceCard = ({
    icon: Icon,
    title,
    isEnabled,
    times,
    leadTime,
    displayedTime,
    customTimes,
    useDifferentTimes,
  }: {
    icon: LucideIcon;
    title: string;
    isEnabled: boolean;
    times?: { start: string; end: string };
    leadTime?: number;
    displayedTime?: string;
    customTimes?: { start: string; end: string };
    useDifferentTimes?: boolean;
  }) => (
    <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg bg-yellow-600/10">
          <Icon className="w-5 h-5 text-yellow-400" />
        </div>
        <div>
          <h4 className="text-white font-medium">{title}</h4>
          <p
            className={`text-sm ${
              isEnabled ? "text-yellow-400" : "text-red-400"
            }`}
          >
            {isEnabled ? "Available" : "Not Available"}
          </p>
        </div>
      </div>
      {isEnabled && (
        <div className="space-y-2 mt-3 border-t border-white/10 pt-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/60">Hours:</span>
            <span className="text-white">
              {useDifferentTimes && customTimes
                ? formatTimeRange(customTimes.start, customTimes.end)
                : times && formatTimeRange(times.start, times.end)}
            </span>
          </div>
          {leadTime && leadTime > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">Lead Time:</span>
              <span className="text-yellow-400">{leadTime} minutes</span>
            </div>
          )}
          {displayedTime && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">First Available:</span>
              <span className="text-yellow-400">
                {formatTime(displayedTime)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const toggleDayExpansion = (day: string) => {
    console.log('day', day);
    setExpandedDay(expandedDay === day ? null : day);
  };

  const ServiceOptionsSection = ({ branch }: { branch: BranchDetails }) => {
    if (!branch.orderingOptions) {
      return (
        <div className="text-center py-8 bg-white/5 rounded-xl">
          <Users className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/60">No service information available</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {/* Delivery Card */}
        <div className="bg-white/0 rounded-xl p-4 backdrop-blur-sm border border-white/10 transition-all duration-300 hover:bg-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-yellow-200/10">
              <Truck className="w-5 h-5 text-gray-200" />
            </div>
            <div>
              <h4 className="text-white font-medium">Delivery</h4>
              <p
                className={`text-sm ${
                  branch.orderingOptions.delivery.isEnabled
                    ? "text-yellow-400"
                    : "text-red-400"
                }`}
              >
                {branch.orderingOptions.delivery.isEnabled
                  ? "Available"
                  : "Not Available"}
              </p>
            </div>
          </div>
          {branch.orderingOptions.delivery.isEnabled && (
            <div className="space-y-2 mt-3 border-t border-white/10 pt-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Time Slots:</span>
                <span className="text-yellow-400">
                  {branch.orderingOptions.delivery.timeslotLength}min
                </span>
              </div>
              {branch.preOrdering?.allowDeliveryPreOrders && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Pre-ordering:</span>
                  <span className="text-yellow-400">Available</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Collection Card */}
        <div className="bg-white/0 rounded-xl p-4 backdrop-blur-sm border border-white/10 transition-all duration-300 hover:bg-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-yellow-200/10">
              <ShoppingBag className="w-5 h-5 text-gray-200" />
            </div>
            <div>
              <h4 className="text-white font-medium">Collection</h4>
              <p
                className={`text-sm ${
                  branch.orderingOptions.collection.isEnabled
                    ? "text-gray-400"
                    : "text-red-400"
                }`}
              >
                {branch.orderingOptions.collection.isEnabled
                  ? "Available"
                  : "Not Available"}
              </p>
            </div>
          </div>
          {branch.orderingOptions.collection.isEnabled && (
            <div className="space-y-2 mt-3 border-t border-white/10 pt-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Time Slots:</span>
                <span className="text-yellow-600">
                  {branch.orderingOptions.collection.timeslotLength}min
                </span>
              </div>
              {branch.preOrdering?.allowCollectionPreOrders && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Pre-ordering:</span>
                  <span className="text-yellow-600">Available</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Table Service Card */}
        <div className="bg-white/0 rounded-xl p-4 backdrop-blur-sm border border-white/10 transition-all duration-300 hover:bg-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-yellow-200/10">
              <Users className="w-5 h-5 text-gray-200" />
            </div>
            <div>
              <h4 className="text-white font-medium">Table Service</h4>
              <p
                className={`text-sm ${
                  branch.orderingOptions.tableOrdering.isEnabled
                    ? "text-gray-400"
                    : "text-red-400"
                }`}
              >
                {branch.orderingOptions.tableOrdering.isEnabled
                  ? "Available"
                  : "Not Available"}
              </p>
            </div>
          </div>
          {branch.orderingOptions.tableOrdering.isEnabled && (
            <div className="space-y-2 mt-3 border-t border-white/10 pt-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Status:</span>
                <span className="text-yellow-600">Active</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-600"></div>
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
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome to Rasoie
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Experience the perfect blend of taste and tradition at Rasoie. We
            pride ourselves on serving delicious meals made with the finest
            ingredients, creating memorable dining experiences for our guests.
          </p>
        </div>

        {branchDetails.map((branch) => {
          const currentTab = activeTabs[branch.id] || "info";
          const weeklySchedule = branch.orderingTimes?.weeklySchedule || {};

          return (
            <div
              key={branch.id}
              className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden mb-8"
            >
              {/* Branch Header */}
              <div className="p-6 border-b border-white/10">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {branch.name}
                </h2>
                <p className="text-white/70">{branch.aboutUs}</p>
              </div>

              {/* Navigation Tabs */}
              <div className="flex overflow-x-auto border-b flex justify-between items-center border-white/10 scrollbar-hide w-full">
                <button
                  onClick={() => handleTabChange(branch.id, "info")}
                  className={`flex-none px-5 py-3 text-sm font-medium whitespace-nowrap ${
                    currentTab === "info"
                      ? "text-yellow-600 border-b-2 border-yellow-700"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Info size={18} className="flex-shrink-0" />
                    <span>Information</span>
                  </div>
                </button>

                <button
                  onClick={() => handleTabChange(branch.id, "hours")}
                  className={`flex-none px-5 py-3 text-sm font-medium whitespace-nowrap ${
                    currentTab === "hours"
                      ? "text-yellow-600 border-b-2 border-yellow-700"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Clock size={18} className="flex-shrink-0" />
                    <span>Opening Hours</span>
                  </div>
                </button>

                <button
                  onClick={() => handleTabChange(branch.id, "closed")}
                  className={`flex-none px-5 py-3 text-sm font-medium whitespace-nowrap ${
                    currentTab === "closed"
                      ? "text-yellow-600 border-b-2 border-yellow-700"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Calendar size={18} className="flex-shrink-0" />
                    <span>Closed Dates</span>
                  </div>
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {currentTab === "info" && (
                  <div className="space-y-6 md:px-6">
                    {/* Contact Info */}
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-xl bg-yellow-200/80">
                          <MapPin className="text-yellow-700" />
                        </div>
                        <div>
                          <h3 className="text-white font-medium mb-1">
                            Address
                          </h3>
                          <p className="text-white/70">
                            {branch.address.street}
                            {branch.address.addressLine2 &&
                              `, ${branch.address.addressLine2}`}
                            <br />
                            {branch.address.city}, {branch.address.postcode}
                            <br />
                            {branch.address.state}, {branch.address.country}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-xl bg-yellow-200/80">
                          <Phone className="text-yellow-700" />
                        </div>
                        <div>
                          <h3 className="text-white font-medium mb-1">
                            Contact
                          </h3>
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
                        <div className="p-2 rounded-xl bg-yellow-200/80">
                          <Mail className="text-yellow-700" />
                        </div>
                        <div>
                          <h3 className="text-white font-medium mb-1">Email</h3>
                          <p className="text-white/70">{branch.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Service Options */}
                    <ServiceOptionsSection branch={branch} />
                  </div>
                )}

                {currentTab === "hours" && (
                  <div className="space-y-4 md:p-6">
                    {Object.keys(weeklySchedule).length > 0 ? (
                      Object.entries(weeklySchedule).sort((a: [string, DaySchedule], b: [string, DaySchedule]) => weekdays.indexOf(a[0]) - weekdays.indexOf(b[0])).map(([day, times]) => {
                        const daySchedule = times as DaySchedule;
                        const hasBreakTime = daySchedule.breakTime?.enabled;
                        const hasDelivery = daySchedule.isDeliveryAllowed;
                        const hasCollection = daySchedule.isCollectionAllowed;

                        return (
                          <div
                            key={day}
                            className="border border-white/10 rounded-lg overflow-hidden bg-white/0 transition-all duration-300 hover:bg-white/10"
                          >
                            <button
                              onClick={() => toggleDayExpansion(day)}
                              className="w-full px-4 py-3 flex items-center justify-between text-left"
                            >
                              <div>
                                <p className="font-medium text-white capitalize">
                                  {day}
                                </p>
                                <p className="text-sm text-white/60">
                                  {formatTimeRange(
                                    daySchedule.defaultTimes.start,
                                    daySchedule.defaultTimes.end
                                  )}
                                </p>
                              </div>
                              {expandedDay === day ? (
                                <ChevronUp
                                  className="text-white/60"
                                  size={20}
                                />
                              ) : (
                                <ChevronDown
                                  className="text-white/60"
                                  size={20}
                                />
                              )}
                            </button>

                            {expandedDay === day && (
                              <div className="px-4 py-3 space-y-4 bg-black/20">
                                {hasBreakTime && (
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-white/60">
                                      Break Time:
                                    </span>
                                    <span className="text-yellow-400">
                                      {formatTimeRange(
                                        daySchedule.breakTime.start,
                                        daySchedule.breakTime.end
                                      )}
                                    </span>
                                  </div>
                                )}

                                {/* Delivery Times */}
                                {hasDelivery && (
                                  <div
                                    className={`pt-3 ${
                                      hasBreakTime
                                        ? "border-t border-white/10"
                                        : ""
                                    }`}
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <p className="text-sm font-medium text-white">
                                        Delivery Hours
                                      </p>
                                      <span className="text-xs bg-yellow-700/80 text-white px-2 py-1 rounded">
                                        Available
                                      </span>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-white/60">
                                          Hours:
                                        </span>
                                        <span className="text-white">
                                          {daySchedule.delivery
                                            .useDifferentTimes &&
                                          daySchedule.delivery.customTimes
                                            ? formatTimeRange(
                                                daySchedule.delivery.customTimes
                                                  .start,
                                                daySchedule.delivery.customTimes
                                                  .end
                                              )
                                            : formatTimeRange(
                                                daySchedule.defaultTimes.start,
                                                daySchedule.defaultTimes.end
                                              )}
                                        </span>
                                      </div>
                                      {daySchedule.delivery.leadTime > 0 && (
                                        <div className="flex justify-between">
                                          <span className="text-white/60">
                                            Lead Time:
                                          </span>
                                          <span className="text-yellow-400">
                                            {daySchedule.delivery.leadTime}{" "}
                                            minutes
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Collection Times */}
                                {hasCollection && (
                                  <div
                                    className={`pt-3 ${
                                      hasBreakTime || hasDelivery
                                        ? "border-t border-white/10"
                                        : ""
                                    }`}
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <p className="text-sm font-medium text-white">
                                        Collection Hours
                                      </p>
                                      <span className="text-xs bg-yellow-700/80 text-white px-2 py-1 rounded">
                                        Available
                                      </span>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-white/60">
                                          Hours:
                                        </span>
                                        <span className="text-white">
                                          {daySchedule.collection
                                            .useDifferentTimes &&
                                          daySchedule.collection.customTimes
                                            ? formatTimeRange(
                                                daySchedule.collection
                                                  .customTimes.start,
                                                daySchedule.collection
                                                  .customTimes.end
                                              )
                                            : formatTimeRange(
                                                daySchedule.defaultTimes.start,
                                                daySchedule.defaultTimes.end
                                              )}
                                        </span>
                                      </div>
                                      {daySchedule.collection.leadTime > 0 && (
                                        <div className="flex justify-between">
                                          <span className="text-white/60">
                                            Lead Time:
                                          </span>
                                          <span className="text-yellow-400">
                                            {daySchedule.collection.leadTime}{" "}
                                            minutes
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {!hasBreakTime &&
                                  !hasDelivery &&
                                  !hasCollection && (
                                    <div className="text-center py-4">
                                      <Info className="w-8 h-8 text-white/20 mx-auto mb-2" />
                                      <p className="text-white/60">
                                        No additional service information
                                        available
                                      </p>
                                    </div>
                                  )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-2">
                        <Clock className="w-12 h-12 text-white/20 mx-auto mb-3" />
                        <p className="text-white/60">
                          No opening hours information available
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {currentTab === "closed" && (
                  <div className="space-y-4">
                    {(() => {
                      const upcomingDates = getUpcomingClosedDates(
                        branch.orderingTimes?.closedDates || []
                      );
                      return upcomingDates.length > 0 ? (
                        upcomingDates.map((date, index) => (
                          <div
                            key={index}
                            className="bg-white/5 rounded-xl p-4"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-white font-medium">
                                  {new Date(date.date).toLocaleDateString(
                                    "en-GB",
                                    {
                                      weekday: "long",
                                      day: "numeric",
                                      month: "long",
                                      year: "numeric",
                                    }
                                  )}
                                </h4>
                                {date.endDate && (
                                  <p className="text-white/70 text-sm mt-1">
                                    Until{" "}
                                    {new Date(date.endDate).toLocaleDateString(
                                      "en-GB",
                                      {
                                        weekday: "long",
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                      }
                                    )}
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
                          <p className="text-white/60">
                            No upcoming closed dates
                          </p>
                        </div>
                      );
                    })()}
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
