import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import usePreventScroll from "../../hooks/usePreventScroll";

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (date: string, timeSlot: string) => void;
}

interface DateOption {
  day: string;
  date: string;
  fullDate: Date;
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  usePreventScroll(isOpen);
  // Generate date options (today + next 4 days)
  const [dateOptions, setDateOptions] = useState<DateOption[]>([]);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

  // Generate time slots from 09:00 to 23:00
  const timeSlots = [
    "09:00 - 10:30",
    "09:30 - 11:00",
    "10:00 - 11:30",
    "10:30 - 12:00",
    "11:00 - 12:30",
    "11:30 - 13:00",
    "12:00 - 13:30",
    "12:30 - 14:00",
    "13:00 - 14:30",
    "13:30 - 15:00",
    "14:00 - 15:30",
    "14:30 - 16:00",
    "15:00 - 16:30",
    "15:30 - 17:00",
    "16:00 - 17:30",
    "16:30 - 18:00",
    "17:00 - 18:30",
    "17:30 - 19:00",
    "18:00 - 19:30",
    "18:30 - 20:00",
    "19:00 - 20:30",
    "19:30 - 21:00",
    "20:00 - 21:30",
    "20:30 - 22:00",
    "21:00 - 22:30",
    "21:30 - 23:00",
    "22:00 - 23:30",
  ];

  // Generate dates on component mount
  useEffect(() => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    const options: DateOption[] = [];
    const today = new Date();

    for (let i = 0; i < 5; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      let day = "";
      if (i === 0) day = "Today";
      else if (i === 1) day = "Tomorrow";
      else day = days[date.getDay()];

      options.push({
        day,
        date: `May ${date.getDate()}`,
        fullDate: date,
      });
    }

    setDateOptions(options);
  }, []);

  // Handle save button
  const handleSave = () => {
    if (selectedTimeSlot && dateOptions.length > 0) {
      const selectedDate = dateOptions[selectedDateIndex];
      onSave(selectedDate.date, selectedTimeSlot);
      onClose();
    }
  };

  // Handle clear button
  const handleClear = () => {
    setSelectedTimeSlot(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl relative max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-medium">Schedule delivery</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Date Selection - Matched to the image */}
        <div className="relative border-b p-4">
          <div className="flex overflow-x-auto space-x-4 pb-2 scrollbar-hide">
            {dateOptions.map((dateOption, index) => (
              <button
                key={index}
                className={`flex-shrink-0 py-4 px-5 rounded-lg border w-32 ${
                  selectedDateIndex === index
                    ? "border-black"
                    : "border-gray-200"
                } focus:outline-none`}
                onClick={() => setSelectedDateIndex(index)}
              >
                <div className="font-medium text-center">{dateOption.day}</div>
                <div className="text-gray-500 text-sm text-center">{dateOption.date}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Time Slots - Matched to the image */}
        <div className="overflow-y-auto flex-1">
          <div className="flex flex-col">
            {timeSlots.map((timeSlot, index) => (
              <div key={index} className="py-4 px-6 border-b border-gray-100 last:border-0">
                <label className="flex items-center w-full cursor-pointer">
                  <input
                    type="radio"
                    name="timeSlot"
                    value={timeSlot}
                    checked={selectedTimeSlot === timeSlot}
                    onChange={() => setSelectedTimeSlot(timeSlot)}
                    className="w-5 h-5 border-gray-300 accent-yellow-600 focus:ring-yellow-600"
                  />
                  <span className="ml-3 text-base">{timeSlot}</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons - Matched to the image */}
        <div className="p-4 grid grid-cols-2 gap-4">
          <button
            onClick={handleSave}
            className={`py-3 px-4 rounded-lg font-medium text-center ${
              selectedTimeSlot
                ? "bg-brand-yellow hover:bg-brand-yellow/70 text-white transition-colors"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
            disabled={!selectedTimeSlot}
          >
            Save
          </button>
          <button
            onClick={handleClear}
            className="bg-white text-black py-3 px-4 rounded-lg font-medium border border-gray-300 text-center hover:bg-gray-50 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleModal;
