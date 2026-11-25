// src/services/customerApi.js
import { API_ORIGIN, apiRequest } from './apiClient';

const BASE_URL = `${API_ORIGIN}/api/Customers`;

export const customerApi = {
  // Fetch live catalog (packages, add-ons, service areas)
  getCatalog: async () => {
    return await apiRequest(`${BASE_URL}/catalog`);
  },

  // 1. Fetch customer profile, balance, loyalty points, and addresses
  getProfile: async () => {
    return await apiRequest(`${BASE_URL}/profile`);
  },

  // Update customer personal info (name, phone, email)
  updateProfile: async (profileData) => {
    return await apiRequest(`${BASE_URL}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    });
  },

  // 2. Register new vehicle (addVehicle)
  addVehicle: async (vehicleData) => {
    return await apiRequest(`${BASE_URL}/vehicles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vehicleData),
    });
  },

  // Delete vehicle from garage
  deleteVehicle: async (vehicleId) => {
    return await apiRequest(`${BASE_URL}/vehicles/${encodeURIComponent(vehicleId)}`, {
      method: 'DELETE',
    });
  },

  // Get customer registered vehicles
  getVehicles: async () => {
    return await apiRequest(`${BASE_URL}/vehicles`);
  },

  // 3. Create new wash booking (createBooking)
  createBooking: async (bookingParams) => {
    return await apiRequest(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingParams),
    });
  },

  // Get customer bookings
  getBookings: async () => {
    return await apiRequest(`${BASE_URL}/bookings`);
  },

  // Get booking details
  getBookingDetails: async (bookingId) => {
    return await apiRequest(`${BASE_URL}/bookings/${encodeURIComponent(bookingId)}`);
  },

  // Cancel or delete booking
  cancelBooking: async (bookingId) => {
    return await apiRequest(`${BASE_URL}/bookings/${encodeURIComponent(bookingId)}`, {
      method: 'DELETE',
    });
  },

  // Top up wallet balance
  topUpWallet: async (amount = 500) => {
    return await apiRequest(`${BASE_URL}/wallet/topup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });
  },

  // 4. Pay mandatory 200 EGP deposit to confirm booking (payDeposit)
  payDeposit: async (bookingId, paymentMethod = 1) => {
    return await apiRequest(`${BASE_URL}/bookings/${encodeURIComponent(bookingId)}/deposit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentMethod }),
    });
  },

  // 5. Accept or decline upsell / additional service proposed by technician (approveUpsell)
  approveUpsell: async (upsellId, decision) => {
    return await apiRequest(`${BASE_URL}/bookings/${encodeURIComponent(upsellId)}/upsell`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision }),
    });
  },

  // 6. Review service and add tip (submitReview)
  submitReview: async (bookingId, reviewData) => {
    return await apiRequest(`${BASE_URL}/bookings/${encodeURIComponent(bookingId)}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewData),
    });
  },

  // Get all customer reviews
  getReviews: async () => {
    return await apiRequest(`${BASE_URL}/reviews`);
  },

  // 7. File official dispute within 12h of completion (fileDispute)
  fileDispute: async (bookingId, disputeData) => {
    return await apiRequest(`${BASE_URL}/bookings/${encodeURIComponent(bookingId)}/dispute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(disputeData),
    });
  },

  // Add saved address
  addSavedAddress: async (address) => {
    const payload = typeof address === 'string' ? { address } : address;
    return await apiRequest(`${BASE_URL}/addresses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  // Delete saved address
  deleteAddress: async (address) => {
    return await apiRequest(`${BASE_URL}/addresses`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address }),
    });
  }
};
