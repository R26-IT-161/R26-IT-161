import axios from 'axios'

const API_BASE_URL = 'http://localhost:5000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const predict = (jobRole, experience, skills) => {
  return api.post('/predict', {
    job_role: jobRole,
    experience: experience,
    skills: skills,
  })
}

export default api
