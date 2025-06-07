import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { ArrowLeft, Save, UserX, Loader2, User, Mail, Phone, MapPin, Lock, Bell } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import axios from 'axios';

const AccountDetailsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    addressLine1: user?.address || "",
    addressLine2: '',
    city: 'Dunfermline',
    postcode: 'KY12 7QF',
    emailNotifications: true,
    smsNotifications: true,
    preferEmail: true,
    preferSMS: false,
  });

  console.log("user",user)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      
      const response = await axios.put('/api/profile/update', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        mobileNumber: formData.phone,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        city: formData.city,
        postalCode: formData.postcode,
        emailNotifications: formData.emailNotifications,
        smsNotifications: formData.smsNotifications,
        preferredCommunicationEmail: formData.preferEmail,
        preferredCommunicationSMS: formData.preferSMS
      });

      if (response.data.success) {
        toast.success('Account details updated successfully');
      } else {
        throw new Error(response.data.message || 'Failed to update profile');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update account details');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 bg-neutral-50 py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white rounded-full transition-colors"
            >
              <ArrowLeft size={24} className="text-neutral-600" />
            </button>
            <h1 className="text-2xl font-bold text-neutral-900">Account Details</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
                <div className="p-6 bg-gradient-to-br from-green-600 to-green-700 text-white">
                  <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                    <span className="text-3xl font-bold">
                      {formData.firstName?.[0]?.toUpperCase() || formData.email?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold">
                    {formData.firstName ? formData.firstName.charAt(0).toUpperCase() + formData.firstName.slice(1) : 'User'}
                  </h2>
                  <p className="text-green-100">{formData.email}</p>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    <h3 className="font-medium text-neutral-900">Account Status</h3>
                    <div className="flex items-center gap-2 text-neutral-600">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span>Active Member</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Section */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Personal Information */}
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <User size={20} className="text-neutral-400" />
                      <h2 className="text-lg font-semibold text-neutral-900">Personal Information</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">First Name</label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Last Name</label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <Mail size={20} className="text-neutral-400" />
                      <h2 className="text-lg font-semibold text-neutral-900">Contact Information</h2>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Email Address</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Mobile Number</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <MapPin size={20} className="text-neutral-400" />
                      <h2 className="text-lg font-semibold text-neutral-900">Delivery Address</h2>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Address Line 1</label>
                        <input
                          type="text"
                          name="addressLine1"
                          value={formData.addressLine1}
                          onChange={handleChange}
                          placeholder="80E James Street"
                          className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Address Line 2</label>
                        <input
                          type="text"
                          name="addressLine2"
                          value={formData.addressLine2}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">City</label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">Postcode</label>
                          <input
                            type="text"
                            name="postcode"
                            value={formData.postcode}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Password Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <Lock size={20} className="text-neutral-400" />
                      <h2 className="text-lg font-semibold text-neutral-900">Password</h2>
                    </div>
                    
                    <div className="flex justify-center">
                      <button
                        onClick={() => navigate('/forgot-password', { state: { mode: 'changePassword' } })}
                        className="px-6 py-2.5 bg-neutral-50 text-neutral-900 font-medium rounded-xl hover:bg-neutral-100 transition-colors flex items-center gap-2"
                      >
                        <Lock size={18} />
                        Change Password
                      </button>
                    </div>
                  </div>
                </div>

                {/* Notification Preferences */}
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <Bell size={20} className="text-neutral-400" />
                      <h2 className="text-lg font-semibold text-neutral-900">Notification Preferences</h2>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="emailNotifications"
                          checked={formData.emailNotifications}
                          onChange={handleChange}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-neutral-300 rounded"
                        />
                        <label className="ml-2 text-sm text-neutral-700">
                          Email notifications and offers
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="smsNotifications"
                          checked={formData.smsNotifications}
                          onChange={handleChange}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-neutral-300 rounded"
                        />
                        <label className="ml-2 text-sm text-neutral-700">
                          SMS notifications and offers
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="preferredContact"
                          checked={formData.preferEmail}
                          onChange={() => setFormData(prev => ({ ...prev, preferEmail: true, preferSMS: false }))}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-neutral-300"
                        />
                        <label className="ml-2 text-sm text-neutral-700">
                          Prefer email communication
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="preferredContact"
                          checked={formData.preferSMS}
                          onChange={() => setFormData(prev => ({ ...prev, preferEmail: false, preferSMS: true }))}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-neutral-300"
                        />
                        <label className="ml-2 text-sm text-neutral-700">
                          Prefer SMS communication
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <Save size={20} />
                        Save Changes
                      </>
                    )}
                  </button>
                  {/* <button
                    type="button"
                    className="flex-1 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <UserX size={20} />
                    Close Account
                  </button> */}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AccountDetailsPage; 