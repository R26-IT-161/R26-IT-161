import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { asyncHandler }   from '../middleware/errorHandler.js'
import { Prediction }     from '../models/Prediction.js'
import { getRecommendations } from '../utils/recommendations.js'

const router = Router()
router.use(authMiddleware)

// GET /api/recommendations/:predictionId
router.get('/:predictionId', asyncHandler(async (req, res) => {
  const prediction = await Prediction.findById(req.params.predictionId)
  if (!prediction) return res.status(404).json({ error: 'Prediction not found' })
  res.json({ recommendations: getRecommendations(prediction.gaps || []) })
}))

export default router
