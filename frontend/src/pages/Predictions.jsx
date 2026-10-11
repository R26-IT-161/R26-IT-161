import { useState, useEffect } from 'react'
import { usePrediction } from '../hooks/usePrediction'
import { SKILLS, SKILL_LABELS } from '../utils/constants'
import { recommendationsService } from '../services/recommendations'
import CourseLinks from '../components/CourseLinks'
import { employeeService } from '../services/employee'
import { jobsService } from '../services/jobs'
import Layout from '../components/Layout'
import toast from 'react-hot-toast'
import '../styles/predictions.css'

const SKILL_GROUPS = [
  { label:'Technical Skills',   icon:'build',              skills:['machine_operation','equipment_setup','troubleshooting','machine_startup','product_changeover','process_knowledge'] },
  { label:'Food Safety',        icon:'health_and_safety',  skills:['gmp_compliance','hygiene_ppe','haccp_knowledge','ccp_monitoring','cleaning_sanitation','safety_compliance'] },
  { label:'Quality',            icon:'verified',           skills:['quality_inspection','quality_sampling','documentation','record_keeping'] },
  { label:'Soft Skills',        icon:'people',             skills:['communication','teamwork','problem_solving','adaptability','time_management','leadership'] },
]

const LEVEL_LABEL = {1:'Beginner',2:'Basic',3:'Intermediate',4:'Advanced',5:'Expert'}
const LEVEL_COLOR = {1:'#C5221F',2:'#E37400',3:'#F29900',4:'#188038',5:'#00796B'}

const RC = {
  'Ready':           {icon:'check_circle', color:'#1E8E3E', bg:'#E6F4EA', border:'#1E8E3E'},
  'Partially Ready': {icon:'pending',      color:'#F29900', bg:'#FEF7E0', border:'#F29900'},
  'Not Ready':       {icon:'cancel',       color:'#C5221F', bg:'#FCE8E6', border:'#C5221F'},
}

function Steps({ current }) {
  return (
    <div className="pred-steps">
      {['Select Employee','Rate Skills','Results'].map((label, i) => (
        <div key={i} className={`pred-step ${i<current?'done':i===current?'active':''}`}>
          <div className="pred-step-circle">
            {i < current
              ? <span className="material-icons-round" style={{fontSize:16}}>check</span>
              : i+1}
          </div>
          <span className="pred-step-label">{label}</span>
          {i < 2 && <div className="pred-step-line"/>}
        </div>
      ))}
    </div>
  )
}

function SkillGroup({ group, skills, updateSkill, onFillGroup, relevantSkills, showAllSkills }) {
  const isRelevant = (skill) => !relevantSkills || relevantSkills.has(skill)
  const visibleSkills = group.skills.filter(s => showAllSkills || isRelevant(s))
  const hiddenCount = group.skills.length - visibleSkills.length

  if (visibleSkills.length === 0) return null // whole group irrelevant to this role and hidden

  const avg = (visibleSkills.reduce((s,k) => s+(skills[k]||1), 0) / visibleSkills.length).toFixed(1)
  return (
    <div className="skill-group-card">
      <div className="skill-group-header">
        <div className="skill-group-title">
          <span className="material-icons-round skill-group-icon">{group.icon}</span>
          {group.label}
        </div>
        <div className="skill-group-actions">
          <div className="skill-group-avg" style={{color:LEVEL_COLOR[Math.round(avg)]}}>avg {avg}</div>
          <button className="fill-btn" onClick={() => onFillGroup(visibleSkills, 3)}>Auto-fill 3</button>
        </div>
      </div>
      <div className="skill-group-rows">
        {visibleSkills.map(skill => {
          const val = skills[skill] || 1
          const dimmed = !isRelevant(skill)
          return (
            <div key={skill} className={`skill-row-v2 ${dimmed?'skill-row-dimmed':''}`}>
              <span className="skill-row-name-v2">
                {SKILL_LABELS[skill]}
                {dimmed && <span className="skill-not-required-tag">not required for this role</span>}
              </span>
              <div className="skill-slider-wrap">
                <input type="range" min="1" max="5" value={val}
                  className="skill-slider"
                  onChange={e => updateSkill(skill, parseInt(e.target.value))} />
                <div className="skill-slider-track-labels">
                  {[1,2,3,4,5].map(n=><span key={n}>{n}</span>)}
                </div>
              </div>
              <div className="skill-level-badge"
                style={{background:LEVEL_COLOR[val]+'22', color:LEVEL_COLOR[val]}}>
                {LEVEL_LABEL[val]}
              </div>
            </div>
          )
        })}
        {!showAllSkills && hiddenCount > 0 && (
          <div className="skill-hidden-hint">{hiddenCount} more skill{hiddenCount>1?'s':''} in this group not required for this role</div>
        )}
      </div>
    </div>
  )
}

