import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './Layout.css'

const HR_NAV = [
  { path:'/dashboard',   icon:'dashboard',  label:'Dashboard'   },
  { path:'/employees',   icon:'people',     label:'Employees'   },
  { path:'/predictions', icon:'psychology', label:'Predictions' },
  { path:'/analytics',   icon:'insights',   label:'Analytics'   },
  { path:'/find-match',  icon:'manage_search', label:'Find Match'  },
]
const EMP_NAV = [
  { path:'/my-dashboard', icon:'person', label:'My Dashboard' },
  { path:'/my-skills',    icon:'star',   label:'My Skills'    },
]
const ROLE_LABEL = { admin:'Administrator', hr_manager:'HR Manager', supervisor:'Supervisor', employee:'Employee' }

export default function Layout({ children }) {
  const { user, logout, isHR } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  const NAV_ITEMS  = isHR() ? HR_NAV : EMP_NAV
  const currentItem = NAV_ITEMS.find(i => i.path === location.pathname)

  return (
    <div className={`app-shell ${collapsed ? 'nav-collapsed' : ''}`}>
      <nav className="nav-drawer">
        <div className="nav-header">
          <div className="nav-logo">
            <span className="material-icons-round nav-logo-icon">verified_user</span>
            {!collapsed && <span className="nav-logo-text">SkillTracker</span>}
          </div>
          <button className="nav-toggle" onClick={() => setCollapsed(c=>!c)}>
            <span className="material-icons-round">{collapsed ? 'menu' : 'menu_open'}</span>
          </button>
        </div>

        {!collapsed && (
          <div style={{padding:'0 16px 8px',fontSize:12,fontWeight:500,color:'var(--md-primary)',background:'var(--md-primary-container)',margin:'0 12px 8px',borderRadius:8,textAlign:'center',lineHeight:'28px'}}>
            {ROLE_LABEL[user?.role] || 'User'}
          </div>
        )}

        <div className="nav-items">
          {NAV_ITEMS.map(item => {
            const active = location.pathname === item.path
            return (
              <button key={item.path} className={`nav-item ${active ? 'active' : ''}`}
                onClick={() => navigate(item.path)} title={collapsed ? item.label : ''}>
                <div className="nav-item-indicator">
                  <span className="material-icons-round">{item.icon}</span>
                </div>
                {!collapsed && <span className="nav-item-label">{item.label}</span>}
              </button>
            )
          })}
        </div>

        <div className="nav-footer">
          {!collapsed && user && (
            <div className="nav-user">
              <div className="nav-avatar">{(user.firstName?.[0]||'?').toUpperCase()}</div>
              <div className="nav-user-info">
                <div className="nav-user-name">{user.firstName} {user.lastName}</div>
                <div className="nav-user-email">{user.email}</div>
              </div>
            </div>
          )}
          {collapsed && user && (
            <div className="nav-avatar nav-avatar-sm" title={`${user.firstName} ${user.lastName}`}>
              {(user.firstName?.[0]||'?').toUpperCase()}
            </div>
          )}
          <button className="nav-logout" onClick={() => { logout(); navigate('/login') }} title="Sign out">
            <span className="material-icons-round">logout</span>
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </nav>

      <div className="main-area">
        <header className="topbar">
          <div className="topbar-title">
            {currentItem?.icon && <span className="material-icons-round topbar-icon">{currentItem.icon}</span>}
            <h1>{currentItem?.label || 'Skill Tracker'}</h1>
          </div>
          <div className="topbar-actions">
            <button className="icon-btn" title="Notifications">
              <span className="material-icons-round">notifications_none</span>
            </button>
            <button className="icon-btn" title="Settings">
              <span className="material-icons-round">settings</span>
            </button>
          </div>
        </header>
        <main className="page-content">{children}</main>
      </div>
    </div>
  )
}
