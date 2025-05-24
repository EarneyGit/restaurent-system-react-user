import React, { useState, useEffect } from "react";
import { Menu, Search, Heart, Bell, LogIn } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import NotificationModal from "../notifications/NotificationModal";
import CartSummary from "../cart/CartSummary";
import ScheduleModal from "./ScheduleModal";
import { useAuth } from '../../context/AuthContext';
import UserAvatar from '../auth/UserAvatar';

const Header = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleInfo, setScheduleInfo] = useState<{
    date: string;
    timeSlot: string;
  } | null>(null);

  const { user, getMe, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isCheckoutPage = location.pathname === '/checkout';

  // Refresh user data when component mounts
  useEffect(() => {
    const refreshUserData = async () => {
      try {
        console.log('Header - Refreshing user data');
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.log('Header - No token found');
          return;
        }

        console.log('Header - Token found, fetching user data');
        const userData = await getMe();
        console.log('Header - User data fetched:', userData);
        
        // If we're on the login page and have user data, redirect to home
        if (location.pathname === '/login' && userData) {
          navigate('/app');
        }
      } catch (error) {
        console.error('Header - Failed to refresh user data:', error);
        // Don't clear token here, let AuthContext handle it
      }
    };

    // Only refresh if we're not already loading and don't have user data
    if (!isLoading && !user) {
      refreshUserData();
    }
  }, [getMe, location.pathname, navigate, isLoading, user]);

  // Log user state changes
  useEffect(() => {
    console.log('Header - User state changed:', user);
    // If we're on the login page and have user data, redirect to home
    if (location.pathname === '/login' && user) {
      navigate('/');
    }
  }, [user, location.pathname, navigate]);

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);

  const openNotifications = () => setIsNotificationsOpen(true);
  const closeNotifications = () => setIsNotificationsOpen(false);

  const openScheduleModal = () => setIsScheduleModalOpen(true);
  const closeScheduleModal = () => setIsScheduleModalOpen(false);

  const handleScheduleSave = (date: string, timeSlot: string) => {
    setScheduleInfo({ date, timeSlot });
  };

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

      <header className="sticky top-0  md:px-6 bg-white z-30">
        <div className="flex justify-between items-center border-b md:py-3 py-2 border-gray-300">
          {" "}
          {/* Top navigation row */}
          <div className="flex items-center justify-between px-4 py-3">
            <button className="p-1" onClick={openSidebar} aria-label="Menu">
              <Menu size={30} />
            </button>

            <div className="flex justify-center flex-1">
              <Link to="/" className="mx-auto flex items-center">
                <div className="h-8 w-8 bg-gradient-to-r from-foodyman-lime to-foodyman-green rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">R</span>
                </div>
                <span className="ml-2 uppercase font-mono  font-semibold text-2xl md:block hidden text-gray-800">
                  Restroman
                </span>
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4 px-4">
            <CartSummary />
            {/* <Link
              to="/liked"
              aria-label="Favorites"
              className="text-gray-700 hover:text-black transition-colors"
            >
              <Heart size={22} />
            </Link> */}
            <button
              onClick={openNotifications}
              aria-label="Notifications"
              className="text-gray-700 hover:text-black transition-colors p-0 bg-transparent border-0"
            >
              <Bell size={22} />
            </button>
            <div className="flex items-center">
              {user ? (
                <UserAvatar />
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                >
                  <LogIn size={18} />
                  <span>Login</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Bottom navigation row - Hide on checkout page */}
        {/* {!isCheckoutPage && (
          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center overflow-x-auto flex-1 scrollbar-hide">
              <button
                onClick={openScheduleModal}
                className="flex items-center gap-2 whitespace-nowrap bg-transparent border-none p-0 cursor-pointer"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8 2V5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M16 2V5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M3 8H21"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <rect
                    x="3"
                    y="4"
                    width="18"
                    height="18"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
                <div className="flex flex-col items-start">
                  <span className="font-medium">Schedule</span>
                  {scheduleInfo && (
                    <span className="text-sm font-semibold text-green-600">
                      {scheduleInfo.date}, {scheduleInfo.timeSlot}
                    </span>
                  )}
                </div>
              </button>

              <div className="flex items-center ml-4 md:ml-6 pl-4 md:pl-6 border-l whitespace-nowrap">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2"
                >
                  <path
                    d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx="12"
                    cy="10"
                    r="3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
                <span className="font-medium">Branch: Noma Haus</span>
              </div>
            </div>

            <div className="flex items-center ml-4">
              <button
                aria-label="Search"
                className="text-gray-700 hover:text-black transition-colors"
              >
                <Search size={24} />
              </button>
            </div>
          </div>
        )} */}
      </header>
    </>
  );
};

export default Header;
