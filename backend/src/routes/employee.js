import { Router } from 'express'
import { employeeController } from '../controllers/employee.js'
import { authMiddleware, requireRole } from '../middleware/auth.js'
const router = Router()
router.use(authMiddleware)
const HR = ['admin', 'hr_manager', 'supervisor']
router.get('/',      employeeController.getAll)
router.get('/me',    employeeController.getMe)
router.post('/',     requireRole(HR), employeeController.create)
router.get('/:id',   employeeController.getById)
router.patch('/:id', requireRole(HR), employeeController.update)
router.delete('/:id',requireRole(['admin','hr_manager']), employeeController.delete)
export default router
