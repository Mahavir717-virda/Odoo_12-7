import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const isAuthenticated = !!user;

  // Simulate API Login
  const login = async (email, password) => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // TODO: Replace with real API call
    // const response = await fetch('/api/auth/login', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ email, password })
    // });
    // const data = await response.json();
    // if (!response.ok) throw new Error(data.message);

    // Mock role determination based on email
    const role = email.toLowerCase().includes('admin') ? 'Admin' : 'Employee';
    const name = email.split('@')[0].split('.').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');

    const loggedInUser = {
      name: name || 'Demo User',
      email,
      role
    };

    setUser(loggedInUser);
    return loggedInUser;
  };

  // Simulate API Signup
  const signup = async (name, email, password, role) => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // TODO: Replace with real API call
    // const response = await fetch('/api/auth/signup', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ name, email, password, role })
    // });
    // const data = await response.json();
    // if (!response.ok) throw new Error(data.message);

    const signedUpUser = {
      name,
      email,
      role
    };

    setUser(signedUpUser);
    return signedUpUser;
  };

  // Simulate API Logout
  const logout = async () => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    // TODO: Replace with real API call
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
