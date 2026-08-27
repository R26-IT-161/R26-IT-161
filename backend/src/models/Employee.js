import mongoose from 'mongoose'
const employeeSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, required: false },
  firstName:      { type: String, required: true },
  lastName:       { type: String, required: true },
  email:          { type: String, required: true },
  jobRoleId:      { type: mongoose.Schema.Types.ObjectId, ref: 'JobRole' },
  jobRole:        { type: String },
  skillProfile:   { type: Map, of: Number, default: new Map() },
  predictions:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'Prediction' }],
  nextReviewDate: { type: Date, default: null },
  createdAt:      { type: Date, default: Date.now },
  updatedAt:      { type: Date, default: Date.now },
})
export const Employee = mongoose.model('Employee', employeeSchema)
