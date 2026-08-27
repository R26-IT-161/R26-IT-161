import api from './api.js'
export const recommendationsService = {
  getForPrediction: (predictionId) => api.get(`/recommendations/${predictionId}`).then(r => r.recommendations || []),
}
