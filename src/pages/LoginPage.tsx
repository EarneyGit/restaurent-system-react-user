import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import * as Yup from 'yup';
import { useFormik } from 'formik';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Get the redirect path from state or localStorage
  const redirectPath = location.state?.from || localStorage.getItem('returnUrl') || '/app';
  const isCheckoutRedirect = redirectPath.includes('/checkout');

  // Clear returnUrl from localStorage after reading it
  useEffect(() => {
    localStorage.removeItem('returnUrl');
  }, []);

  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
  });

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema,
    onSubmit: handleLogin,
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

  const handleGuestCheckout = (e: React.MouseEvent) => {
    e.preventDefault();
    // Clear any existing auth data to ensure clean guest state
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('deliveryAddress');
    localStorage.removeItem('orderDetails');
    // Set guest status
    localStorage.setItem('isGuest', 'true');
    
    // Navigate to checkout or app based on the redirect path
    if (isCheckoutRedirect) {
      navigate('/checkout', { replace: true });
    } else {
      navigate('/app', { replace: true });
    }
  };

  return (
    <div>
      {/* Render your form here */}
    </div>
  );
};

export default LoginPage; 