import { Router } from 'express'
import { authMiddleware, requireRole } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import { getAccessiblePrediction } from '../utils/access.js'
import { generateDevelopmentPlan } from '../utils/pdfGenerator.js'
import { getRecommendations }      from '../utils/recommendations.js'

const router = Router()
router.use(authMiddleware)
router.use(requireRole(['admin','hr_manager','supervisor']))

// GET /api/devplan/:predictionId  → streams PDF
router.get('/:predictionId', asyncHandler(async (req, res) => {
  const { prediction, employee } = await getAccessiblePrediction(req.user, req.params.predictionId)

  const recommendations = getRecommendations(prediction.gaps || [])
  const nextReviewDate  = employee.nextReviewDate

  const filename = `dev-plan-${employee.firstName}-${employee.lastName}-${Date.now()}.pdf`
    .replace(/\s+/g,'-').replace(/[^a-zA-Z0-9._-]/g,'').toLowerCase()

  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)

  generateDevelopmentPlan(res, { employee, prediction, recommendations, nextReviewDate })
}))

export default router
