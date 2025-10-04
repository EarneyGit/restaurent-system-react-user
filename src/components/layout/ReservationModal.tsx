import React, { useState, useEffect, useRef } from "react";
import { X, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import usePreventScroll from "../../hooks/usePreventScroll";

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReservationModal = ({ isOpen, onClose }: ReservationModalProps) => {
  usePreventScroll(isOpen);
  const navigate = useNavigate();

  const [branch, setBranch] = useState("Noma Haus");
  const [date, setDate] = useState("Wed, May 21");
  const [zone, setZone] = useState("Vip 4");
  const [guests, setGuests] = useState(2);
  const [openDropdown, setOpenDropdown] = useState<"branch" | "date" | "zone" | null>(null);

  const dropdownRefs = {
    branch: useRef(null),
    date: useRef(null),
    zone: useRef(null),
  };

  const branches = ["Noma Haus", "Noma Downtown", "Noma Uptown", "Noma Riverside"];
  const dates = ["Wed, May 21", "Thu, May 22", "Fri, May 23", "Sat, May 24", "Sun, May 25"];
  const zones = ["Vip 4", "Vip 3", "Vip 2", "Vip 1", "Regular Zone", "Outdoor"];

  const isLoggedIn = false;

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        openDropdown &&
        dropdownRefs[openDropdown]?.current &&
        !(dropdownRefs[openDropdown]?.current as any).contains(e.target)
      ) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdown]);

  if (!isOpen) return null;

  const handleFindTable = () => {
    onClose();
    navigate(isLoggedIn ? "/reservation" : "/login");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>

      {/* Modal */}
      <div className="bg-white rounded-xl shadow-xl relative w-full max-w-3xl overflow-hidden z-[55]">
        {/* Header */}
        <div className="p-6 relative border-b">
          <h2 className="text-2xl font-bold text-gray-800">Make a reservation</h2>
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Branch */}
            <div className="relative" ref={dropdownRefs.branch}>
              <label className="block text-gray-800 mb-2 font-medium">Branch</label>
              <div
                onClick={() =>
                  setOpenDropdown(openDropdown === "branch" ? null : "branch")
                }
                className="border border-gray-300 rounded-lg p-3 flex justify-between items-center cursor-pointer hover:border-gray-400"
              >
                <span>{branch}</span>
                <ChevronDown size={20} className="text-gray-500" />
              </div>
              {openDropdown === "branch" && (
                <div className="absolute top-full left-0 z-[60] mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-auto">
                  {branches.map((b) => (
                    <div
                      key={b}
                      onClick={() => {
                        setBranch(b);
                        setOpenDropdown(null);
                      }}
                      className="p-3 hover:bg-gray-50 cursor-pointer"
                    >
                      {b}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Date */}
            <div className="relative" ref={dropdownRefs.date}>
              <label className="block text-gray-800 mb-2 font-medium">Date</label>
              <div
                onClick={() =>
                  setOpenDropdown(openDropdown === "date" ? null : "date")
                }
                className="border border-gray-300 rounded-lg p-3 flex justify-between items-center cursor-pointer hover:border-gray-400"
              >
                <span>{date}</span>
                <ChevronDown size={20} className="text-gray-500" />
              </div>
              {openDropdown === "date" && (
                <div className="absolute top-full left-0 z-[60] mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-auto">
                  {dates.map((d) => (
                    <div
                      key={d}
                      onClick={() => {
                        setDate(d);
                        setOpenDropdown(null);
                      }}
                      className="p-3 hover:bg-gray-50 cursor-pointer"
                    >
                      {d}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Zone */}
            <div className="relative" ref={dropdownRefs.zone}>
              <label className="block text-gray-800 mb-2 font-medium">Zone</label>
              <div
                onClick={() =>
                  setOpenDropdown(openDropdown === "zone" ? null : "zone")
                }
                className="border border-gray-300 rounded-lg p-3 flex justify-between items-center cursor-pointer hover:border-gray-400"
              >
                <span>{zone}</span>
                <ChevronDown size={20} className="text-gray-500" />
              </div>
              {openDropdown === "zone" && (
                <div className="absolute top-full left-0 z-[60] mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-40 overflow-auto">
                  {zones.map((z) => (
                    <div
                      key={z}
                      onClick={() => {
                        setZone(z);
                        setOpenDropdown(null);
                      }}
                      className="p-3 hover:bg-gray-50 cursor-pointer"
                    >
                      {z}
                    </div>
                  ))}
                </div>
              )}
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
                className="w-full p-3 border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-4 px-6 pb-6 pt-20 bg-gray-50">
          <button
            onClick={onClose}
            className="py-3 text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleFindTable}
            className="py-3 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Find a table
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReservationModal;
