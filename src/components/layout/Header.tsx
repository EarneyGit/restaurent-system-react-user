import React, { useState, useEffect } from "react";
import { UserCircle } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import Sidebar from "./Sidebar";
import NotificationModal from "../notifications/NotificationModal";
import { CartSummary } from "../cart/CartSummary";
import ScheduleModal from "./ScheduleModal";
import { useAuth } from "../../context/AuthContext";
import UserAvatar from "../auth/UserAvatar";
import BranchSelector from "../BranchSelector";
import { BRANCH_ENDPOINTS } from "@/config/api.config";
import { Branch, BranchResponse } from "@/types/branch.types";
import { toast } from "sonner";

const Header = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleInfo, setScheduleInfo] = useState<{
    date: string;
    timeSlot: string;
  } | null>(null);

  const { user, getMe, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isCheckoutPage = location.pathname === "/checkout";

  const [isCollectionAllowed, setIsCollectionAllowed] = useState(false);
  const [isDeliveryAllowed, setIsDeliveryAllowed] = useState(false);

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

  useEffect(() => {
    const fetchBranch = async () => {
      try {
        const selectedBranchId = localStorage.getItem("selectedBranchId");
        if (!selectedBranchId) return;

        const response = await axios.get<BranchResponse>(
          BRANCH_ENDPOINTS.GET_ALL_BRANCHES
        );

        if (response.data.success && response.data.data) {
          const branch = response.data.data.find(
            (b: Branch) => b.id === selectedBranchId
          );

          if (branch) {
            const todaySchedule =
              branch?.orderingTimes?.weeklySchedule?.[today] || {};
            setIsCollectionAllowed(todaySchedule.isCollectionAllowed ?? false);
            setIsDeliveryAllowed(todaySchedule.isDeliveryAllowed ?? false);

            const todayTIme = new Date();
            todayTIme.setUTCHours(0, 0, 0, 0);

            const todayDate = todayTIme.toISOString();
            const isClosedToday = branch?.orderingTimes?.closedDates?.some(
              (closed: { date: string }) => closed.date === todayDate
            );

            if (isClosedToday) {
              setIsCollectionAllowed(false);
              setIsDeliveryAllowed(false);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching branch in header:", error);
        toast.error("Failed to load branch info.");
      }
    };

    fetchBranch();
  }, []);

  useEffect(() => {
    const refreshUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      if (!user && !authLoading) {
        try {
          await getMe();
        } catch (error) {
          if (
            error instanceof AxiosError &&
            (error.response?.status === 401 || error.response?.status === 403)
          ) {
            console.error("Authentication error:", error);
            localStorage.removeItem("token");
          } else {
            console.error("Error fetching user data:", error);
          }
        }
      }
    };

    refreshUserData();
  }, [getMe, authLoading, user]);

  const handleScheduleSave = (date: string, timeSlot: string) => {
    setScheduleInfo({ date, timeSlot });
  };

  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const branchId = localStorage.getItem("branchId");
    localStorage.setItem(
      "returnUrl",
      branchId ? "/app" : window.location.pathname
    );
    window.location.href = "/login";
  };

  if (authLoading) {
    return (
      <header className="sticky top-0 bg-white z-30 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center h-16 px-4">
            <div className="w-8 h-8 animate-pulse bg-gray-200 rounded-full"></div>
            <div className="w-40 h-8 animate-pulse bg-gray-200 rounded-lg"></div>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 animate-pulse bg-gray-200 rounded-full"></div>
              <div className="w-8 h-8 animate-pulse bg-gray-200 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <NotificationModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSave={handleScheduleSave}
      />

      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="md:px-10">
          <div className="flex justify-between items-center  px-4">
            {/* Left section */}
            <div className="flex items-center gap-2 h-full">
              <Link to="/" className="flex p-3 items-center h-full">
                <img
                  src="/rasoie_logo.png"
                  alt="Logo"
                  className="w-16 h-16 object-contain"
                />
              </Link>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-3">
              {(isCollectionAllowed || isDeliveryAllowed) && (
                <CartSummary className="p-2 hover:bg-gray-100 rounded-full transition-colors" />
              )}
              <BranchSelector />
              <div className="flex items-center">
                {user ? (
                  <UserAvatar />
                ) : (
                  <button
                    onClick={handleLoginClick}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-foodyman-green hover:bg-foodyman-green/90 text-white font-medium transition-colors"
                  >
                    <UserCircle size={18} />
                    <span className="hidden md:inline">Sign in</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
