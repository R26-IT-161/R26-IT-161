import mongoose from 'mongoose'
import { Employee } from '../models/Employee.js'
import { Prediction } from '../models/Prediction.js'

export const HR_ROLES = ['admin', 'hr_manager', 'supervisor']
export const isHR = (user) => HR_ROLES.includes(user?.role)

export const httpError = (status, message) => Object.assign(new Error(message), { status })

// Users without an organization must never match "all" employees, so an
// absent org id becomes a filter that matches nothing.
export const orgFilter = (organizationId) =>
  organizationId ? { organizationId } : { _id: { $in: [] } }

const sameId = (a, b) => !!a && !!b && String(a) === String(b)

const assertValidId = (id) => {
  if (!mongoose.isValidObjectId(id)) throw httpError(400, 'Invalid ID')
}

// Employees may only see their own record; HR roles may see records in their own org.
// Anything else is reported as 404 so record existence isn't revealed.
export async function getAccessibleEmployee(user, employeeId) {
  assertValidId(employeeId)
  const employee = await Employee.findById(employeeId)
  const allowed = employee && (isHR(user)
    ? sameId(employee.organizationId, user.organizationId)
    : employee.email?.toLowerCase() === user.email?.toLowerCase())
  if (!allowed) throw httpError(404, 'Not found')
  return employee
}

export async function getAccessiblePrediction(user, predictionId) {
  assertValidId(predictionId)
  const prediction = await Prediction.findById(predictionId)
  if (!prediction) throw httpError(404, 'Prediction not found')
  const employee = await getAccessibleEmployee(user, prediction.employeeId)
  return { prediction, employee }
}

// Only these fields may be set on an employee through the API.
const EMPLOYEE_FIELDS = ['firstName', 'lastName', 'email', 'jobRole', 'jobRoleId', 'skillProfile', 'nextReviewDate']
export const pickEmployeeFields = (body = {}) =>
  Object.fromEntries(EMPLOYEE_FIELDS.filter(k => body[k] !== undefined).map(k => [k, body[k]]))
