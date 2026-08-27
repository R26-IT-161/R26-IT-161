import { analyticsService } from '../services/analytics.js'
import { Employee }   from '../models/Employee.js'
import { Prediction } from '../models/Prediction.js'
import { asyncHandler } from '../middleware/errorHandler.js'

export const analyticsController = {
  getMetrics:       asyncHandler(async (req,res) => res.json(await analyticsService.getMetrics(req.user.organizationId))),
  getSkillGaps:     asyncHandler(async (req,res) => res.json(await analyticsService.getSkillGaps(req.user.organizationId))),
  getTrends:        asyncHandler(async (req,res) => res.json(await analyticsService.getTrends(req.user.organizationId, +(req.query.days||30)))),
  getReadinessTrend:asyncHandler(async (req,res) => res.json(await analyticsService.getReadinessTrend(req.user.organizationId, +(req.query.months||6)))),
  getDueForReview:  asyncHandler(async (req,res) => res.json(await analyticsService.getDueForReview(req.user.organizationId))),

  getMyStats: asyncHandler(async (req,res) => {
    const emp = await Employee.findOne({ email: req.user.email })
    if (!emp) return res.json({ predictions:[], latestReadiness:null, latestConfidence:0, latestGaps:[], totalPredictions:0 })
    const predictions = await Prediction.find({ employeeId:emp._id }).sort({ createdAt:-1 }).limit(10)
    const latest = predictions[0]
    res.json({ employee:emp, latestReadiness:latest?.readiness||null, latestConfidence:latest?.confidence||0, latestGaps:latest?.gaps||[], totalPredictions:predictions.length, predictions })
  }),
}
