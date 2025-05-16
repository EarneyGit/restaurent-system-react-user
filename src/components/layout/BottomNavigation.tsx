import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Calendar } from "lucide-react";
import ReservationModal from "./ReservationModal";

const BottomNavigation = () => {
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);

  const openReservationModal = () => setIsReservationModalOpen(true);
  const closeReservationModal = () => setIsReservationModalOpen(false);

  return (
    <>
      <ReservationModal isOpen={isReservationModalOpen} onClose={closeReservationModal} />
      
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-20 bg-gray-700 rounded-full px-4 py-3 shadow-lg">
        <div className="flex items-center gap-8">
          <Link to="/foods" className="flex flex-col items-center text-white">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 9V5a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v4" />
              <path d="M1 9h22v9a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1Z" />
            </svg>
            <span className="text-xs mt-1">FOODS</span>
          </Link>
          
          <button 
            onClick={openReservationModal} 
            className="flex flex-col items-center text-white bg-transparent border-none p-0 cursor-pointer"
          >
            <Calendar size={24} />
            <span className="text-xs mt-1">RESERVATION</span>
          </button>
          
          <Link to="/liked" className="flex flex-col items-center text-white">
            <Heart size={24} />
            <span className="text-xs mt-1">LIKED</span>
          </Link>
        </div>
      </div>
    </>
  );
};

export default BottomNavigation;
