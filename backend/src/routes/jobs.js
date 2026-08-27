import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { huggingfaceService } from '../utils/huggingface.js'
import { asyncHandler } from '../middleware/errorHandler.js'

const FALLBACK_JOBS = [
  'Line Operator', 'Machine Operator', 'Quality Inspector',
  'Line Supervisor', 'Production Supervisor', 'Shift Manager',
  'Maintenance Technician', 'Sanitation Worker', 'Packer',
  'Forklift Operator', 'Warehouse Associate', 'Quality Assurance Technician',
  'Food Safety Officer', 'Production Manager', 'Process Technician',
]

const router = Router()
router.use(authMiddleware)

router.get('/', asyncHandler(async (req, res) => {
  let jobs = await huggingfaceService.getJobs()
  if (!jobs || jobs.length === 0) jobs = FALLBACK_JOBS
  res.json({ jobs })
}))

export default router
