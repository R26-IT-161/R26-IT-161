import { employeeService } from '../services/employee.js'
import { asyncHandler }    from '../middleware/errorHandler.js'
import { Employee }        from '../models/Employee.js'

export const employeeController = {
  getAll: asyncHandler(async (req, res) => {
    const { page=1, limit=100 } = req.query
    const result = await employeeService.getAll(+page, +limit, req.user.organizationId)
    res.json(result)
  }),
  getById: asyncHandler(async (req, res) => {
    const emp = await employeeService.getById(req.params.id)
    if (!emp) return res.status(404).json({ error: 'Not found' })
    res.json(emp)
  }),
  getMe: asyncHandler(async (req, res) => {
    const emp = await Employee.findOne({ email: req.user.email }).populate('predictions')
    if (!emp) return res.status(404).json({ error: 'No employee record linked to this account' })
    res.json(emp)
  }),
  create: asyncHandler(async (req, res) => {
    req.body.organizationId = req.user.organizationId
    res.status(201).json(await employeeService.create(req.body))
  }),
  update: asyncHandler(async (req, res) => {
    res.json(await employeeService.update(req.params.id, req.body))
  }),
  delete: asyncHandler(async (req, res) => {
    await employeeService.delete(req.params.id)
    res.json({ message: 'Deleted' })
  }),
}
