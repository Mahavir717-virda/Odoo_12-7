import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import Dashboard from './pages/Dashboard/Dashboard';
import Environmental from './pages/Environmental/Environmental';
import Social from './pages/Social/Social';
import Governance from './pages/Governance/Governance';
import Gamification from './pages/Gamification/Gamification';
import Reports from './pages/Reports/Reports';
import Settings from './pages/Settings/Settings';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected Routes inside Shell Layout */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                
                {/* Environmental Route - Accessible by all roles except Employee */}
                <Route element={<ProtectedRoute allowedRoles={['Admin', 'Sustainability Team', 'Manager', 'Compliance Team', 'HR']} />}>
                  <Route path="/environmental" element={<Environmental />} />
                </Route>

                {/* Social, Governance and Gamification - Accessible by everyone */}
                <Route path="/social" element={<Social />} />
                <Route path="/governance" element={<Governance />} />
                <Route path="/gamification" element={<Gamification />} />
                
                {/* Reports Route - Accessible by all roles except Employee */}
                <Route element={<ProtectedRoute allowedRoles={['Admin', 'Sustainability Team', 'Compliance Team', 'HR', 'Manager']} />}>
                  <Route path="/reports" element={<Reports />} />
                </Route>

                {/* Settings Route - Restricted to Admin only */}
                <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
                  <Route path="/settings" element={<Settings />} />
                </Route>
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
