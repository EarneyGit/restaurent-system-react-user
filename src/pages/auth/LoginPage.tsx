import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, UserCircle2 } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { AUTH_ENDPOINTS } from '../../config/api.config';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Get the redirect path from state, default to '/app'
  const redirectPath = location.state?.from || '/app';
  const isCheckoutRedirect = redirectPath.includes('/checkout');

  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
  });

  const handleLogin = async (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!formik.isValid || formik.isSubmitting) return;
    
    try {
      formik.setSubmitting(true);
      await login(formik.values.email, formik.values.password);
      
      // After successful login, navigate to the redirect path
      navigate(redirectPath, { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      // Error is already handled in the login function
    } finally {
      formik.setSubmitting(false);
    }
  };

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      window.location.href = '/app';
    }
  }, []);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    validationSchema,
    onSubmit: () => {} // We'll handle submission manually
  });

  const handleGuestCheckout = (e: React.MouseEvent) => {
    e.preventDefault();
    // Clear any existing auth data to ensure clean guest state
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Navigate based on the redirect path
    navigate(isCheckoutRedirect ? '/checkout' : '/app', { replace: true });
  };

  const togglePasswordVisibility = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left side - Form */}
      <div className="w-full md:w-1/2 lg:w-2/5 p-6 md:p-12 flex flex-col">
        {/* Logo */}
        <div className="flex md:px-6 md:py-6 pt-6">
          <Link to="/" className="flex items-center">
            <div className="h-8 w-8 bg-gradient-to-r from-foodyman-lime to-foodyman-green rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="ml-2 uppercase font-mono font-semibold text-2xl  text-gray-800">
              Restroman
            </span>
          </Link>
        </div>

        {/* Login Form */}
        <div className="flex-grow flex flex-col justify-center max-w-md mx-auto w-full">
          <h1 className="text-3xl font-medium text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-600 mb-8">
            Don't have an account?{' '}
            <Link to="/register" className="text-foodyman-lime hover:text-foodyman-lime/70 transition-colors">
              Sign up
            </Link>
          </p>

          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-xs uppercase font-medium text-gray-500 mb-2">
                Email or phone
              </label>
              <input
                id="email"
                type="text"
                {...formik.getFieldProps('email')}
                className={`w-full border ${
                  formik.touched.email && formik.errors.email
                    ? 'border-red-500'
                    : 'border-gray-300'
                } rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-foodyman-lime focus:border-transparent`}
                placeholder="Type here"
              />
              {formik.touched.email && formik.errors.email && (
                <div className="text-red-500 text-sm mt-1">{formik.errors.email}</div>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-xs uppercase font-medium text-gray-500 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...formik.getFieldProps('password')}
                  className={`w-full border ${
                    formik.touched.password && formik.errors.password
                      ? 'border-red-500'
                      : 'border-gray-300'
                  } rounded-md p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-foodyman-lime focus:border-transparent`}
                  placeholder="Type here"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleLogin();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <div className="text-red-500 text-sm mt-1">{formik.errors.password}</div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...formik.getFieldProps('rememberMe')}
                  className="w-4 h-4 border-gray-300 rounded bg-green-600 text-white"
                />
                <span className="ml-2 text-sm text-gray-600">Keep me logged in</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-gray-600 hover:text-foodyman-lime transition-colors">
                Forgot password
              </Link>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleLogin}
                disabled={formik.isSubmitting}
                className="w-full bg-foodyman-lime text-white font-medium py-3 rounded-md hover:bg-foodyman-lime/70 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {formik.isSubmitting ? 'Logging in...' : 'Login'}
              </button>

              <button
                type="button"
                onClick={handleGuestCheckout}
                className="w-full border border-gray-300 text-gray-700 font-medium py-3 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <UserCircle2 size={20} />
                Continue as Guest
              </button>
            </div>
          </div>
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
              Welcome Back to Restroman
            </h2>
            <p className="text-white/90 text-lg mb-8">
              Log in to your account to access your favorite restaurants, track orders,
              and enjoy exclusive member benefits.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/30 backdrop-blur-sm p-4 rounded-lg">
                <h3 className="text-foodyman-lime font-bold text-xl mb-2">
                  Order History
                </h3>
                <p className="text-white/80">
                  View your past orders and quickly reorder your favorites
                </p>
              </div>
              <div className="bg-black/30 backdrop-blur-sm p-4 rounded-lg">
                <h3 className="text-foodyman-lime font-bold text-xl mb-2">
                  Saved Addresses
                </h3>
                <p className="text-white/80">
                  Quick checkout with your saved delivery locations
                </p>
              </div>
              <div className="bg-black/30 backdrop-blur-sm p-4 rounded-lg">
                <h3 className="text-foodyman-lime font-bold text-xl mb-2">
                  Special Offers
                </h3>
                <p className="text-white/80">
                  Access member-only discounts and promotions
                </p>
              </div>
              <div className="bg-black/30 backdrop-blur-sm p-4 rounded-lg">
                <h3 className="text-foodyman-lime font-bold text-xl mb-2">
                  Faster Checkout
                </h3>
                <p className="text-white/80">
                  Skip the guest checkout process every time
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 