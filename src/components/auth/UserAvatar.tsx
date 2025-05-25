import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AUTH_ENDPOINTS } from '../../config/api.config';
import axios from 'axios';
import { toast } from 'sonner';
import { LogOut, User, ShoppingBag, Key, Settings } from 'lucide-react';

const UserAvatar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('UserAvatar - Current user:', user);
  }, [user]);

  const getInitials = () => {
    if (!user?.name) {
      console.log('No user name available for initials');
      return '?';
    }
    const names = user.name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return names[0][0].toUpperCase();
  };

  const handleLogout = async () => {
    try {
      console.log('Attempting logout');
      await axios.get(AUTH_ENDPOINTS.LOGOUT);
      await logout();
      navigate('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Failed to logout properly, but you have been logged out locally');
      await logout();
      navigate('/login');
    }
  };

  if (!user) {
    console.log('UserAvatar rendered without user data');
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-black/60 via-neutral-800 to-neutral-800 text-white font-semibold hover:opacity-90 transition-all duration-200 transform hover:scale-105 ring-2 ring-offset-2 ring-transparent ring-foodyman-lime/30"
      >
        {getInitials()}
      </button>

      {isOpen && (
        <>
          <div className="absolute right-0 mt-3 w-64 bg-white rounded-lg shadow-lg border border-gray-100 z-50 transform transition-all duration-200">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-base font-medium text-gray-800">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
              {/* {user.phone && (
                <p className="text-sm text-gray-500 mt-1">{user.phone}</p>
              )} */}
            </div>

            <Link
              to="/app/my-orders"
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <ShoppingBag size={18} />
              <span>My Orders</span>
            </Link>

            <Link
              to="/app/password"
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Key size={18} />
              <span>Change Password</span>
            </Link>

            <Link
              to="/app/details"
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <User size={18} />
              <span>Account Details</span>
            </Link>

            <Link
              to="/app/rewards"
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Settings size={18} />
              <span>Rewards & Settings</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-black font-semibold hover:bg-neutral-100 transition-colors border-t border-gray-100"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>

          <div
            className="fixed inset-0 z-40 bg-black/10 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          ></div>
        </>
      )}
    </div>
  );
};

export default UserAvatar; 