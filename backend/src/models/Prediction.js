import mongoose from 'mongoose'

const predictionSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  jobRoleId: { type: mongoose.Schema.Types.ObjectId, ref: 'JobRole' },
  jobRole: { type: String, required: true },
  skillInput: { type: Map, of: Number, required: true },
  readiness: { type: String, enum: ['Ready', 'Partially Ready', 'Not Ready'] },
  confidence: { type: Number, min: 0, max: 1 },
  totalGap: { type: Number },
  criticalGaps: { type: Number },
  gaps: [{
    skill: String,
    empLevel: Number,
    reqLevel: Number,
    gap: Number,
    gapLabel: String,
  }],
  createdAt: { type: Date, default: Date.now },
})

export const Prediction = mongoose.model('Prediction', predictionSchema)
