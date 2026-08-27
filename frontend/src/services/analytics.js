import api from './api.js'
export const analyticsService = {
  getMetrics:        () => api.get('/analytics'),
  getSkillGaps:      () => api.get('/analytics/skill-gaps'),
  getTrends:         (days=30)  => api.get(`/analytics/trends?days=${days}`),
  getReadinessTrend: (months=6) => api.get(`/analytics/readiness-trend?months=${months}`),
  getDueForReview:   () => api.get('/analytics/due-for-review'),
  getMyStats:        () => api.get('/analytics/me'),
}
