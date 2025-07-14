import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { GuestCartProvider } from "./context/GuestCartContext";
import "./config/axios.config";
import Layout from "./components/layout/Layout";
import Index from "./pages/Index";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProductListingPage from "./pages/ProductListingPage";
import Welcome from "./pages/Welcome";
import OrderMethodPage from "./pages/OrderMethodPage";
import DeliveryAddressPage from "./pages/DeliveryAddressPage";
import OffersPage from "./pages/OffersPage";
import SpecialAboutPage from "./pages/SpecialAboutPage";
import OutletSelectionPage from "./pages/OutletSelectionPage";
import LikedProductsPage from "./pages/LikedProductsPage";
import ScrollToTop from "./components/utils/ScrollToTop";
import "./styles/globals.css";
import CheckoutPage from "./pages/CheckoutPage";
import { AuthProvider, useAuth } from "./context/AuthContext";
import OTPVerificationPage from "./pages/auth/OTPVerificationPage";
import RegisterCompletePage from "./pages/auth/RegisterCompletePage";
import ProductPage from "./pages/ProductPage";
import "@/styles/carousel.css";
import { Toaster } from "sonner";
import CartPage from "./pages/CartPage";
import { BranchProvider } from "./context/BranchContext";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import OrderFailurePage from "./pages/OrderFailurePage";
import TermsAndConditionsPage from "./pages/TermsAndConditionsPage";
import AccountDetailsPage from "./pages/AccountDetailsPage";
import OrdersPage from "./pages/OrdersPage";
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AboutPage from "./pages/AboutPage";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowGuest?: boolean;
}

// Protected route wrapper component
const ProtectedRouteWrapper = ({
  children,
  allowGuest = false,
}: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated && !allowGuest) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <BranchProvider>
          <GuestCartProvider>
            <CartProvider>
              <ScrollToTop />
              <Toaster
                position="bottom-right"
                expand={true}
                toastOptions={{
                  className: "text-base p-4",
                }}
              />
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/register/verify" element={<OTPVerificationPage />} />
                <Route path="/register/complete" element={<RegisterCompletePage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                {/* Terms & Conditions */}
                <Route path="/terms" element={<TermsAndConditionsPage />} />

                {/* Account Details */}
                <Route 
                  path="/account" 
                  element={
                    <ProtectedRouteWrapper>
                      <AccountDetailsPage />
                    </ProtectedRouteWrapper>
                  } 
                />

                {/* Orders */}
                <Route 
                  path="/orders" 
                  element={
                    <ProtectedRouteWrapper>
                      <OrdersPage />
                    </ProtectedRouteWrapper>
                  } 
                />

                {/* Public Welcome Flow Routes */}
                <Route path="/" element={<Welcome />} />
                <Route path="/order-method" element={<OrderMethodPage />} />
                <Route path="/delivery-address" element={<DeliveryAddressPage />} />
                <Route path="/offers" element={<OffersPage />} />
                <Route path="/select-outlet" element={<OutletSelectionPage />} />
                <Route path="/about" element={<AboutPage />} />

                {/* Main App Routes */}
                <Route path="/app" element={<Layout />}>
                  <Route index element={<Index />} />
                  <Route path="products/:category" element={<ProductListingPage />} />
                  <Route path="profile" element={<ProtectedRouteWrapper><div>Profile Page</div></ProtectedRouteWrapper>} />
                  <Route path="orders" element={<ProtectedRouteWrapper><OrdersPage /></ProtectedRouteWrapper>} />
                  <Route path="favorites" element={<ProtectedRouteWrapper><div>Favorites Page</div></ProtectedRouteWrapper>} />
                </Route>

                {/* Checkout Route - Allows Guest Access */}
                <Route path="/checkout" element={<ProtectedRouteWrapper allowGuest={true}><Layout><CheckoutPage /></Layout></ProtectedRouteWrapper>} />

                {/* Order Success Route */}
                <Route path="/order-success" element={<OrderSuccessPage />} />

                {/* Order Failure Route */}
                <Route path="/order-failure/:orderId" element={<OrderFailurePage />} />

                {/* Protected Liked Products Route */}
                <Route path="/liked" element={<ProtectedRouteWrapper><Layout><LikedProductsPage /></Layout></ProtectedRouteWrapper>} />

                {/* App Routes */}
                <Route path="/app/products/:outletId" element={<ProductPage />} />

                {/* Cart Route */}
                <Route path="/cart" element={<Layout><CartPage /></Layout>} />

                {/* Order Tracking Routes */}
                <Route path="/order-status/:orderId" element={<OrderSuccessPage />} />
                <Route path="/track/:orderId" element={<OrderSuccessPage />} />

                {/* Catch all route */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </CartProvider>
          </GuestCartProvider>
        </BranchProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
