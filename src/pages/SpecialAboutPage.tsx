import React, { useEffect, useState } from 'react';
import { ArrowLeft, Clock, MapPin, Phone, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const branchesData = [
  {
    name: 'DUNFERMLINE',
    address: {
      line1: '26 Bruce Street',
      city: 'Dunfermline',
      postcode: 'KY12 7AG',
      country: 'United Kingdom',
    },
    phone: '01383623409',
    hours: {
      Monday: ['11:45–14:30', '16:30–22:00'],
      Tuesday: ['16:30–22:00'],
      Wednesday: ['16:30–22:00'],
      Thursday: ['11:45–14:30', '16:30–22:00'],
      Friday: ['11:45–14:30', '16:30–23:00'],
      Saturday: ['11:45–14:30', '16:30–23:00'],
      Sunday: ['11:45–14:30', '16:30–22:00'],
    },
  },
  {
    name: 'EDINBURGH',
    address: {
      line1: '175 Dalry Road',
      city: 'Edinburgh',
      postcode: 'EH11 2EB',
      country: 'United Kingdom',
    },
    phone: '01312374516',
    hours: {
      Monday: ['11:45–22:55'],
      Tuesday: ['11:45–22:55'],
      Wednesday: ['11:45–22:55'],
      Thursday: ['11:45–22:55'],
      Friday: ['11:45–22:55'],
      Saturday: ['11:45–22:55'],
      Sunday: ['11:45–22:55'],
    },
  },
];

const SpecialAboutPage = () => {
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    setBranches(branchesData);
  }, []);

  const primaryColor = '#1D8348'; // Green tone

  return (
    <div className="min-h-screen bg-[#f8f5f2] text-gray-800">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm flex items-center">
        <Link to="/" className="text-gray-700 hover:text-green-700">
          <ArrowLeft size={22} />
        </Link>
        <h1 className="ml-4 text-xl font-mono text-[#1D8348] font-semibold">ABOUT US</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Description */}
        <h2 className="text-2xl text-[#1D8348] font-semibold mb-1">RESTROMAN</h2>
        <p className="text-gray-600 mb-4 leading-relaxed">
          Discover the warmth of authentic cuisine and personalized service. At Restroman, every dish tells a story, and every guest is family.
        </p>

        {/* Website */}
        <div className="flex items-center mb-6 text-sm text-gray-700">
          <Globe className="mr-2 text-[#1D8348]" size={18} />
          www.restroman.com
        </div>

        {/* Branches */}
        {branches.map((branch, i) => (
          <div key={i} className="mb-8 bg-white border rounded-lg shadow-sm p-4">
            <h3 className="text-lg font-semibold  uppercase mb-2">{branch.name}</h3>

            {/* Address & Phone */}
            <div className="space-y-1 text-sm text-gray-700 mb-4">
              <p className="flex items-start">
                <MapPin className="w-4 h-4 mt-0.5 mr-2 text-[#1D8348]" />
                <span>
                  {branch.address.line1},<br />
                  {branch.address.city}, {branch.address.postcode},<br />
                  {branch.address.country}
                </span>
              </p>
              <p className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-[#1D8348]" />
                {branch.phone}
              </p>
            </div>

            {/* Hours */}
            <div className="bg-[#1D8348]/5 border border-[#1D8348]/20 rounded-md p-3">
              <div className="flex items-center mb-2 text-sm font-medium text-gray-800">
                <Clock className="w-4 h-4 mr-2 text-[#1D8348]" />
                Opening Hours
              </div>
              <table className="w-full text-sm text-gray-700">
                <tbody>
                  {Object.entries(branch.hours).map(([day, times]) => (
                    <tr key={day}>
                      <td className="py-0.5 w-1/3 font-medium">{day}</td>
                      <td className="py-0.5">{times.length ? times.join(', ') : 'Closed'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {/* Note */}
        <div className="bg-[#1D8348]/10 p-4 text-sm rounded-md text-gray-700">
          <strong>Note:</strong> Kitchen closes 30 minutes before closing. Please ensure last orders are placed accordingly.
        </div>
      </div>
    </div>
  );
};

export default SpecialAboutPage;
