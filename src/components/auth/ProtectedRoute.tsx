import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowGuest?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowGuest = false }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // List of paths that require authentication
  const protectedPaths = [
    '/app/profile',
    '/app/orders',
    '/app/favorites',
    '/liked',
  ];

  // Check if current path requires authentication
  const requiresAuth = protectedPaths.some(path => location.pathname.startsWith(path));

  // Allow guest checkout
  if (allowGuest && location.pathname.includes('/checkout')) {
    return <>{children}</>;
  }

  // Only redirect to login if the path requires authentication
  if (!isAuthenticated && requiresAuth) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 