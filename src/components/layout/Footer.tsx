import React from "react";
import {
  Phone,
  Mail,
  Apple,
  PlayIcon,
  MapPin,
  ChevronRight,
  UtensilsCrossed,
  Pizza,
  Coffee,
} from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="relative bg-gray-50 pt-10 pb-8 overflow-hidden border-t border-gray-300 rounded-t-[32px]">
      {/* SVG Background Pattern */}
      <div className="absolute right-0 bottom-0 pointer-events-none opacity-[0.03]">
        <img
          src="/footer-svg.png"
          alt="Footer pattern"
          className="w-60 h-60 object-cover"
        />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Logo and Address Section */}
          <div className="">
            {/* <Link to="/" className="inline-block group">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-black rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform">
                  <span className="text-white font-bold text-lg">R</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Restroman
                </span>
              </div>
            </Link> */}
            <Link to="/" className="">
              <img
                src="/rasoie_logo.png"
                alt="Logo"
                className="w-14 h-14 object-contain"
              />
            </Link>
            <div className="flex items-start space-x-3 my-4 text-gray-600">
              <MapPin className="w-5 h-5 mt-1 flex-shrink-0" />
              <p className="text-sm leading-relaxed">
                17th Street, Manhattan
                <br />
                New York, 10011
                <br />
                United States
              </p>
            </div>
            <div className="flex gap-4">
              <Link
                to="/app-store"
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
              >
                <Apple className="w-5 h-5" />
                <div className="text-left">
                  <p className="text-[10px] opacity-80">Download on the</p>
                  <p className="text-sm font-medium">App Store</p>
                </div>
              </Link>
              <Link
                to="/play-store"
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
              >
                <PlayIcon className="w-5 h-5" />
                <div className="text-left">
                  <p className="text-[10px] opacity-80">Get it on</p>
                  <p className="text-sm font-medium">Play Store</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold text-gray-900">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/about"
                  className="group flex items-center text-gray-600 hover:text-black transition-colors"
                >
                  <ChevronRight className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  <span>About Us</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/careers"
                  className="group flex items-center text-gray-600 hover:text-black transition-colors"
                >
                  <ChevronRight className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  <span>Careers</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/affiliate"
                  className="group flex items-center text-gray-600 hover:text-black transition-colors"
                >
                  <ChevronRight className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  <span>Become an Affiliate</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold text-gray-900">Support</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/help"
                  className="group flex items-center text-gray-600 hover:text-black transition-colors"
                >
                  <ChevronRight className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  <span>Get Help</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/deliver"
                  className="group flex items-center text-gray-600 hover:text-black transition-colors"
                >
                  <ChevronRight className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  <span>Sign up to deliver</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/box"
                  className="group flex items-center text-gray-600 hover:text-black transition-colors"
                >
                  <ChevronRight className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  <span>Order Tracking</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold text-gray-900">Contact</h4>
            <div className="space-y-4">
              <a
                href="tel:123456789"
                className="flex items-center gap-3 text-gray-600 hover:text-black transition-colors"
              >
                <div className="bg-gray-100 p-2 rounded-lg">
                  <Phone className="w-4 h-4" />
                </div>
                <span className="text-sm">+1 (234) 567-890</span>
              </a>
              <a
                href="mailto:rasoierestaurent@gmail.com"
                className="flex items-center gap-3 text-gray-600 hover:text-black transition-colors"
              >
                <div className="bg-gray-100 p-2 rounded-lg">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="text-sm">rasoierestaurent@gmail.com</span>
              </a>
              <div className="flex gap-3 pt-2">
                {[
                  {
                    name: "facebook",
                    normalIcon:
                      "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z",
                    hoverIcon: <Pizza className="w-4 h-4" />,
                  },
                  {
                    name: "twitter",
                    normalIcon:
                      "M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z",
                    hoverIcon: <Coffee className="w-4 h-4" />,
                  },
                  {
                    name: "instagram",
                    normalIcon: (
                      <>
                        <rect
                          x="2"
                          y="2"
                          width="20"
                          height="20"
                          rx="5"
                          ry="5"
                        />
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                      </>
                    ),
                    hoverIcon: <UtensilsCrossed className="w-4 h-4" />,
                  },
                  {
                    name: "youtube",
                    normalIcon: (
                      <>
                        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
                      </>
                    ),
                    hoverIcon: <Pizza className="w-4 h-4 rotate-90" />,
                  },
                ].map((social) => (
                  <Link
                    key={social.name}
                    to={`/${social.name}`}
                    className="group relative bg-gray-100 p-3 rounded-xl hover:bg-black hover:text-white transition-all duration-300"
                  >
                    <div className="transition-opacity duration-300 opacity-100 group-hover:opacity-0">
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        {typeof social.normalIcon === "string" ? (
                          <path d={social.normalIcon} />
                        ) : (
                          social.normalIcon
                        )}
                      </svg>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {social.hoverIcon}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap gap-6 justify-center md:justify-start">
              <Link
                to="/privacy"
                className="text-sm text-gray-600 hover:text-black transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="text-sm text-gray-600 hover:text-black transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                to="/cookies"
                className="text-sm text-gray-600 hover:text-black transition-colors"
              >
                Cookie Settings
              </Link>
            </div>
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} Rasoie - Indian Restaurent. All
              rights reserved
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
