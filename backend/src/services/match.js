import { Employee } from '../models/Employee.js'
import { JobRole }  from '../models/JobRole.js'
import { Prediction } from '../models/Prediction.js'
import { huggingfaceService } from '../utils/huggingface.js'

// For employees who have predictions but skillProfile not yet written
// (existing data before this feature), fall back to their latest prediction's skillInput
async function getSkillProfile(employee) {
  if (employee.skillProfile && employee.skillProfile.size > 0) {
    return Object.fromEntries(employee.skillProfile)
  }
  // fallback: load latest prediction's skillInput
  const latest = await Prediction
    .findOne({ employeeId: employee._id })
    .sort({ createdAt: -1 })
  if (latest && latest.skillInput) {
    // also write it back so next time it's fast
    await Employee.findByIdAndUpdate(employee._id, { $set: { skillProfile: latest.skillInput } })
    return Object.fromEntries(latest.skillInput)
  }
  return null
}

// Local scoring — no API calls, instant
// Returns: { matchPct, readiness, totalGap, criticalGaps, gaps[], missingSkills[] }
function scoreEmployee(skillProfile, requirements) {
  const reqEntries = Object.entries(requirements)
  if (!reqEntries.length) return null

  let totalGap = 0
  let criticalGaps = 0
  const gaps = []
  const missingSkills = []

  for (const [skill, required] of reqEntries) {
    const empLevel = skillProfile[skill] || 0
    const gap = Math.max(0, required - empLevel)
    if (gap > 0) {
      totalGap += gap
      gaps.push({ skill, empLevel, reqLevel: required, gap })
      if (empLevel === 0) missingSkills.push(skill)
      if (gap >= 2) criticalGaps++
    }
  }

  const metCount  = reqEntries.filter(([s, r]) => (skillProfile[s] || 0) >= r).length
  const matchPct  = Math.round((metCount / reqEntries.length) * 100)

  let readiness
  if (totalGap === 0)          readiness = 'Ready'
  else if (criticalGaps === 0) readiness = 'Partially Ready'
  else                         readiness = 'Not Ready'

  return {
    matchPct,
    readiness,
    totalGap,
    criticalGaps,
    gaps: gaps.sort((a, b) => b.gap - a.gap),
    missingSkills,
    metCount,
    totalRequired: reqEntries.length,
  }
}

export const matchService = {
  async findMatches(jobRoleName, organizationId) {
    // 1. Find the job role and its requirements.
    // The job dropdown is populated from the Hugging Face Space's job list
    // (huggingfaceService.getJobs), which does not necessarily match the
    // names seeded into the local Mongo JobRole collection. So: try local
    // Mongo first (it's richer — has category/level/description), and if
    // that role isn't seeded locally, fall back to the HF Space's own
    // requirements for that job so the two stay in sync.
    let requirements = null
    let jobRoleMeta = null

    const jobRole = await JobRole.findOne({ name: jobRoleName })
    if (jobRole) {
      requirements = Object.fromEntries(jobRole.requirements)
      jobRoleMeta = { name: jobRole.name, requirements, totalSkills: Object.keys(requirements).length }
    } else {
      const hfRequirements = await huggingfaceService.getJobSkills(jobRoleName)
      if (hfRequirements && Object.keys(hfRequirements).length > 0) {
        requirements = hfRequirements
        jobRoleMeta = { name: jobRoleName, requirements, totalSkills: Object.keys(requirements).length }
      }
    }

    if (!requirements) {
      // Job role not found locally or on the HF Space — return employees with no scoring
      return { jobRole: null, matches: [] }
    }

    // 2. Get all employees (with their skill profiles)
    const filter = organizationId ? { organizationId } : {}
    const employees = await Employee.find(filter)

    // 3. Score each employee
    const results = []
    for (const emp of employees) {
      const skillProfile = await getSkillProfile(emp)

      const entry = {
        _id:       emp._id,
        firstName: emp.firstName,
        lastName:  emp.lastName,
        email:     emp.email,
        jobRole:   emp.jobRole || null,
        hasSkillData: !!skillProfile,
      }

      if (skillProfile) {
        const score = scoreEmployee(skillProfile, requirements)
        Object.assign(entry, score)
      } else {
        // No skill data yet — can't score
        Object.assign(entry, {
          matchPct: null, readiness: 'Unassessed',
          totalGap: null, criticalGaps: null,
          gaps: [], missingSkills: [], metCount: 0,
          totalRequired: Object.keys(requirements).length,
        })
      }

      results.push(entry)
    }

    // 4. Sort: Ready first, then Partially Ready, then Not Ready, then Unassessed
    const ORDER = { Ready: 0, 'Partially Ready': 1, 'Not Ready': 2, Unassessed: 3 }
    results.sort((a, b) => {
      const orderDiff = (ORDER[a.readiness] ?? 3) - (ORDER[b.readiness] ?? 3)
      if (orderDiff !== 0) return orderDiff
      return (a.totalGap ?? 999) - (b.totalGap ?? 999) // within same tier, lower gap = better
    })

    return {
      jobRole: jobRoleMeta,
      matches: results,
      summary: {
        total:          results.length,
        ready:          results.filter(r => r.readiness === 'Ready').length,
        partiallyReady: results.filter(r => r.readiness === 'Partially Ready').length,
        notReady:       results.filter(r => r.readiness === 'Not Ready').length,
        unassessed:     results.filter(r => r.readiness === 'Unassessed').length,
      },
    }
  },
}
