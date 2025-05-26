import React from "react";
import { Link } from "react-router-dom";
import { X, Heart, Globe, CreditCard } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const handleLinkClick = () => {
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity" 
          onClick={onClose}
        ></div>
      )}
      
      {/* Sidebar */}
      <div 
        className={`fixed top-0 left-0 h-full w-[80%] max-w-[350px] bg-white z-50 transform transition-transform duration-300 ease-in-out shadow-xl ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header with close button */}
          <div className="flex items-center justify-between p-5 border-b">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gradient-to-r from-foodyman-lime to-foodyman-green rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="ml-2 font-semibold text-gray-800">Restroman</span>
            </div>
            <button onClick={onClose} className="p-1">
              <X size={24} />
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="py-4">
              {/* Menu Items */}
              <div className="px-4 pb-4">
                {/* <Link 
                  to="/liked" 
                  className="flex items-center justify-between py-3 border-b"
                  onClick={handleLinkClick}
                >
                  <div className="flex items-center gap-3">
                    <Heart size={24} />
                    <span>Liked</span>
                  </div>
                  <div className="text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right"><path d="m9 18 6-6-6-6"/></svg>
                  </div>
                </Link> */}
                
               
                
                <Link 
                  to="/currency" 
                  className="flex items-center justify-between py-3 border-b"
                  onClick={handleLinkClick}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard size={24} />
                    <span>Currency</span>
                  </div>
                  <div className="text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right"><path d="m9 18 6-6-6-6"/></svg>
                  </div>
                </Link>
              </div>

              {/* Buttons */}
              <div className="px-4 mt-4 space-y-3">
                <Link 
                  to="/register" 
                  className="flex justify-center items-center bg-gray-800 text-white py-3 px-4 rounded-md font-medium w-full"
                  onClick={handleLinkClick}
                >
                  Sign up
                </Link>
                <Link 
                  to="/login" 
                  className="flex justify-center items-center border border-gray-300 text-gray-800 py-3 px-4 rounded-md font-medium w-full"
                  onClick={handleLinkClick}
                >
                  Login
                </Link>
              </div>

              {/* App promo */}
              <div className="px-4 mt-8">
                <div className="flex items-center mt-auto p-4">
                  <div className="h-12 w-12 bg-lime-500 rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap"><path d="M13 2H4a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2v-7"/><path d="M13 2v7h7"/><path d="m9 16 3-3-3-3"/></svg>
                  </div>
                  <div className="ml-3">
                    <div className="text-lg font-semibold">There's more to love</div>
                    <div className="text-lg font-semibold">in the app.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
