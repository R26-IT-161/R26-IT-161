import { Prediction } from '../models/Prediction.js'
import { Employee }   from '../models/Employee.js'
import { huggingfaceService } from '../utils/huggingface.js'
import { orgFilter } from '../utils/access.js'

export const predictionService = {
  async predict(employeeId, jobRole, experience, skills) {
    const hfResult = await huggingfaceService.predict(jobRole, experience, skills)

    const prediction = new Prediction({
      employeeId,
      jobRole,
      skillInput: skills,
      readiness:    hfResult.readiness,
      confidence:   hfResult.confidence,
      totalGap:     hfResult.total_gap     || 0,
      criticalGaps: hfResult.critical_gaps || 0,
      gaps:         hfResult.gaps          || [],
    })

    await prediction.save()

    // Save latest skill ratings back to Employee.skillProfile
    // so the match engine can query without loading all predictions
    await Employee.findByIdAndUpdate(employeeId, {
      $push: { predictions: prediction._id },
      $set:  { skillProfile: skills, updatedAt: new Date() },
    })

    return prediction
  },

  async getByEmployee(employeeId) {
    return Prediction.find({ employeeId }).sort({ createdAt: -1 })
  },

  async getHistory(limit = 10, organizationId) {
    limit = Math.min(100, Math.max(1, Number.isFinite(limit) ? Math.floor(limit) : 10))
    const employees = await Employee.find(orgFilter(organizationId)).select('_id')
    return Prediction.find({ employeeId: { $in: employees.map(e => e._id) } })
      .sort({ createdAt: -1 }).limit(limit)
  },

  async batchPredict(predictions) {
    const results = []
    for (const p of predictions) {
      results.push(await this.predict(p.employeeId, p.jobRole, p.experience, p.skills))
    }
    return results
  },
}
