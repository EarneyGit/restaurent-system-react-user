import React, { useState } from "react";
import { X, ChevronDown } from "lucide-react";

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReservationModal = ({ isOpen, onClose }: ReservationModalProps) => {
  const [branch, setBranch] = useState<string>("");
  const [date, setDate] = useState<string>("Sat, May 03");
  const [zone, setZone] = useState<string>("");
  const [guests, setGuests] = useState<number>(2);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="relative bg-white w-full max-w-lg rounded-lg shadow-lg overflow-hidden m-4">
        {/* Header */}
        <div className="p-6 relative">
          <h2 className="text-2xl font-bold text-gray-800">Make a reservation</h2>
          <button 
            onClick={onClose} 
            className="absolute top-5 right-5 p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Form */}
        <div className="px-6 pb-6 space-y-6">
          {/* Branch */}
          <div>
            <label className="block text-gray-800 mb-2 font-medium">Branch</label>
            <div className="relative">
              <select 
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full p-3 pr-10 appearance-none border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-foodyman-lime"
              >
                <option value="" disabled>Select branch</option>
                <option value="downtown">Downtown</option>
                <option value="uptown">Uptown</option>
                <option value="suburbia">Suburbia</option>
              </select>
              <ChevronDown 
                size={20} 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" 
              />
            </div>
          </div>
          
          {/* Date */}
          <div>
            <label className="block text-gray-800 mb-2 font-medium">Date</label>
            <div className="relative">
              <select 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 pr-10 appearance-none border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-foodyman-lime"
              >
                <option value="Sat, May 03">Sat, May 03</option>
                <option value="Sun, May 04">Sun, May 04</option>
                <option value="Mon, May 05">Mon, May 05</option>
                <option value="Tue, May 06">Tue, May 06</option>
              </select>
              <ChevronDown 
                size={20} 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" 
              />
            </div>
          </div>
          
          {/* Zone */}
          <div>
            <label className="block text-gray-800 mb-2 font-medium">Zone</label>
            <div className="relative">
              <select 
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                className="w-full p-3 pr-10 appearance-none border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-foodyman-lime"
              >
                <option value="" disabled>Select zone</option>
                <option value="indoor">Indoor</option>
                <option value="outdoor">Outdoor</option>
                <option value="balcony">Balcony</option>
                <option value="private">Private Room</option>
              </select>
              <ChevronDown 
                size={20} 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" 
              />
            </div>
          </div>
          
          {/* Guests */}
          <div>
            <label className="block text-gray-800 mb-2 font-medium">Guests</label>
            <input 
              type="number" 
              min="1" 
              max="20"
              value={guests}
              onChange={(e) => setGuests(parseInt(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-foodyman-lime"
            />
          </div>
        </div>
        
        {/* Button row */}
        <div className="flex items-center border-t border-gray-200">
          <button 
            onClick={onClose}
            className="flex-1 py-4 text-gray-700 font-medium"
          >
            Cancel
          </button>
          <button 
            className="flex-1 py-4 bg-foodyman-lime text-white font-medium hover:bg-opacity-90"
          >
            Find a table
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReservationModal; 