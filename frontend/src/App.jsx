import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './hooks/useAuth'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Predictions from './pages/Predictions'
import Employees from './pages/Employees'
import EmployeeProfile from './pages/EmployeeProfile'
import Analytics  from './pages/Analytics'
import FindMatch  from './pages/FindMatch'
import MyDashboard from './pages/MyDashboard'
import MySkills from './pages/MySkills'
import NotFound from './pages/NotFound'
import './App.css'

const HR_ROLES = ['admin','hr_manager','supervisor']

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" />
}

function HRRoute({ children }) {
  const { isAuthenticated, user } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" />
  if (!HR_ROLES.includes(user?.role)) return <Navigate to="/my-dashboard" />
  return children
}

function Root() {
  const { isAuthenticated, user } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" />
  return <Navigate to={HR_ROLES.includes(user?.role) ? '/dashboard' : '/my-dashboard'} />
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* HR / Admin / Supervisor */}
        <Route path="/dashboard"     element={<HRRoute><Dashboard /></HRRoute>} />
        <Route path="/employees"     element={<HRRoute><Employees /></HRRoute>} />
        <Route path="/employees/:id" element={<HRRoute><EmployeeProfile /></HRRoute>} />
        <Route path="/predictions"   element={<HRRoute><Predictions /></HRRoute>} />
        <Route path="/analytics"        element={<HRRoute><Analytics /></HRRoute>} />
        <Route path="/find-match"        element={<HRRoute><FindMatch /></HRRoute>} />

        {/* Employee */}
        <Route path="/my-dashboard" element={<ProtectedRoute><MyDashboard /></ProtectedRoute>} />
        <Route path="/my-skills"    element={<ProtectedRoute><MySkills /></ProtectedRoute>} />

        <Route path="/" element={<Root />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster position="top-right" toastOptions={{ style: { fontFamily:'var(--font-body)', borderRadius:'12px', boxShadow:'0 4px 12px rgba(0,0,0,0.15)' } }} />
    </Router>
  )
}
