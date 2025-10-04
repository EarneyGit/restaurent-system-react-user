import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Heart, Calendar, Utensils } from "lucide-react";
import ReservationModal from "./ReservationModal";

const BottomNavigation = () => {
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const location = useLocation();

  const openReservationModal = () => setIsReservationModalOpen(true);
  const closeReservationModal = () => setIsReservationModalOpen(false);

  // Get the current active section
  const getActivePath = () => {
    const path = location.pathname;
    if (path.includes('/liked')) return 'liked';
    if (path === '/app' || path.includes('/app/products')) return 'foods';
    return '';
  };

  const activePath = getActivePath();

  return (
    <>
      <ReservationModal isOpen={isReservationModalOpen} onClose={closeReservationModal} />
      
      <div className="fixed bottom-4 left-0 right-0 z-20 px-4">
        <div className="backdrop-blur-lg bg-black/50 rounded-full px-8 py-4 shadow-lg max-w-sm mx-auto relative border-1 border-[#4caf50]/20">
          {/* Double border effect for more unique styling */}
          <div className="absolute inset-0 rounded-full"></div>
          <div className="absolute inset-[-1px] rounded-full border border-[#4caf50]/20"></div>
          
          <div className="flex items-center justify-around relative z-10">
            <Link 
              to="/app" 
              className={`flex flex-col items-center text-white relative ${
                activePath === 'foods' ? 'opacity-100' : 'opacity-80 hover:opacity-100'
              } transition-opacity duration-200`}
            >
              <div className={`p-2 ${activePath === 'foods' ? 'bg-brand-yellow/60 rounded-full' : ''}`}>
                <Utensils size={20} className={activePath === 'foods' ? 'text-white' : ''} />
              </div>
              <span className="text-xs mt-1 font-medium">FOODS</span>
              {activePath === 'foods' && (
                <div className="absolute -bottom-2 w-12 h-1 bg-brand-yellow/80 rounded-full"></div>
              )}
            </Link>
            
            <Link 
              to="/liked" 
              className={`flex flex-col items-center text-white relative ${
                activePath === 'liked' ? 'opacity-100' : 'opacity-80 hover:opacity-100'
              } transition-opacity duration-200`}
            >
              <div className={`p-2 ${activePath === 'liked' ? 'bg-brand-yellow/60 rounded-full' : ''}`}>
                <Heart size={20} className={activePath === 'liked' ? 'text-white' : ''} />
              </div>
              <span className="text-xs mt-1 font-medium">LIKED</span>
              {activePath === 'liked' && (
                <div className="absolute -bottom-2 w-12 h-1 bg-brand-yellow/80 rounded-full"></div>
              )}
            </Link>
            
            <button 
              onClick={openReservationModal} 
              className="flex flex-col items-center text-white bg-transparent border-none p-0 cursor-pointer opacity-80 hover:opacity-100 transition-opacity duration-200 relative"
            >
              <div className="p-2">
                <Calendar size={20} />
              </div>
              <span className="text-xs mt-1 font-medium">RESERVATION</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default BottomNavigation;
