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

export async function authFetch(url, options = {}) {
  return fetch(url, options);
}
