import { predictionService } from '../services/prediction.js'
import { Prediction } from '../models/Prediction.js'
import { Employee } from '../models/Employee.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import { getAccessibleEmployee, httpError } from '../utils/access.js'

const MAX_BATCH = 100

export const predictionController = {
  predict: asyncHandler(async (req, res) => {
    const { employeeId, jobRole, experience, skills } = req.body
    await getAccessibleEmployee(req.user, employeeId)
    const prediction = await predictionService.predict(employeeId, jobRole, experience, skills)
    // Only clients in the same organization receive the event (see socket auth in server.js)
    req.app.get('io')?.to(`org:${req.user.organizationId}`).emit('prediction:new', prediction)
    res.status(201).json(prediction)
  }),
  getByEmployee: asyncHandler(async (req, res) => {
    const emp = await getAccessibleEmployee(req.user, req.params.employeeId)
    res.json(await predictionService.getByEmployee(emp._id))
  }),
  getHistory: asyncHandler(async (req, res) => {
    res.json(await predictionService.getHistory(+(req.query.limit || 10), req.user.organizationId))
  }),
  getMine: asyncHandler(async (req, res) => {
    const emp = await Employee.findOne({ email: req.user.email })
    if (!emp) return res.json([])
    res.json(await Prediction.find({ employeeId: emp._id }).sort({ createdAt: -1 }))
  }),
  batchPredict: asyncHandler(async (req, res) => {
    const items = req.body.predictions
    if (!Array.isArray(items) || items.length === 0 || items.length > MAX_BATCH) {
      throw httpError(400, `predictions must be an array of 1-${MAX_BATCH} items`)
    }
    for (const p of items) await getAccessibleEmployee(req.user, p?.employeeId)
    res.status(201).json(await predictionService.batchPredict(items))
  }),
}
