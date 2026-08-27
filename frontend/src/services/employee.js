import api from './api.js'

// NOTE: api.js interceptor already unwraps response.data
// so api.get(...) resolves directly to the response body

export const employeeService = {
  getAll:  (page=1, limit=100) => api.get(`/employees?page=${page}&limit=${limit}`),
  getById: (id)       => api.get(`/employees/${id}`),
  getMe:   ()         => api.get('/employees/me'),
  create:  (data)     => api.post('/employees', data),
  update:  (id, data) => api.patch(`/employees/${id}`, data),
  delete:  (id)       => api.delete(`/employees/${id}`),
}
