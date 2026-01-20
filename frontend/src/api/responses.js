import { apiRequest } from './client';

export const responsesApi = {
  // Get survey for rendering (public endpoint)
  getSurvey: (slug) => apiRequest(`/surveys/${slug}/public`),

  // Get user's existing response
  getMyResponse: (slug) => apiRequest(`/surveys/${slug}/my-response`),

  // Submit or update response (upsert)
  submit: (slug, data) => apiRequest(`/surveys/${slug}/respond`, {
    method: 'POST',
    body: data,
  }),
};
