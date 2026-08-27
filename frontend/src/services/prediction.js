import api from './api.js'
export const predictionService = {
  predict:       (employeeId,jobRole,experience,skills) => api.post('/predictions',{employeeId,jobRole,experience,skills}),
  getByEmployee: (employeeId) => api.get(`/predictions/employee/${employeeId}`),
  getHistory:    (limit=10)   => api.get(`/predictions/history?limit=${limit}`),
  getMine:       ()           => api.get('/predictions/mine'),
}
