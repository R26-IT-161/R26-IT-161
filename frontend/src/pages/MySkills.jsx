import { useEffect, useState } from 'react'
import { predictionService } from '../services/prediction'
import { employeeService }   from '../services/employee'
import Layout from '../components/Layout'
import toast from 'react-hot-toast'

const LEVEL  = {1:'Beginner',2:'Basic',3:'Intermediate',4:'Advanced',5:'Expert'}
const LCOLOR = {1:'#C5221F',2:'#E37400',3:'#F29900',4:'#1E8E3E',5:'#00796B'}
const RI     = { 'Ready':'chip-ready', 'Partially Ready':'chip-partial', 'Not Ready':'chip-not-ready' }

export default function MySkills() {
  const [predictions, setPredictions] = useState([])
  const [employee,    setEmployee]    = useState(null)
  const [selected,    setSelected]    = useState(null)
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    Promise.all([predictionService.getMine(), employeeService.getMe()])
      .then(([preds,emp]) => { setPredictions(preds); setEmployee(emp); if (preds.length) setSelected(preds[0]) })
      .catch(() => toast.error('Failed to load skill data'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Layout><div className="loading-screen" style={{height:'60vh'}}><div className="md-spinner"/><span style={{color:'var(--md-on-surface-variant)',fontSize:14}}>Loading your skills…</span></div></Layout>

  const skills = selected?.skillInput ? Object.entries(selected.skillInput) : []
  const gaps   = selected?.gaps ? [...selected.gaps].sort((a,b)=>b.gap-a.gap) : []

  return (
    <Layout>
      <div style={{maxWidth:960}}>
        {/* Header */}
        <div className="md-card" style={{padding:'20px 24px',marginBottom:24,display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
          <div style={{display:'flex',alignItems:'center',gap:14}}>
            <span className="material-icons-round" style={{fontSize:32,color:'#F9A825'}}>star</span>
            <div>
              <div style={{fontSize:18,fontWeight:500,color:'var(--md-on-surface)'}}>My Skill Profile</div>
              <div style={{fontSize:13,color:'var(--md-on-surface-variant)'}}>
                {employee ? `${employee.firstName} ${employee.lastName} · ${employee.jobRole||'No role assigned'}` : 'Your assessed skill set'}
              </div>
            </div>
          </div>
          {predictions.length>1 && (
            <select value={selected?._id||''} onChange={e=>setSelected(predictions.find(p=>p._id===e.target.value))}
              style={{padding:'8px 12px',border:'1.5px solid var(--md-outline,#DADCE0)',borderRadius:8,background:'var(--md-surface)',color:'var(--md-on-surface)',fontSize:13,cursor:'pointer',fontFamily:'var(--font-body)'}}>
              {predictions.map(p=><option key={p._id} value={p._id}>{new Date(p.createdAt).toLocaleDateString()} — {p.jobRole}</option>)}
            </select>
          )}
        </div>

        {!predictions.length ? (
          <div className="empty-state" style={{marginTop:60}}>
            <span className="material-icons-round" style={{fontSize:56,opacity:.4}}>assignment</span>
            <h3 style={{marginTop:16,fontSize:18,fontWeight:500}}>No assessments yet</h3>
            <p>Your HR manager will run your first skill assessment.</p>
          </div>
        ) : (
          <>
            {/* Summary */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:24}}>
              {[
                {label:'Job Role',   val:selected?.jobRole||'—',    cls:''},
                {label:'Readiness',  val:selected?.readiness||'—',  cls:RI[selected?.readiness]||''},
                {label:'Confidence', val:selected?.confidence?`${Math.round(selected.confidence*100)}%`:'—', cls:''},
                {label:'Total Gap',  val:selected?.totalGap??'—',   cls:''},
              ].map(s=>(
                <div key={s.label} className="analytics-stat" style={{display:'flex',flexDirection:'column',gap:6}}>
                  <div style={{fontSize:11,textTransform:'uppercase',letterSpacing:'.05em',color:'var(--md-on-surface-variant)'}}>{s.label}</div>
                  <div>{s.cls ? <span className={`chip ${s.cls}`}>{s.val}</span> : <span style={{fontSize:16,fontWeight:600,color:'var(--md-on-surface)'}}>{s.val}</span>}</div>
                </div>
              ))}
            </div>

            {skills.length>0 && (
              <div className="md-card" style={{padding:'20px 24px',marginBottom:20}}>
                <div style={{fontSize:14,fontWeight:500,marginBottom:18}}>Skill Ratings</div>
                {skills.map(([skill,val])=>(
                  <div key={skill} style={{display:'grid',gridTemplateColumns:'140px 1fr 110px',alignItems:'center',gap:12,marginBottom:12}}>
                    <span style={{fontSize:13,fontWeight:500}}>{skill}</span>
                    <div style={{background:'var(--md-outline-variant,#E8EAED)',borderRadius:6,height:10,overflow:'hidden'}}>
                      <div style={{height:'100%',width:`${(val/5)*100}%`,background:LCOLOR[val]||'#90A4AE',borderRadius:6,transition:'width .5s'}}/>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <span style={{fontSize:12,fontWeight:600}}>{val}/5</span>
                      <span style={{fontSize:11,fontWeight:500,color:LCOLOR[val]}}>{LEVEL[val]||val}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {gaps.length>0 && (
              <div className="md-card" style={{padding:'20px 24px'}}>
                <div style={{fontSize:14,fontWeight:500,marginBottom:16}}>Gaps to Work On</div>
                <div style={{display:'flex',flexWrap:'wrap',gap:10}}>
                  {gaps.map((g,i)=>(
                    <div key={i} style={{display:'flex',alignItems:'center',gap:6,background:'#FCE8E6',borderRadius:50,padding:'6px 14px'}}>
                      <span className="material-icons-round" style={{fontSize:15,color:'#C5221F'}}>arrow_upward</span>
                      <span style={{fontSize:13,fontWeight:500,color:'#C5221F'}}>{g.skill}</span>
                      <span style={{fontSize:12,color:'#E53935',fontWeight:600}}>+{g.gap}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}
