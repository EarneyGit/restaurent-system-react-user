import React, { useState } from "react";
import { X, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReservationModal = ({ isOpen, onClose }: ReservationModalProps) => {
  const navigate = useNavigate();
  const [branch, setBranch] = useState<string>("Noma Haus");
  const [date, setDate] = useState<string>("Wed, May 21");
  const [zone, setZone] = useState<string>("Vip 4");
  const [guests, setGuests] = useState<number>(2);
  
  // This would typically come from auth context
  const isLoggedIn = false;

  if (!isOpen) return null;
  
  const handleFindTable = () => {
    if (!isLoggedIn) {
      onClose();
      navigate('/login');
    } else {
      // Navigate to reservation page
      onClose();
      navigate('/reservation');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="relative bg-white w-full max-w-lg rounded-lg shadow-lg m-4">
        {/* Header */}
        <div className="p-4 relative border-b">
          <h2 className="text-2xl font-bold text-gray-800">Make a reservation</h2>
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Form */}
        <div className="px-4 py-6 space-y-6">
          {/* Branch */}
          <div>
            <label className="block text-gray-800 mb-2">Branch</label>
            <div className="relative">
              <div className="border border-gray-300 rounded-lg p-3 flex justify-between items-center cursor-pointer">
                <span>{branch}</span>
                <ChevronDown size={20} className="text-gray-500" />
              </div>
            </div>
          </div>
          
          {/* Date */}
          <div>
            <label className="block text-gray-800 mb-2">Date</label>
            <div className="relative">
              <div className="border border-gray-300 rounded-lg p-3 flex justify-between items-center cursor-pointer">
                <span>{date}</span>
                <ChevronDown size={20} className="text-gray-500" />
              </div>
            </div>
          </div>
          
          {/* Zone */}
          <div>
            <label className="block text-gray-800 mb-2">Zone</label>
            <div className="relative">
              <div className="border border-gray-300 rounded-lg p-3 flex justify-between items-center cursor-pointer">
                <span>{zone}</span>
                <ChevronDown size={20} className="text-gray-500" />
              </div>
            </div>
          </div>
          
          {/* Guests */}
          <div>
            <label className="block text-gray-800 mb-2">Guests</label>
            <input 
              type="number" 
              min="1" 
              max="20"
              value={guests}
              onChange={(e) => setGuests(parseInt(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
        
        {/* Button row */}
        <div className="grid grid-cols-2 gap-4 p-4">
          <button 
            onClick={onClose}
            className="py-3 text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleFindTable}
            className="py-3 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600"
          >
            Find a table
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReservationModal; 