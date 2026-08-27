import api from './api.js'
export const authService = {
  login:          (email,password) => api.post('/auth/login',{email,password}),
  register:       (firstName,lastName,email,password) => api.post('/auth/register',{firstName,lastName,email,password}),
  getCurrentUser: () => api.get('/auth/me'),
}
