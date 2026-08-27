import { Employee }   from '../models/Employee.js'
import { Prediction } from '../models/Prediction.js'

const orgFilter = (id) => id ? { organizationId: id } : {}

export const employeeService = {
  async getAll(page=1, limit=100, organizationId) {
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
  async update(id, data)   { return Employee.findByIdAndUpdate(id, data, { new: true }) },
  async delete(id)         { await Prediction.deleteMany({ employeeId: id }); return Employee.findByIdAndDelete(id) },
  async importBulk(employees, organizationId) {
    return Employee.insertMany(employees.map(e => ({ ...e, organizationId })))
  },
}
