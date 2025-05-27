import React, { useState, useEffect } from 'react';
import { Pencil } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface Address {
  street: string;
  street2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

interface DeliveryAddressFormProps {
  address: Address;
  onChange: (field: string, value: string) => void;
}

const DeliveryAddressForm: React.FC<DeliveryAddressFormProps> = ({
  address,
  onChange
}) => {
  const { isAuthenticated, user } = useAuth();
  const [isEditing, setIsEditing] = useState(!isAuthenticated);

  // Update address fields when user data is available
  useEffect(() => {
    if (isAuthenticated && user?.address) {
      onChange('street', user.address.street || '');
      onChange('street2', user.address.street2 || '');
      onChange('city', user.address.city || '');
      onChange('state', user.address.state || '');
      onChange('country', user.address.country || '');
      onChange('postalCode', user.address.postalCode || '');
    }
  }, [isAuthenticated, user]);

  if (!isEditing && isAuthenticated && user?.address) {
    return (
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-gray-900">{user.address.street}</p>
            {user.address.street2 && <p className="text-gray-900">{user.address.street2}</p>}
            <p className="text-gray-600">
              {user.address.city}, {user.address.state} {user.address.postalCode}
            </p>
            <p className="text-gray-600">{user.address.country}</p>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Pencil size={18} className="text-gray-600" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Street Address
        </label>
        <input
          type="text"
          value={address.street}
          onChange={(e) => onChange('street', e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
          placeholder="Enter your street address"
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Apartment, suite, etc. (optional)
        </label>
        <input
          type="text"
          value={address.street2}
          onChange={(e) => onChange('street2', e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
          placeholder="Apartment or suite number"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          City
        </label>
        <input
          type="text"
          value={address.city}
          onChange={(e) => onChange('city', e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
          placeholder="Enter city"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          State
        </label>
        <input
          type="text"
          value={address.state}
          onChange={(e) => onChange('state', e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
          placeholder="Enter state"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Postal Code
        </label>
        <input
          type="text"
          value={address.postalCode}
          onChange={(e) => onChange('postalCode', e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
          placeholder="Enter postal code"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Country
        </label>
        <input
          type="text"
          value={address.country}
          onChange={(e) => onChange('country', e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
          placeholder="Enter country"
        />
      </div>

      {isAuthenticated && (
        <div className="md:col-span-2">
          <button
            onClick={() => setIsEditing(false)}
            className="text-green-600 hover:text-green-700 text-sm font-medium"
          >
            Cancel Editing
          </button>
        </div>
      )}
    </div>
  );
};

export default DeliveryAddressForm; 