import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { asyncHandler }   from '../middleware/errorHandler.js'
import { getAccessiblePrediction } from '../utils/access.js'
import { getRecommendations } from '../utils/recommendations.js'

const router = Router()
router.use(authMiddleware)

// GET /api/recommendations/:predictionId
router.get('/:predictionId', asyncHandler(async (req, res) => {
  const { prediction } = await getAccessiblePrediction(req.user, req.params.predictionId)
  res.json({ recommendations: getRecommendations(prediction.gaps || []) })
}))

export default router
