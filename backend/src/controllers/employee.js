import { employeeService } from '../services/employee.js'
import { asyncHandler }    from '../middleware/errorHandler.js'
import { Employee }        from '../models/Employee.js'
import { getAccessibleEmployee, pickEmployeeFields, httpError } from '../utils/access.js'

export const employeeController = {
  getAll: asyncHandler(async (req, res) => {
    const { page=1, limit=100 } = req.query
    const result = await employeeService.getAll(+page, +limit, req.user.organizationId)
    res.json(result)
  }),
  getById: asyncHandler(async (req, res) => {
    const emp = await getAccessibleEmployee(req.user, req.params.id)
    res.json(await employeeService.getById(emp._id))
  }),
  getMe: asyncHandler(async (req, res) => {
    const emp = await Employee.findOne({ email: req.user.email }).populate('predictions')
    if (!emp) return res.status(404).json({ error: 'No employee record linked to this account' })
    res.json(emp)
  }),
  create: asyncHandler(async (req, res) => {
    if (!req.user.organizationId) throw httpError(403, 'Your account is not linked to an organization')
    const data = { ...pickEmployeeFields(req.body), organizationId: req.user.organizationId }
    res.status(201).json(await employeeService.create(data))
  }),
  update: asyncHandler(async (req, res) => {
    const emp = await getAccessibleEmployee(req.user, req.params.id)
    res.json(await employeeService.update(emp._id, pickEmployeeFields(req.body)))
  }),
  delete: asyncHandler(async (req, res) => {
    const emp = await getAccessibleEmployee(req.user, req.params.id)
    await employeeService.delete(emp._id)
    res.json({ message: 'Deleted' })
  }),
}
