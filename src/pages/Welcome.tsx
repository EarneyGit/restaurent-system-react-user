import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Store, Info, MapPin, User, LogOut, ShoppingBag, KeyRound, Gift } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Welcome = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [showAccountOptions, setShowAccountOptions] = useState(false);

  const handleAccountClick = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setShowAccountOptions(!showAccountOptions);
  };

  const handleLogout = async () => {
    await logout();
    setShowAccountOptions(false);
    navigate("/login");
  };

  return (
    <div className="min-h-screen relative xl:pt-10 md:pt-5 pt-3 font-sans">
      {/* Background Layer */}
      <div className="absolute inset-0">
        <img
          src="/bg-home.png"
          alt="background"
          className="w-full h-full object-cover opacity-50 blur-sm"
        />
        <div className="absolute inset-0 bg-black/85" />
      </div>

      {/* Hero Content */}
      <div className="relative flex flex-col items-center justify-center min-h-[80vh] p-6 animate-fade-in">
        {/* Logo */}
        <div className="md:w-48 md:h-48 w-40 h-40 mb-8 relative">
          <div className="absolute inset-0 bg-green-700/20 rounded-full blur-xl"></div>
          <svg viewBox="0 0 200 200" className="w-full h-full relative">
            <defs>
              <linearGradient
                id="logoGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#2e7d32" />
                <stop offset="100%" stopColor="#4caf50" />
              </linearGradient>
            </defs>
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="white"
              className="drop-shadow-md"
            />
            <circle
              cx="100"
              cy="100"
              r="85"
              stroke="url(#logoGradient)"
              strokeWidth="2"
              fill="none"
            />
            {/* Fork */}
            <path
              d="M70 50 L70 150 M60 50 L60 90 M80 50 L80 90 M60 90 C60 100, 80 100, 80 90"
              stroke="url(#logoGradient)"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
            {/* Spoon */}
            <path
              d="M120 50 C160 50, 160 150, 120 150"
              stroke="url(#logoGradient)"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="120" cy="50" r="10" fill="url(#logoGradient)" />
          </svg>
        </div>

        {/* Info Card */}
        <div className="text-center bg-white/90 backdrop-blur-lg glow-effect p-8 rounded-3xl shadow-2xl border border-green-800/90 max-w-xl mb-6">
          <h1 className="text-4xl font-mono font-bold bg-gradient-to-r from-foodyman-green via-foodyman-green to-[#4caf50] bg-clip-text text-transparent tracking-tight mb-4">
            RESTROMAN
          </h1>
          <p className="text-black/70 font-semibold text-lg mb-8">
            Experience the finest flavors, crafted with passion and served with
            care.
          </p>
          <button
            onClick={() => navigate("/select-outlet")}
            className="px-8 py-3 rounded-xl text-lg font-semibold bg-gradient-to-r from-[#2e7d32] to-[#4caf50] text-white shadow-md relative overflow-hidden border border-white/10 transition hover:scale-x-95"
          >
            <span className="relative z-10 uppercase">Start Over</span>
            <div className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition duration-300"></div>
          </button>
        </div>

        {/* Bottom Nav - Below the Card */}
        <div className="w-full max-w-md rounded-xl border border-white/20 backdrop-blur-lg p-4 grid grid-cols-4 gap-2">
          <Link to="/offers" className="flex flex-col items-center text-white">
            <div className="p-2 rounded-xl bg-green-800/60">
              <Store size={24} stroke="white" />
            </div>
            <span className="text-sm mt-1 font-medium">Offers</span>
          </Link>
          <Link
            to="/special-about"
            className="flex flex-col items-center text-white"
          >
            <div className="p-2 rounded-xl bg-green-800/30">
              <Info size={24} stroke="white" />
            </div>
            <span className="text-sm mt-1 font-medium">About</span>
          </Link>
          <Link
            to="/select-outlet"
            className="flex flex-col items-center text-white"
          >
            <div className="p-2 rounded-xl bg-green-800/60">
              <MapPin size={24} stroke="white" />
            </div>
            <span className="text-sm mt-1 font-medium">Outlet</span>
          </Link>
          <button
            onClick={handleAccountClick}
            className="flex flex-col items-center text-white relative"
          >
            <div className="p-2 rounded-xl bg-green-800/30">
              <User size={24} stroke="white" />
            </div>
            <span className="text-sm mt-1 font-medium">Account</span>
          </button>
        </div>

        {/* Account Options Modal */}
        {showAccountOptions && isAuthenticated && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur z-50"
              onClick={() => setShowAccountOptions(false)}
            />
            
            {/* Modal */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-2xl w-full bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-fade-in-up">
              {/* User Info */}
              <div className="p-8 bg-gradient-to-r from-green-900 to-green-600 text-white relative">
                <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
                <div className="relative">
                  <h2 className="text-3xl font-bold mb-2">{user?.name}</h2>
                  <p className="text-lg opacity-90">{user?.email}</p>
                </div>
              </div>
              
              {/* Options */}
              <div className="p-4">
                <div className="space-y-3">
                  <button
                    onClick={() => navigate("/orders")}
                    className="w-full p-4 text-left hover:bg-gray-50 text-gray-700 font-medium rounded-xl flex items-center space-x-3 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br border border-gray-200 from-gray-50 to-gray-50 flex items-center justify-center group-hover:scale-95 transition-transform">
                      <ShoppingBag className="w-6 h-6 text-gray-500" strokeWidth={1.5} />
                    </div>
                    <span className="text-lg">My Orders</span>
                  </button>

                  <button
                    onClick={() => navigate("/forgot-password")}
                    className="w-full p-4 text-left hover:bg-gray-50 text-gray-700 font-medium rounded-xl flex items-center space-x-3 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br border border-gray-200 from-gray-50 to-gray-50 flex items-center justify-center group-hover:scale-95 transition-transform">
                      <KeyRound className="w-6 h-6 text-gray-500" strokeWidth={1.5} />
                    </div>
                    <span className="text-lg">Change Password</span>
                  </button>

                  <button
                    onClick={() => navigate("/offers")}
                    className="w-full p-4 text-left hover:bg-gray-50 text-gray-700 font-medium rounded-xl flex items-center space-x-3 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br border border-gray-200 from-gray-50 to-gray-50 flex items-center justify-center group-hover:scale-95 transition-transform">
                      <Gift className="w-6 h-6 text-gray-500" strokeWidth={1.5} />
                    </div>
                    <span className="text-lg">Rewards</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full p-4  text-left hover:bg-gray-50 text-red-600 font-medium rounded-xl flex items-center justify-end transition-colors mt-6 border-t border-gray-200 group"
                  >
                    {/* <div className="w-12 h-12 rounded-2xl  from-gray-50 to-gray-50 flex items-center justify-center group-hover:scale-95 transition-transform">
                    <LogOut className="w-5 h-5 text-red-600" strokeWidth={1.5} />
                    </div> */}
                    <span className="text-lg uppercase font-bold text-red-600">Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Welcome;
