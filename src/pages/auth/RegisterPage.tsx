import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from 'sonner';
import axios from "axios";
import { AUTH_ENDPOINTS } from "../../config/api.config";

const RegisterPage = () => {
  const navigate = useNavigate();

  const validationSchema = Yup.object({
    name: Yup.string()
      .min(2, "Name must be at least 2 characters")
      .required("Name is required"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        // First, send OTP
        const response = await axios.post(AUTH_ENDPOINTS.SEND_OTP, {
          email: values.email
        });

        if (response.data.success) {
          toast.success(response.data.message || "Verification OTP sent to your email");
          // Navigate to OTP verification with user details
          navigate("/register/verify", {
            state: {
              email: values.email,
              name: values.name,
              type: 'register'
            },
          });
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Failed to send OTP";
        toast.error(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left side - Form */}
      <div className="w-full md:w-1/2 lg:w-2/5 p-6 md:p-12 flex flex-col">
        {/* Logo */}
        <div className="flex md:px-6 py-6">
          <Link to="/" className="flex items-center">
            <div className="h-8 w-8 bg-gradient-to-r from-foodyman-lime to-foodyman-green rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="ml-2 uppercase font-mono font-semibold text-2xl text-gray-800">
              Restroman
            </span>
          </Link>
        </div>

        {/* Registration Form */}
        <div className="flex-grow flex flex-col justify-center max-w-md mx-auto w-full">
          <h1 className="text-3xl font-medium text-gray-900 mb-2">
            Create an account
          </h1>
          <p className="text-gray-600 mb-8">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-foodyman-lime hover:text-foodyman-lime/70 transition-colors"
            >
              Login
            </Link>
          </p>

          <form onSubmit={formik.handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-xs uppercase font-medium text-gray-500 mb-2"
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                {...formik.getFieldProps("name")}
                className={`mt-1 block w-full border ${
                  formik.touched.name && formik.errors.name
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md shadow-sm py-3 px-3 focus:outline-none focus:ring-foodyman-lime focus:border-foodyman-lime sm:text-sm`}
                placeholder="Enter your full name"
              />
              {formik.touched.name && formik.errors.name && (
                <div className="text-red-500 text-xs mt-1">
                  {formik.errors.name}
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-xs uppercase font-medium text-gray-500 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                {...formik.getFieldProps("email")}
                className={`mt-1 block w-full border ${
                  formik.touched.email && formik.errors.email
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md shadow-sm py-3 px-3 focus:outline-none focus:ring-foodyman-lime focus:border-foodyman-lime sm:text-sm`}
                placeholder="Enter your email address"
              />
              {formik.touched.email && formik.errors.email && (
                <div className="text-red-500 text-xs mt-1">
                  {formik.errors.email}
                </div>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={formik.isSubmitting}
                className="w-full bg-foodyman-lime text-white font-medium py-3 rounded-md hover:bg-foodyman-lime/70 transition-colors disabled:opacity-50"
              >
                {formik.isSubmitting ? "Sending OTP..." : "Send OTP"}
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
              Join Restroman Today
            </h2>
            <p className="text-white/90 text-lg mb-8">
              Get access to exclusive restaurants and enjoy premium food delivery
              right to your door. Sign up now and get 20% off your first order.
            </p>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
              <div className="bg-black/30 backdrop-blur-sm p-4 rounded-lg">
                <h3 className="text-foodyman-lime font-bold text-xl mb-2">
                  Fast Delivery
                </h3>
                <p className="text-white/80">
                  Get your food delivered within 30 minutes of ordering
                </p>
              </div>
              <div className="bg-black/30 backdrop-blur-sm p-4 rounded-lg">
                <h3 className="text-foodyman-lime font-bold text-xl mb-2">
                  Premium Selection
                </h3>
                <p className="text-white/80">
                  Access to high-quality restaurants curated just for you
                </p>
              </div>
              <div className="bg-black/30 backdrop-blur-sm p-4 rounded-lg">
                <h3 className="text-foodyman-lime font-bold text-xl mb-2">
                  Loyalty Rewards
                </h3>
                <p className="text-white/80">
                  Earn points with every order that can be redeemed for discounts
                </p>
              </div>
              <div className="bg-black/30 backdrop-blur-sm p-4 rounded-lg">
                <h3 className="text-foodyman-lime font-bold text-xl mb-2">
                  Exclusive Offers
                </h3>
                <p className="text-white/80">
                  Get access to special promotions and restaurant deals
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 