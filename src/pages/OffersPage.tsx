import React from 'react';
import { ArrowLeft, Gift, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const OffersPage = () => {
  const offers = [
    {
      title: "Welcome Offer",
      description: "Get 10% off on your first order",
      code: "WELCOME10"
    },
    {
      title: "Weekend Special",
      description: "Free delivery on orders above $30",
      code: "WEEKEND"
    },
    {
      title: "Family Feast",
      description: "20% off on family bundles",
      code: "FAMILY20"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f5f2] via-[#fefefe] to-[#f1f1f1] pb-12 font-sans">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-[#2E7D32]/10 px-4 py-4 flex items-center sticky top-0 z-10 shadow-sm">
        <Link to="/" className="text-gray-800 hover:text-[#2E7D32] transition">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-xl font-semibold uppercase font-mono ml-4 text-[#2E7D32]">Offers & Rewards</h1>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-6">
        {/* Loyalty Points */}
        <div className="rounded-3xl bg-white/90 backdrop-blur-md p-6 shadow-md border border-[#2E7D32]/10 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Star className="text-[#2E7D32] mr-2" size={22} />
              <h2 className="text-lg font-semibold text-gray-800">Your Points</h2>
            </div>
            <span className="text-3xl font-extrabold text-[#2E7D32]">0</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Earn 1 point for every $1 spent. Redeem points for free items!
          </p>
        </div>

        {/* Current Offers */}
        <h2 className="text-lg font-bold text-gray-800 mb-3">Current Offers</h2>
        <div className="space-y-4">
          {offers.map((offer, index) => (
            <div
              key={index}
              className="relative bg-gradient-to-br from-[#fff] to-[#fdfdfd] border border-[#2E7D32]/10 rounded-2xl p-5 pl-6 pr-6 shadow transition hover:scale-[0.98] hover:shadow-lg"
            >
              <div className="flex items-start gap-3">
                <div className="text-[#2E7D32] mt-1">
                  <Gift size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-[#333]">{offer.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{offer.description}</p>
                  <span className="inline-block mt-2 px-3 py-1 text-sm font-medium bg-[#f5f5f5] rounded-lg border border-gray-200 text-[#2E7D32] tracking-wider">
                    {offer.code}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OffersPage;
