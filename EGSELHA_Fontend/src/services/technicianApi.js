// src/services/technicianApi.js
import { API_ORIGIN, authFetch } from './apiClient';

const BASE_URL = `${API_ORIGIN}/api/Technicians`;

export const technicianApi = {
  // 1. جلب بيانات الـ Dashboard
  getDashboard: async () => {
    const res = await authFetch(`${BASE_URL}/dashboard`);
    return await res.json();
  },

  // 2. جلب الحجوزات مع الفلترة والبحث
  getJobs: async (status = '', search = '') => {
    const query = new URLSearchParams();
    if (status && status !== 'All') query.append('status', status);
    if (search) query.append('search', search);

    const res = await authFetch(`${BASE_URL}/jobs?${query.toString()}`);
    return await res.json();
  },

  // 3. جلب تفاصيل حجز معين
  getJobDetails: async (id) => {
    const res = await authFetch(`${BASE_URL}/jobs/${encodeURIComponent(id)}`);
    return await res.json();
  },

  // 4. تحديث حالة الحجز (On The Way, Arrived, In Progress, Completed)
  updateJobStatus: async (id, newStatus) => {
    const res = await authFetch(`${BASE_URL}/jobs/${encodeURIComponent(id)}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.message || 'Failed to update job status.');
    }
    return data;
  },

  // 5. جلب الأرباح والماليات
  getEarnings: async (range = '7d') => {
    const res = await authFetch(`${BASE_URL}/earnings?range=${encodeURIComponent(range)}`);
    return await res.json();
  },

  // 6. جلب وحفظ الملف الشخصي (Profile)
  getProfile: async () => {
    const res = await authFetch(`${BASE_URL}/profile`);
    return await res.json();
  },
  updateProfile: async (profileData) => {
    const res = await authFetch(`${BASE_URL}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    });
    return await res.json();
  },

  // 7. جلب وحفظ الإعدادات (Settings)
  getSettings: async () => {
    const res = await authFetch(`${BASE_URL}/settings`);
    return await res.json();
  },
  updateSettings: async (settingsData) => {
    const res = await authFetch(`${BASE_URL}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settingsData),
    });
    return await res.json();
  },

  // 8. الإشعارات
  getNotifications: async () => {
    const res = await authFetch(`${BASE_URL}/notifications`);
    return await res.json();
  },
  markAllNotificationsRead: async () => {
    const res = await authFetch(`${BASE_URL}/notifications/read-all`, {
      method: 'POST',
    });
    return await res.json();
  },

  // ==========================================
  // Core Technician Specification Behaviors
  // ==========================================

  // 1. تحديث الموقع الحي (GPS)
  updateLocation: async (latitude, longitude) => {
    const res = await authFetch(`${BASE_URL}/location`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latitude, longitude }),
    });
    return await res.json();
  },

  // 2. تفعيل / إيقاف توفر الفني (Availability)
  toggleAvailability: async (isOnline) => {
    const res = await authFetch(`${BASE_URL}/availability`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(isOnline),
    });
    return await res.json();
  },

  // 3. تأكيد الوصول لموقع العميل (markArrived)
  markArrived: async (id) => {
    const res = await authFetch(`${BASE_URL}/jobs/${encodeURIComponent(id)}/arrived`, {
      method: 'PUT',
    });
    return await res.json();
  },

  // 4. رفع صور الفحص والجودة (PhotoQA: 4 قبل و 4 بعد)
  uploadQAPhoto: async (id, photoData) => {
    const res = await authFetch(`${BASE_URL}/jobs/${encodeURIComponent(id)}/photos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(photoData),
    });
    return await res.json();
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
      throw new Error(data?.message || 'Failed to upload QA photo');
    }
    return data;
  },
  getQAPhotos: async (id) => {
    const res = await authFetch(`${BASE_URL}/jobs/${encodeURIComponent(id)}/photos`);
    return await res.json();
  },

  // 5. اقتراح تنظيف إضافي بعد الفحص (InspectionUpsell)
  proposeUpsell: async (id, upsellData) => {
    const res = await authFetch(`${BASE_URL}/jobs/${encodeURIComponent(id)}/upsell`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(upsellData),
    });
    return await res.json();
  },
  getUpsell: async (id) => {
    const res = await authFetch(`${BASE_URL}/jobs/${encodeURIComponent(id)}/upsell`);
    return await res.json();
  },

  // 6. طلب سحب الأرباح (Request Payout)
  requestPayout: async (payoutData) => {
    const res = await authFetch(`${BASE_URL}/payout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payoutData),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.message || 'Failed to request payout');
    }
    return data;
  },
  getPayouts: async () => {
    const res = await authFetch(`${BASE_URL}/payouts`);
    return await res.json();
  },

  // 7. استقبال والرد على عروض الغسيل خلال 45 ثانية (Job Offers)
  getJobOffers: async () => {
    const res = await authFetch(`${BASE_URL}/offers`);
    return await res.json();
  },
  respondToJobOffer: async (offerId, accept) => {
    const res = await authFetch(`${BASE_URL}/offers/${encodeURIComponent(offerId)}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accept }),
    });
    return await res.json();
  }
};
