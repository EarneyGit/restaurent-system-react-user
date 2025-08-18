import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LogOut, ShoppingBag, KeyRound, Settings } from 'lucide-react';
import { toast } from 'sonner';

const UserAvatar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const getInitial = (firstName?: string, email?: string) => {
    if (firstName && firstName.length > 0) {
      return firstName[0].toUpperCase();
    }
    if (email && email.length > 0) {
      return email[0].toUpperCase();
    }
    return 'U';
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      // toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Failed to logout properly');
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-green-600 to-green-700 text-white font-semibold hover:opacity-90 transition-all duration-200 transform hover:scale-105"
      >
        {getInitial(user?.firstName, user?.email)}
      </button>

      {isOpen && (
        <>
          <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-lg border border-gray-100 z-50">
            {/* User Info */}
            <div className="p-4 border-b border-gray-100">
              <p className="font-semibold text-gray-900">
                {user?.firstName ? user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1) : 'User'}
              </p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>

            {/* Menu Items */}
            <div className="p-2 text-sm">     
              <button
                onClick={() => {
                  navigate('/orders');
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <ShoppingBag size={18} />
                <span>My Orders</span>
              </button>

              <button
                onClick={() => {
                  navigate('/account');
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Settings size={18} />
                <span>Account Details</span>
              </button>

              <button
                onClick={() => {
                  navigate('/forgot-password');
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <KeyRound size={18} />
                <span>Change Password</span>
              </button>

              <div className="border-t border-gray-100 my-2" />

              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
        </>
      )}
    </div>
  );
};

export default UserAvatar; 