export default function Predictions() {
  const [step,       setStep]      = useState(0)
  const [employees,  setEmployees] = useState([])
  const [jobs,       setJobs]      = useState([])
  const [empSearch,  setEmpSearch] = useState('')
  const [jobSearch,  setJobSearch] = useState('')
  const [showJobDrop, setShowJobDrop] = useState(false)
  const [selected,   setSelected]  = useState(null)
  const [jobRole,    setJobRole]    = useState('')
  const [experience, setExperience] = useState(0)
  const [loadingEmps, setLoadingEmps] = useState(true)
  const [jobRequirements, setJobRequirements] = useState(null) // {skill: level} for the selected role, or null while unknown
  const [showAllSkills, setShowAllSkills] = useState(false)

  const { skills, setSkills, updateSkill, resetSkills, predict, result, setResult, loading } = usePrediction()
  const [recs, setRecs] = useState({}) // skill -> recommendation (with course suggestions) for the current result

  useEffect(() => {
    setRecs({})
    if (!result?._id) return
    let cancelled = false
    recommendationsService.getForPrediction(result._id)
      .then(list => { if (!cancelled) setRecs(Object.fromEntries(list.map(r => [r.skill, r]))) })
      .catch(() => {}) // courses are a bonus; the result is still shown without them
    return () => { cancelled = true }
  }, [result?._id])

  useEffect(() => {
    employeeService.getAll(1, 100)
      .then(data => setEmployees(data.employees || []))
      .catch(() => toast.error('Could not load employees'))
      .finally(() => setLoadingEmps(false))
    jobsService.getJobs()
      .then(setJobs)
      .catch(() => {}) // fallback handled server-side
  }, [])

  const filteredEmps = employees.filter(e =>
    `${e.firstName} ${e.lastName} ${e.email} ${e.jobRole||''}`.toLowerCase().includes(empSearch.toLowerCase()))

  const filteredJobs = jobs.filter(j =>
    j.toLowerCase().includes(jobSearch.toLowerCase()))

  const fillGroup = (skillKeys, val) =>
    setSkills(prev => { const n={...prev}; skillKeys.forEach(k=>{n[k]=val}); return n })

  const fillAll = (val) => {
    const all={}; SKILLS.forEach(k=>{all[k]=val}); setSkills(all)
  }

  const avgScore = (SKILLS.reduce((s,k)=>s+(skills[k]||1),0)/SKILLS.length).toFixed(1)

  const REQ_THRESHOLD = 3 // requirement level 3+ ("Intermediate" or higher) counts as relevant to the role
  const hasReqData = jobRequirements && Object.keys(jobRequirements).length > 0
  const relevantSkills = hasReqData
    ? new Set(Object.entries(jobRequirements).filter(([,lvl]) => lvl >= REQ_THRESHOLD).map(([k])=>k))
    : null // null = no requirement data available (loading or lookup failed) -> don't mask anything

  const handlePredict = async () => {
    if (!selected) { toast.error('Select an employee first'); return }
    if (!jobRole)  { toast.error('Select a job role'); return }
    if (!jobs.some(j => j.toLowerCase() === jobRole.toLowerCase())) {
      toast.error(`"${jobRole}" isn't a role the model recognizes — pick one from the dropdown`)
      return
    }
    const res = await predict(selected._id, jobRole, experience)
    if (res.success) setStep(2)
    else toast.error(res.error || 'Prediction failed')
  }

  const handleNewAssessment = () => {
    setStep(0); setSelected(null); setJobRole(''); setExperience(0)
    resetSkills(); setResult(null); setEmpSearch('')
    setJobRequirements(null); setShowAllSkills(false)
  }

  const rc = result ? (RC[result.readiness] || RC['Not Ready']) : null
  const confPct = result ? Math.round((result.confidence||0)*100) : 0
  const hasGaps = result?.gaps?.length > 0

  return (
    <Layout>
      <div className="predictions-page">
        <Steps current={step}/>

        {/* ── STEP 0: Select Employee ── */}
        {step === 0 && (
          <div className="pred-step-panel">
            <div className="pred-step-panel-title">
              <span className="material-icons-round">person_search</span>
              Who are you assessing?
            </div>

            <div className="emp-search-wrap">
              <span className="material-icons-round">search</span>
              <input className="emp-search-input"
                placeholder="Search employees by name, email or role…"
                value={empSearch} onChange={e=>setEmpSearch(e.target.value)}/>
            </div>

            {loadingEmps
              ? <div className="loading-screen" style={{height:160}}><div className="md-spinner"/></div>
              : filteredEmps.length === 0
                ? <div className="empty-state"><span className="material-icons-round" style={{fontSize:40,opacity:.4}}>people_outline</span><p>No employees found.</p></div>
                : <div className="emp-grid">
                    {filteredEmps.map(emp=>(
                      <button key={emp._id}
                        className={`emp-card ${selected?._id===emp._id?'selected':''}`}
                        onClick={()=>{
                          setSelected(emp)
                          // Only prefill the job role if it's a name the prediction
                          // model actually recognizes — the employee's stored jobRole
                          // may come from a different taxonomy (e.g. seeded local data)
                          // that the model doesn't have requirements for.
                          const knownRole = jobs.find(j => j.toLowerCase() === (emp.jobRole||'').toLowerCase())
                          setJobRole(knownRole || '')
                        }}>
                        <div className="emp-card-avatar">{(emp.firstName?.[0]||'?').toUpperCase()}</div>
                        <div className="emp-card-info">
                          <div className="emp-card-name">{emp.firstName} {emp.lastName}</div>
                          <div className="emp-card-role">{emp.jobRole||'No role'}</div>
                          <div className="emp-card-email">{emp.email}</div>
                        </div>
                        {selected?._id===emp._id &&
                          <span className="material-icons-round emp-card-check">check_circle</span>}
                      </button>
                    ))}
                  </div>
            }

            {selected && (
              <div className="pred-selected-bar">
                <div className="pred-selected-info">
                  <span className="material-icons-round" style={{color:'#1E8E3E'}}>check_circle</span>
                  <strong>{selected.firstName} {selected.lastName}</strong> selected
                </div>

                <div className="pred-role-row">
                  {/* Job role dropdown */}
                  <div className="pred-field-inline" style={{flex:2, position:'relative'}}>
                    <label>Assessing for job role *</label>
                    <div className="job-dropdown-wrap">
                      <input className="pred-input-inline"
                        placeholder="Search or type a job role…"
                        value={jobRole}
                        onChange={e=>{ setJobRole(e.target.value); setJobSearch(e.target.value); setShowJobDrop(true) }}
                        onFocus={()=>setShowJobDrop(true)}
                        onBlur={()=>setTimeout(()=>setShowJobDrop(false),150)}
                      />
                      <span className="material-icons-round job-dropdown-arrow">
                        {showJobDrop ? 'expand_less' : 'expand_more'}
                      </span>
                    </div>
                    {showJobDrop && filteredJobs.length > 0 && (
                      <div className="job-dropdown-list">
                        {filteredJobs.map(j=>(
                          <button key={j} className="job-dropdown-item"
                            onMouseDown={()=>{ setJobRole(j); setJobSearch(''); setShowJobDrop(false) }}>
                            <span className="material-icons-round" style={{fontSize:16}}>work</span>
                            {j}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Experience */}
                  <div className="pred-field-inline" style={{maxWidth:160}}>
                    <label>Years of experience</label>
                    <input className="pred-input-inline" type="number" min={0} max={50}
                      value={experience}
                      onChange={e=>setExperience(parseInt(e.target.value)||0)}/>
                  </div>
                </div>

                <button className="pred-next-btn"
                  onClick={async ()=>{
                    if(!jobRole){toast.error('Select a job role');return}
                    if(!jobs.some(j=>j.toLowerCase()===jobRole.toLowerCase())){
                      toast.error(`"${jobRole}" isn't a role the model recognizes — pick one from the dropdown`)
                      return
                    }
                    setJobRequirements(null)
                    setShowAllSkills(false)
                    jobsService.getJobSkills(jobRole)
                      .then(reqs => setJobRequirements(reqs && Object.keys(reqs).length ? reqs : {}))
                      .catch(() => setJobRequirements({})) // fall back to showing everything
                    setStep(1)
                  }}>
                  Next: Rate Skills
                  <span className="material-icons-round" style={{fontSize:18}}>arrow_forward</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 1: Rate Skills ── */}
        {step === 1 && (
          <div className="pred-step-panel">
            <div className="pred-step-panel-title">
              <span className="material-icons-round">star_rate</span>
              Rate {selected?.firstName}'s Skills
            </div>

            <div className="skills-summary-bar">
              <div className="ssb-item">
                <span className="material-icons-round">person</span>
                <div><div className="ssb-label">Employee</div><div className="ssb-val">{selected?.firstName} {selected?.lastName}</div></div>
              </div>
              <div className="ssb-item">
                <span className="material-icons-round">work</span>
                <div><div className="ssb-label">Role</div><div className="ssb-val">{jobRole}</div></div>
              </div>
              <div className="ssb-item">
                <span className="material-icons-round">star</span>
                <div><div className="ssb-label">Avg Score</div><div className="ssb-val">{avgScore}/5</div></div>
              </div>
              <div className="ssb-quick">
                <span style={{fontSize:12,color:'var(--md-on-surface-variant)'}}>Quick fill all:</span>
                {[1,2,3,4,5].map(v=>(
                  <button key={v} className="quick-fill-btn"
                    style={{background:LEVEL_COLOR[v]+'22', color:LEVEL_COLOR[v]}}
                    onClick={()=>fillAll(v)} title={LEVEL_LABEL[v]}>{v}</button>
                ))}
              </div>
            </div>

            {hasReqData && (
              <label className="show-all-skills-toggle">
                <input type="checkbox" checked={showAllSkills}
                  onChange={e=>setShowAllSkills(e.target.checked)} />
                Show all skills (including ones not required for {jobRole})
              </label>
            )}

            {SKILL_GROUPS.map(g=>(
              <SkillGroup key={g.label} group={g} skills={skills}
                updateSkill={updateSkill} onFillGroup={fillGroup}
                relevantSkills={relevantSkills} showAllSkills={showAllSkills || !hasReqData}/>
            ))}

            <div className="pred-footer-actions">
              <button className="pred-back-btn" onClick={()=>{setStep(0); setJobRequirements(null); setShowAllSkills(false)}}>
                <span className="material-icons-round" style={{fontSize:18}}>arrow_back</span>Back
              </button>
              <button className="predict-btn" onClick={handlePredict} disabled={loading}>
                {loading
                  ? <><div className="auth-spinner"/>Analyzing…</>
                  : <><span className="material-icons-round" style={{fontSize:18}}>psychology</span>Predict Readiness</>}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Results ── */}
        {step === 2 && result && rc && (
          <div className="pred-step-panel">
            <div className="pred-step-panel-title">
              <span className="material-icons-round">assignment_turned_in</span>
              Assessment Complete
            </div>

            {/* Result hero */}
            <div className="result-hero" style={{background:rc.bg, borderColor:rc.border}}>
              <div className="result-hero-left">
                <span className="material-icons-round result-hero-icon" style={{color:rc.color}}>{rc.icon}</span>
                <div>
                  <div className="result-hero-label">Readiness Status</div>
                  <div className="result-hero-value" style={{color:rc.color}}>{result.readiness}</div>
                  <div className="result-hero-sub">
                    <strong>{selected?.firstName} {selected?.lastName}</strong> for <strong>{jobRole}</strong>
                  </div>
                </div>
              </div>
              <div className="result-hero-stats">
                <div className="result-hero-stat">
                  <div className="rhs-val" style={{color:rc.color}}>{confPct}%</div>
                  <div className="rhs-label">Confidence</div>
                  <div className="conf-bar">
                    <div className="conf-fill" style={{width:`${confPct}%`, background:rc.color}}/>
                  </div>
                </div>
                <div className="result-hero-stat">
                  <div className="rhs-val">{result.totalGap||0}</div>
                  <div className="rhs-label">Total Gap</div>
                </div>
                <div className="result-hero-stat">
                  <div className="rhs-val">{result.gaps?.length||0}</div>
                  <div className="rhs-label">Skills to Improve</div>
                </div>
              </div>
            </div>

            {/* What this means */}
            <div className="result-meaning">
              <span className="material-icons-round" style={{color:rc.color, fontSize:20}}>info</span>
              <span>
                {result.readiness === 'Ready' && `${selected?.firstName} meets all skill requirements for this role. They are fully prepared.`}
                {result.readiness === 'Partially Ready' && `${selected?.firstName} has most of the required skills but has some gaps to address before taking on this role.`}
                {result.readiness === 'Not Ready' && `${selected?.firstName} has significant skill gaps for this role. Targeted training is recommended.`}
              </span>
            </div>

            {/* Skill gaps + recommended courses */}
            {hasGaps && (
              <div className="result-gaps-card">
                <div className="result-gaps-title">
                  <span className="material-icons-round" style={{fontSize:18, color:'var(--md-primary)'}}>trending_up</span>
                  Skills to Improve ({result.gaps.length})
                </div>
                <p className="cs-note" style={{marginTop:0,marginBottom:10}}>Courses to help {selected?.firstName} reach the level this role needs, biggest gaps first. Links open a course search for each topic.</p>
                <div className="gap-courses-list">
                  {[...result.gaps].sort((a,b)=>b.gap-a.gap).map((g,i)=>{
                    const rec = recs[g.skill]
                    const isHigh = g.gapLabel === 'High'
                    return (
                      <div key={i} className="gap-course-row" style={isHigh?{borderColor:'#C5221F33'}:undefined}>
                        <div className="gap-course-row-top">
                          <span className="material-icons-round" style={{fontSize:14,color:isHigh?'#C5221F':'#F9AB00'}}>arrow_upward</span>
                          <span className="gap-chip-name">{SKILL_LABELS[g.skill]||g.skill}</span>
                          <span className="gap-chip-delta">+{g.gap} needed</span>
                          {isHigh && <span className="gap-priority-badge">Priority</span>}
                        </div>
                        {rec && (
                          <>
                            <div className="gap-course-rec">
                              <span className="material-icons-round" style={{fontSize:14,color:'var(--md-on-surface-variant)'}}>arrow_right</span>
                              <span>{rec.action}</span>
                            </div>
                            <CourseLinks courses={rec.courses}/>
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {!hasGaps && result.readiness === 'Ready' && (
              <div className="result-all-good">
                <span className="material-icons-round" style={{fontSize:40,color:'#1E8E3E',display:'block',marginBottom:8}}>emoji_events</span>
                <div style={{fontWeight:600,color:'#1E8E3E',fontSize:16}}>No skill gaps — fully ready!</div>
                <div style={{fontSize:13,color:'var(--md-on-surface-variant)',marginTop:4}}>All required skills meet or exceed the role requirements.</div>
              </div>
            )}

            <div className="pred-footer-actions" style={{marginTop:24}}>
              <button className="pred-back-btn" onClick={handleNewAssessment}>
                <span className="material-icons-round" style={{fontSize:18}}>refresh</span>New Assessment
              </button>
              <button className="pred-back-btn" onClick={()=>setStep(1)}>
                <span className="material-icons-round" style={{fontSize:18}}>edit</span>Edit Ratings
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
