import axios from 'axios'

const HF_API_URL = process.env.HUGGINGFACE_API_URL || 'https://yasithadulara-adaptive-skill-tracker.hf.space'

export const huggingfaceService = {
  async getJobs() {
    try {
      const res = await axios.get(`${HF_API_URL}/api/jobs`)
      return res.data.jobs
    } catch (error) {
      console.error('HF getJobs error:', error.message)
      return []
    }
  },

  async getJobSkills(jobName) {
    try {
      const res = await axios.get(`${HF_API_URL}/api/jobs/${encodeURIComponent(jobName)}/skills`)
      return res.data.requirements
    } catch (error) {
      console.error('HF getJobSkills error:', error.message)
      return {}
    }
  },

  async predict(jobName, experience, skills) {
    try {
      const res = await axios.post(`${HF_API_URL}/api/predict`, {
        job_name: jobName,
        experience,
        skills,
      })
      return res.data
    } catch (error) {
      console.error('HF predict error:', error.message)
      return { readiness: 'Not Ready', confidence: 0 }
    }
  },
}
