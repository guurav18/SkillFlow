import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('workflow_token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state by fetching current user if token exists
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('workflow_token');
      if (storedToken) {
        try {
          const data = await authService.getMe();
          setUser(data.user);
        } catch (err) {
          console.warn('[Auth] Stored token invalid or expired:', err.message);
          localStorage.removeItem('workflow_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    setError(null);
    try {
      const data = await authService.login(credentials);
      localStorage.setItem('workflow_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      const data = await authService.register(userData);
      localStorage.setItem('workflow_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('workflow_token');
    setToken(null);
    setUser(null);
    setError(null);
  };

  const updateUserState = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        updateUserState,
        isAuthenticated: !!user,
        isClient: user?.role === 'client',
        isFreelancer: user?.role === 'freelancer',
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
