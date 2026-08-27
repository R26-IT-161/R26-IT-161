import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { analyticsService } from '../services/analytics'
import Layout from '../components/Layout'
import toast from 'react-hot-toast'
import '../styles/dashboard.css'

const QUICK_ACTIONS = [
  { icon: 'people', color: 'blue', title: 'Manage Employees', desc: 'Add, update, and view employee profiles and skills', path: '/employees' },
  { icon: 'psychology', color: 'teal', title: 'Run Predictions', desc: 'Assess employee readiness with AI-powered scoring', path: '/predictions' },
  { icon: 'insights', color: 'orange', title: 'View Analytics', desc: 'Explore skill gap trends and team performance', path: '/analytics' },
]

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) navigate('/login')
  }, [isAuthenticated, navigate])

  useEffect(() => {
    analyticsService.getMetrics()
      .then(setMetrics)
      .catch(() => toast.error('Failed to load metrics'))
      .finally(() => setLoading(false))
  }, [])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  }

  if (loading) return (
    <Layout>
      <div className="loading-screen" style={{height:'60vh'}}>
        <div className="md-spinner" />
        <span style={{color:'var(--md-on-surface-variant)',fontSize:14}}>Loading your dashboard…</span>
      </div>
    </Layout>
  )

  const stats = [
    { key: 'total', label: 'Total Employees', value: metrics?.totalEmployees ?? 0, icon: 'group', cls: '' },
    { key: 'ready', label: 'Ready', value: metrics?.readyCount ?? 0, icon: 'check_circle', cls: 'ready-card', iconCls: 'ready' },
    { key: 'partial', label: 'Partially Ready', value: metrics?.partiallyReadyCount ?? 0, icon: 'pending', cls: 'partial-card', iconCls: 'partial' },
    { key: 'not-ready', label: 'Not Ready', value: metrics?.notReadyCount ?? 0, icon: 'cancel', cls: 'not-ready-card', iconCls: 'not-ready' },
  ]

  return (
    <Layout>
      <div className="dashboard">
        <div className="dashboard-welcome">
          <h2>{greeting()}, {user?.firstName || 'there'} 👋</h2>
          <p>Here's an overview of your team's skill readiness today.</p>
        </div>

        <div className="stat-grid">
          {stats.map(s => (
            <div key={s.key} className={`stat-card ${s.cls}`}>
              <div className="stat-card-header">
                <span className="stat-label">{s.label}</span>
                <div className={`stat-icon ${s.iconCls || 'total'}`}>
                  <span className="material-icons-round">{s.icon}</span>
                </div>
              </div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-trend">
                <span className="material-icons-round" style={{fontSize:14}}>info_outline</span>
                Live count
              </div>
            </div>
          ))}
        </div>

        <div className="section-title">Quick Actions</div>
        <div className="action-grid">
          {QUICK_ACTIONS.map(a => (
            <button key={a.path} className="action-card" onClick={() => navigate(a.path)}>
              <div className={`action-card-icon ${a.color}`}>
                <span className="material-icons-round">{a.icon}</span>
              </div>
              <div>
                <div className="action-card-title">{a.title}</div>
                <div className="action-card-desc">{a.desc}</div>
              </div>
              <span className="material-icons-round action-card-arrow">arrow_forward</span>
            </button>
          ))}
        </div>
      </div>
    </Layout>
  )
}
