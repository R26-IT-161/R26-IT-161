import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import mongoose from 'mongoose'
import { createServer } from 'http'
import { Server as SocketIO } from 'socket.io'
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
import './models/User.js'
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
app.use(express.json())
app.use(express.urlencoded({ extended: true, limit: '50mb' })) // ✅ fixed: added extended: true

// Connect MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/skill-tracker'
mongoose
  .connect(MONGODB_URI)
  .then(() => logger.info('✅ MongoDB connected'))
  .catch(err => logger.error(`❌ MongoDB error: ${err.message}`))

// Socket.io
io.on('connection', socket => {
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