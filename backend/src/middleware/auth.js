import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) return res.status(401).json({ error: 'No token' })

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)
    
    if (!user) return res.status(401).json({ error: 'User not found' })
    
    req.user = user
    req.token = token
    next()
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' })
  }
}

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' })
    }
    next()
  }
} 
