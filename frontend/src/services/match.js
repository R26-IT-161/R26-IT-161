import api from './api.js'
export const matchService = {
  findMatches: (jobRole) => api.get(`/match?jobRole=${encodeURIComponent(jobRole)}`),
}
