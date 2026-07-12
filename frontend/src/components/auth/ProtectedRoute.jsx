import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, user, loading } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();

  useEffect(() => {
    if (!loading && isAuthenticated && allowedRoles && user && !allowedRoles.includes(user.role)) {
      showToast("You don't have access to that section.", "error");
    }
  }, [loading, isAuthenticated, allowedRoles, user, showToast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-base text-text-primary">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-accent-env border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary animate-pulse">Verifying Session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
