import { create } from 'zustand'

export const usePredictionStore = create((set) => ({
  predictions: [],
  currentPrediction: null,
  loading: false,
  addPrediction: (prediction) => set((state) => ({ predictions: [prediction, ...state.predictions] })),
  setCurrentPrediction: (prediction) => set({ currentPrediction: prediction }),
  setLoading: (loading) => set({ loading }),
}))
