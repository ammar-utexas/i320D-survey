import { apiRequest } from './client';

export const surveysApi = {
  // List all surveys for current admin
  list: () => apiRequest('/surveys'),

  // Get active surveys for respondents
  getActive: () => apiRequest('/surveys/active'),

  // Get single survey details
  get: (id) => apiRequest(`/surveys/${id}`),

  // Create survey from JSON config
  create: (config) => apiRequest('/surveys', {
    method: 'POST',
    body: config,
  }),

  // Update survey metadata
  update: (id, data) => apiRequest(`/surveys/${id}`, {
    method: 'PATCH',
    body: data,
  }),

  // Soft-delete survey
  delete: (id) => apiRequest(`/surveys/${id}`, {
    method: 'DELETE',
  }),

  // Duplicate survey
  duplicate: (id, newTitle) => apiRequest(`/surveys/${id}/duplicate`, {
    method: 'POST',
    body: { title: newTitle },
  }),

  // Get survey responses
  getResponses: (id, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/surveys/${id}/responses${query ? `?${query}` : ''}`);
  },

  // Export responses
  export: (id, format) => apiRequest(`/surveys/${id}/export?format=${format}`),
};
