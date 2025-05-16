
import React from "react";
import { Phone, Mail, Apple, PlayIcon } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-white pt-10 border-t">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Address */}
          <div>
            <Link to="/" className="mb-4 inline-block">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-gradient-to-r from-foodyman-lime to-foodyman-green rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">R</span>
                </div>
                <span className="ml-2 font-semibold text-gray-800">Restroman</span>
              </div>
            </Link>
            <p className="text-gray-600 mt-4">17th Street, New York, 10011, USA</p>
            <div className="flex gap-4 mt-4">
              <Link to="/app-store" className="border border-gray-200 rounded px-4 py-2 flex items-center gap-2 hover:bg-gray-50">
                <Apple size={20} />
                <span className="text-sm font-medium">App Store</span>
              </Link>
              <Link to="/play-store" className="border border-gray-200 rounded px-4 py-2 flex items-center gap-2 hover:bg-gray-50">
                <PlayIcon size={20} />
                <span className="text-sm font-medium">Play Store</span>
              </Link>
            </div>
          </div>
          
          {/* Links */}
          <div className="grid grid-cols-2">
            <div>
              <h4 className="font-bold mb-4">About</h4>
              <ul className="space-y-3">
                <li><Link to="/about" className="text-gray-600 hover:text-foodyman-lime">About</Link></li>
                <li><Link to="/careers" className="text-gray-600 hover:text-foodyman-lime">Careers</Link></li>
                <li><Link to="/affiliate" className="text-gray-600 hover:text-foodyman-lime">Become an Affiliate</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Branches</h4>
              <ul className="space-y-3">
                <li><Link to="/box" className="text-gray-600 hover:text-foodyman-lime">Box</Link></li>
                <li><Link to="/help" className="text-gray-600 hover:text-foodyman-lime">Get helps</Link></li>
                <li><Link to="/deliver" className="text-gray-600 hover:text-foodyman-lime">Sign up to deliver</Link></li>
              </ul>
            </div>
          </div>
          
          {/* Contact Info */}
          <div>
            <h4 className="font-bold mb-4">Contacts</h4>
            <div className="space-y-3">
              <p className="flex items-center gap-2 text-gray-600">
                <Phone size={16} />
                <span>123456789</span>
              </p>
              <p className="flex items-center gap-2 text-gray-600">
                <Mail size={16} />
                <span>restroman.single@githubit.com</span>
              </p>
              <div className="flex gap-3 mt-4">
                <Link to="/facebook" className="bg-gray-100 p-2 rounded-full hover:bg-foodyman-lime hover:text-white">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </Link>
                <Link to="/twitter" className="bg-gray-100 p-2 rounded-full hover:bg-foodyman-lime hover:text-white">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                  </svg>
                </Link>
                <Link to="/instagram" className="bg-gray-100 p-2 rounded-full hover:bg-foodyman-lime hover:text-white">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </Link>
                <Link to="/youtube" className="bg-gray-100 p-2 rounded-full hover:bg-foodyman-lime hover:text-white">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t mt-8 py-6 flex flex-col md:flex-row justify-between items-center">
          <div className="flex gap-6 mb-4 md:mb-0">
            <Link to="/privacy" className="text-sm text-gray-600 hover:text-foodyman-lime">Privacy Policy</Link>
            <Link to="/terms" className="text-sm text-gray-600 hover:text-foodyman-lime">Terms</Link>
          </div>
          <p className="text-sm text-gray-600">© 2025 Githubit. All rights reserved</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
