import { create } from 'zustand'

export const useEmployeeStore = create((set) => ({
  employees: [],
  loading: false,
  setEmployees: (employees) => set({ employees }),
  addEmployee: (employee) => set((state) => ({ employees: [...state.employees, employee] })),
  setLoading: (loading) => set({ loading }),
}))
