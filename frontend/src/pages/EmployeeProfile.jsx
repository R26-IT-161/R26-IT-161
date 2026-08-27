import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { employeeService }       from '../services/employee'
import { predictionService }     from '../services/prediction'
import { recommendationsService }from '../services/recommendations'
import { devplanService }        from '../services/devplan'
import Layout from '../components/Layout'
import toast  from 'react-hot-toast'

const RI = {
  'Ready':           { cls:'chip-ready',     icon:'check_circle', color:'#1E8E3E' },
  'Partially Ready': { cls:'chip-partial',   icon:'pending',      color:'#F29900' },
  'Not Ready':       { cls:'chip-not-ready', icon:'cancel',       color:'#C5221F' },
}

const SKILL_LABELS = {
  machine_operation:'Machine Operation', equipment_setup:'Equipment Setup',
  troubleshooting:'Troubleshooting',     machine_startup:'Machine Startup',
  product_changeover:'Product Changeover', process_knowledge:'Process Knowledge',
  gmp_compliance:'GMP Compliance',       hygiene_ppe:'Hygiene & PPE',
  haccp_knowledge:'HACCP Knowledge',     ccp_monitoring:'CCP Monitoring',
  cleaning_sanitation:'Cleaning & Sanitation', safety_compliance:'Safety Compliance',
  quality_inspection:'Quality Inspection', quality_sampling:'Quality Sampling',
  documentation:'Documentation',         record_keeping:'Record Keeping',
  communication:'Communication',         teamwork:'Teamwork',
  problem_solving:'Problem Solving',     adaptability:'Adaptability',
  time_management:'Time Management',     leadership:'Leadership',
}

// ── Skill trend mini chart ─────────────────────────────────────────────────────
function SkillTrendChart({ predictions }) {
  if (predictions.length < 2) return (
    <div style={{textAlign:'center',padding:'24px',color:'var(--md-on-surface-variant)',fontSize:13}}>
      <span className="material-icons-round" style={{fontSize:32,opacity:.3,display:'block',marginBottom:8}}>show_chart</span>
      Run at least 2 assessments to see skill trend.
    </div>
  )

  const sorted = [...predictions].sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt))
  const W=400, H=120, PAD={t:12,r:12,b:28,l:32}
  const plotW=W-PAD.l-PAD.r, plotH=H-PAD.t-PAD.b

  // average skill score per assessment
  const points = sorted.map(p => {
    const vals = p.skillInput ? Array.from(
      p.skillInput instanceof Map ? p.skillInput.values() : Object.values(p.skillInput)
    ) : []
    return vals.length ? vals.reduce((s,v)=>s+v,0)/vals.length : 0
  })

  const maxVal=5, minVal=1
  const xPos=(i)=>PAD.l+(i/(sorted.length-1))*plotW
  const yPos=(v)=>PAD.t+plotH-((v-minVal)/(maxVal-minVal))*plotH
  const pts = points.map((v,i)=>`${xPos(i)},${yPos(v)}`).join(' ')

  // confidence line
  const confPts = sorted.map((p,i)=>`${xPos(i)},${yPos(1+(p.confidence||0)*4)}`).join(' ')

  const dateLabel = (d) => new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short'})

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{overflow:'visible'}}>
      {/* Grid */}
      {[1,2,3,4,5].map(v=>(
        <g key={v}>
          <line x1={PAD.l} y1={yPos(v)} x2={W-PAD.r} y2={yPos(v)} stroke="var(--md-outline-variant,#E8EAED)" strokeWidth="1"/>
          <text x={PAD.l-4} y={yPos(v)+4} fontSize="8" fill="var(--md-on-surface-variant)" textAnchor="end">{v}</text>
        </g>
      ))}
      {/* Confidence line */}
      <polyline points={confPts} fill="none" stroke="#F29900" strokeWidth="1.5" strokeDasharray="4 2" opacity=".6"/>
      {/* Avg skill line */}
      <polyline points={pts} fill="none" stroke="var(--md-primary)" strokeWidth="2.5" strokeLinejoin="round"/>
      {/* Dots + dates */}
      {points.map((v,i)=>(
        <g key={i}>
          <circle cx={xPos(i)} cy={yPos(v)} r="4" fill="var(--md-primary)"/>
          <text x={xPos(i)} y={H-2} fontSize="8" fill="var(--md-on-surface-variant)" textAnchor="middle">
            {dateLabel(sorted[i].createdAt)}
          </text>
        </g>
      ))}
      {/* Legend */}
      <rect x={W-130} y={4} width="118" height="26" rx="4" fill="var(--md-surface-dim,#F8F9FA)"/>
      <line x1={W-126} y1={14} x2={W-118} y2={14} stroke="var(--md-primary)" strokeWidth="2.5"/>
      <text x={W-115} y={18} fontSize="8" fill="var(--md-on-surface-variant)">Avg skill</text>
      <line x1={W-80} y1={14} x2={W-72} y2={14} stroke="#F29900" strokeWidth="1.5" strokeDasharray="3 2"/>
      <text x={W-69} y={18} fontSize="8" fill="var(--md-on-surface-variant)">Confidence</text>
    </svg>
  )
}

