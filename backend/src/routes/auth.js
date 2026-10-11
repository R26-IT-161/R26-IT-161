import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import Joi from 'joi'
import { authController } from '../controllers/auth.js'
import { authMiddleware } from '../middleware/auth.js'
import { validate } from '../middleware/validation.js'

const router = Router()

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.AUTH_RATE_LIMIT) || 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts, please try again later' },
})

const loginSchema = Joi.object({
  email: Joi.string().email().max(254).required(),
  password: Joi.string().max(200).required(),
})

const registerSchema = Joi.object({
  firstName: Joi.string().trim().max(100).required(),
  lastName: Joi.string().trim().max(100).required(),
  email: Joi.string().email().max(254).required(),
  password: Joi.string().min(6).max(200).required(),
})

router.post('/login',    authLimiter, validate(loginSchema),    authController.login)
router.post('/register', authLimiter, validate(registerSchema), authController.register)
router.get('/me', authMiddleware, authController.me)

export default router
