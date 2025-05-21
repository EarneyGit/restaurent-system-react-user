import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Layout from './components/layout/Layout';
import Index from './pages/Index';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';
import ProductListingPage from './pages/ProductListingPage';
import Welcome from './pages/Welcome';
import OrderMethodPage from './pages/OrderMethodPage';
import OffersPage from './pages/OffersPage';
import SpecialAboutPage from './pages/SpecialAboutPage';
import OutletSelectionPage from './pages/OutletSelectionPage';
import LikedProductsPage from './pages/LikedProductsPage';
import ScrollToTop from './components/utils/ScrollToTop';
import './styles/globals.css';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const deliveryMethod = localStorage.getItem('deliveryMethod');
  if (!deliveryMethod) {
    return <Navigate to="/order-method" replace />;
  }
  return <>{children}</>;
};

const App = () => {
  return (
    <BrowserRouter>
      <CartProvider>
        <ScrollToTop />
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Welcome Flow Routes */}
          <Route path="/" element={<Welcome />} />
          <Route path="/order-method" element={<OrderMethodPage />} />
          <Route path="/offers" element={<OffersPage />} />
          <Route path="/special-about" element={<SpecialAboutPage />} />
          <Route path="/select-outlet" element={<OutletSelectionPage />} />
          
          {/* Main App Routes - Protected */}
          <Route path="/app" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Index />} />
            <Route path="products/:category" element={<ProductListingPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Liked Products Route */}
          <Route path="/liked" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<LikedProductsPage />} />
          </Route>

          {/* Catch all route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
};

export default App;
