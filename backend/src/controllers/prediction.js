import { predictionService } from '../services/prediction.js'
import { Prediction } from '../models/Prediction.js'
import { Employee } from '../models/Employee.js'
import { asyncHandler } from '../middleware/errorHandler.js'

export const predictionController = {
  predict: asyncHandler(async (req, res) => {
    const { employeeId, jobRole, experience, skills } = req.body
    const prediction = await predictionService.predict(employeeId, jobRole, experience, skills)
    req.app.get('io')?.emit('prediction:new', prediction)
    res.status(201).json(prediction)
  }),
  getByEmployee: asyncHandler(async (req, res) => {
    res.json(await predictionService.getByEmployee(req.params.employeeId))
  }),
  getHistory: asyncHandler(async (req, res) => {
    res.json(await predictionService.getHistory(+(req.query.limit || 10)))
  }),
  getMine: asyncHandler(async (req, res) => {
    const emp = await Employee.findOne({ email: req.user.email })
    if (!emp) return res.json([])
    res.json(await Prediction.find({ employeeId: emp._id }).sort({ createdAt: -1 }))
  }),
  batchPredict: asyncHandler(async (req, res) => {
    res.status(201).json(await predictionService.batchPredict(req.body.predictions))
  }),
}
