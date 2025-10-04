
import React, { useState } from "react";
import { Search, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import Sidebar from "./Sidebar";

const Navbar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <>
      <div className="border-b py-3 md:px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={openSidebar}
              className="p-1"
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
            
            <Link to="/" className="flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M4 21V10H20V21H4Z" stroke="currentColor" strokeWidth="2" />
                <path d="M1 10L12 3L23 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className="font-medium">Schedule</span>
            </Link>
            
            <div className="flex items-center gap-2 border-l pl-6">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M3 21H21V19H3V21Z" fill="currentColor" />
                <path d="M3 3V5H21V3H3Z" fill="currentColor" />
                <path d="M9 9H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M15 15H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path fillRule="evenodd" clipRule="evenodd" d="M3 7V17H21V7H3ZM5 9H19V15H5V9Z" fill="currentColor" />
              </svg>
              <span className="font-medium">Branch:</span>
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search"
              className="pl-10 pr-4 py-2 border rounded-full w-[200px] focus:outline-none focus:ring-1 focus:ring-yellow-600"
            />
          </div>
        </div>
      </div>
      
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
    </>
  );
};

export default Navbar;
