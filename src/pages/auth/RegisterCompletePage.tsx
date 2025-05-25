import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';
import axios from 'axios';
import { AUTH_ENDPOINTS } from '../../config/api.config';

const RegisterCompletePage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get user details from location state
  const { email, name, token, type = 'register' } = location.state || {};

  // Redirect if missing required data
  React.useEffect(() => {
    if (!email || !token) {
      navigate('/register');
    }
  }, [email, token, navigate]);

  const validationSchema = Yup.object({
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      )
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], 'Passwords must match')
      .required('Confirm password is required'),
    phone: Yup.string()
      .matches(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number')
      .required('Phone number is required'),
    address: Yup.string()
      .min(5, 'Address must be at least 5 characters')
      .required('Address is required'),
  });

  const formik = useFormik({
    initialValues: {
      password: '',
      confirmPassword: '',
      phone: '',
      address: '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const response = await axios.post(AUTH_ENDPOINTS.REGISTER, {
          email,
          name,
          token,
          password: values.password,
          phone: values.phone,
          address: values.address,
        });

        if (response.data.success) {
          // Store token and redirect
          localStorage.setItem('token', response.data.token);
          toast.success(response.data.message || 'Registration successful');
          navigate('/');
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Registration failed';
        toast.error(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
      } finally {
        setSubmitting(false);
      }
    },
  });

  if (!email || !token) {
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

        {/* Registration Form */}
        <div className="flex-grow flex flex-col justify-center max-w-md mx-auto w-full">
          <h1 className="text-3xl font-medium text-gray-900 mb-2">
            Complete your profile
          </h1>
          <p className="text-gray-600 mb-8">
            Just a few more details to get you started
          </p>

          <form onSubmit={formik.handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="password"
                className="block text-xs uppercase font-medium text-gray-500 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                {...formik.getFieldProps('password')}
                className={`mt-1 block w-full border ${
                  formik.touched.password && formik.errors.password
                    ? 'border-red-500'
                    : 'border-gray-300'
                } rounded-md shadow-sm py-3 px-3 focus:outline-none focus:ring-foodyman-lime focus:border-foodyman-lime sm:text-sm`}
                placeholder="Create a strong password"
              />
              {formik.touched.password && formik.errors.password && (
                <div className="text-red-500 text-xs mt-1">
                  {formik.errors.password}
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs uppercase font-medium text-gray-500 mb-2"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                {...formik.getFieldProps('confirmPassword')}
                className={`mt-1 block w-full border ${
                  formik.touched.confirmPassword && formik.errors.confirmPassword
                    ? 'border-red-500'
                    : 'border-gray-300'
                } rounded-md shadow-sm py-3 px-3 focus:outline-none focus:ring-foodyman-lime focus:border-foodyman-lime sm:text-sm`}
                placeholder="Confirm your password"
              />
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <div className="text-red-500 text-xs mt-1">
                  {formik.errors.confirmPassword}
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-xs uppercase font-medium text-gray-500 mb-2"
              >
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                {...formik.getFieldProps('phone')}
                className={`mt-1 block w-full border ${
                  formik.touched.phone && formik.errors.phone
                    ? 'border-red-500'
                    : 'border-gray-300'
                } rounded-md shadow-sm py-3 px-3 focus:outline-none focus:ring-foodyman-lime focus:border-foodyman-lime sm:text-sm`}
                placeholder="Enter your phone number"
              />
              {formik.touched.phone && formik.errors.phone && (
                <div className="text-red-500 text-xs mt-1">
                  {formik.errors.phone}
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="address"
                className="block text-xs uppercase font-medium text-gray-500 mb-2"
              >
                Delivery Address
              </label>
              <textarea
                id="address"
                {...formik.getFieldProps('address')}
                rows={3}
                className={`mt-1 block w-full border ${
                  formik.touched.address && formik.errors.address
                    ? 'border-red-500'
                    : 'border-gray-300'
                } rounded-md shadow-sm py-3 px-3 focus:outline-none focus:ring-foodyman-lime focus:border-foodyman-lime sm:text-sm`}
                placeholder="Enter your delivery address"
              />
              {formik.touched.address && formik.errors.address && (
                <div className="text-red-500 text-xs mt-1">
                  {formik.errors.address}
                </div>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={formik.isSubmitting}
                className="w-full bg-foodyman-lime text-white font-medium py-3 rounded-md hover:bg-foodyman-lime/70 transition-colors disabled:opacity-50"
              >
                {formik.isSubmitting ? 'Creating Account...' : 'Complete Registration'}
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
              Final Step!
            </h2>
            <p className="text-white/90 text-lg mb-8">
              We need a few more details to personalize your experience and ensure
              smooth delivery of your orders.
            </p>
            <div className="bg-black/30 backdrop-blur-sm p-6 rounded-lg">
              <h3 className="text-foodyman-lime font-bold text-xl mb-4">
                Why we need this information
              </h3>
              <ul className="space-y-3 text-white/80">
                <li>• Secure your account with a strong password</li>
                <li>• Contact you about your orders via phone</li>
                <li>• Deliver your food to the correct address</li>
                <li>• Provide personalized recommendations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterCompletePage; 