import { User } from '../models/User.js'
import { generateToken } from '../utils/jwt.js'

export const authService = {
  async login(email, password) {
    const user = await User.findOne({ email })
    if (!user) throw new Error('User not found')

    const isValid = await user.comparePassword(password)
    if (!isValid) throw new Error('Invalid password')

    const token = generateToken(user._id.toString())
    return {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organizationId: user.organizationId, // ✅ fixed: included so frontend filters by org
      },
      token,
    }
  },

  async register(firstName, lastName, email, password) {
    const existing = await User.findOne({ email })
    if (existing) throw new Error('Email already registered')

    const user = new User({ firstName, lastName, email, password })
    await user.save()

    const token = generateToken(user._id.toString())
    return {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organizationId: user.organizationId, // ✅ fixed: included here too
      },
      token,
    }
  },

  async getCurrentUser(userId) {
    return await User.findById(userId).select('-password')
  },
}