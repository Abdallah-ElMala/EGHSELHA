// src/services/customerApi.js
const BASE_URL = 'http://localhost:58300/api/Customers';

export const customerApi = {
  // 1. جلب بيانات العميل والرصيد ونقاط الولاء والعناوين
  getProfile: async () => {
    const res = await fetch(`${BASE_URL}/profile`);
    return await res.json();
  },

  // تحديث بيانات العميل الشخصية (الاسم، الهاتف، البريد)
  updateProfile: async (profileData) => {
    const res = await fetch(`${BASE_URL}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    });
    return await res.json();
  },

  // 2. تسجيل سيارة جديدة (addVehicle)
  addVehicle: async (vehicleData) => {
    const res = await fetch(`${BASE_URL}/vehicles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vehicleData),
    });
    return await res.json();
  },

  // حذف سيارة من الجراج
  deleteVehicle: async (vehicleId) => {
    const res = await fetch(`${BASE_URL}/vehicles/${encodeURIComponent(vehicleId)}`, {
      method: 'DELETE',
    });
    return await res.json();
  },

  // جلب سيارات العميل المسجلة
  getVehicles: async () => {
    const res = await fetch(`${BASE_URL}/vehicles`);
    return await res.json();
  },

  // 3. إنشاء حجز جديد لغسيل السيارة (createBooking)
  createBooking: async (bookingParams) => {
    const res = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingParams),
    });
    return await res.json();
  },

  // جلب حجوزات العميل
  getBookings: async () => {
    const res = await fetch(`${BASE_URL}/bookings`);
    return await res.json();
  },

  // جلب تفاصيل حجز
  getBookingDetails: async (bookingId) => {
    const res = await fetch(`${BASE_URL}/bookings/${encodeURIComponent(bookingId)}`);
    return await res.json();
  },

  // 4. دفع العربون الإجباري 200 جنيه لتأكيد الحجز (payDeposit)
  payDeposit: async (bookingId, paymentMethod = 0) => {
    const res = await fetch(`${BASE_URL}/bookings/${encodeURIComponent(bookingId)}/deposit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentMethod }),
    });
    return await res.json();
  },

  // 5. قبول أو رفض الترقية/التكلفة الإضافية المقترحة من الفني (approveUpsell)
  approveUpsell: async (upsellId, decision) => {
    const res = await fetch(`${BASE_URL}/upsells/${encodeURIComponent(upsellId)}/decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision }),
    });
    return await res.json();
  },

  // 6. تقييم الخدمة وإرسال إكرامية (submitReview)
  submitReview: async (bookingId, reviewData) => {
    const res = await fetch(`${BASE_URL}/bookings/${encodeURIComponent(bookingId)}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewData),
    });
    return await res.json();
  },

  // جلب جميع تقييمات العميل
  getReviews: async () => {
    const res = await fetch(`${BASE_URL}/reviews`);
    return await res.json();
  },

  // 7. فتح شكوى رسمية خلال 12 ساعة من انتهاء الغسيل (fileDispute)
  fileDispute: async (bookingId, disputeData) => {
    const res = await fetch(`${BASE_URL}/bookings/${encodeURIComponent(bookingId)}/disputes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(disputeData),
    });
    return await res.json();
  },

  // إضافة عنوان مفضل
  addSavedAddress: async (address) => {
    const res = await fetch(`${BASE_URL}/addresses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(address),
    });
    return await res.json();
  },

  // حذف عنوان مفضل
  deleteAddress: async (address) => {
    const res = await fetch(`${BASE_URL}/addresses`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address }),
    });
    return await res.json();
  }
};
