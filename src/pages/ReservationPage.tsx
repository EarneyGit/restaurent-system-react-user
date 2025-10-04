import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Star, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const ReservationPage = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState('Wed, May 21');
  const [zone, setZone] = useState('Vip 4');
  const [table, setTable] = useState('Abc');
  const [guests, setGuests] = useState(2);
  const [showMoreTimes, setShowMoreTimes] = useState(false);
  
  // This would typically come from auth context
  const isLoggedIn = false;

  const timeSlots = [
    '09:15', '09:40', '10:05', '10:30', '10:55',
    '11:20', '11:45', '12:10', '12:35', '13:00',
    '13:25', '13:50', '14:15', '14:40', '15:05',
    '15:30', '15:55', '16:20', '16:45', '17:10',
    '17:35', '18:00', '18:25', '18:50', '19:15',
    '19:40', '20:05', '20:30', '20:55', '21:20',
    '21:45', '22:10', '22:35', '23:00'
  ];
  
  const handleTimeClick = () => {
    if (!isLoggedIn) {
      navigate('/login');
    } else {
      // Handle time selection logic for logged in users
      console.log('Time selected');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white p-4 flex justify-between items-center border-b">
        <Link to="/" className="flex items-center text-gray-800">
          <ArrowLeft size={20} className="mr-2" />
          <span>Back</span>
        </Link>
        <Link to="/login" className="border border-gray-300 px-4 py-1.5 rounded">
          Login
        </Link>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 overflow-hidden rounded-full mb-4">
              <img 
                src="/restaurant.jpg" 
                alt="Noma Haus" 
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-2xl font-bold mb-2">Noma Haus</h1>
            <p className="text-gray-600 text-sm mb-2">
              New Jersey Performing Arts Center (NJPAC), Center Street, Newark, NJ, UK 
              <button className="text-blue-500 ml-2">Change branch</button>
            </p>
            <div className="flex items-center">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star}
                    size={16} 
                    className="text-gray-300" 
                    fill="currentColor"
                  />
                ))}
              </div>
              <span className="ml-2 text-gray-500 text-sm">0 reviews</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <div className="border border-gray-300 rounded-lg p-2 flex justify-between items-center">
                <span>{date}</span>
                <ChevronDown size={18} className="text-gray-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Zone</label>
              <div className="border border-gray-300 rounded-lg p-2 flex justify-between items-center">
                <span>{zone}</span>
                <ChevronDown size={18} className="text-gray-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Table</label>
              <div className="border border-gray-300 rounded-lg p-2 flex justify-between items-center">
                <span>{table}</span>
                <ChevronDown size={18} className="text-gray-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Guests</label>
              <input 
                type="number" 
                value={guests} 
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg p-2"
              />
            </div>
          </div>

          <div>
            <div className="mb-2">
              <div className="flex items-center mb-1">
                <h2 className="text-xl font-medium">Wed, May 21</h2>
              </div>
              <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                {timeSlots.slice(0, showMoreTimes ? timeSlots.length : 16).map((time, index) => (
                  <button 
                    key={time} 
                    className={`py-2 px-1 text-center border rounded-md hover:bg-gray-50 ${
                      index === 6 ? 'bg-yellow-100 border-yellow-300' : ''
                    }`}
                    onClick={handleTimeClick}
                  >
                    {time}
                  </button>
                ))}
              </div>
              {timeSlots.length > 16 && (
                <button 
                  className="flex items-center justify-center w-full mt-4 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowMoreTimes(!showMoreTimes)}
                >
                  {showMoreTimes ? (
                    <>
                      <ChevronUp size={20} className="mr-1" />
                      <span>Show less</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown size={20} className="mr-1" />
                      <span>See reservations on other dates</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationPage; 