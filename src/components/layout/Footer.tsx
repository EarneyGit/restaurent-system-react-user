import React from "react";
import { Mail, MapPin, Smartphone, PhoneCall } from "lucide-react";
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
            Rasoie <span className="hidden md:inline">- Indian Restaurant</span>
          </span>
        </div>

        {/* Address | Contact | Email */}
        <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 text-gray-600 text-sm mb-8 px-2">
          {/* Address */}
          <div className="flex items-start gap-2 flex-shrink-0 text-center md:text-left">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div className="flex flex-col md:flex-row md:items-center md:gap-1">
              <span>1 Tryst Road Stenhousemuir Larbert</span>
              <span className="md:ml-1">FK5 4QQ Scotland</span>
            </div>
          </div>

          {/* Divider */}
          <span className="hidden md:inline">|</span>

          {/* Phone */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <PhoneCall className="w-4 h-4 flex-shrink-0" />
            <a
              href="tel:+01324644646"
              className="hover:text-black transition-colors"
            >
              +01324644646
            </a>
          </div>

          {/* Mobile */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Smartphone className="w-4 h-4 flex-shrink-0" />
            <a
              href="tel:07777438428"
              className="hover:text-black transition-colors"
            >
              +07777438428
            </a>
          </div>

          {/* Divider */}
          <span className="hidden md:inline">|</span>

          {/* Email */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Mail className="w-4 h-4 flex-shrink-0" />
            <a
              href="mailto:rasoie.co.uk@gmail.com"
              className="hover:text-black transition-colors"
            >
              rasoie.co.uk@gmail.com
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
