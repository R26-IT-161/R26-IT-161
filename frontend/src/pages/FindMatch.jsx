import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { matchService } from '../services/match'
import { jobsService }  from '../services/jobs'
import Layout from '../components/Layout'
import toast from 'react-hot-toast'
import '../styles/find-match.css'

const SKILL_LABELS = {
  machine_operation:'Machine Operation', equipment_setup:'Equipment Setup',
  troubleshooting:'Troubleshooting', machine_startup:'Machine Startup',
  product_changeover:'Product Changeover', process_knowledge:'Process Knowledge',
  gmp_compliance:'GMP Compliance', hygiene_ppe:'Hygiene & PPE',
  haccp_knowledge:'HACCP Knowledge', ccp_monitoring:'CCP Monitoring',
  cleaning_sanitation:'Cleaning & Sanitation', safety_compliance:'Safety Compliance',
  quality_inspection:'Quality Inspection', quality_sampling:'Quality Sampling',
  documentation:'Documentation', record_keeping:'Record Keeping',
  communication:'Communication', teamwork:'Teamwork',
  problem_solving:'Problem Solving', adaptability:'Adaptability',
  time_management:'Time Management', leadership:'Leadership',
}

const RC = {
  'Ready':           { icon:'check_circle',  color:'#1E8E3E', bg:'#E6F4EA', label:'Ready'           },
  'Partially Ready': { icon:'pending',        color:'#F29900', bg:'#FEF7E0', label:'Partially Ready' },
  'Not Ready':       { icon:'cancel',         color:'#C5221F', bg:'#FCE8E6', label:'Not Ready'       },
  'Unassessed':      { icon:'help_outline',   color:'#9E9E9E', bg:'#F5F5F5', label:'No Data'         },
}

function MatchBar({ pct }) {
  const color = pct >= 80 ? '#1E8E3E' : pct >= 50 ? '#F29900' : '#C5221F'
  return (
    <div className="match-bar-wrap">
      <div className="match-bar-track">
        <div className="match-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="match-bar-label" style={{ color }}>{pct}%</span>
    </div>
  )
}

function SummaryPills({ summary }) {
  return (
    <div className="summary-pills">
      {[
        { key:'ready',          label:'Ready',            color:'#1E8E3E', bg:'#E6F4EA' },
        { key:'partiallyReady', label:'Partially Ready',  color:'#F29900', bg:'#FEF7E0' },
        { key:'notReady',       label:'Not Ready',        color:'#C5221F', bg:'#FCE8E6' },
        { key:'unassessed',     label:'No Skill Data',    color:'#9E9E9E', bg:'#F5F5F5' },
      ].map(s => (
        <div key={s.key} className="summary-pill" style={{ background: s.bg, color: s.color }}>
          <strong>{summary[s.key]}</strong> {s.label}
        </div>
      ))}
    </div>
  )
}

