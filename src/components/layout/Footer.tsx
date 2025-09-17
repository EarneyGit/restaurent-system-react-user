import React from "react";
import { Phone, Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="relative bg-gray-50 pt-12 pb-6 overflow-hidden border-t border-gray-300 rounded-t-[32px]">
      {/* Background Pattern */}
      <div className="absolute right-0 bottom-0 pointer-events-none opacity-[0.03]">
        <img
          src="/footer-svg.png"
          alt="Footer pattern"
          className="w-60 h-60 object-cover"
        />
      </div>

      <div className="container mx-auto px-4 relative text-center">
        {/* Logo + Name */}
        <div className="flex justify-center items-center gap-3 mb-8">
          <Link to="/" className="inline-block">
            <img
              src="/rasoie_logo.png"
              alt="Rasoie Logo"
              className="w-12 h-12 object-contain"
            />
          </Link>
          <span className="text-2xl font-serif tracking-wide text-gray-900">
           Rasoie Indian Restaurant
          </span>
        </div>

        {/* Address | Contact | Email */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 text-gray-600 text-sm mb-8">
          {/* Address */}
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>17th Street, Manhattan, New York, 10011</span>
          </div>

          {/* Divider */}
          <span className="hidden md:inline">|</span>

          {/* Phone */}
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            <a
              href="tel:123456789"
              className="hover:text-black transition-colors"
            >
              +1 (234) 567-890
            </a>
          </div>

          {/* Divider */}
          <span className="hidden md:inline">|</span>

          {/* Email */}
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            <a
              href="mailto:rasoierestaurent@gmail.com"
              className="hover:text-black transition-colors"
            >
              rasoierestaurent@gmail.com
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 pt-4">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} Rasoie Indian Restaurant. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
