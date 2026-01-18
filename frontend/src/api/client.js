/**
 * Base API client with credentials for cookie-based authentication
 */

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Makes an API request with credentials included for cookie auth
 * @param {string} endpoint - API endpoint (e.g., '/auth/me')
 * @param {object} options - Fetch options
 * @returns {Promise<any>} Response data
 * @throws {Error} On network or HTTP errors
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;

  const config = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Request failed');
  }

  // Handle empty responses (e.g., 204 No Content)
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }

  return null;
}

/**
 * Makes a GET request
 * @param {string} endpoint - API endpoint
 * @returns {Promise<any>} Response data
 */
export function get(endpoint) {
  return apiRequest(endpoint, { method: 'GET' });
}

/**
 * Makes a POST request
 * @param {string} endpoint - API endpoint
 * @param {object} body - Request body
 * @returns {Promise<any>} Response data
 */
export function post(endpoint, body) {
  return apiRequest(endpoint, { method: 'POST', body });
}

export { API_URL };
