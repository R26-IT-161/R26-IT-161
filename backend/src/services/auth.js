import { User } from '../models/User.js'
import { generateToken } from '../utils/jwt.js'
import { httpError } from '../utils/access.js'

export const authService = {
  async login(email, password) {
    const user = await User.findOne({ email: email.toLowerCase().trim() })
    // Same message for unknown email and wrong password so accounts can't be enumerated
    const isValid = user ? await user.comparePassword(password) : false
    if (!isValid) throw httpError(401, 'Invalid email or password')

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
    const existing = await User.findOne({ email: email.toLowerCase().trim() })
    if (existing) throw httpError(409, 'Email already registered')

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