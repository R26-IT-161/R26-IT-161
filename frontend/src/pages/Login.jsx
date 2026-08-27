import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'
import '../styles/auth.css'

const HR_ROLES = ['admin','hr_manager','supervisor']

export default function Login() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const { login, loading } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await login(email, password)
    if (result.success) {
      toast.success('Welcome back!')
      navigate(HR_ROLES.includes(result.role) ? '/dashboard' : '/my-dashboard')
    } else {
      toast.error(result.error || 'Login failed')
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
          <h2>Track Skills.<br />Build Teams.<br />Drive Growth.</h2>
          <p>AI-powered employee readiness assessment for modern manufacturing and food-safety teams.</p>
        </div>
        <div className="auth-features">
          {[['psychology','ML-based readiness predictions'],['insights','Real-time skill gap analytics'],['people','Centralized employee management']].map(([icon,label])=>(
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
            <h1>Sign in</h1>
            <p>Enter your credentials to access your workspace</p>
          </div>
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-input-wrap">
              <span className="material-icons-round">mail_outline</span>
              <input type="email" placeholder="Email address" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email"/>
            </div>
            <div className="auth-input-wrap">
              <span className="material-icons-round">lock_outline</span>
              <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required autoComplete="current-password"/>
            </div>
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? <div className="auth-spinner"/> : <span className="material-icons-round" style={{fontSize:18}}>login</span>}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
          <p className="auth-footer-link" style={{marginTop:24}}>
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
          <div style={{marginTop:20,padding:'12px 16px',background:'var(--md-surface-dim,#F8F9FA)',borderRadius:10,fontSize:12,color:'var(--md-on-surface-variant)',lineHeight:1.8}}>
            <strong style={{color:'var(--md-on-surface)'}}>Demo accounts</strong><br/>
            HR: hr@company.com / hr123<br/>
            Admin: admin@company.com / admin123<br/>
            Employee: employee1@company.com / emp123
          </div>
        </div>
      </div>
    </div>
  )
}
