// src/services/customerApi.js
import { API_ORIGIN, authFetch } from './apiClient';

const BASE_URL = `${API_ORIGIN}/api/Customers`;

export const customerApi = {
  // جلب الكتالوج الحي (الباقات، الإضافات، مناطق الخدمة)
  getCatalog: async () => {
    const res = await authFetch(`${BASE_URL}/catalog`);
    return await res.json();
  },

  // 1. جلب بيانات العميل والرصيد ونقاط الولاء والعناوين
  getProfile: async () => {
    const res = await authFetch(`${BASE_URL}/profile`);
    return await res.json();
  },

  // تحديث بيانات العميل الشخصية (الاسم، الهاتف، البريد)
  updateProfile: async (profileData) => {
    const res = await authFetch(`${BASE_URL}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    });
    return await res.json();
  },

  // 2. تسجيل سيارة جديدة (addVehicle)
  addVehicle: async (vehicleData) => {
    const res = await authFetch(`${BASE_URL}/vehicles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vehicleData),
    });
    return await res.json();
  },

  // حذف سيارة من الجراج
  deleteVehicle: async (vehicleId) => {
    const res = await authFetch(`${BASE_URL}/vehicles/${encodeURIComponent(vehicleId)}`, {
      method: 'DELETE',
    });
    return await res.json();
  },

  // جلب سيارات العميل المسجلة
  getVehicles: async () => {
    const res = await authFetch(`${BASE_URL}/vehicles`);
    return await res.json();
  },

  // 3. إنشاء حجز جديد لغسيل السيارة (createBooking)
  createBooking: async (bookingParams) => {
    const res = await authFetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingParams),
    });
    return await res.json();
  },

  // جلب حجوزات العميل
  getBookings: async () => {
    const res = await authFetch(`${BASE_URL}/bookings`);
    return await res.json();
  },

  // جلب تفاصيل حجز
  getBookingDetails: async (bookingId) => {
    const res = await authFetch(`${BASE_URL}/bookings/${encodeURIComponent(bookingId)}`);
    return await res.json();
  },

  // إلغاء أو حذف حجز (مسموح دائماً قبل قبول الفني، وخلال دقيقتين بعد قبول الفني)
  cancelBooking: async (bookingId) => {
    const res = await authFetch(`${BASE_URL}/bookings/${encodeURIComponent(bookingId)}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    return { ok: res.ok, ...data };
  },

  // شحن رصيد المحفظة في قاعدة البيانات
  topUpWallet: async (amount = 500) => {
    const res = await authFetch(`${BASE_URL}/wallet/topup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || 'Failed to top up wallet');
    return data;
  },

  // 4. دفع العربون الإجباري 200 جنيه لتأكيد الحجز (payDeposit)
  payDeposit: async (bookingId, paymentMethod = 1) => {
    const res = await authFetch(`${BASE_URL}/bookings/${encodeURIComponent(bookingId)}/deposit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentMethod }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || 'Failed to process deposit');
    return data;
  },

  // 5. قبول أو رفض الترقية/التكلفة الإضافية المقترحة من الفني (approveUpsell)
  approveUpsell: async (upsellId, decision) => {
    const res = await authFetch(`${BASE_URL}/upsells/${encodeURIComponent(upsellId)}/decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision }),
    });
    return await res.json();
  },

  // 6. تقييم الخدمة وإرسال إكرامية (submitReview)
  submitReview: async (bookingId, reviewData) => {
    const res = await authFetch(`${BASE_URL}/bookings/${encodeURIComponent(bookingId)}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewData),
    });
    return await res.json();
  },

  // جلب جميع تقييمات العميل
  getReviews: async () => {
    const res = await authFetch(`${BASE_URL}/reviews`);
    return await res.json();
  },

  // 7. فتح شكوى رسمية خلال 12 ساعة من انتهاء الغسيل (fileDispute)
  fileDispute: async (bookingId, disputeData) => {
    const res = await authFetch(`${BASE_URL}/bookings/${encodeURIComponent(bookingId)}/disputes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(disputeData),
    });
    return await res.json();
  },

  // إضافة عنوان مفضل
  addSavedAddress: async (address) => {
    const res = await authFetch(`${BASE_URL}/addresses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(address),
    });
    return await res.json();
  },

  // حذف عنوان مفضل
  deleteAddress: async (address) => {
    const res = await authFetch(`${BASE_URL}/addresses`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address }),
    });
    return await res.json();
  }
};
