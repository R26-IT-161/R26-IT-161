import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { analyticsService } from '../services/analytics'
import { recommendationsService } from '../services/recommendations'
import CourseLinks from '../components/CourseLinks'
import Layout from '../components/Layout'
import toast from 'react-hot-toast'

const RI = { 'Ready':{cls:'chip-ready',icon:'check_circle',color:'#1E8E3E',bg:'#E6F4EA'}, 'Partially Ready':{cls:'chip-partial',icon:'pending',color:'#F29900',bg:'#FEF7E0'}, 'Not Ready':{cls:'chip-not-ready',icon:'cancel',color:'#C5221F',bg:'#FCE8E6'} }
const greeting = () => { const h=new Date().getHours(); return h<12?'Good morning':h<18?'Good afternoon':'Good evening' }

export default function MyDashboard() {
  const { user } = useAuth()
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [recs,    setRecs]    = useState([])

  useEffect(() => {
    analyticsService.getMyStats()
      .then(s => {
        setStats(s)
        const latest = s?.predictions?.[0]
        if (latest?._id && latest.gaps?.length) {
          recommendationsService.getForPrediction(latest._id).then(setRecs).catch(() => {})
        }
      })
      .catch(() => toast.error('Failed to load your stats'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Layout><div className="loading-screen" style={{height:'60vh'}}><div className="md-spinner"/><span style={{color:'var(--md-on-surface-variant)',fontSize:14}}>Loading your profile…</span></div></Layout>

  const ri = stats?.latestReadiness ? RI[stats.latestReadiness] : null
  const topGaps = [...(stats?.latestGaps||[])].sort((a,b)=>b.gap-a.gap).slice(0,5)
  const maxGap  = topGaps[0]?.gap||1

  return (
    <Layout>
      <div style={{maxWidth:960}}>
        {/* Welcome */}
        <div className="md-card" style={{padding:'24px 28px',marginBottom:24,display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:16}}>
          <div style={{display:'flex',alignItems:'center',gap:16}}>
            <div style={{width:52,height:52,borderRadius:'50%',background:'linear-gradient(135deg,#1D9E75,#1565C0)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,fontWeight:600}}>
              {(user?.firstName?.[0]||'?').toUpperCase()}
            </div>
            <div>
              <div style={{fontSize:22,fontWeight:500,color:'var(--md-on-surface)',marginBottom:4}}>{greeting()}, {user?.firstName} 👋</div>
              <div style={{fontSize:13,color:'var(--md-on-surface-variant)'}}>Your personal skill readiness summary</div>
            </div>
          </div>
          {ri ? (
            <div style={{display:'flex',alignItems:'center',gap:8,padding:'10px 18px',borderRadius:50,background:ri.bg,color:ri.color,fontSize:13,fontWeight:500}}>
              <span className="material-icons-round" style={{fontSize:18}}>{ri.icon}</span>
              {stats.latestReadiness}
            </div>
          ) : (
            <div style={{display:'flex',alignItems:'center',gap:8,padding:'10px 18px',borderRadius:50,background:'#F5F5F5',color:'#757575',fontSize:13,fontWeight:500}}>
              <span className="material-icons-round" style={{fontSize:18}}>help_outline</span>
              No assessment yet
            </div>
          )}
        </div>

        {/* Stats row */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginBottom:24}}>
          {[
            {icon:'psychology',color:'#1976D2',val:stats?.totalPredictions??0,label:'Total Assessments'},
            {icon:'speed',     color:'#1D9E75',val:stats?.latestConfidence?`${Math.round(stats.latestConfidence*100)}%`:'—',label:'Latest Confidence'},
            {icon:'bar_chart', color:'#E65100',val:topGaps.length,label:'Skill Gaps'},
          ].map(s=>(
            <div key={s.label} className="md-card" style={{padding:20,textAlign:'center'}}>
              <span className="material-icons-round" style={{fontSize:28,color:s.color,display:'block',marginBottom:8}}>{s.icon}</span>
              <div style={{fontSize:26,fontWeight:600,color:'var(--md-on-surface)'}}>{s.val}</div>
              <div style={{fontSize:12,color:'var(--md-on-surface-variant)',marginTop:2}}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:20}}>
          {/* Skill gaps */}
          <div className="md-card" style={{padding:20}}>
            <div style={{display:'flex',alignItems:'center',gap:8,fontSize:14,fontWeight:500,marginBottom:16}}>
              <span className="material-icons-round" style={{fontSize:18,color:'var(--md-primary)'}}>bar_chart</span>Top Skill Gaps
            </div>
            {topGaps.length===0
              ? <div className="empty-state"><span className="material-icons-round" style={{fontSize:36,opacity:.4}}>check_circle_outline</span><p>No gaps on record yet.</p></div>
              : topGaps.map((g,i)=>(
                <div key={i} style={{display:'grid',gridTemplateColumns:'120px 1fr 36px',alignItems:'center',gap:10,marginBottom:10}}>
                  <span style={{fontSize:12,fontWeight:500}}>{g.skill}</span>
                  <div style={{background:'var(--md-outline-variant,#E8EAED)',borderRadius:4,height:8,overflow:'hidden'}}><div style={{height:'100%',width:`${(g.gap/maxGap)*100}%`,background:'linear-gradient(90deg,#1D9E75,#1565C0)',borderRadius:4,transition:'width .5s'}}/></div>
                  <span style={{fontSize:12,fontWeight:600,color:'var(--md-primary)',textAlign:'right'}}>{g.gap}</span>
                </div>))}
          </div>

          {/* History */}
          <div className="md-card" style={{padding:20}}>
            <div style={{display:'flex',alignItems:'center',gap:8,fontSize:14,fontWeight:500,marginBottom:16}}>
              <span className="material-icons-round" style={{fontSize:18,color:'var(--md-primary)'}}>history</span>Assessment History
            </div>
            {!stats?.predictions?.length
              ? <div className="empty-state"><span className="material-icons-round" style={{fontSize:36,opacity:.4}}>assignment</span><p>No assessments yet.<br/>Your HR manager will schedule one.</p></div>
              : stats.predictions.map((p,i)=>{
                  const r=RI[p.readiness]||RI['Not Ready']
                  return (
                    <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 0',borderBottom:'1px solid var(--md-outline-variant,#E8EAED)'}}>
                      <div>
                        <div style={{fontSize:13,fontWeight:500}}>{p.jobRole||'Unknown Role'}</div>
                        <div style={{fontSize:11,color:'var(--md-on-surface-variant)'}}>{new Date(p.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <span className={`chip ${r.cls}`}>{p.readiness}</span>
                        <span style={{fontSize:12,color:'var(--md-on-surface-variant)'}}>{Math.round((p.confidence||0)*100)}%</span>
                      </div>
                    </div>)
                })}
          </div>
        </div>

        {recs.length > 0 && (
          <div className="md-card" style={{padding:20,marginBottom:20}}>
            <div style={{display:'flex',alignItems:'center',gap:8,fontSize:14,fontWeight:500,marginBottom:4}}>
              <span className="material-icons-round" style={{fontSize:18,color:'var(--md-primary)'}}>school</span>Courses to get you role-ready
            </div>
            <p className="cs-note" style={{marginTop:0,marginBottom:14}}>Based on your latest assessment. Start with the highest priority skills. Links open a course search for each topic.</p>
            <div style={{display:'flex',flexDirection:'column',gap:14}}>
              {recs.map(r => (
                <div key={r.skill}>
                  <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                    <span style={{fontSize:13,fontWeight:600}}>{r.label}</span>
                    <span style={{fontSize:12,color:'var(--md-on-surface-variant)'}}>level {r.empLevel} → {r.reqLevel}</span>
                    <span className={`cs-priority cs-priority-${r.priority}`}>{r.priority} priority</span>
                  </div>
                  <div style={{fontSize:12,color:'var(--md-on-surface-variant)',marginTop:2}}>{r.action}</div>
                  <CourseLinks courses={r.courses}/>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{display:'flex',alignItems:'flex-start',gap:10,background:'#E8F0FE',borderRadius:12,padding:'14px 18px',fontSize:13,color:'#1A73E8'}}>
          <span className="material-icons-round" style={{fontSize:20}}>lightbulb</span>
          <p style={{margin:0}}>Contact your HR manager or supervisor to request a new skill assessment and track your progress.</p>
        </div>
      </div>
    </Layout>
  )
}
