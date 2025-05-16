import React, { useState } from "react";
import { Menu, Search, MapPin, Globe, CreditCard, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import Sidebar from "./Sidebar";
import AddressModal from "./AddressModal";
import LanguageModal from "./LanguageModal";
import CurrencyModal from "./CurrencyModal";
import CartIndicator from "./CartIndicator";
import ReservationModal from "./ReservationModal";

const Header = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);
  
  const openAddressModal = () => setIsAddressModalOpen(true);
  const closeAddressModal = () => setIsAddressModalOpen(false);
  
  const openLanguageModal = () => setIsLanguageModalOpen(true);
  const closeLanguageModal = () => setIsLanguageModalOpen(false);
  
  const openCurrencyModal = () => setIsCurrencyModalOpen(true);
  const closeCurrencyModal = () => setIsCurrencyModalOpen(false);
  
  const openReservationModal = () => setIsReservationModalOpen(true);
  const closeReservationModal = () => setIsReservationModalOpen(false);
  
  return (
    <>
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      <AddressModal isOpen={isAddressModalOpen} onClose={closeAddressModal} />
      <LanguageModal isOpen={isLanguageModalOpen} onClose={closeLanguageModal} />
      <CurrencyModal isOpen={isCurrencyModalOpen} onClose={closeCurrencyModal} />
      <ReservationModal isOpen={isReservationModalOpen} onClose={closeReservationModal} />
      
      <header className="bg-white shadow-sm sticky top-0 z-10 px-4 py-3">
        <div className="flex items-center gap-3">
          <button className="p-1" onClick={openSidebar}>
            <Menu size={24} />
          </button>
          
          <Link to="/" className="flex items-center">
            <div className="h-8 w-8 bg-gradient-to-r from-foodyman-lime to-foodyman-green rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="ml-2 font-semibold text-gray-800">Restroman</span>
          </Link>

          <div className="relative w-48 md:w-64 lg:w-auto lg:flex-grow mx-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search restaurant..."
              className="pl-9 pr-3 py-1.5 border rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-foodyman-lime text-sm"
            />
          </div>

          <div className="flex items-center gap-2 md:gap-3 ml-auto">
            <button 
              className="hidden md:flex items-center gap-1 text-xs border border-gray-300 px-2 py-1.5 rounded hover:bg-gray-50"
              onClick={openReservationModal}
            >
              <Calendar size={14} />
              <span>Reservation</span>
            </button>
          
            <button 
              className="hidden md:flex items-center gap-1 text-xs border border-gray-300 px-2 py-1.5 rounded hover:bg-gray-50"
              onClick={openLanguageModal}
            >
              <Globe size={14} />
              <span>EN</span>
            </button>
            
            <button 
              className="hidden md:flex items-center gap-1 text-xs border border-gray-300 px-2 py-1.5 rounded hover:bg-gray-50"
              onClick={openCurrencyModal}
            >
              <CreditCard size={14} />
              <span>USD</span>
            </button>
            
            <div 
              className="flex flex-col text-xs cursor-pointer hover:text-foodyman-lime transition-colors group"
              onClick={openAddressModal}
            >
              <span className="font-semibold flex items-center">
                <MapPin size={14} className="inline-block mr-1 text-foodyman-lime" />
                <span className="hidden md:inline">Delivery address</span>
              </span>
              <span className="text-gray-500 hidden md:block">San Francisco 14 St.</span>
              <div className="hidden group-hover:block absolute top-full right-0 mt-1 bg-white shadow-lg rounded-md p-2 text-xs text-gray-800 md:hidden">
                Click to set delivery address
              </div>
            </div>
            
            <div className="hidden md:flex flex-col text-xs text-foodyman-lime">
              <span className="font-semibold">Delivery on</span>
              <span>30-40 35min</span>
            </div>
            
            <CartIndicator />
            
            <Link to="/login" className="border border-gray-300 px-3 py-1.5 rounded text-sm hover:bg-gray-50">
              Login
            </Link>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
