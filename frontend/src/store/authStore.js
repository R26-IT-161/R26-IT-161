import { create } from 'zustand'

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  setUser: (user) => {
    set({ user })
    if (user) localStorage.setItem('user', JSON.stringify(user))
    else localStorage.removeItem('user')
  },
  setToken: (token) => {
    set({ token })
    if (token) localStorage.setItem('token', token)
    else localStorage.removeItem('token')
  },
  logout: () => {
    set({ user: null, token: null })
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  },
  isAuthenticated: () => !!get().token,
}))
