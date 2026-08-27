import mongoose from 'mongoose'

const jobRoleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  requirements: { type: Map, of: Number, required: true },
  category: { type: String },
  level: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

export const JobRole = mongoose.model('JobRole', jobRoleSchema)
