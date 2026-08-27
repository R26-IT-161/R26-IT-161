import { Router } from 'express'
import { analyticsController } from '../controllers/analytics.js'
import { authMiddleware, requireRole } from '../middleware/auth.js'
const router = Router()
router.use(authMiddleware)
const HR = ['admin','hr_manager','supervisor']
router.get('/',               requireRole(HR), analyticsController.getMetrics)
router.get('/skill-gaps',     requireRole(HR), analyticsController.getSkillGaps)
router.get('/trends',         requireRole(HR), analyticsController.getTrends)
router.get('/readiness-trend',requireRole(HR), analyticsController.getReadinessTrend)
router.get('/due-for-review', requireRole(HR), analyticsController.getDueForReview)
router.get('/me',                              analyticsController.getMyStats)
export default router
