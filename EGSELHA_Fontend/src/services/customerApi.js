// src/services/customerApi.js
import { API_ORIGIN, apiRequest } from './apiClient';

const BASE_URL = `${API_ORIGIN}/api/Customers`;

export const customerApi = {
  // جلب الكتالوج الحي (الباقات، الإضافات، مناطق الخدمة)
  getCatalog: async () => {
    return await apiRequest(`${BASE_URL}/catalog`);
  },

  // 1. جلب بيانات العميل والرصيد ونقاط الولاء والعناوين
  getProfile: async () => {
    return await apiRequest(`${BASE_URL}/profile`);
  },

  // تحديث بيانات العميل الشخصية (الاسم، الهاتف، البريد)
  updateProfile: async (profileData) => {
    return await apiRequest(`${BASE_URL}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    });
  },

  // 2. تسجيل سيارة جديدة (addVehicle)
  addVehicle: async (vehicleData) => {
    return await apiRequest(`${BASE_URL}/vehicles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vehicleData),
    });
  },

  // حذف سيارة من الجراج
  deleteVehicle: async (vehicleId) => {
    return await apiRequest(`${BASE_URL}/vehicles/${encodeURIComponent(vehicleId)}`, {
      method: 'DELETE',
    });
  },

  // جلب سيارات العميل المسجلة
  getVehicles: async () => {
    return await apiRequest(`${BASE_URL}/vehicles`);
  },

  // 3. إنشاء حجز جديد لغسيل السيارة (createBooking)
  createBooking: async (bookingParams) => {
    return await apiRequest(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingParams),
    });
  },

  // جلب حجوزات العميل
  getBookings: async () => {
    return await apiRequest(`${BASE_URL}/bookings`);
  },

  // جلب تفاصيل حجز
  getBookingDetails: async (bookingId) => {
    return await apiRequest(`${BASE_URL}/bookings/${encodeURIComponent(bookingId)}`);
  },

  // إلغاء أو حذف حجز
  cancelBooking: async (bookingId) => {
    return await apiRequest(`${BASE_URL}/bookings/${encodeURIComponent(bookingId)}`, {
      method: 'DELETE',
    });
  },

  // شحن رصيد المحفظة في قاعدة البيانات
  topUpWallet: async (amount = 500) => {
    return await apiRequest(`${BASE_URL}/wallet/topup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });
  },

  // 4. دفع العربون الإجباري 200 جنيه لتأكيد الحجز (payDeposit)
  payDeposit: async (bookingId, paymentMethod = 1) => {
    return await apiRequest(`${BASE_URL}/bookings/${encodeURIComponent(bookingId)}/deposit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentMethod }),
    });
  },

  // 5. قبول أو رفض الترقية/التكلفة الإضافية المقترحة من الفني (approveUpsell)
  approveUpsell: async (upsellId, decision) => {
    return await apiRequest(`${BASE_URL}/upsells/${encodeURIComponent(upsellId)}/decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision }),
    });
  },

  // 6. تقييم الخدمة وإرسال إكرامية (submitReview)
  submitReview: async (bookingId, reviewData) => {
    return await apiRequest(`${BASE_URL}/bookings/${encodeURIComponent(bookingId)}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewData),
    });
  },

  // جلب جميع تقييمات العميل
  getReviews: async () => {
    return await apiRequest(`${BASE_URL}/reviews`);
  },

  // 7. فتح شكوى رسمية خلال 12 ساعة من انتهاء الغسيل (fileDispute)
  fileDispute: async (bookingId, disputeData) => {
    return await apiRequest(`${BASE_URL}/bookings/${encodeURIComponent(bookingId)}/disputes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(disputeData),
    });
  },

  // إضافة عنوان مفضل
  addSavedAddress: async (address) => {
    return await apiRequest(`${BASE_URL}/addresses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(address),
    });
  },

  // حذف عنوان مفضل
  deleteAddress: async (address) => {
    return await apiRequest(`${BASE_URL}/addresses`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address }),
    });
  }
};
