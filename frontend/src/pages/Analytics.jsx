import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { analyticsService } from '../services/analytics'
import { SKILL_LABELS } from '../utils/constants'
import Layout from '../components/Layout'
import toast from 'react-hot-toast'
import '../styles/analytics.css'

// ── Donut chart (existing, unchanged) ──────────────────────────────────────────
function DonutChart({ ready, partial, notReady, total }) {
  const r=70, cx=80, cy=80, circ=2*Math.PI*r
  const segs=[{value:ready,color:'#1E8E3E'},{value:partial,color:'#F29900'},{value:notReady,color:'#C5221F'}]
  let offset=0
  const arcs=segs.map(s=>{
    const len=total>0?(s.value/total)*circ:0
    const arc={...s,dasharray:`${len} ${circ-len}`,offset:circ-offset}
    offset+=len; return arc
  })
  return (
    <div className="donut-card">
      <h3>Readiness Breakdown</h3>
      <div className="donut-wrap">
        <svg width="160" height="160" viewBox="0 0 160 160">
          {total===0&&<circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--md-surface-variant)" strokeWidth="20"/>}
          {arcs.map((a,i)=>a.value>0&&<circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={a.color} strokeWidth="20" strokeDasharray={a.dasharray} strokeDashoffset={a.offset} strokeLinecap="round"/>)}
        </svg>
        <div className="donut-center">
          <div className="donut-center-value">{total}</div>
          <div className="donut-center-label">total</div>
        </div>
      </div>
      <div className="donut-legend">
        {[{label:'Ready',value:ready,color:'#1E8E3E'},{label:'Partial',value:partial,color:'#F29900'},{label:'Not Ready',value:notReady,color:'#C5221F'}].map(l=>(
          <div className="legend-item" key={l.label}>
            <div className="legend-left"><div className="legend-dot" style={{background:l.color}}/><span className="legend-label">{l.label}</span></div>
            <span className="legend-val">{l.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── NEW: Readiness trend line chart (SVG) ──────────────────────────────────────
function TrendChart({ data }) {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="trend-card">
        <h3><span className="material-icons-round" style={{fontSize:18,color:'var(--md-primary)'}}>show_chart</span> Readiness Trend</h3>
        <div className="no-data">Not enough data yet. Run more predictions to see trends.</div>
      </div>
    )
  }

  const months = Object.keys(data).sort()
  const W = 460, H = 160, PAD = { t:20, r:20, b:30, l:36 }
  const plotW = W - PAD.l - PAD.r
  const plotH = H - PAD.t - PAD.b

  const maxVal = Math.max(...months.map(m => (data[m].ready||0)+(data[m].partial||0)+(data[m].notReady||0)), 1)

  const xPos = (i) => PAD.l + (i / Math.max(months.length-1, 1)) * plotW
  const yPos = (v) => PAD.t + plotH - (v / maxVal) * plotH

  const lineFor = (key, color) => {
    const pts = months.map((m, i) => `${xPos(i)},${yPos(data[m][key]||0)}`)
    return <polyline key={key} points={pts.join(' ')} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
  }

  const monthLabel = (m) => {
    const [y, mo] = m.split('-')
    return new Date(+y, +mo-1).toLocaleString('default',{month:'short'})
  }

  return (
    <div className="trend-card">
      <div className="trend-header">
        <h3><span className="material-icons-round" style={{fontSize:18,color:'var(--md-primary)'}}>show_chart</span>Readiness Trend</h3>
        <div className="trend-legend">
          {[['Ready','#1E8E3E'],['Partially Ready','#F29900'],['Not Ready','#C5221F']].map(([l,c])=>(
            <div key={l} style={{display:'flex',alignItems:'center',gap:4,fontSize:11,color:'var(--md-on-surface-variant)'}}>
              <div style={{width:12,height:3,background:c,borderRadius:2}}/>
              {l}
            </div>
          ))}
        </div>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{overflow:'visible'}}>
        {/* Grid lines */}
        {[0,0.25,0.5,0.75,1].map(f=>{
          const y=yPos(maxVal*f)
          return <g key={f}>
            <line x1={PAD.l} y1={y} x2={W-PAD.r} y2={y} stroke="var(--md-outline-variant,#E8EAED)" strokeWidth="1"/>
            <text x={PAD.l-4} y={y+4} fontSize="9" fill="var(--md-on-surface-variant)" textAnchor="end">{Math.round(maxVal*f)}</text>
          </g>
        })}
        {/* Lines */}
        {lineFor('ready','#1E8E3E')}
        {lineFor('partial','#F29900')}
        {lineFor('notReady','#C5221F')}
        {/* Dots */}
        {months.map((m,i)=>[
          ['ready','#1E8E3E'],['partial','#F29900'],['notReady','#C5221F']
        ].map(([k,c])=>(
          <circle key={`${m}-${k}`} cx={xPos(i)} cy={yPos(data[m][k]||0)} r="3.5" fill={c}/>
        )))}
        {/* X labels */}
        {months.map((m,i)=>(
          <text key={m} x={xPos(i)} y={H-2} fontSize="9" fill="var(--md-on-surface-variant)" textAnchor="middle">{monthLabel(m)}</text>
        ))}
      </svg>
    </div>
  )
}

export default function Analytics() {
  const navigate  = useNavigate()
  const [metrics, setMetrics]  = useState(null)
  const [gaps,    setGaps]     = useState(null)
  const [trend,   setTrend]    = useState(null)
  const [due,     setDue]      = useState([])
  const [loading, setLoading]  = useState(true)

  useEffect(() => {
    Promise.all([
      analyticsService.getMetrics(),
      analyticsService.getSkillGaps(),
      analyticsService.getReadinessTrend(6),
      analyticsService.getDueForReview(),
    ])
      .then(([m, g, t, d]) => {
        setMetrics(m)
        setGaps(g)
        setTrend(t)
        setDue(d)
      })
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <Layout>
      <div className="loading-screen" style={{height:'60vh'}}>
        <div className="md-spinner"/>
        <span style={{color:'var(--md-on-surface-variant)',fontSize:14}}>Loading analytics…</span>
      </div>
    </Layout>
  )

  const total      = metrics?.totalEmployees || 0
  const ready      = metrics?.readyCount     || 0
  const partial    = metrics?.partiallyReadyCount || 0
  const notReady   = metrics?.notReadyCount  || 0
  const confidence = Math.round((metrics?.averageConfidence||0)*100)
  const topGaps    = gaps ? Object.entries(gaps).sort((a,b)=>b[1]-a[1]).slice(0,10) : []
  const maxGap     = topGaps[0]?.[1] || 1

  const statCards = [
    { label:'Total Employees', value:total,          icon:'group',         cls:'blue',   valCls:'' },
    { label:'Ready',           value:ready,           icon:'check_circle',  cls:'green',  valCls:'green'  },
    { label:'Partially Ready', value:partial,         icon:'pending',       cls:'yellow', valCls:'yellow' },
    { label:'Not Ready',       value:notReady,        icon:'cancel',        cls:'red',    valCls:'red'    },
    { label:'Avg Confidence',  value:`${confidence}%`,icon:'bar_chart',     cls:'teal',   valCls:'' },
  ]

  return (
    <Layout>
      <div className="analytics-page">
        {/* Stat row */}
        <div className="analytics-grid">
          {statCards.map(s=>(
            <div className="analytics-stat" key={s.label}>
              <div className={`analytics-stat-icon ${s.cls}`}>
                <span className="material-icons-round">{s.icon}</span>
              </div>
              <div className="analytics-stat-label">{s.label}</div>
              <div className={`analytics-stat-value ${s.valCls}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Donut + Gaps */}
        <div className="analytics-main">
          <DonutChart ready={ready} partial={partial} notReady={notReady} total={total}/>
          <div className="gaps-card">
            <h3>
              <span className="material-icons-round" style={{color:'var(--md-primary)',fontSize:20}}>bar_chart</span>
              Top Skill Gaps
            </h3>
            {topGaps.length===0
              ? <div className="no-data">No skill gap data yet.</div>
              : topGaps.map(([skill,count])=>(
                <div className="gap-bar-row" key={skill}>
                  <span className="gap-bar-label">{SKILL_LABELS[skill]||skill}</span>
                  <div className="gap-bar-track">
                    <div className="gap-bar-fill" style={{width:`${(count/maxGap)*100}%`}}/>
                  </div>
                  <span className="gap-bar-count">{count}</span>
                </div>))}
          </div>
        </div>

        {/* NEW: Trend chart */}
        <TrendChart data={trend}/>

        {/* NEW: Due for re-assessment */}
        {due.length > 0 && (
          <div className="due-card">
            <div className="due-card-header">
              <span className="material-icons-round" style={{color:'#F29900'}}>schedule</span>
              <h3>Due for Re-Assessment ({due.length})</h3>
            </div>
            <div className="due-list">
              {due.map(emp=>{
                const daysLeft = Math.ceil((new Date(emp.nextReviewDate)-new Date())/86400000)
                const overdue  = daysLeft < 0
                return (
                  <div key={emp._id} className="due-row">
                    <div className="due-avatar">{(emp.firstName?.[0]||'?').toUpperCase()}</div>
                    <div className="due-info">
                      <div className="due-name">{emp.firstName} {emp.lastName}</div>
                      <div className="due-role">{emp.jobRole||'—'}</div>
                    </div>
                    <div className={`due-badge ${overdue?'overdue':'upcoming'}`}>
                      {overdue ? `${Math.abs(daysLeft)}d overdue` : daysLeft===0 ? 'Today' : `in ${daysLeft}d`}
                    </div>
                    <button className="due-btn" onClick={()=>navigate(`/predictions?employeeId=${emp._id}`)}>
                      <span className="material-icons-round" style={{fontSize:15}}>psychology</span>
                      Assess
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
