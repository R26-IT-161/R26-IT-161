import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'
import '../styles/auth.css'

export default function Register() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' })
  const { register, loading } = useAuth()
  const navigate = useNavigate()

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await register(form.firstName, form.lastName, form.email, form.password)
    if (result.success) {
      toast.success('Account created! Please log in.')
      navigate('/login')
    } else {
      toast.error(result.error || 'Registration failed')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-side">
        <div className="auth-brand">
          <div className="auth-brand-icon">
            <span className="material-icons-round">verified_user</span>
          </div>
          <span className="auth-brand-name">SkillTracker</span>
        </div>
        <div className="auth-headline">
          <h2>Join your team's<br />skill platform.</h2>
          <p>Create an account to start assessing employee readiness and tracking skill development in real time.</p>
        </div>
        <div className="auth-features">
          {[
            ['bar_chart', 'Instant readiness scoring'],
            ['task_alt', 'Compliance & GMP tracking'],
            ['group_add', 'Team-wide skill dashboards'],
          ].map(([icon, label]) => (
            <div className="auth-feature" key={icon}>
              <span className="material-icons-round">{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="auth-main">
        <div className="auth-card">
          <div className="auth-card-header">
            <div className="auth-logo-sm">
              <span className="material-icons-round">verified_user</span>
              <span>SkillTracker</span>
            </div>
            <h1>Create account</h1>
            <p>Fill in your details to get started</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-form-row">
              <div className="auth-input-wrap">
                <span className="material-icons-round">person_outline</span>
                <input type="text" placeholder="First name" value={form.firstName} onChange={set('firstName')} required />
              </div>
              <div className="auth-input-wrap">
                <span className="material-icons-round">person_outline</span>
                <input type="text" placeholder="Last name" value={form.lastName} onChange={set('lastName')} required />
              </div>
            </div>
            <div className="auth-input-wrap">
              <span className="material-icons-round">mail_outline</span>
              <input type="email" placeholder="Email address" value={form.email} onChange={set('email')} required autoComplete="email" />
            </div>
            <div className="auth-input-wrap">
              <span className="material-icons-round">lock_outline</span>
              <input type="password" placeholder="Password" value={form.password} onChange={set('password')} required minLength="6" autoComplete="new-password" />
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? <div className="auth-spinner" /> : <span className="material-icons-round" style={{fontSize:18}}>person_add</span>}
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="auth-footer-link" style={{marginTop:24}}>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
