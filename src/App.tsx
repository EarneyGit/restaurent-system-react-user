import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { CartProvider } from "./context/CartContext";
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
import AppRoutes from "./routes";

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
          <CartProvider>
            <ScrollToTop />
            <Toaster
              position="bottom-right"
              expand={true}
              toastOptions={{
                className: "text-base p-4", 
              }}
            />{" "}
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/register/verify"
                element={<OTPVerificationPage />}
              />
              <Route
                path="/register/complete"
                element={<RegisterCompletePage />}
              />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              {/* Public Welcome Flow Routes */}
              <Route path="/" element={<Welcome />} />
              <Route path="/order-method" element={<OrderMethodPage />} />
              <Route path="/offers" element={<OffersPage />} />
              <Route path="/special-about" element={<SpecialAboutPage />} />
              <Route path="/select-outlet" element={<OutletSelectionPage />} />

              {/* Main App Routes */}
              <Route path="/app" element={<Layout />}>
                <Route index element={<Index />} />
                <Route
                  path="products/:category"
                  element={<ProductListingPage />}
                />

                {/* Protected User Routes */}
                <Route
                  path="profile"
                  element={
                    <ProtectedRouteWrapper>
                      <div>Profile Page</div>
                    </ProtectedRouteWrapper>
                  }
                />
                <Route
                  path="orders"
                  element={
                    <ProtectedRouteWrapper>
                      <div>Orders Page</div>
                    </ProtectedRouteWrapper>
                  }
                />
                <Route
                  path="favorites"
                  element={
                    <ProtectedRouteWrapper>
                      <div>Favorites Page</div>
                    </ProtectedRouteWrapper>
                  }
                />
              </Route>

              {/* Checkout Route - Allows Guest Access */}
              <Route
                path="/checkout"
                element={
                  <ProtectedRouteWrapper allowGuest={true}>
                    <Layout />
                  </ProtectedRouteWrapper>
                }
              >
                <Route index element={<CheckoutPage />} />
              </Route>

              {/* Protected Liked Products Route */}
              <Route
                path="/liked"
                element={
                  <ProtectedRouteWrapper>
                    <Layout />
                  </ProtectedRouteWrapper>
                }
              >
                <Route index element={<LikedProductsPage />} />
              </Route>

              {/* App Routes */}
              <Route path="/app/products/:outletId" element={<ProductPage />} />

              {/* Cart Route */}
              <Route
                path="/cart"
                element={
                  <Layout>
                    <CartPage />
                  </Layout>
                }
              />

              {/* Catch all route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </CartProvider>
        </BranchProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
