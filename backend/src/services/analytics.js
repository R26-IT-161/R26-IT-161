import { Prediction } from '../models/Prediction.js'
import { Employee }   from '../models/Employee.js'

import { orgFilter } from '../utils/access.js'

// Get the most recent prediction per employee
async function getLatestPerEmployee(employeeIds) {
  // Use aggregation to get only the latest prediction per employee
  return Prediction.aggregate([
    { $match: { employeeId: { $in: employeeIds } } },
    { $sort:  { createdAt: -1 } },
    { $group: { _id: '$employeeId', readiness: { $first: '$readiness' }, confidence: { $first: '$confidence' }, createdAt: { $first: '$createdAt' } } },
  ])
}

export const analyticsService = {
  async getMetrics(organizationId) {
    const employees  = await Employee.find(orgFilter(organizationId))
    const latestPreds = await getLatestPerEmployee(employees.map(e => e._id))

    const readyCount          = latestPreds.filter(p => p.readiness === 'Ready').length
    const partiallyReadyCount = latestPreds.filter(p => p.readiness === 'Partially Ready').length
    const notReadyCount       = latestPreds.filter(p => p.readiness === 'Not Ready').length
    const avgConfidence       = latestPreds.length
      ? latestPreds.reduce((s,p) => s+(p.confidence||0), 0) / latestPreds.length : 0

    return {
      totalEmployees: employees.length,
      readyCount,
      partiallyReadyCount,
      notReadyCount,
      averageConfidence: avgConfidence,
      assessedCount: latestPreds.length,
      unassessedCount: employees.length - latestPreds.length,
    }
  },

  async getSkillGaps(organizationId) {
    const employees  = await Employee.find(orgFilter(organizationId))
    const latestPreds = await Prediction.aggregate([
      { $match: { employeeId: { $in: employees.map(e=>e._id) } } },
      { $sort:  { createdAt: -1 } },
      { $group: { _id: '$employeeId', gaps: { $first: '$gaps' } } },
    ])
    const gaps = {}
    latestPreds.forEach(p => p.gaps?.forEach(g => { gaps[g.skill] = (gaps[g.skill]||0) + g.gap }))
    return gaps
  },

  async getTrends(organizationId, days=30) {
    const since = new Date(Date.now()-days*86400000)
    const employees = await Employee.find(orgFilter(organizationId))
    const predictions = await Prediction.find({
      employeeId: { $in: employees.map(e=>e._id) },
      createdAt:  { $gte: since },
    })
    const trends = {}
    predictions.forEach(p => {
      const d = p.createdAt.toISOString().split('T')[0]
      trends[d] = (trends[d]||0)+1
    })
    return trends
  },

  async getReadinessTrend(organizationId, months=6) {
    const since = new Date()
    since.setMonth(since.getMonth()-months)
    const employees  = await Employee.find(orgFilter(organizationId))
    const predictions = await Prediction.find({
      employeeId: { $in: employees.map(e=>e._id) },
      createdAt:  { $gte: since },
    }).sort({ createdAt: 1 })

    const buckets = {}
    predictions.forEach(p => {
      const key = p.createdAt.toISOString().substring(0,7)
      if (!buckets[key]) buckets[key] = { ready:0, partial:0, notReady:0 }
      if (p.readiness==='Ready')                buckets[key].ready++
      else if (p.readiness==='Partially Ready') buckets[key].partial++
      else                                       buckets[key].notReady++
    })
    return buckets
  },

  async getDueForReview(organizationId) {
    const today = new Date()
    const in30  = new Date(today); in30.setDate(in30.getDate()+30)
    return Employee.find({
      ...orgFilter(organizationId),
      nextReviewDate: { $ne: null, $lte: in30 },
    }).sort({ nextReviewDate: 1 })
  },
}
