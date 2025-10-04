import React, { useState } from 'react';
import TimeSlotSelector from './TimeSlotSelector';

interface CheckoutFormProps {
  onSubmit: (formData: any) => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    timeSlot: '',
    notes: '',
    firstName: '',
    lastName: '',
    mobileNumber: '',
    emailAddress: '',
    address: '',
    couponCode: '',
    agreeToTerms: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Time Slot */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Choose your timeslot:
        </label>
        <TimeSlotSelector
          selectedTime={formData.timeSlot}
          onChange={(time) => setFormData(prev => ({ ...prev, timeSlot: time }))}
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Add your notes:
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-600 focus:border-transparent resize-none"
          placeholder="Special instructions or requests..."
        />
      </div>

      {/* Personal Details */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Personal details:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="First Name"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-600 focus:border-transparent"
            />
          </div>
          <div>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Last Name"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-600 focus:border-transparent"
            />
          </div>
          <div>
            <input
              type="tel"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
              placeholder="Mobile Number"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-600 focus:border-transparent"
            />
          </div>
          <div>
            <input
              type="email"
              name="emailAddress"
              value={formData.emailAddress}
              onChange={handleChange}
              placeholder="Email Address"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-600 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Address */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-gray-700">
            83C James Street, Dunfermline, KY12 7QF
          </label>
          <button
            type="button"
            className="text-sm font-medium text-yellow-700 hover:text-yellow-700"
            onClick={() => {/* Handle address change */}}
          >
            CHANGE ADDRESS
          </button>
        </div>
      </div>

      {/* Apply Coupons */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Apply coupons:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            name="couponCode"
            value={formData.couponCode}
            onChange={handleChange}
            placeholder="Coupon Code"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-600 focus:border-transparent"
          />
          <button
            type="button"
            className="px-6 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors"
          >
            APPLY
          </button>
        </div>
      </div>

      {/* Terms Agreement */}
      <div className="flex items-start">
        <input
          type="checkbox"
          name="agreeToTerms"
          checked={formData.agreeToTerms}
          onChange={handleChange}
          className="mt-1 h-4 w-4 text-yellow-700 focus:ring-yellow-600 border-gray-300 rounded"
        />
        <label className="ml-2 text-sm text-gray-600">
          By placing this order you're agreeing to d&c's{' '}
          <a href="/terms" className="text-red-600 hover:text-red-700">
            privacy & data use policy
          </a>
          .
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full py-4 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors"
      >
        PROCEED TO PAYMENT
      </button>
    </form>
  );
};

export default CheckoutForm; 