// src/services/authApi.js
import { API_ORIGIN, apiRequest } from './apiClient';

const AUTH_BASE = `${API_ORIGIN}/api/auth`;

export const authApi = {
  // Login with Email & Password
  login: async (email, password) => {
    return apiRequest(`${AUTH_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
  },

  // Register Customer
  registerCustomer: async (customerData) => {
    return apiRequest(`${AUTH_BASE}/register-customer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customerData)
    });
  },

  // Register Technician
  registerTechnician: async (technicianData) => {
    return apiRequest(`${AUTH_BASE}/register-technician`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(technicianData)
    });
  },

  // Refresh Token Flow
  refreshToken: async (accessToken, refreshToken) => {
    return apiRequest(`${AUTH_BASE}/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken, refreshToken })
    });
  },

  // Revoke Refresh Token / Logout
  revokeToken: async (refreshToken) => {
    return apiRequest(`${AUTH_BASE}/revoke-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
  },

  logout: async () => {
    return apiRequest(`${AUTH_BASE}/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
  },

  // 2-Factor Authentication (2FA)
  verifyTwoFactor: async (email, code) => {
    return apiRequest(`${AUTH_BASE}/2fa/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code })
    });
  },

  toggleTwoFactor: async () => {
    return apiRequest(`${AUTH_BASE}/2fa/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
  },

  // Email Confirmation & Forgot/Reset Password
  sendEmailConfirmation: async (email) => {
    return apiRequest(`${AUTH_BASE}/send-email-confirmation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
  },

  confirmEmail: async (email, token) => {
    return apiRequest(`${AUTH_BASE}/confirm-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, token })
    });
  },

  forgotPassword: async (email) => {
    return apiRequest(`${AUTH_BASE}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
  },

  resetPassword: async (resetData) => {
    return apiRequest(`${AUTH_BASE}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resetData)
    });
  },

  // Google OAuth Login
  googleLogin: async (idToken, role = 'CUSTOMER') => {
    return apiRequest(`${AUTH_BASE}/google-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken, role })
    });
  },

  // Current User Profile
  getMe: async () => {
    return apiRequest(`${AUTH_BASE}/me`, {
      method: 'GET'
    });
  }
};
