/**
 * Auth API module - handles login, logout, and user session
 */

import { API_URL, apiRequest } from './client';

export const authApi = {
  /**
   * Initiates GitHub OAuth login by redirecting to backend
   * The backend will redirect to GitHub, then back to frontend with session cookie
   */
  login() {
    window.location.href = `${API_URL}/auth/github`;
  },

  /**
   * Logs out the current user
   * Backend clears the session cookie
   * @returns {Promise<void>}
   */
  async logout() {
    await apiRequest('/auth/logout', { method: 'POST' });
  },

  /**
   * Fetches the current authenticated user
   * @returns {Promise<object|null>} User object or null if not authenticated
   */
  async me() {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          return null;
        }
        throw new Error('Failed to fetch user');
      }

      return response.json();
    } catch {
      return null;
    }
  },
};
