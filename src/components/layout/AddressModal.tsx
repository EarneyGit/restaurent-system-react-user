import React, { useState } from "react";
import { X, Search, Plus, Minus, ArrowUpRight, Star } from "lucide-react";

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Store {
  id: number;
  name: string;
  address: string;
  district: string;
  rating: number;
  hours: string;
  lat: number;
  lng: number;
}

const stores: Store[] = [
  {
    id: 1,
    name: "Eco Bazaar",
    address: "Mirzo-Ulugbek district, Temur Malik str., 3A",
    district: "Mirzo-Ulugbek",
    rating: 4.5,
    hours: "08:00 — 22:00",
    lat: 41.316883,
    lng: 69.268889
  },
  {
    id: 2,
    name: "Shota Rustaveli",
    address: "Mirzo-Ulugbek district, Temur Malik str., 3A",
    district: "Mirzo-Ulugbek",
    rating: 4.5,
    hours: "08:00 — 22:00",
    lat: 41.319552,
    lng: 69.274311
  },
  {
    id: 3,
    name: "Eco Bazaar",
    address: "Mirzo-Ulugbek district, Temur Malik str., 3A",
    district: "Mirzo-Ulugbek",
    rating: 4.5,
    hours: "08:00 — 22:00",
    lat: 41.313123,
    lng: 69.276513
  },
  {
    id: 4,
    name: "Shota Rustaveli",
    address: "Mirzo-Ulugbek district, Temur Malik str., 3A",
    district: "Mirzo-Ulugbek",
    rating: 4.5,
    hours: "08:00 — 22:00",
    lat: 41.311456,
    lng: 69.279456
  }
];

const AddressModal = ({ isOpen, onClose }: AddressModalProps) => {
  const [activeFilter, setActiveFilter] = useState<string | null>("Near you");
  const [searchValue, setSearchValue] = useState("27 Chilonzor ko'chasi, Tashkent 100115, Uzbekistan");
  const [viewAsList, setViewAsList] = useState(false);
  
  if (!isOpen) return null;
  
  const filterOptions = ["Near you", "Open now", "24/7", "New", "Pickup"];

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b relative">
        <h2 className="text-xl font-semibold text-center">Enter delivery address</h2>
        <button 
          onClick={onClose}
          className="absolute right-4 top-1/2 transform -translate-y-1/2"
        >
          <X size={24} />
        </button>
      </div>
      
      {/* Search Bar */}
      <div className="p-4 mb-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-grow">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Search size={20} />
            </div>
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none"
            />
            {searchValue && (
              <button
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                onClick={() => setSearchValue("")}
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button className="bg-gray-800 text-white px-4 py-3 rounded-lg font-medium">
            Submit
          </button>
        </div>
      </div>
      
      {/* Filter Tabs */}
      <div className="flex items-center px-4 overflow-x-auto no-scrollbar">
        <button className="p-2 mr-2 border rounded-md">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 9L12 16L5 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        {filterOptions.map((filter) => (
          <button
            key={filter}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm mr-2 ${
              activeFilter === filter
                ? "bg-foodyman-lime text-white"
                : "bg-gray-100 text-gray-800"
            }`}
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>
      
      <div className="flex flex-col md:flex-row mt-4">
        {/* Map View */}
        <div className="w-full md:w-2/3 h-[500px] relative bg-gray-100">
          {/* Map placeholder - in a real app, you would use a map library like Google Maps or Leaflet */}
          <div className="w-full h-full bg-[#e5e3df] relative">
            {/* Map markers */}
            {stores.map((store) => (
              <div 
                key={store.id}
                className="absolute w-12 h-12 transform -translate-x-1/2 -translate-y-1/2"
                style={{ 
                  left: `${10 + store.lng % 1 * 80}%`, 
                  top: `${20 + store.lat % 1 * 60}%` 
                }}
              >
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform duration-200 cursor-pointer">
                  <div className="w-10 h-10 bg-[#009B37] rounded-full flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 7H4C2.9 7 2 7.9 2 9V15C2 16.1 2.9 17 4 17H20C21.1 17 22 16.1 22 15V9C22 7.9 21.1 7 20 7Z" stroke="white" strokeWidth="2" />
                      <path d="M16 7V5C16 3.9 15.1 3 14 3H10C8.9 3 8 3.9 8 5V7" stroke="white" strokeWidth="2" />
                      <path d="M12 12V12.01" stroke="white" strokeWidth="2" strokeLinecap="round" />
                      <path d="M17 17V19C17 20.1 16.1 21 15 21H9C7.9 21 7 20.1 7 19V17" stroke="white" strokeWidth="2" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Current location marker */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center animate-pulse shadow-lg">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
                  <circle cx="12" cy="10" r="3" fill="white" />
                </svg>
              </div>
            </div>
            
            {/* Lightning/energy marker */}
            <div className="absolute left-[60%] top-[45%]">
              <div className="w-10 h-10 bg-[#8BBF21] rounded-full flex items-center justify-center shadow-lg">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
          
          {/* Map Controls */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-2">
            <button className="w-8 h-8 bg-white rounded shadow flex items-center justify-center">
              <Plus size={16} />
            </button>
            <button className="w-8 h-8 bg-white rounded shadow flex items-center justify-center">
              <Minus size={16} />
            </button>
          </div>
          
          {/* Map attribution (simplified) */}
          <div className="absolute bottom-0 w-full bg-white bg-opacity-80 text-[10px] text-gray-600 p-1 flex justify-between">
            <span>Keyboard shortcuts</span>
            <span>Map data ©2023</span>
            <span>Terms</span>
            <span>Report a map error</span>
          </div>
          
          {/* View in list button */}
          <div className="absolute top-4 right-4">
            <button 
              className="bg-foodyman-lime text-white px-4 py-2 rounded-md flex items-center"
              onClick={() => setViewAsList(!viewAsList)}
            >
              <div className="w-5 h-5 bg-white rounded mr-2 flex items-center justify-center">
                {viewAsList && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="#8BBF21" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              View in list
            </button>
          </div>
        </div>
      
        {/* Store List */}
        <div className="w-full md:w-1/3 bg-white border-l overflow-y-auto h-[500px]">
          {stores.map((store) => (
            <div key={store.id} className="p-4 border-b hover:bg-gray-50 transition-colors duration-150 cursor-pointer">
              <div className="flex items-start">
                <div className="w-16 h-16 bg-[#009B37] rounded-full flex items-center justify-center mr-3">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 7H4C2.9 7 2 7.9 2 9V15C2 16.1 2.9 17 4 17H20C21.1 17 22 16.1 22 15V9C22 7.9 21.1 7 20 7Z" stroke="white" strokeWidth="2" />
                    <path d="M16 7V5C16 3.9 15.1 3 14 3H10C8.9 3 8 3.9 8 5V7" stroke="white" strokeWidth="2" />
                    <path d="M12 12V12.01" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    <path d="M17 17V19C17 20.1 16.1 21 15 21H9C7.9 21 7 20.1 7 19V17" stroke="white" strokeWidth="2" />
                  </svg>
                </div>
                <div className="flex-grow">
                  <h3 className="font-semibold text-lg">{store.name}</h3>
                  <p className="text-gray-600 text-sm mb-1">{store.address}</p>
                  <div className="flex items-center">
                    <div className="text-sm text-gray-500 mr-2">{store.hours}</div>
                    <div className="flex items-center">
                      <Star size={14} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-sm ml-1">{store.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AddressModal; 