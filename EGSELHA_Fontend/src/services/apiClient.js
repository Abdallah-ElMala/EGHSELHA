// src/services/apiClient.js
export const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || 'http://localhost:58300';

export function resolveAssetUrl(url) {
  if (!url || typeof url !== 'string') return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  if (url.startsWith('/')) {
    return `${API_ORIGIN}${url}`;
  }
  return url;
}

let isRefreshing = false;
let refreshSubscribers = [];

function onRefreshed(newToken) {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback) {
  refreshSubscribers.push(callback);
}

export async function authFetch(url, options = {}) {
  const headers = new Headers(options.headers || {});

  // Attach JWT Bearer Token if present in localStorage
  const token = localStorage.getItem('jwt_token');
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Also pass current user ID header as fallback for legacy controllers if available
  const userJson = localStorage.getItem('auth_user');
  if (userJson) {
    try {
      const user = JSON.parse(userJson);
      if (user.id) {
        if (user.role?.toUpperCase() === 'TECHNICIAN' && !headers.has('X-Technician-Id')) {
          headers.set('X-Technician-Id', user.id);
        } else if (!headers.has('X-Customer-Id')) {
          headers.set('X-Customer-Id', user.id);
        }
      }
    } catch { }
  }

  return fetch(url, { ...options, headers });
}

export async function apiRequest(url, options = {}) {
  let res = await authFetch(url, options);

  // Auto-refresh token if 401 Unauthorized occurs and we have a refresh token
  if (res.status === 401 && !url.includes('/api/auth/login') && !url.includes('/api/auth/refresh-token')) {
    const oldAccessToken = localStorage.getItem('jwt_token');
    const refreshToken = localStorage.getItem('refresh_token');

    if (oldAccessToken && refreshToken) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshRes = await fetch(`${API_ORIGIN}/api/auth/refresh-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accessToken: oldAccessToken, refreshToken })
          });

          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            if (refreshData.token) {
              localStorage.setItem('jwt_token', refreshData.token);
              if (refreshData.refreshToken) {
                localStorage.setItem('refresh_token', refreshData.refreshToken);
              }
              onRefreshed(refreshData.token);
            }
          } else {
            // Refresh token expired or revoked - clear tokens
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('auth_user');
          }
        } catch {
          localStorage.removeItem('jwt_token');
          localStorage.removeItem('refresh_token');
        } finally {
          isRefreshing = false;
        }
      }

      // Retry request with updated token
      const retryPromise = new Promise((resolve) => {
        addRefreshSubscriber(async (newToken) => {
          const retryHeaders = new Headers(options.headers || {});
          retryHeaders.set('Authorization', `Bearer ${newToken}`);
          resolve(fetch(url, { ...options, headers: retryHeaders }));
        });
      });

      res = await retryPromise;
    }
  }

  const contentType = res.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const data = isJson ? await res.json().catch(() => ({})) : await res.text().catch(() => '');

  if (!res.ok) {
    const errorMsg = data?.message || (typeof data === 'string' && data ? data : `Request failed with status ${res.status}`);
    const err = new Error(errorMsg);
    err.status = res.status;
    err.data = data;
    err.errors = data?.errors || {};
    throw err;
  }

  return data;
}
