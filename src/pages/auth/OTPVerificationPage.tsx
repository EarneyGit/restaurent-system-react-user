import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';
import axios from 'axios';
import { AUTH_ENDPOINTS } from '../../config/api.config';

const OTPVerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Get email, name and type from location state
  const { email, firstName, lastName, type = 'register' } = location.state || {};

  // Handle countdown for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setResendDisabled(false);
    }
  }, [countdown]);

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      navigate(`/${type}`);
    }
  }, [email, type, navigate]);

  const validationSchema = Yup.object({
    otp: Yup.string()
      .matches(/^\d{6}$/, 'OTP must be 6 digits')
      .required('OTP is required'),
  });

  const formik = useFormik({
    initialValues: {
      otp: '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        // Verify OTP
        const verifyResponse = await axios.post(AUTH_ENDPOINTS.VERIFY_OTP, {
          email,
          otp: values.otp
        });

        if (verifyResponse.data.success) {
          toast.success(verifyResponse.data.message || 'OTP verified successfully');
          
          if (type === 'register') {
            // For registration flow
            navigate('/register/complete', {
              state: {
                email,
                firstName,
                lastName,
                token: verifyResponse.data.token,
                type: 'register'
              }
            });
          } else {
            // For password reset flow
            navigate('/reset-password', {
              state: {
                email,
                token: verifyResponse.data.token,
                type: 'reset'
              }
            });
          }
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'OTP verification failed';
        toast.error(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleResendOTP = async () => {
    if (resendDisabled) return;
    
    try {
      setResendDisabled(true);
      setCountdown(30); // 30 seconds cooldown
      
      const endpoint = type === 'register' 
        ? AUTH_ENDPOINTS.SEND_OTP 
        : AUTH_ENDPOINTS.FORGOT_PASSWORD_OTP;
      
      const response = await axios.post(endpoint, { email });
      
      if (response.data.success) {
        toast.success(response.data.message || 'Verification code resent successfully');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to resend code';
      toast.error(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
      setResendDisabled(false);
      setCountdown(0);
    }
  };

  if (!email) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left side - Form */}
      <div className="w-full md:w-1/2 lg:w-2/5 p-6 md:p-12 flex flex-col">
        {/* Logo and Back Button */}
        <div className="flex justify-between items-center md:px-6 py-6">
          <Link to="/" className="flex items-center">
            <div className="h-8 w-8 bg-gradient-to-r from-foodyman-lime to-foodyman-green rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="ml-2 uppercase font-mono font-semibold text-2xl text-gray-800">
              Restroman
            </span>
          </Link>
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
        </div>

        {/* OTP Form */}
        <div className="flex-grow flex flex-col justify-center max-w-md mx-auto w-full">
          <h1 className="text-3xl font-medium text-gray-900 mb-2">
            Verify your email
          </h1>
          <p className="text-gray-600 mb-8">
            We've sent a 6-digit code to {email}
          </p>

          <form onSubmit={formik.handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="otp"
                className="block text-xs uppercase font-medium text-gray-500 mb-2"
              >
                Verification Code
              </label>
              <input
                id="otp"
                type="text"
                maxLength={6}
                {...formik.getFieldProps('otp')}
                className={`mt-1 block w-full border ${
                  formik.touched.otp && formik.errors.otp
                    ? 'border-red-500'
                    : 'border-gray-300'
                } rounded-md shadow-sm py-3 px-3 focus:outline-none focus:ring-foodyman-lime focus:border-foodyman-lime sm:text-sm`}
                placeholder="Enter 6-digit code"
              />
              {formik.touched.otp && formik.errors.otp && (
                <div className="text-red-500 text-xs mt-1">
                  {formik.errors.otp}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <button
                type="submit"
                disabled={formik.isSubmitting}
                className="w-full bg-foodyman-lime text-white font-medium py-3 rounded-md hover:bg-foodyman-lime/70 transition-colors disabled:opacity-50"
              >
                {formik.isSubmitting ? 'Verifying...' : 'Verify Code'}
              </button>

              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resendDisabled}
                className="w-full bg-transparent text-foodyman-lime font-medium py-3 rounded-md hover:bg-foodyman-lime/10 transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
              >
                {resendDisabled
                  ? `Resend code in ${countdown}s`
                  : 'Resend code'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right side - Image with overlay and content */}
      <div className="hidden md:block md:w-1/2 lg:w-3/5 bg-gray-100 relative">
        <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-10"></div>
        <img
          src="/delivery-courier.jpg"
          alt="Delivery courier"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col justify-center items-start z-20 p-12">
          <div className="max-w-xl">
            <h2 className="text-4xl font-bold text-white mb-6">
              Almost there!
            </h2>
            <p className="text-white/90 text-lg mb-8">
              We just need to verify your email address to ensure it's really you.
              This helps us keep your account secure and prevents unauthorized access.
            </p>
            <div className="bg-black/30 backdrop-blur-sm p-6 rounded-lg">
              <h3 className="text-foodyman-lime font-bold text-xl mb-4">
                Why verify your email?
              </h3>
              <ul className="space-y-3 text-white/80">
                <li>• Protect your account from unauthorized access</li>
                <li>• Receive important updates about your orders</li>
                <li>• Get exclusive offers and promotions</li>
                <li>• Reset your password if you ever need to</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerificationPage; 