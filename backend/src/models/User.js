import mongoose from 'mongoose'
import bcryptjs from 'bcryptjs'

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['admin', 'hr_manager', 'employee', 'supervisor'],
    default: 'employee',
  },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcryptjs.hash(this.password, 10)
  next()
})

userSchema.methods.comparePassword = async function (password) {
  return await bcryptjs.compare(password, this.password)
}

export const User = mongoose.model('User', userSchema)
