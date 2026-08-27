import { useState } from 'react'
import { predictionService } from '../services/prediction.js'
import { SKILLS } from '../utils/constants.js'

// Build default object: all 22 skills = 1
const defaultSkills = () => SKILLS.reduce((acc, key) => ({ ...acc, [key]: 1 }), {})

export const usePrediction = () => {
  const [skills,  setSkills]  = useState(defaultSkills())
  const [result,  setResult]  = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const predict = async (employeeId, jobRole, experience) => {
    setLoading(true); setError(null)
    try {
      const prediction = await predictionService.predict(employeeId, jobRole, experience, skills)
      setResult(prediction)
      return { success: true, data: prediction }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Prediction failed'
      setError(msg)
      return { success: false, error: msg }
    } finally {
      setLoading(false) }
  }

  const updateSkill = (skill, value) =>
    setSkills(prev => ({ ...prev, [skill]: value }))

  const resetSkills = () => setSkills(defaultSkills())

  return { skills, setSkills, updateSkill, resetSkills, result, setResult, loading, error, predict }
}
