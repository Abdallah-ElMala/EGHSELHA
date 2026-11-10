import { API_ORIGIN, authFetch } from './apiClient';

const BASE_URL = `${API_ORIGIN}/api/Admins`;

async function request(url, options = {}) {
  const res = await authFetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || `Request failed (${res.status})`);
  }
  return data;
}

export const adminApi = {
  getDashboard: () => request(`${BASE_URL}/dashboard`),

  getBookings: (status = '', search = '') => {
    const q = new URLSearchParams();
    if (status && status !== 'All') q.append('status', status);
    if (search) q.append('search', search);
    const qs = q.toString();
    return request(`${BASE_URL}/bookings${qs ? `?${qs}` : ''}`);
  },
  assignTechnician: (bookingId, technicianId) =>
    request(`${BASE_URL}/bookings/${encodeURIComponent(bookingId)}/assign`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ technicianId }),
    }),
  updateBookingStatus: (bookingId, status) =>
    request(`${BASE_URL}/bookings/${encodeURIComponent(bookingId)}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }),

  getTechnicians: () => request(`${BASE_URL}/technicians`),
  toggleTechnicianAvailability: (techId, isOnline) =>
    request(`${BASE_URL}/technicians/${encodeURIComponent(techId)}/availability`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(isOnline),
    }),
  reviewTechnicianApplication: (techId, decision) =>
    request(`${BASE_URL}/technicians/${encodeURIComponent(techId)}/application`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision }),
    }),

  getCustomers: () => request(`${BASE_URL}/customers`),

  getCatalog: () => request(`${BASE_URL}/catalog`),
  updatePackage: (packageId, dto) =>
    request(`${BASE_URL}/packages/${encodeURIComponent(packageId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    }),
  updateAddOn: (addOnId, dto) =>
    request(`${BASE_URL}/addons/${encodeURIComponent(addOnId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    }),

  getZones: () => request(`${BASE_URL}/zones`),
  createZone: (dto) =>
    request(`${BASE_URL}/zones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    }),
  updateZone: (zoneId, dto) =>
    request(`${BASE_URL}/zones/${encodeURIComponent(zoneId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    }),

  getDisputes: () => request(`${BASE_URL}/disputes`),
  resolveDispute: (disputeId, dto) =>
    request(`${BASE_URL}/disputes/${encodeURIComponent(disputeId)}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    }),

  getPayouts: () => request(`${BASE_URL}/payouts`),
  processPayout: (payoutId, approve) =>
    request(`${BASE_URL}/payouts/${encodeURIComponent(payoutId)}/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approve }),
    }),
};
