import React, { useState, useEffect } from "react";
import { Menu, BellRing, UserCircle, ShoppingCart } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import Sidebar from "./Sidebar";
import NotificationModal from "../notifications/NotificationModal";
import { CartSummary } from "../cart/CartSummary";
import ScheduleModal from "./ScheduleModal";
import { useAuth } from "../../context/AuthContext";
import UserAvatar from "../auth/UserAvatar";
import BranchSelector from "../BranchSelector";

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

  // Refresh user data when component mounts
  useEffect(() => {
    const refreshUserData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        return; // No token, no need to proceed
      }

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

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);

  const openNotifications = () => setIsNotificationsOpen(true);
  const closeNotifications = () => setIsNotificationsOpen(false);

  const openScheduleModal = () => setIsScheduleModalOpen(true);
  const closeScheduleModal = () => setIsScheduleModalOpen(false);

  const handleScheduleSave = (date: string, timeSlot: string) => {
    setScheduleInfo({ date, timeSlot });
  };

  const getInitial = (name?: string, email?: string) => {
    if (name && name.length > 0) {
      return name[0].toUpperCase();
    }
    if (email && email.length > 0) {
      return email[0].toUpperCase();
    }
    return 'U';
  };

  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const branchId = localStorage.getItem('branchId');
    // Store current path for redirect after login
    localStorage.setItem('returnUrl', branchId ? '/app' : window.location.pathname);
    // Use window.location.href to ensure a full page refresh
    window.location.href = '/login';
  };

  // Show loading state while checking authentication
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
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      <NotificationModal
        isOpen={isNotificationsOpen}
        onClose={closeNotifications}
      />
      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={closeScheduleModal}
        onSave={handleScheduleSave}
      />

      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="px-5 md:px-14">
          <div className="flex justify-between items-center h-16 px-4">
            {/* Left section */}
            <div className="flex items-center gap-2">
              {/* <button
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                onClick={openSidebar}
                aria-label="Menu"
              >
                <Menu size={24} className="text-gray-700" />
              </button> */}
              <Link to="/" className="flex items-center font-mono">
                <div className="h-8 w-8 bg-gradient-to-r from-foodyman-lime to-foodyman-green rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">R</span>
                </div>
                <span className="ml-2 font-semibold md:text-2xl text-xl uppercase text-gray-900">
                  Restroman
                </span>
              </Link>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-3">
              <CartSummary className="p-2 hover:bg-gray-100 rounded-full transition-colors" />
              <BranchSelector />
              {/* <button
                onClick={openNotifications}
                aria-label="Notifications"
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <BellRing size={20} className="text-gray-700" />
              </button> */}
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
