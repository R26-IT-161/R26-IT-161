import { matchService } from '../services/match.js'
import { asyncHandler }  from '../middleware/errorHandler.js'

export const matchController = {
  findMatches: asyncHandler(async (req, res) => {
    const { jobRole } = req.query
    if (!jobRole) return res.status(400).json({ error: 'jobRole query param is required' })
    const result = await matchService.findMatches(jobRole, req.user.organizationId)
    res.json(result)
  }),
}
