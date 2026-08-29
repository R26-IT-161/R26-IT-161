import api from './api.js'
export const jobsService = {
  getJobs: () => api.get('/jobs').then(r => r.jobs || []),
  getJobSkills: (job) => api.get(`/jobs/skills?job=${encodeURIComponent(job)}`).then(r => r.requirements || {}),
}
