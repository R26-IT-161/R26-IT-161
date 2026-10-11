import { Router } from 'express'
import { employeeController } from '../controllers/employee.js'
import { authMiddleware, requireRole } from '../middleware/auth.js'
import { HR_ROLES } from '../utils/access.js'
const router = Router()
router.use(authMiddleware)
router.get('/',      requireRole(HR_ROLES), employeeController.getAll)
router.get('/me',    employeeController.getMe)
router.post('/',     requireRole(HR_ROLES), employeeController.create)
router.get('/:id',   employeeController.getById)
router.patch('/:id', requireRole(HR_ROLES), employeeController.update)
router.delete('/:id',requireRole(['admin','hr_manager']), employeeController.delete)
export default router
