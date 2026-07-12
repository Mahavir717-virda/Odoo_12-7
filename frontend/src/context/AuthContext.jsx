import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'info', message: 'Welcome to EcoSphere ESG Platform!', date: new Date().toISOString().split('T')[0], read: false }
  ]);

  const isAuthenticated = !!user;

  // Central Notification Helper
  const createNotification = (userId, type, message) => {
    const newNotif = {
      id: Date.now() + Math.random(),
      type,
      message,
      date: new Date().toISOString().split('T')[0],
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      const mockUserStr = localStorage.getItem('mock_user');
      if (token) {
        try {
          const response = await fetch('http://localhost:5000/api/v1/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const result = await response.json();
          if (response.ok) {
            setUser(result.data);
            setLoading(false);
            return;
          }
        } catch (err) {
          // If server is offline, fall back to mock user
          if (mockUserStr) {
            setUser(JSON.parse(mockUserStr));
            setLoading(false);
            return;
          }
        }
      }

      if (mockUserStr) {
        setUser(JSON.parse(mockUserStr));
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  // Dual-mode Login: Attempt Backend first, fallback to mock credentials
  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const result = await response.json();
      if (response.ok) {
        const loggedInUser = result.data.user;
        localStorage.setItem('token', result.data.token);
        localStorage.setItem('mock_user', JSON.stringify(loggedInUser));
        setUser(loggedInUser);
        return loggedInUser;
      } else {
        throw new Error(result.message || 'Login failed');
      }
    } catch (err) {
      console.warn("Backend login failed/offline. Falling back to local mock authentication.", err);
      // Determine department & role based on email or defaults
      let role = 'Employee';
      let name = 'Demo User';
      let department = 'Manufacturing';

      if (email.includes('admin')) {
        role = 'Admin';
        name = 'Super Admin';
      } else if (email.includes('hr')) {
        role = 'HR';
        name = 'Sarah HR';
        department = 'Corporate';
      } else if (email.includes('manager')) {
        role = 'Manager';
        name = 'Michael Manager';
        department = 'Manufacturing';
      } else if (email.includes('sustain')) {
        role = 'Sustainability Team';
        name = 'Susan Sustainability';
        department = 'R&D';
      } else if (email.includes('compliance')) {
        role = 'Compliance Team';
        name = 'Charlie Compliance';
        department = 'Corporate';
      }

      const mockUser = {
        id: 'mock-' + Date.now(),
        name,
        email,
        role,
        department,
        xp: 150,
        points: 100,
        completedCount: 1
      };
      localStorage.setItem('token', 'mock-token-' + Date.now());
      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      setUser(mockUser);
      return mockUser;
    }
  };

  // Dual-mode Signup
  const signup = async (name, email, password, role) => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });
      const result = await response.json();
      if (response.ok) {
        const signedUpUser = result.data.user;
        localStorage.setItem('token', result.data.token);
        localStorage.setItem('mock_user', JSON.stringify(signedUpUser));
        setUser(signedUpUser);
        return signedUpUser;
      } else {
        throw new Error(result.message || 'Signup failed');
      }
    } catch (err) {
      console.warn("Backend signup offline. Creating local mock user.", err);
      const mockUser = {
        id: 'mock-' + Date.now(),
        name,
        email,
        role,
        department: 'Manufacturing',
        xp: 0,
        points: 0,
        completedCount: 0
      };
      localStorage.setItem('token', 'mock-token-' + Date.now());
      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      setUser(mockUser);
      return mockUser;
    }
  };

  const logout = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('mock_user');
    setUser(null);
  };

  const canAccess = (moduleName) => {
    if (!user) return false;
    const r = user.role;
    if (r === 'Admin') return true;

    switch (moduleName.toLowerCase()) {
      case 'environmental':
        return ['Sustainability Team', 'Manager', 'Compliance Team', 'HR'].includes(r);
      case 'social':
        return true; // Everyone can view
      case 'governance':
        return true; // Everyone can view/ack
      case 'gamification':
        return true; // Everyone can view / join
      case 'reports':
        return ['Sustainability Team', 'Compliance Team', 'HR', 'Manager', 'Employee'].includes(r);
      case 'settings':
        return r === 'HR'; // HR can view employee lists
      default:
        return false;
    }
  };

  const canEdit = (moduleName) => {
    if (!user) return false;
    const r = user.role;
    if (r === 'Admin') return true;

    switch (moduleName.toLowerCase()) {
      case 'environmental':
        return r === 'Sustainability Team';
      case 'social':
        return r === 'HR';
      case 'governance':
        return r === 'Compliance Team';
      case 'gamification':
        return false; // Only Admin can configure challenges/badges/rewards catalog
      case 'reports':
        return false;
      case 'settings':
        return false;
      default:
        return false;
    }
  };

  const canApprove = (moduleName) => {
    if (!user) return false;
    const r = user.role;
    if (r === 'Admin') return true;

    switch (moduleName.toLowerCase()) {
      case 'environmental':
        return false;
      case 'social':
        return r === 'HR' || r === 'Manager';
      case 'governance':
        return r === 'Compliance Team';
      case 'gamification':
        return r === 'Manager'; // manager approves challenge participation
      case 'reports':
        return false;
      case 'settings':
        return false;
      default:
        return false;
    }
  };

  // Helper to update user XP & points (points/XP auto-calculation side-effect)
  const updateUserXPAndPoints = (xpAmount, pointsAmount) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = {
        ...prev,
        xp: (prev.xp || 0) + xpAmount,
        points: (prev.points || 0) + pointsAmount,
        completedCount: (prev.completedCount || 0) + 1
      };
      localStorage.setItem('mock_user', JSON.stringify(updated));
      return updated;
    });
  };

  const refreshUser = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await fetch('http://localhost:5000/api/v1/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        if (response.ok) {
          setUser(result.data);
          localStorage.setItem('mock_user', JSON.stringify(result.data));
          return result.data;
        }
      } catch (err) {
        console.error('Failed to refresh user profile:', err);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading,
      isAuthenticated, 
      login, 
      signup, 
      logout,
      canAccess,
      canEdit,
      canApprove,
      updateUserXPAndPoints,
      refreshUser,
      notifications,
      createNotification
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
