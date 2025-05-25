import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Store, Info, MapPin, User } from "lucide-react";

const Welcome = () => {
  const navigate = useNavigate();

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
          <Link to="/login" className="flex flex-col items-center text-white">
            <div className="p-2 rounded-xl bg-green-800/30">
              <User size={24} stroke="white" />
            </div>
            <span className="text-sm mt-1 font-medium">Account</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
