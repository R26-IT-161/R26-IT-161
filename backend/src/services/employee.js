import { Employee }   from '../models/Employee.js'
import { Prediction } from '../models/Prediction.js'
import { orgFilter }  from '../utils/access.js'

export const employeeService = {
  async getAll(page=1, limit=100, organizationId) {
    page  = Math.max(1, Number.isFinite(page) ? Math.floor(page) : 1)
    limit = Math.min(200, Math.max(1, Number.isFinite(limit) ? Math.floor(limit) : 100))
    const filter = orgFilter(organizationId)
    const [employees, total] = await Promise.all([
      Employee.find(filter)
        .skip((page-1)*limit)
        .limit(limit)
        .populate('jobRoleId')
        .sort({ createdAt: -1 }),
      Employee.countDocuments(filter),
    ])
    return { employees, total, page, limit, pages: Math.ceil(total/limit) }
  },
  async getById(id)        { return Employee.findById(id).populate('jobRoleId') },
  async create(data)       { return new Employee(data).save() },
  async update(id, data)   { return Employee.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true, runValidators: true }) },
  async delete(id)         { await Prediction.deleteMany({ employeeId: id }); return Employee.findByIdAndDelete(id) },
  async importBulk(employees, organizationId) {
    return Employee.insertMany(employees.map(e => ({ ...e, organizationId })))
  },
}
