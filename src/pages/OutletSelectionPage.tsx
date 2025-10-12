import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { X, MapPin, Loader2, Clock, Menu } from "lucide-react";
import axios from "../config/axios.config";
import { BRANCH_ENDPOINTS } from "../config/api.config";
import { Branch, BranchResponse } from "../types/branch.types";
import { toast } from "sonner";
import { useBranch } from "../context/BranchContext";

interface BranchWithFlags extends Branch {
  isCollectionAllowedToday?: boolean;
  isDeliveryAllowedToday?: boolean;
  isClosedToday?: boolean;
}

const OutletSelectionPage = () => {
  const navigate = useNavigate();
  const [branches, setBranches] = useState<BranchWithFlags[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { setSelectedBranch } = useBranch();

  // Get today's weekday in lowercase (monday, tuesday...)
  const daysOfWeek = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const today = daysOfWeek[new Date().getDay()];
  const todayDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const response = await axios.get<BranchResponse>(
        BRANCH_ENDPOINTS.GET_ALL_BRANCHES
      );
      if (response.data.success && response.data.data) {
        const updatedBranches: BranchWithFlags[] = response.data.data.map(
          (branch) => {
            const todaySchedule =
              branch?.orderingTimes?.weeklySchedule?.[today] || {};

            // ✅ Check closedDates
            const isClosedToday =
              branch?.orderingTimes?.closedDates?.some((cd) => {
                const closedDate = new Date(cd.date)
                  .toISOString()
                  .split("T")[0];
                return closedDate === todayDate;
              }) ?? false;

            return {
              ...branch,
              isCollectionAllowedToday:
                todaySchedule.isCollectionAllowed ?? false,
              isDeliveryAllowedToday: todaySchedule.isDeliveryAllowed ?? false,
              isClosedToday,
            };
          }
        );
        setBranches(updatedBranches);
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
      toast.error("Failed to load outlets. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOutletSelect = (branch: BranchWithFlags) => {
    if (branch.isClosedToday) return; // ❌ prevent selection if closed
    setSelectedBranch(branch);
    localStorage.setItem("selectedBranchId", branch.id);
    navigate("/order-method");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 size={40} className="text-yellow-600 animate-spin" />
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
          onClick={() => navigate("/")}
          className="absolute right-4 top-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <X size={24} className="text-white" />
        </button>

        {/* Header */}
        <div className="text-center mb-12 pt-20">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Select Your Outlet
          </h1>
          <p className="text-white/80 text-lg">
            Choose the nearest outlet for your order
          </p>
        </div>

        {/* Outlet Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {branches.map((branch) => {
            const {
              isCollectionAllowedToday,
              isDeliveryAllowedToday,
              isClosedToday,
            } = branch;

            const outletClosed =
              isClosedToday ||
              (!isCollectionAllowedToday && !isDeliveryAllowedToday);

            return (
              <div
                key={branch.id}
                className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20 hover:bg-white/5 transition-colors group"
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-yellow-200/80">
                      <MapPin size={24} className="text-yellow-700" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {branch.name}
                      </h3>
                      <p className="text-white/70 mb-4">
                        {branch.address.street}, {branch.address.city}{" "}
                        {branch.address.postalCode}
                      </p>
                      <div className="flex flex-col gap-3 text-sm text-white/60">
                        <span>{branch.contact.phone}</span>
                        <span>{branch.contact.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Availability Info */}
                  <div className="mt-4 space-y-2 text-sm">
                    {outletClosed ? (
                      <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                        <p className="text-red-200 text-sm">
                          {isClosedToday
                            ? "Outlet is closed today"
                            : "Outlet is not available today"}
                        </p>
                      </div>
                    ) : (
                      <>
                        {!isCollectionAllowedToday && (
                          <div className="p-2 bg-yellow-600/10 rounded-lg border border-yellow-600/20 text-yellow-200">
                            Collection option is not available today
                          </div>
                        )}
                        {!isDeliveryAllowedToday && (
                          <div className="px-2 py-3 bg-yellow-600/10 rounded-lg border border-yellow-600/20 text-yellow-200">
                            Delivery option is not available today
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 space-y-3">
                    {outletClosed ? (
                      <div className="flex gap-3">
                        <Link
                          to={`/about?branchId=${branch.id}&tab=hours`}
                          className="flex-1 py-3 bg-black/30 text-white/70 hover:text-white/90 font-medium rounded-xl hover:bg-black/60 transition-colors text-center flex items-center justify-center gap-2"
                          onClick={() => {
                            setSelectedBranch(branch);
                            localStorage.setItem("selectedBranchId", branch.id);
                          }}
                        >
                          <Clock size={18} />
                          Opening Times
                        </Link>
                        <Link
                          to={`/app/products/All?branchId=${branch.id}`}
                          className="flex-1 py-3 bg-yellow-700/30 text-white/70 hover:text-white/90 font-medium rounded-xl hover:bg-yellow-700/60 transition-colors text-center flex items-center justify-center gap-2"
                          onClick={() => {
                            setSelectedBranch(branch);
                            localStorage.setItem("selectedBranchId", branch.id);
                          }}
                        >
                          <Menu size={18} />
                          View Menu
                        </Link>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleOutletSelect(branch)}
                        disabled={isClosedToday}
                        className="w-full py-3 bg-yellow-600 text-white font-bold rounded-xl hover:bg-yellow-600/90 transition-colors uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Select Outlet
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {branches.length === 0 && (
          <div className="text-center text-white/80 mt-8">
            No outlets available at the moment. Please try again later.
          </div>
        )}
      </div>
    </div>
  );
};

export default OutletSelectionPage;
