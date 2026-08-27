import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div style={{
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      height:'100vh', gap:16, background:'var(--md-background)', textAlign:'center', padding:20,
      fontFamily:'var(--font-body)'
    }}>
      <span className="material-icons-round" style={{fontSize:72, color:'var(--md-on-surface-variant)', opacity:0.4}}>
        search_off
      </span>
      <h1 style={{fontFamily:'var(--font-display)', fontSize:32, fontWeight:700, color:'var(--md-on-surface)'}}>
        404 — Page not found
      </h1>
      <p style={{color:'var(--md-on-surface-variant)', fontSize:15, maxWidth:360}}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <button
        className="btn btn-filled"
        onClick={() => navigate('/dashboard')}
        style={{marginTop:8}}
      >
        <span className="material-icons-round" style={{fontSize:18}}>arrow_back</span>
        Go to Dashboard
      </button>
    </div>
  )
}
