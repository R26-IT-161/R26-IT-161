import { Router } from 'express'
import { predictionController } from '../controllers/prediction.js'
import { authMiddleware, requireRole } from '../middleware/auth.js'
const router = Router()
router.use(authMiddleware)
const HR = ['admin', 'hr_manager', 'supervisor']
router.post('/',                    requireRole(HR), predictionController.predict)
router.post('/batch',               requireRole(HR), predictionController.batchPredict)
router.get('/history',              requireRole(HR), predictionController.getHistory)
router.get('/mine',                                  predictionController.getMine)
router.get('/employee/:employeeId',                  predictionController.getByEmployee)
export default router
