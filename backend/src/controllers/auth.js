import { authService } from '../services/auth.js'
import { asyncHandler } from '../middleware/errorHandler.js'

export const authController = {
  login: asyncHandler(async (req, res) => {
    const { email, password } = req.body
    const result = await authService.login(email, password)
    res.json(result)
  }),

  register: asyncHandler(async (req, res) => {
    const { firstName, lastName, email, password } = req.body
    const result = await authService.register(firstName, lastName, email, password)
    res.status(201).json(result)
  }),

  me: asyncHandler(async (req, res) => {
    const user = await authService.getCurrentUser(req.user.id)
    res.json(user)
  }),
}
