import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated && allowedRoles && user && !allowedRoles.includes(user.role)) {
      showToast("You don't have access to that section.", "error");
    }
  }, [isAuthenticated, allowedRoles, user, showToast]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
