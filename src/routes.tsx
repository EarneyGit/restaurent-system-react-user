import React from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Index from './pages/Index';
import ProductListingPage from './pages/ProductListingPage';
import NotFound from './pages/NotFound';

// Wrapper component to handle category parameter
const CategoryRedirect = () => {
  const { category } = useParams();
  return <Navigate to={`/products/${category || 'All'}`} replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Index />} />
        <Route path="/products/:category" element={<ProductListingPage />} />
        <Route path="/category" element={<Navigate to="/products/All" replace />} />
        <Route path="/category/:category" element={<CategoryRedirect />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes; 