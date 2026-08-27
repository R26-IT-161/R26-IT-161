import { Router } from 'express'
import { authMiddleware, requireRole } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import { Employee }   from '../models/Employee.js'
import { Prediction } from '../models/Prediction.js'
import { generateDevelopmentPlan } from '../utils/pdfGenerator.js'
import { getRecommendations }      from '../utils/recommendations.js'

const router = Router()
router.use(authMiddleware)
router.use(requireRole(['admin','hr_manager','supervisor']))

// GET /api/devplan/:predictionId  → streams PDF
router.get('/:predictionId', asyncHandler(async (req, res) => {
  const prediction = await Prediction.findById(req.params.predictionId)
  if (!prediction) return res.status(404).json({ error: 'Prediction not found' })

  const employee = await Employee.findById(prediction.employeeId)
  if (!employee)  return res.status(404).json({ error: 'Employee not found' })

  const recommendations = getRecommendations(prediction.gaps || [])
  const nextReviewDate  = employee.nextReviewDate

  const filename = `dev-plan-${employee.firstName}-${employee.lastName}-${Date.now()}.pdf`
    .replace(/\s+/g,'-').toLowerCase()

  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)

  generateDevelopmentPlan(res, { employee, prediction, recommendations, nextReviewDate })
}))

export default router
