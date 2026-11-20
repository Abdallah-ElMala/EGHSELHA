// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('jwt_token') || null);
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('refresh_token') || null);
  const [loading, setLoading] = useState(true);

  // Synchronize state with localStorage
  const saveSession = useCallback((newToken, newRefreshToken, userData) => {
    setToken(newToken);
    setRefreshToken(newRefreshToken);
    setUser(userData);

    if (newToken) localStorage.setItem('jwt_token', newToken);
    else localStorage.removeItem('jwt_token');

    if (newRefreshToken) localStorage.setItem('refresh_token', newRefreshToken);
    else localStorage.removeItem('refresh_token');

    if (userData) localStorage.setItem('auth_user', JSON.stringify(userData));
    else localStorage.removeItem('auth_user');
  }, []);

  const clearSession = useCallback(() => {
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('auth_user');
  }, []);

  // Check login status on mount
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('jwt_token');
      if (savedToken) {
        try {
          const me = await authApi.getMe();
          if (me) {
            setUser(me);
            localStorage.setItem('auth_user', JSON.stringify(me));
          }
        } catch (err) {
          // If token expired, apiClient interceptor will try refresh-token automatically
          console.warn('Initial session check failed:', err.message);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Standard Login
  const login = async (email, password) => {
    const res = await authApi.login(email, password);

    // If 2FA is required, return response without saving full tokens yet
    if (res.requiresTwoFactor) {
      return res;
    }

    if (res.token && res.user) {
      saveSession(res.token, res.refreshToken, res.user);
    }
    return res;
  };

  // Verify 2FA challenge code
  const verifyTwoFactor = async (email, code) => {
    const res = await authApi.verifyTwoFactor(email, code);
    if (res.token && res.user) {
      saveSession(res.token, res.refreshToken, res.user);
    }
    return res;
  };

  // Register Customer
  const registerCustomer = async (data) => {
    const res = await authApi.registerCustomer(data);
    if (res.token && res.user) {
      saveSession(res.token, res.refreshToken, res.user);
    }
    return res;
  };

  // Register Technician
  const registerTechnician = async (data) => {
    const res = await authApi.registerTechnician(data);
    if (res.token && res.user) {
      saveSession(res.token, res.refreshToken, res.user);
    }
    return res;
  };

  // Google OAuth Login
  const googleLogin = async (idToken, role = 'CUSTOMER') => {
    const res = await authApi.googleLogin(idToken, role);
    if (res.token && res.user) {
      saveSession(res.token, res.refreshToken, res.user);
    }
    return res;
  };

  // Logout
  const logout = async () => {
    try {
      const currentRefresh = localStorage.getItem('refresh_token');
      if (currentRefresh) {
        await authApi.revokeToken(currentRefresh).catch(() => {});
      }
      await authApi.logout().catch(() => {});
    } finally {
      clearSession();
    }
  };

  // Toggle 2FA
  const toggleTwoFactor = async () => {
    const res = await authApi.toggleTwoFactor();
    if (user) {
      const updatedUser = { ...user, twoFactorEnabled: res.twoFactorEnabled };
      setUser(updatedUser);
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
    }
    return res;
  };

  // Role Checker Helper
  const hasRole = (...roles) => {
    if (!user || !user.role) return false;
    const userRole = user.role.toUpperCase();
    return roles.some((r) => r.toUpperCase() === userRole);
  };

  const role = user?.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()) : null;
  const isAuthenticated = Boolean(token && user);

  const value = {
    user,
    token,
    refreshToken,
    role,
    isAuthenticated,
    loading,
    login,
    verifyTwoFactor,
    registerCustomer,
    registerTechnician,
    googleLogin,
    logout,
    toggleTwoFactor,
    forgotPassword: authApi.forgotPassword,
    resetPassword: authApi.resetPassword,
    confirmEmail: authApi.confirmEmail,
    hasRole
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
