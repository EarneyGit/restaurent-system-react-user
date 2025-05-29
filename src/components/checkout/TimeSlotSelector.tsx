import React from 'react';
import { format, addMinutes, setHours, setMinutes } from 'date-fns';

interface TimeSlotSelectorProps {
  selectedTime: string;
  onChange: (time: string) => void;
}

const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({ selectedTime, onChange }) => {
  // Generate time slots from 9:00 to 16:00 with 10-minute intervals
  const generateTimeSlots = () => {
    const slots = [];
    let currentTime = setHours(setMinutes(new Date(), 0), 9); // Start at 9:00
    const endTime = setHours(setMinutes(new Date(), 0), 16); // End at 16:00

    while (currentTime <= endTime) {
      slots.push(format(currentTime, 'HH:mm'));
      currentTime = addMinutes(currentTime, 10);
    }

    return slots;
  };

  const timeSlots = generateTimeSlots();

  return (
    <div className="w-full">
      <select
        value={selectedTime}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
      >
        <option value="">Select a time slot</option>
        {timeSlots.map((time) => (
          <option key={time} value={time}>
            {time}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TimeSlotSelector; 