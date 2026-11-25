// src/services/technicianApi.js
import { API_ORIGIN, authFetch, apiRequest } from './apiClient';

const BASE_URL = `${API_ORIGIN}/api/Technicians`;

export const technicianApi = {
  // 1. Fetch Dashboard data
  getDashboard: async () => {
    return await apiRequest(`${BASE_URL}/dashboard`);
  },

  // 2. Fetch Jobs with filtering and search
  getJobs: async (status = '', search = '') => {
    const query = new URLSearchParams();
    if (status && status !== 'All') query.append('status', status);
    if (search) query.append('search', search);

    return await apiRequest(`${BASE_URL}/jobs?${query.toString()}`);
  },

  // 3. Fetch specific job details
  getJobDetails: async (id) => {
    return await apiRequest(`${BASE_URL}/jobs/${encodeURIComponent(id)}`);
  },

  // 4. Update job status (On The Way, Arrived, In Progress, Completed)
  updateJobStatus: async (id, newStatus) => {
    return await apiRequest(`${BASE_URL}/jobs/${encodeURIComponent(id)}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
  },

  // 5. Fetch earnings and financials
  getEarnings: async (range = '7d') => {
    return await apiRequest(`${BASE_URL}/earnings?range=${encodeURIComponent(range)}`);
  },

  // 6. Fetch and save Profile
  getProfile: async () => {
    return await apiRequest(`${BASE_URL}/profile`);
  },
  updateProfile: async (profileData) => {
    return await apiRequest(`${BASE_URL}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    });
  },

  // 7. Fetch and save Settings
  getSettings: async () => {
    return await apiRequest(`${BASE_URL}/settings`);
  },
  updateSettings: async (settingsData) => {
    return await apiRequest(`${BASE_URL}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settingsData),
    });
  },

  // 8. Notifications
  getNotifications: async () => {
    return await apiRequest(`${BASE_URL}/notifications`);
  },
  markAllNotificationsRead: async () => {
    return await apiRequest(`${BASE_URL}/notifications/read-all`, {
      method: 'POST',
    });
  },

  // ==========================================
  // Core Technician Specification Behaviors
  // ==========================================

  // 1. Update live GPS location
  updateLocation: async (latitude, longitude) => {
    return await apiRequest(`${BASE_URL}/location`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latitude, longitude }),
    });
  },

  // 2. Toggle technician availability
  toggleAvailability: async (isOnline) => {
    return await apiRequest(`${BASE_URL}/availability`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(isOnline),
    });
  },

  // 3. Mark arrived at customer location (markArrived)
  markArrived: async (id) => {
    return await apiRequest(`${BASE_URL}/jobs/${encodeURIComponent(id)}/arrived`, {
      method: 'PUT',
    });
  },

  // 4. Upload inspection and quality photos (PhotoQA: 4 before and 4 after)
  uploadQAPhoto: async (id, photoData) => {
    return await apiRequest(`${BASE_URL}/jobs/${encodeURIComponent(id)}/photos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(photoData),
    });
  },
  uploadQAPhotoFile: async (id, file, photoType = 'BEFORE', category = 'FRONT', latitude = 0, longitude = 0) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('photoType', photoType);
    formData.append('category', category);
    formData.append('latitude', String(latitude));
    formData.append('longitude', String(longitude));

    const res = await authFetch(`${BASE_URL}/jobs/${encodeURIComponent(id)}/photos/upload`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data?.message || 'Failed to upload QA photo');
      err.errors = data?.errors || {};
      throw err;
    }
    return data;
  },
  getQAPhotos: async (id) => {
    return await apiRequest(`${BASE_URL}/jobs/${encodeURIComponent(id)}/photos`);
  },

  // 5. Propose additional detailing service (InspectionUpsell)
  proposeUpsell: async (id, upsellData) => {
    return await apiRequest(`${BASE_URL}/jobs/${encodeURIComponent(id)}/upsell`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(upsellData),
    });
  },
  getUpsell: async (id) => {
    return await apiRequest(`${BASE_URL}/jobs/${encodeURIComponent(id)}/upsell`);
  },

  // 6. Request earnings payout (Request Payout)
  requestPayout: async (payoutData) => {
    return await apiRequest(`${BASE_URL}/payout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payoutData),
    });
  },
  getPayouts: async () => {
    return await apiRequest(`${BASE_URL}/payouts`);
  },

  // 7. Receive and respond to job offers within 45 seconds (Job Offers)
  getJobOffers: async () => {
    return await apiRequest(`${BASE_URL}/offers`);
  },
  respondToJobOffer: async (offerId, accept) => {
    return await apiRequest(`${BASE_URL}/offers/${encodeURIComponent(offerId)}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accept }),
    });
  }
};
