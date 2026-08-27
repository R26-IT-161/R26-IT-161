import { useState } from 'react'
import { useAuthStore } from '../store/authStore.js'
import { authService } from '../services/auth.js'

export const useAuth = () => {
  const { user, token, setUser, setToken, logout, isAuthenticated } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const isHR       = () => ['admin','hr_manager','supervisor'].includes(user?.role)
  const isEmployee = () => user?.role === 'employee'

  const login = async (email, password) => {
    setLoading(true); setError(null)
    try {
      const { user: userData, token: newToken } = await authService.login(email, password)
      setUser(userData); setToken(newToken)
      return { success: true, role: userData.role }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Login failed'
      setError(errorMsg); return { success: false, error: errorMsg }
    } finally { setLoading(false) }
  }

  const register = async (firstName, lastName, email, password) => {
    setLoading(true); setError(null)
    try {
      const { user: userData, token: newToken } = await authService.register(firstName, lastName, email, password)
      setUser(userData); setToken(newToken)
      return { success: true, role: userData.role }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Registration failed'
      setError(errorMsg); return { success: false, error: errorMsg }
    } finally { setLoading(false) }
  }

  return { user, token, isAuthenticated: isAuthenticated(), loading, error, login, register, logout, isHR, isEmployee }
}
