import { apiRequest } from './client';

export const authApi = {
  me: () => apiRequest('/auth/me'),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
};
