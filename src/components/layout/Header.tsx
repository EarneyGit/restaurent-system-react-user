import React, { useState } from "react";
import { Menu, Search, Heart, Bell } from "lucide-react";
import { Link } from "react-router-dom";
import Sidebar from "./Sidebar";
import NotificationModal from "../notifications/NotificationModal";
import CartSummary from "../cart/CartSummary";
import ScheduleModal from "./ScheduleModal";

const Header = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleInfo, setScheduleInfo] = useState<{
    date: string;
    timeSlot: string;
  } | null>(null);

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

      <header className="sticky top-0 md:px-6 py-3 bg-white z-10">
        <div className="flex justify-between items-center border-b border-gray-300">  
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
                <span className="ml-2 font-mono uppercase font-semibold text-xl md:block hidden text-gray-800">
                  Restroman
                </span>
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3 md:pr-0 pr-4"> 
            <CartSummary />
            <Link
              to="/liked"
              aria-label="Favorites"
              className="text-gray-700 hover:text-black transition-colors"
            >
              <Heart size={22} />
            </Link>
            <button
              onClick={openNotifications}
              aria-label="Notifications"
              className="text-gray-700 hover:text-black transition-colors p-0 bg-transparent border-0"
            >
              <Bell size={22} />
            </button>
            <Link
              to="/login"
              className="flex items-center text-gray-700 hover:text-black transition-colors"
            >
              <span className="hidden md:inline mr-2 text-sm">Login</span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14 4L22 12L14 20"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M22 12H9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        </div>

        {/* Bottom navigation row */}
        <div className="flex items-center justify-between px-4 py-4 border-b">
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
      </header>
    </>
  );
};

export default Header;
