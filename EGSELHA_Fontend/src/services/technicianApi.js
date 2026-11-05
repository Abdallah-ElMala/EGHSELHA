// src/api/technicianApi.js
const BASE_URL = 'https://localhost:58299/api/Technicians';

export const technicianApi = {
  // 1. جلب بيانات الـ Dashboard
  getDashboard: async () => {
    const res = await fetch(`${BASE_URL}/dashboard`);
    return await res.json();
  },

  // 2. جلب الحجوزات مع الفلترة والبحث
  getJobs: async (status = '', search = '') => {
    const query = new URLSearchParams();
    if (status && status !== 'All') query.append('status', status);
    if (search) query.append('search', search);

    const res = await fetch(`${BASE_URL}/jobs?${query.toString()}`);
    return await res.json();
  },

  // 3. جلب تفاصيل حجز معين
  getJobDetails: async (id) => {
    const res = await fetch(`${BASE_URL}/jobs/${encodeURIComponent(id)}`);
    return await res.json();
  },

  // 4. تحديث حالة الحجز (On The Way, In Progress, Completed)
  updateJobStatus: async (id, newStatus) => {
    const res = await fetch(`${BASE_URL}/jobs/${encodeURIComponent(id)}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    return await res.json();
  },

  // 5. جلب الأرباح والماليات
  getEarnings: async () => {
    const res = await fetch(`${BASE_URL}/earnings`);
    return await res.json();
  },

  // 6. جلب وحفظ الملف الشخصي (Profile)
  getProfile: async () => {
    const res = await fetch(`${BASE_URL}/profile`);
    return await res.json();
  },
  updateProfile: async (profileData) => {
    const res = await fetch(`${BASE_URL}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    });
    return await res.json();
  },

  // 7. جلب وحفظ الإعدادات (Settings)
  getSettings: async () => {
    const res = await fetch(`${BASE_URL}/settings`);
    return await res.json();
  },
  updateSettings: async (settingsData) => {
    const res = await fetch(`${BASE_URL}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settingsData),
    });
    return await res.json();
  },

  // 8. الإشعارات
  getNotifications: async () => {
    const res = await fetch(`${BASE_URL}/notifications`);
    return await res.json();
  },
  markAllNotificationsRead: async () => {
    const res = await fetch(`${BASE_URL}/notifications/read-all`, {
      method: 'POST',
    });
    return await res.json();
  }
};