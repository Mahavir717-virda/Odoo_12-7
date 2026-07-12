import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const isAuthenticated = !!user;

  React.useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch('http://localhost:5000/api/v1/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const result = await response.json();
          if (response.ok) {
            setUser(result.data);
          } else {
            localStorage.removeItem('token');
          }
        } catch (err) {
          localStorage.removeItem('token');
        }
      }
    };
    checkAuth();
  }, []);

  // Real API Login
  const login = async (email, password) => {
    const response = await fetch('http://localhost:5000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Login failed');

    const loggedInUser = result.data.user;
    localStorage.setItem('token', result.data.token);
    setUser(loggedInUser);
    return loggedInUser;
  };

  // Real API Signup
  const signup = async (name, email, password, role) => {
    const response = await fetch('http://localhost:5000/api/v1/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Signup failed');

    const signedUpUser = result.data.user;
    localStorage.setItem('token', result.data.token);
    setUser(signedUpUser);
    return signedUpUser;
  };

  // Real API Logout
  const logout = async () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, signup, logout }}>
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
