import axios from 'axios'
import { useAuthStore } from '../store/authStore.js'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const devplanService = {
  download: async (predictionId, filename) => {
    const token = useAuthStore.getState().token
    const response = await axios.get(`${BASE}/devplan/${predictionId}`, {
      responseType: 'blob',
      headers: { Authorization: `Bearer ${token}` },
    })
    const url  = window.URL.createObjectURL(new Blob([response.data], { type:'application/pdf' }))
    const link = document.createElement('a')
    link.href  = url
    link.setAttribute('download', filename || 'development-plan.pdf')
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },
}
