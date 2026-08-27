import { Router } from 'express'
import { matchController } from '../controllers/match.js'
import { authMiddleware, requireRole } from '../middleware/auth.js'
const router = Router()
router.use(authMiddleware)
router.use(requireRole(['admin', 'hr_manager', 'supervisor']))
router.get('/', matchController.findMatches)
export default router