export default function EmployeeProfile() {
  const { id }  = useParams()
  const navigate= useNavigate()

  const [employee,    setEmployee]    = useState(null)
  const [predictions, setPredictions] = useState([])
  const [recs,        setRecs]        = useState([])
  const [editing,     setEditing]     = useState(false)
  const [form,        setForm]        = useState({})
  const [saving,      setSaving]      = useState(false)
  const [loading,     setLoading]     = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [reviewDate,  setReviewDate]  = useState('')
  const [savingReview,setSavingReview]= useState(false)

  useEffect(() => {
    Promise.all([
      employeeService.getById(id),
      predictionService.getByEmployee(id),
    ])
      .then(([emp, preds]) => {
        setEmployee(emp)
        setForm({ firstName:emp.firstName, lastName:emp.lastName, email:emp.email, jobRole:emp.jobRole||'' })
        setReviewDate(emp.nextReviewDate ? new Date(emp.nextReviewDate).toISOString().split('T')[0] : '')
        setPredictions(preds)
        // load recommendations for latest prediction
        if (preds[0]?._id) {
          recommendationsService.getForPrediction(preds[0]._id)
            .then(setRecs).catch(()=>{})
        }
      })
      .catch(() => toast.error('Failed to load employee'))
      .finally(() => setLoading(false))
  }, [id])

  const handleSave = async () => {
    setSaving(true)
    try { const u=await employeeService.update(id,form); setEmployee(u); setEditing(false); toast.success('Saved') }
    catch { toast.error('Update failed') }
    finally { setSaving(false) }
  }

  const handleSaveReview = async () => {
    setSavingReview(true)
    try {
      const u = await employeeService.update(id, { nextReviewDate: reviewDate || null })
      setEmployee(u)
      toast.success(reviewDate ? 'Review date saved' : 'Review date cleared')
    } catch { toast.error('Failed to save') }
    finally { setSavingReview(false) }
  }

  const handleDownloadPlan = async () => {
    if (!predictions[0]) return toast.error('No prediction to generate plan from')
    setDownloading(true)
    try {
      await devplanService.download(
        predictions[0]._id,
        `dev-plan-${employee.firstName}-${employee.lastName}.pdf`
      )
      toast.success('Development plan downloaded')
    } catch { toast.error('Failed to generate PDF') }
    finally { setDownloading(false) }
  }

  if (loading) return <Layout><div className="loading-screen" style={{height:'60vh'}}><div className="md-spinner"/></div></Layout>
  if (!employee) return (
    <Layout>
      <div style={{padding:40,textAlign:'center'}}>
        <p>Employee not found.</p>
        <button className="btn btn-filled" onClick={()=>navigate('/employees')}>Back</button>
      </div>
    </Layout>
  )

  const latest = predictions[0]
  const ri = latest ? (RI[latest.readiness]||RI['Not Ready']) : null
  const topGaps = [...(latest?.gaps||[])].sort((a,b)=>b.gap-a.gap).slice(0,6)
  const maxGap  = topGaps[0]?.gap||1

  // card style helper
  const card = { background:'var(--md-surface)', borderRadius:16, padding:20, boxShadow:'var(--elevation-1)' }
  const cardTitle = { display:'flex', alignItems:'center', gap:8, fontSize:14, fontWeight:500, color:'var(--md-on-surface)', marginBottom:16 }

  return (
    <Layout>
      <div style={{maxWidth:980}}>
        {/* Back */}
        <button onClick={()=>navigate('/employees')}
          style={{display:'flex',alignItems:'center',gap:6,background:'none',border:'none',color:'var(--md-primary)',fontSize:13,cursor:'pointer',padding:0,marginBottom:20,fontWeight:500,fontFamily:'var(--font-body)'}}>
          <span className="material-icons-round" style={{fontSize:18}}>arrow_back</span>Back to Employees
        </button>

        {/* Hero */}
        <div style={{...card,padding:'24px 28px',marginBottom:20,display:'flex',alignItems:'flex-start',gap:20,flexWrap:'wrap'}}>
          <div style={{width:64,height:64,borderRadius:'50%',background:'linear-gradient(135deg,#1D9E75,#1565C0)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,fontWeight:600,flexShrink:0}}>
            {(employee.firstName?.[0]||'?').toUpperCase()}
          </div>
          <div style={{flex:1,minWidth:200}}>
            {!editing ? (
              <>
                <div style={{fontSize:22,fontWeight:500,color:'var(--md-on-surface)',marginBottom:4}}>{employee.firstName} {employee.lastName}</div>
                <div style={{fontSize:13,color:'var(--md-on-surface-variant)'}}>{employee.email}</div>
                <div style={{marginTop:6,display:'inline-block',background:'var(--md-primary-container)',color:'var(--md-primary)',padding:'2px 10px',borderRadius:12,fontSize:12}}>{employee.jobRole||'No role assigned'}</div>
              </>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:10,width:'100%'}}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                  <input style={{padding:'10px 12px',border:'1.5px solid var(--md-outline)',borderRadius:8,fontSize:13,fontFamily:'var(--font-body)',outline:'none'}} placeholder="First name" value={form.firstName} onChange={e=>setForm({...form,firstName:e.target.value})}/>
                  <input style={{padding:'10px 12px',border:'1.5px solid var(--md-outline)',borderRadius:8,fontSize:13,fontFamily:'var(--font-body)',outline:'none'}} placeholder="Last name"  value={form.lastName}  onChange={e=>setForm({...form,lastName:e.target.value})}/>
                </div>
                <input style={{padding:'10px 12px',border:'1.5px solid var(--md-outline)',borderRadius:8,fontSize:13,fontFamily:'var(--font-body)',outline:'none'}} placeholder="Email"    value={form.email}   onChange={e=>setForm({...form,email:e.target.value})}/>
                <input style={{padding:'10px 12px',border:'1.5px solid var(--md-outline)',borderRadius:8,fontSize:13,fontFamily:'var(--font-body)',outline:'none'}} placeholder="Job role" value={form.jobRole} onChange={e=>setForm({...form,jobRole:e.target.value})}/>
              </div>
            )}
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:8,alignItems:'flex-end'}}>
            {!editing
              ? <button className="btn btn-outlined btn-sm" onClick={()=>setEditing(true)}><span className="material-icons-round" style={{fontSize:16}}>edit</span>Edit</button>
              : <><button className="btn btn-filled btn-sm" onClick={handleSave} disabled={saving}>{saving?'Saving…':'Save'}</button>
                  <button className="btn btn-text btn-sm" onClick={()=>setEditing(false)}>Cancel</button></>}
            {/* PDF download button */}
            {latest && (
              <button className="btn btn-filled btn-sm" style={{background:'#1E8E3E'}}
                onClick={handleDownloadPlan} disabled={downloading}>
                <span className="material-icons-round" style={{fontSize:16}}>picture_as_pdf</span>
                {downloading ? 'Generating…' : 'Dev Plan PDF'}
              </button>
            )}
          </div>
        </div>

        {/* Status strip */}
        {ri && (
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:20}}>
            {[
              {icon:'psychology', cls:'',      label:'Assessments',    val:predictions.length},
              {icon:ri.icon,      cls:ri.cls.replace('chip-',''), label:'Latest Readiness',val:latest.readiness},
              {icon:'speed',      cls:'',      label:'Confidence',     val:`${Math.round((latest.confidence||0)*100)}%`},
              {icon:'work',       cls:'',      label:'Role Assessed',  val:latest.jobRole},
            ].map(s=>(
              <div key={s.label} style={{...card,padding:16,display:'flex',alignItems:'center',gap:12}}>
                <span className="material-icons-round" style={{fontSize:24,color:s.cls==='ready'?'#1E8E3E':s.cls==='partial'?'#F29900':s.cls==='not-ready'?'#C5221F':'var(--md-on-surface-variant)'}}>{s.icon}</span>
                <div>
                  <div style={{fontSize:11,color:'var(--md-on-surface-variant)',marginBottom:2}}>{s.label}</div>
                  <div style={{fontSize:15,fontWeight:600,color:s.cls==='ready'?'#1E8E3E':s.cls==='partial'?'#F29900':s.cls==='not-ready'?'#C5221F':'var(--md-on-surface)'}}>{s.val}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Main body grid */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:20}}>
          {/* Skill gaps */}
          <div style={card}>
            <div style={cardTitle}>
              <span className="material-icons-round" style={{fontSize:18,color:'var(--md-primary)'}}>bar_chart</span>Latest Skill Gaps
            </div>
            {topGaps.length===0
              ? <div className="empty-state"><span className="material-icons-round" style={{fontSize:36,opacity:.4}}>check_circle_outline</span><p>No gaps on record.</p></div>
              : topGaps.map((g,i)=>(
                <div key={i} style={{display:'grid',gridTemplateColumns:'120px 1fr 36px',alignItems:'center',gap:10,marginBottom:10}}>
                  <span style={{fontSize:12,fontWeight:500}}>{SKILL_LABELS[g.skill]||g.skill}</span>
                  <div style={{background:'var(--md-outline-variant,#E8EAED)',borderRadius:4,height:8,overflow:'hidden'}}>
                    <div style={{height:'100%',width:`${(g.gap/maxGap)*100}%`,background:'linear-gradient(90deg,#E53935,#FF7043)',borderRadius:4}}/>
                  </div>
                  <span style={{fontSize:12,fontWeight:600,color:'#E53935',textAlign:'right'}}>+{g.gap}</span>
                </div>))}
          </div>

          {/* History */}
          <div style={card}>
            <div style={cardTitle}>
              <span className="material-icons-round" style={{fontSize:18,color:'var(--md-primary)'}}>history</span>Assessment History
            </div>
            {predictions.length===0
              ? <div className="empty-state"><span className="material-icons-round" style={{fontSize:36,opacity:.4}}>assignment</span><p>No assessments yet.</p></div>
              : <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
                  <thead><tr>{['Date','Role','Readiness','Conf.','Gap'].map(h=><th key={h} style={{textAlign:'left',padding:'6px 8px',fontSize:11,textTransform:'uppercase',color:'var(--md-on-surface-variant)',borderBottom:'2px solid var(--md-outline-variant,#E8EAED)'}}>{h}</th>)}</tr></thead>
                  <tbody>{predictions.map((p,i)=>{
                    const r=RI[p.readiness]||RI['Not Ready']
                    return <tr key={i}>
                      <td style={{padding:'9px 8px',borderBottom:'1px solid var(--md-outline-variant,#E8EAED)'}}>{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td style={{padding:'9px 8px',borderBottom:'1px solid var(--md-outline-variant,#E8EAED)'}}>{p.jobRole}</td>
                      <td style={{padding:'9px 8px',borderBottom:'1px solid var(--md-outline-variant,#E8EAED)'}}><span className={`chip ${r.cls}`}>{p.readiness}</span></td>
                      <td style={{padding:'9px 8px',borderBottom:'1px solid var(--md-outline-variant,#E8EAED)'}}>{Math.round((p.confidence||0)*100)}%</td>
                      <td style={{padding:'9px 8px',borderBottom:'1px solid var(--md-outline-variant,#E8EAED)'}}>{p.totalGap}</td>
                    </tr>
                  })}</tbody>
                </table>
            }
          </div>
        </div>

        {/* Skill trend chart */}
        <div style={{...card,marginBottom:20}}>
          <div style={cardTitle}>
            <span className="material-icons-round" style={{fontSize:18,color:'var(--md-primary)'}}>show_chart</span>
            Skill Score Trend
          </div>
          <SkillTrendChart predictions={predictions}/>
        </div>

        {/* Recommendations */}
        {recs.length > 0 && (
          <div style={{...card,marginBottom:20}}>
            <div style={{...cardTitle,marginBottom:8}}>
              <span className="material-icons-round" style={{fontSize:18,color:'var(--md-primary)'}}>lightbulb</span>
              Development Recommendations
              <span style={{marginLeft:'auto',fontSize:11,color:'var(--md-on-surface-variant)',fontWeight:400}}>Based on latest assessment</span>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:2}}>
              {recs.map((rec,i)=>(
                <div key={i} style={{padding:'12px 14px',borderRadius:10,background:i%2===0?'var(--md-surface-dim,#F8F9FA)':'var(--md-surface)',border:'1px solid var(--md-outline-variant,#E8EAED)'}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6}}>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <span style={{fontSize:13,fontWeight:600,color:'var(--md-on-surface)'}}>{SKILL_LABELS[rec.skill]||rec.skill}</span>
                      <span style={{fontSize:11,background:'#FCE8E6',color:'#C5221F',padding:'2px 8px',borderRadius:50,fontWeight:600}}>Gap +{rec.gap}</span>
                    </div>
                    <span style={{fontSize:11,background:'#E8F0FE',color:'var(--md-primary)',padding:'2px 8px',borderRadius:50}}>{rec.timeframe}</span>
                  </div>
                  <div style={{fontSize:13,color:'var(--md-on-surface)',marginBottom:4}}>
                    <span className="material-icons-round" style={{fontSize:14,color:'var(--md-primary)',verticalAlign:'middle',marginRight:4}}>arrow_right</span>
                    {rec.action}
                  </div>
                  <div style={{fontSize:12,color:'var(--md-on-surface-variant)'}}>
                    <span className="material-icons-round" style={{fontSize:12,verticalAlign:'middle',marginRight:4}}>link</span>
                    {rec.resource}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Review date */}
        <div style={card}>
          <div style={cardTitle}>
            <span className="material-icons-round" style={{fontSize:18,color:'#F29900'}}>schedule</span>
            Next Re-assessment Date
          </div>
          <div style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
            <input type="date" value={reviewDate}
              onChange={e=>setReviewDate(e.target.value)}
              style={{padding:'10px 14px',border:'1.5px solid var(--md-outline)',borderRadius:8,fontSize:14,fontFamily:'var(--font-body)',outline:'none',color:'var(--md-on-surface)'}}/>
            <button className="btn btn-filled btn-sm" onClick={handleSaveReview} disabled={savingReview}>
              {savingReview ? 'Saving…' : 'Save Date'}
            </button>
            {reviewDate && (
              <button className="btn btn-text btn-sm" onClick={()=>{setReviewDate('');handleSaveReview()}}>Clear</button>
            )}
            {employee.nextReviewDate && (
              <span style={{fontSize:13,color:'var(--md-on-surface-variant)'}}>
                Currently set: <strong>{new Date(employee.nextReviewDate).toLocaleDateString()}</strong>
              </span>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
