import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { employeeService } from '../services/employee'
import Layout from '../components/Layout'
import toast from 'react-hot-toast'
import '../styles/employees.css'

const PAGE_SIZE = 20
const EMPTY_EMP = { firstName:'', lastName:'', email:'', jobRole:'' }

export default function Employees() {
  const navigate = useNavigate()
  const [employees, setEmployees] = useState([])
  const [total,     setTotal]     = useState(0)
  const [page,      setPage]      = useState(1)
  const [pages,     setPages]     = useState(1)
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [showForm,  setShowForm]  = useState(false)
  const [newEmp,    setNewEmp]    = useState(EMPTY_EMP)
  const [saving,    setSaving]    = useState(false)

  const fetchPage = async (p=1) => {
    setLoading(true)
    try {
      const data = await employeeService.getAll(p, PAGE_SIZE)
      setEmployees(data.employees || [])
      setTotal(data.total || 0)
      setPages(data.pages || 1)
      setPage(p)
    } catch { toast.error('Failed to load employees') }
    finally  { setLoading(false) }
  }

  useEffect(() => { fetchPage(1) }, [])

  const handleAdd = async () => {
    if (!newEmp.firstName || !newEmp.email) return toast.error('Name and email required')
    setSaving(true)
    try {
      await employeeService.create(newEmp)
      setNewEmp(EMPTY_EMP)
      setShowForm(false)
      await fetchPage(1)
      toast.success('Employee added')
    } catch { toast.error('Failed to add employee') }
    finally  { setSaving(false) }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return
    try { await employeeService.delete(id); await fetchPage(page); toast.success('Deleted') }
    catch { toast.error('Delete failed') }
  }

  const set = (k) => (e) => setNewEmp(p => ({ ...p, [k]: e.target.value }))

  const filtered = employees.filter(emp =>
    `${emp.firstName} ${emp.lastName} ${emp.email} ${emp.jobRole||''}`
      .toLowerCase().includes(search.toLowerCase()))

  const initials = (emp) =>
    `${emp.firstName?.[0]||''}${emp.lastName?.[0]||''}`.toUpperCase()

  return (
    <Layout>
      <div className="employees-page">

        {/* ── Top bar: title + Add button ── */}
        <div className="emp-header">
          <div className="emp-header-left">
            <h2 className="emp-title">Employees</h2>
            <span className="emp-count-badge">{total}</span>
          </div>
          <button
            className={`emp-add-btn ${showForm ? 'emp-add-btn--cancel' : ''}`}
            onClick={() => { setShowForm(!showForm); setNewEmp(EMPTY_EMP) }}
          >
            <span className="material-icons-round">
              {showForm ? 'close' : 'person_add'}
            </span>
            {showForm ? 'Cancel' : 'Add Employee'}
          </button>
        </div>

        {/* ── Add employee form ── */}
        {showForm && (
          <div className="emp-form-card">
            <div className="emp-form-title">
              <span className="material-icons-round">person_add</span>
              New Employee
            </div>
            <div className="emp-form-grid">
              <div className="emp-form-field">
                <label>First Name *</label>
                <input placeholder="Jane" value={newEmp.firstName} onChange={set('firstName')} />
              </div>
              <div className="emp-form-field">
                <label>Last Name</label>
                <input placeholder="Doe" value={newEmp.lastName} onChange={set('lastName')} />
              </div>
              <div className="emp-form-field">
                <label>Email *</label>
                <input type="email" placeholder="jane@company.com" value={newEmp.email} onChange={set('email')} />
              </div>
              <div className="emp-form-field">
                <label>Job Role</label>
                <input placeholder="e.g. Line Operator" value={newEmp.jobRole} onChange={set('jobRole')} />
              </div>
            </div>
            <div className="emp-form-actions">
              <button className="emp-btn-text" onClick={() => { setShowForm(false); setNewEmp(EMPTY_EMP) }}>
                Cancel
              </button>
              <button className="emp-btn-save" onClick={handleAdd} disabled={saving}>
                {saving ? 'Saving…' : 'Save Employee'}
              </button>
            </div>
          </div>
        )}

        {/* ── Search + count ── */}
        <div className="emp-search-bar">
          <div className="emp-search-wrap">
            <span className="material-icons-round emp-search-icon">search</span>
            <input
              className="emp-search-input"
              type="text"
              placeholder="Search by name, email or role…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="emp-search-clear" onClick={() => setSearch('')}>
                <span className="material-icons-round">close</span>
              </button>
            )}
          </div>
          <span className="emp-showing">
            Showing <strong>{filtered.length}</strong> of <strong>{total}</strong>
          </span>
        </div>

        {/* ── Table ── */}
        {loading ? (
          <div className="loading-screen" style={{ height: 220 }}>
            <div className="md-spinner" />
            <span style={{ color:'var(--md-on-surface-variant)', fontSize:14 }}>Loading employees…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <span className="material-icons-round" style={{ fontSize:48, opacity:.3 }}>people_outline</span>
            <p>{search ? 'No employees match your search.' : 'No employees yet. Click Add Employee to get started.'}</p>
          </div>
        ) : (
          <div className="emp-table-card">
            <table className="emp-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th style={{ textAlign:'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(emp => (
                  <tr key={emp._id}>
                    <td>
                      <div className="emp-name-cell">
                        <div className="emp-avatar">{initials(emp)}</div>
                        <span className="emp-name-text">{emp.firstName} {emp.lastName}</span>
                      </div>
                    </td>
                    <td className="emp-email">{emp.email}</td>
                    <td>
                      {emp.jobRole
                        ? <span className="emp-role-chip">{emp.jobRole}</span>
                        : <span className="emp-no-role">—</span>}
                    </td>
                    <td>
                      <div className="emp-actions">
                        <button
                          className="emp-btn-view"
                          onClick={() => navigate(`/employees/${emp._id}`)}
                        >
                          <span className="material-icons-round">visibility</span>
                          View
                        </button>
                        <button
                          className="emp-btn-delete"
                          onClick={() => handleDelete(emp._id, `${emp.firstName} ${emp.lastName}`)}
                        >
                          <span className="material-icons-round">delete_outline</span>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {pages > 1 && !search && (
              <div className="emp-pagination">
                <button
                  className="emp-page-btn"
                  onClick={() => fetchPage(page-1)}
                  disabled={page <= 1}
                >
                  <span className="material-icons-round">chevron_left</span>
                </button>
                {Array.from({ length: pages }, (_, i) => i+1).map(p => (
                  <button
                    key={p}
                    className={`emp-page-btn ${p === page ? 'active' : ''}`}
                    onClick={() => fetchPage(p)}
                  >
                    {p}
                  </button>
                ))}
                <button
                  className="emp-page-btn"
                  onClick={() => fetchPage(page+1)}
                  disabled={page >= pages}
                >
                  <span className="material-icons-round">chevron_right</span>
                </button>
                <span className="emp-page-info">
                  Page {page} of {pages} · {total} employees
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}