export default function FindMatch() {
  const navigate  = useNavigate()
  const [jobs,    setJobs]    = useState([])
  const [search,  setSearch]  = useState('')
  const [showDrop, setShowDrop] = useState(false)
  const [selected, setSelected] = useState('')
  const [result,  setResult]  = useState(null)
  const [loading, setLoading] = useState(false)
  const [filter,  setFilter]  = useState('all') // all | ready | partial | notready | unassessed
  const [sortBy,  setSortBy]  = useState('match') // match | name | gap

  useEffect(() => {
    jobsService.getJobs().then(setJobs).catch(() => {})
  }, [])

  const filteredJobs = jobs.filter(j => j.toLowerCase().includes(search.toLowerCase()))

  const handleFind = async (role) => {
    setLoading(true)
    try {
      const data = await matchService.findMatches(role)
      setResult(data)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to find matches')
    } finally { setLoading(false) }
  }

  const selectJob = (job) => {
    setSelected(job); setSearch(job); setShowDrop(false); handleFind(job)
  }

  // Apply filter + sort to matches
  const visibleMatches = (result?.matches || [])
    .filter(m => {
      if (filter === 'all')        return true
      if (filter === 'ready')      return m.readiness === 'Ready'
      if (filter === 'partial')    return m.readiness === 'Partially Ready'
      if (filter === 'notready')   return m.readiness === 'Not Ready'
      if (filter === 'unassessed') return m.readiness === 'Unassessed'
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'name')  return `${a.firstName}${a.lastName}`.localeCompare(`${b.firstName}${b.lastName}`)
      if (sortBy === 'gap')   return (a.totalGap ?? 999) - (b.totalGap ?? 999)
      // default: match % descending
      return (b.matchPct ?? -1) - (a.matchPct ?? -1)
    })

  return (
    <Layout>
      <div className="find-match-page">

        {/* ── Header ── */}
        <div className="fm-header">
          <div className="fm-header-icon">
            <span className="material-icons-round">manage_search</span>
          </div>
          <div>
            <h2>Find Best Match</h2>
            <p>Select a job role and instantly see which employees are ready for it.</p>
          </div>
        </div>

        {/* ── Job selector ── */}
        <div className="fm-selector-card">
          <div className="fm-selector-label">
            <span className="material-icons-round">work</span>
            Select Job Role / Task
          </div>
          <div className="fm-dropdown-wrap">
            <input
              className="fm-search-input"
              placeholder="Search job roles or type one…"
              value={search}
              onChange={e => { setSearch(e.target.value); setShowDrop(true) }}
              onFocus={() => setShowDrop(true)}
              onBlur={() => setTimeout(() => setShowDrop(false), 150)}
            />
            <span className="material-icons-round fm-search-icon">search</span>
            {search && (
              <button className="fm-clear-btn" onClick={() => { setSearch(''); setSelected(''); setResult(null) }}>
                <span className="material-icons-round">close</span>
              </button>
            )}
            {showDrop && filteredJobs.length > 0 && (
              <div className="fm-dropdown-list">
                {filteredJobs.map(j => (
                  <button key={j} className={`fm-dropdown-item ${selected === j ? 'active' : ''}`}
                    onMouseDown={() => selectJob(j)}>
                    <span className="material-icons-round">work_outline</span>
                    {j}
                    {selected === j && <span className="material-icons-round fm-item-check">check</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
          {selected && !loading && (
            <button className="fm-refresh-btn" onClick={() => handleFind(selected)} title="Refresh results">
              <span className="material-icons-round">refresh</span>
            </button>
          )}
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="loading-screen" style={{ height: 200 }}>
            <div className="md-spinner" />
            <span style={{ color: 'var(--md-on-surface-variant)', fontSize: 14 }}>
              Scoring all employees…
            </span>
          </div>
        )}

        {/* ── Results ── */}
        {!loading && result && (
          <>
            {/* Summary pills */}
            <div className="fm-results-header">
              <div>
                <span className="fm-results-title">
                  {result.matches.length} employee{result.matches.length !== 1 ? 's' : ''} scored for
                  <strong> {selected}</strong>
                </span>
                {result.jobRole && (
                  <span className="fm-req-count">
                    · {result.jobRole.totalSkills} skills required
                  </span>
                )}
              </div>
            </div>

            <SummaryPills summary={result.summary} />

            {/* Filter + sort bar */}
            <div className="fm-controls">
              <div className="fm-filters">
                {[
                  { key:'all',        label:'All' },
                  { key:'ready',      label:'Ready' },
                  { key:'partial',    label:'Partially Ready' },
                  { key:'notready',   label:'Not Ready' },
                  { key:'unassessed', label:'No Data' },
                ].map(f => (
                  <button key={f.key}
                    className={`fm-filter-btn ${filter === f.key ? 'active' : ''}`}
                    onClick={() => setFilter(f.key)}>
                    {f.label}
                    <span className="fm-filter-count">
                      {f.key === 'all' ? result.matches.length
                        : f.key === 'ready' ? result.summary.ready
                        : f.key === 'partial' ? result.summary.partiallyReady
                        : f.key === 'notready' ? result.summary.notReady
                        : result.summary.unassessed}
                    </span>
                  </button>
                ))}
              </div>
              <div className="fm-sort">
                <span className="material-icons-round" style={{ fontSize: 16, color: 'var(--md-on-surface-variant)' }}>sort</span>
                <select className="fm-sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                  <option value="match">Sort by match %</option>
                  <option value="gap">Sort by skill gap</option>
                  <option value="name">Sort by name</option>
                </select>
              </div>
            </div>

            {/* Employee cards */}
            {visibleMatches.length === 0 ? (
              <div className="empty-state">
                <span className="material-icons-round" style={{ fontSize: 44, opacity: .4 }}>filter_list_off</span>
                <p>No employees match this filter.</p>
              </div>
            ) : (
              <div className="fm-cards">
                {visibleMatches.map((emp, i) => {
                  const rc = RC[emp.readiness] || RC['Unassessed']
                  const topGaps = emp.gaps?.slice(0, 3) || []
                  return (
                    <div key={emp._id} className="fm-card">
                      {/* Rank badge */}
                      {emp.readiness !== 'Unassessed' && (
                        <div className="fm-rank">#{i + 1}</div>
                      )}

                      {/* Employee info */}
                      <div className="fm-card-top">
                        <div className="fm-card-avatar">{(emp.firstName?.[0] || '?').toUpperCase()}</div>
                        <div className="fm-card-info">
                          <div className="fm-card-name">{emp.firstName} {emp.lastName}</div>
                          <div className="fm-card-role">{emp.jobRole || 'No role assigned'}</div>
                        </div>
                        <div className="fm-readiness-pill" style={{ background: rc.bg, color: rc.color }}>
                          <span className="material-icons-round" style={{ fontSize: 14 }}>{rc.icon}</span>
                          {rc.label}
                        </div>
                      </div>

                      {/* Match bar */}
                      {emp.matchPct !== null && emp.matchPct !== undefined && (
                        <div className="fm-card-match">
                          <div className="fm-match-label">
                            <span>Skill match</span>
                            <span>{emp.metCount}/{emp.totalRequired} skills met</span>
                          </div>
                          <MatchBar pct={emp.matchPct} />
                        </div>
                      )}

                      {emp.readiness === 'Unassessed' && (
                        <div className="fm-no-data">
                          <span className="material-icons-round" style={{ fontSize: 16 }}>info_outline</span>
                          No skill data — run a prediction first
                        </div>
                      )}

                      {/* Top gaps */}
                      {topGaps.length > 0 && (
                        <div className="fm-card-gaps">
                          <span style={{ fontSize: 11, color: 'var(--md-on-surface-variant)', fontWeight: 500, marginBottom: 4, display: 'block' }}>
                            TOP GAPS
                          </span>
                          <div className="fm-gap-chips">
                            {topGaps.map((g, gi) => (
                              <div key={gi} className="fm-gap-chip">
                                <span className="material-icons-round" style={{ fontSize: 12, color: '#C5221F' }}>arrow_upward</span>
                                {SKILL_LABELS[g.skill] || g.skill}
                                <span className="fm-gap-delta">+{g.gap}</span>
                              </div>
                            ))}
                            {emp.gaps.length > 3 && (
                              <div className="fm-gap-chip fm-gap-more">
                                +{emp.gaps.length - 3} more
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="fm-card-actions">
                        <button className="fm-action-btn secondary"
                          onClick={() => navigate(`/employees/${emp._id}`)}>
                          <span className="material-icons-round" style={{ fontSize: 15 }}>visibility</span>
                          View Profile
                        </button>
                        <button className="fm-action-btn primary"
                          onClick={() => navigate(`/predictions?employeeId=${emp._id}&jobRole=${encodeURIComponent(selected)}`)}>
                          <span className="material-icons-round" style={{ fontSize: 15 }}>psychology</span>
                          Run Prediction
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* ── Empty state before search ── */}
        {!loading && !result && (
          <div className="fm-empty-prompt">
            <span className="material-icons-round" style={{ fontSize: 64, color: 'var(--md-primary)', opacity: .3 }}>manage_search</span>
            <h3>Search for a role above</h3>
            <p>The system will instantly score all employees against that role's skill requirements and rank them from best match to most in need of training.</p>
          </div>
        )}
      </div>
    </Layout>
  )
}
