import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import mongoose from 'mongoose'
import { createServer } from 'http'
import { Server as SocketIO } from 'socket.io'
import { verifyToken } from './utils/jwt.js'
import { logger } from './utils/logger.js'
import { errorHandler } from './middleware/errorHandler.js'
import authRoutes from './routes/auth.js'
import employeeRoutes from './routes/employee.js'
import predictionRoutes from './routes/prediction.js'
import analyticsRoutes from './routes/analytics.js'
import jobsRoutes from './routes/jobs.js'
import matchRoutes          from './routes/match.js'
import devplanRoutes       from './routes/devplan.js'
import recommendationsRoutes from './routes/recommendations.js'
import { User } from './models/User.js'
import './models/Organization.js'
import './models/JobRole.js'
import './models/Employee.js'
import './models/Prediction.js'

const app = express()
const httpServer = createServer(app)
const io = new SocketIO(httpServer, {
  cors: { origin: process.env.FRONTEND_URL || 'http://localhost:3000' },
})

// Middleware
app.use(helmet())
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }))
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))

// Connect MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/skill-tracker'
mongoose
  .connect(MONGODB_URI)
  .then(() => logger.info('✅ MongoDB connected'))
  .catch(err => logger.error(`❌ MongoDB error: ${err.message}`))

// Socket.io — clients must present a valid JWT and only receive events for their own organization
io.use(async (socket, next) => {
  try {
    const decoded = verifyToken(socket.handshake.auth?.token)
    const user = await User.findById(decoded.id)
    if (!user) return next(new Error('Unauthorized'))
    socket.data.user = user
    next()
  } catch {
    next(new Error('Unauthorized'))
  }
})

io.on('connection', socket => {
  const { organizationId } = socket.data.user
  if (organizationId) socket.join(`org:${organizationId}`)
  logger.info(`User connected: ${socket.id}`)
  socket.on('disconnect', () => logger.info(`User disconnected: ${socket.id}`))
})

app.set('io', io)

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

app.use('/api/auth', authRoutes)
app.use('/api/employees', employeeRoutes)
app.use('/api/predictions', predictionRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/jobs', jobsRoutes)
app.use('/api/match', matchRoutes)
app.use('/api/devplan', devplanRoutes)
app.use('/api/recommendations', recommendationsRoutes)

// Error handling
app.use(errorHandler)

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

const PORT = process.env.PORT || 5000

httpServer.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`)
  console.log(`\n✅ Backend running at http://localhost:${PORT}`)
  console.log(`✅ API: http://localhost:${PORT}/api\n`)
})

export default app