import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from 'sonner';
import axios from "axios";

interface FormValues {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

interface LocationState {
  mode?: 'changePassword' | 'forgotPassword';
}

const ForgotPasswordPage = () => {
  const [step, setStep] = useState<"email" | "otp" | "reset">("email");
  const [resetToken, setResetToken] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const mode = state?.mode || 'forgotPassword';

  const emailValidationSchema = Yup.object({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
  });

  const otpValidationSchema = Yup.object({
    otp: Yup.string()
      .matches(/^\d{6}$/, "OTP must be 6 digits")
      .required("OTP is required"),
  });

  const resetPasswordValidationSchema = Yup.object({
    newPassword: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      )
      .required("New password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("newPassword")], "Passwords must match")
      .required("Confirm password is required"),
  });

  const emailFormik = useFormik<FormValues>({
    initialValues: {
      email: "",
    },
    validationSchema: emailValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await axios.post("/api/auth/forgot-password-otp", { email: values.email });
        toast.success("OTP sent to your email");
        setStep("otp");
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to send OTP");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const otpFormik = useFormik<FormValues>({
    initialValues: {
      otp: "",
    },
    validationSchema: otpValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const response = await axios.post("/api/auth/verify-otp", {
          email: emailFormik?.values?.email,
          otp: values?.otp,
        });


        setResetToken(response?.data?.token);
        toast.success("OTP verified successfully");
        setStep("reset");
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Invalid OTP");
      } finally {
        setSubmitting(false);
      }
    },
  });


  const resetPasswordFormik = useFormik<FormValues>({
    initialValues: {
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: resetPasswordValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await axios.post(`/api/auth/reset-password`, {
          password: values.newPassword,
          confirmPassword: values.confirmPassword,
          token: resetToken,  
        });
        toast.success("Password reset successful");
        navigate("/login");
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to reset password");
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left side - Form */}
      <div className="w-full md:w-1/2 lg:w-2/5 p-6 md:p-12 flex flex-col">
        {/* Logo and Back Button */}
        <div className="flex justify-between items-center pt-6">
          <Link
            to={mode === 'changePassword' ? '/account' : '/login'}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft size={20} className="mr-2" />
            <span>Back to {mode === 'changePassword' ? 'Account' : 'Login'}</span>
          </Link>
          <Link to="/" className="flex items-center">
            <div className="h-8 w-8 bg-gradient-to-r from-brand-yellow to-yellow-700 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
          </Link>
        </div>

        {/* Form Content */}
        <div className="flex-grow flex flex-col justify-center max-w-md mx-auto w-full">
          <h2 className="text-3xl font-medium text-gray-900 mb-2">
            {mode === 'changePassword' ? 'Change Password' : 'Forgot Password'}
          </h2>
          <p className="text-gray-600 mb-8">
            {step === "email"
              ? "Enter your email to receive a verification code"
              : step === "otp"
              ? "Enter the OTP sent to your email"
              : "Enter your new password"}
          </p>

          {step === "email" && (
            <form onSubmit={emailFormik.handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs uppercase font-medium text-gray-500 mb-2"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  {...emailFormik.getFieldProps("email")}
                  className={`w-full border ${
                    emailFormik.touched.email && emailFormik.errors.email ? "border-red-500" : "border-gray-300"
                  } rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent`}
                  placeholder="Enter your email"
                />
                {emailFormik.touched.email && emailFormik.errors.email && (
                  <div className="text-red-500 text-sm mt-1">{emailFormik.errors.email}</div>
                )}
              </div>
              <button
                type="submit"
                disabled={emailFormik.isSubmitting}
                className="w-full bg-yellow-600 text-white font-medium py-3 rounded-md hover:bg-yellow-600/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {emailFormik.isSubmitting ? "Sending..." : "Send OTP"}
              </button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={otpFormik.handleSubmit} className="space-y-6">
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
                  {...otpFormik.getFieldProps("otp")}
                  className={`w-full border ${
                    otpFormik.touched.otp && otpFormik.errors.otp ? "border-red-500" : "border-gray-300"
                  } rounded-md p-3 focus:outline-none text-sm focus:ring-2 focus:ring-yellow-600 focus:border-transparent`}
                  placeholder="Enter 6-digit OTP"
                />
                {otpFormik.touched.otp && otpFormik.errors.otp && (
                  <div className="text-red-500 text-sm mt-1">{otpFormik.errors.otp}</div>
                )}
              </div>
              <button
                type="submit"
                disabled={otpFormik.isSubmitting}
                className="w-full bg-brand-yellow text-white font-medium py-3 rounded-md hover:bg-brand-yellow/70 transition-colors disabled:opacity-50"
              >
                {otpFormik.isSubmitting ? "Verifying..." : "Verify OTP"}
              </button>
            </form>
          )}

          {step === "reset" && (
            <form onSubmit={resetPasswordFormik.handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-xs uppercase font-medium text-gray-500 mb-2"
                >
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  {...resetPasswordFormik.getFieldProps("newPassword")}
                  className={`w-full border ${
                    resetPasswordFormik.touched.newPassword && resetPasswordFormik.errors.newPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent`}
                  placeholder="Enter new password"
                />
                {resetPasswordFormik.touched.newPassword && resetPasswordFormik.errors.newPassword && (
                  <div className="text-red-500 text-sm mt-1">{resetPasswordFormik.errors.newPassword}</div>
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
                  {...resetPasswordFormik.getFieldProps("confirmPassword")}
                  className={`w-full border ${
                    resetPasswordFormik.touched.confirmPassword && resetPasswordFormik.errors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent`}
                  placeholder="Confirm new password"
                />
                {resetPasswordFormik.touched.confirmPassword && resetPasswordFormik.errors.confirmPassword && (
                  <div className="text-red-500 text-sm mt-1">{resetPasswordFormik.errors.confirmPassword}</div>
                )}
              </div>

              <button
                type="submit"
                disabled={resetPasswordFormik.isSubmitting}
                className="w-full bg-yellow-600 text-white font-medium py-3 rounded-md hover:bg-yellow-600/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {resetPasswordFormik.isSubmitting ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}
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
          <div className="max-w-md">
            <h2 className="text-4xl font-bold text-white mb-6">
              {mode === 'changePassword' ? 'Change Your Password' : 'Reset Your Password'}
            </h2>
            <p className="text-white/90 text-lg mb-8">
              {mode === 'changePassword' 
                ? "Keep your account secure by updating your password regularly. Follow these steps to change your password."
                : "Don't worry, we've got you covered. Follow these simple steps to reset your password and regain access to your account."
              }
            </p>
            <ul className="space-y-4 text-white/90">
              <li className="flex items-center">
                <span className="w-6 h-6 bg-yellow-700 rounded-full flex items-center justify-center mr-3">1</span>
                <span>Enter your registered email address</span>
              </li>
              <li className="flex items-center">
                <span className="w-6 h-6 bg-yellow-700 rounded-full flex items-center justify-center mr-3">2</span>
                <span>Check your email for the verification code</span>
              </li>
              <li className="flex items-center">
                <span className="w-6 h-6 bg-yellow-700 rounded-full flex items-center justify-center mr-3">3</span>
                <span>Enter the code to verify your identity</span>
              </li>
              <li className="flex items-center">
                <span className="w-6 h-6 bg-yellow-700 rounded-full flex items-center justify-center mr-3">4</span>
                <span>Create a new secure password</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage; 
