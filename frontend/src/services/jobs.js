import api from './api.js'
export const jobsService = {
  getJobs: () => api.get('/jobs').then(r => r.jobs || []),
}
