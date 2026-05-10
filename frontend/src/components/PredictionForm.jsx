import { useState } from 'react'
import { predict } from '../api'
import { Zap, AlertCircle, Loader } from 'lucide-react'
import './PredictionForm.css'

const SKILLS = [
  'machine_operation', 'equipment_setup', 'troubleshooting',
  'process_knowledge', 'cleaning_sanitation',
  'gmp_compliance', 'hygiene_ppe', 'haccp_knowledge',
  'ccp_monitoring', 'quality_inspection', 'documentation',
  'communication', 'teamwork', 'problem_solving',
  'adaptability', 'time_management', 'leadership',
  'machine_startup', 'product_changeover', 'safety_compliance',
  'quality_sampling', 'record_keeping',
]

const JOB_ROLES = ['Machine Operator', 'Production Worker', 'QA Technician', 'Packer', 'Supervisor']

const SKILL_CATEGORIES = {
  Technical: ['machine_operation', 'equipment_setup', 'troubleshooting', 'process_knowledge', 'cleaning_sanitation'],
  'Food Safety': ['gmp_compliance', 'hygiene_ppe', 'haccp_knowledge', 'ccp_monitoring', 'quality_inspection', 'documentation'],
  'Soft Skills': ['communication', 'teamwork', 'problem_solving', 'adaptability', 'time_management', 'leadership'],
  'Task-Based': ['machine_startup', 'product_changeover', 'safety_compliance', 'quality_sampling', 'record_keeping'],
}

function PredictionForm() {
  const [jobRole, setJobRole] = useState('QA Technician')
  const [experience, setExperience] = useState('1-3')
  const [skills, setSkills] = useState(SKILLS.reduce((acc, skill) => ({ ...acc, [skill]: 3 }), {}))
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [expandedCategory, setExpandedCategory] = useState('Technical')

  const handlePredict = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setPrediction(null)

    try {
      const response = await predict(jobRole, experience, skills)
      setPrediction(response.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to get prediction. Ensure backend is running on http://localhost:5000')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getReadinessColor = (code) => {
    switch (code) {
      case 0: return '#10b981'
      case 1: return '#f59e0b'
      case 2: return '#ef4444'
      default: return '#6b7280'
    }
  }

  const getReadinessLabel = (code) => {
    const labels = { 0: 'Ready', 1: 'Partially Ready', 2: 'Not Ready' }
    return labels[code] || 'Unknown'
  }

  return (
    <div className="container">
      <header className="header">
        <div className="header-content">
          <h1>Predict Employee Readiness</h1>
        </div>
      </header>

      <main className="main">
        <div className="grid">
          {/* Form */}
          <div className="form-section">
            <form onSubmit={handlePredict} className="form">
              <div className="form-group">
                <label>Job Role *</label>
                <select value={jobRole} onChange={(e) => setJobRole(e.target.value)} className="input">
                  {JOB_ROLES.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Experience Level *</label>
                <select value={experience} onChange={(e) => setExperience(e.target.value)} className="input">
                  <option value="<1">Less than 1 year</option>
                  <option value="1-3">1-3 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value=">5">More than 5 years</option>
                </select>
              </div>

              <div className="skills-section">
                <h3>Rate 22 Skills (1-4 Scale)</h3>
                <p className="hint">1 = Novice, 2 = Intermediate, 3 = Proficient, 4 = Expert</p>

                {Object.entries(SKILL_CATEGORIES).map(([category, categorySkills]) => (
                  <div key={category} className="category">
                    <button
                      type="button"
                      className="category-header"
                      onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
                    >
                      <span>{category}</span>
                      <span className={`chevron ${expandedCategory === category ? 'open' : ''}`}>›</span>
                    </button>

                    {expandedCategory === category && (
                      <div className="skills-list">
                        {categorySkills.map((skill) => (
                          <div key={skill} className="skill-item">
                            <label>{skill.replace(/_/g, ' ')}</label>
                            <div className="skill-control">
                              <input
                                type="range"
                                min="1"
                                max="4"
                                value={skills[skill]}
                                onChange={(e) => setSkills({ ...skills, [skill]: parseInt(e.target.value) })}
                                className="slider"
                              />
                              <span className="value">{skills[skill]}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button type="submit" disabled={loading} className="btn-predict">
                {loading ? (
                  <>
                    <Loader size={18} className="spinner" />
                    Predicting...
                  </>
                ) : (
                  <>
                    <Zap size={18} />
                    Predict Readiness
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Results */}
          <div className="results-section">
            {error && (
              <div className="alert alert-error">
                <AlertCircle size={20} />
                <div>
                  <strong>Error</strong>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {prediction && (
              <div className="result">
                <div className="result-header">
                  <h2>Prediction Results</h2>
                  <span className="role-badge">{prediction.job_role}</span>
                </div>

                <div className="readiness-badge" style={{ borderColor: getReadinessColor(prediction.readiness_code) }}>
                  <div className="badge-label">Readiness Status</div>
                  <div className="badge-value" style={{ color: getReadinessColor(prediction.readiness_code) }}>
                    {getReadinessLabel(prediction.readiness_code)}
                  </div>
                </div>

                <div className="confidence-section">
                  <h3>Confidence Scores</h3>
                  <div className="confidence-bars">
                    <div className="bar-item">
                      <div className="bar-label">Ready</div>
                      <div className="bar-bg">
                        <div className="bar" style={{
                          width: `${prediction.confidence.ready * 100}%`,
                          backgroundColor: '#10b981',
                        }} />
                      </div>
                      <span className="percentage">{(prediction.confidence.ready * 100).toFixed(1)}%</span>
                    </div>

                    <div className="bar-item">
                      <div className="bar-label">Partially Ready</div>
                      <div className="bar-bg">
                        <div className="bar" style={{
                          width: `${prediction.confidence.partially_ready * 100}%`,
                          backgroundColor: '#f59e0b',
                        }} />
                      </div>
                      <span className="percentage">{(prediction.confidence.partially_ready * 100).toFixed(1)}%</span>
                    </div>

                    <div className="bar-item">
                      <div className="bar-label">Not Ready</div>
                      <div className="bar-bg">
                        <div className="bar" style={{
                          width: `${prediction.confidence.not_ready * 100}%`,
                          backgroundColor: '#ef4444',
                        }} />
                      </div>
                      <span className="percentage">{(prediction.confidence.not_ready * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                <div className="gaps-section">
                  <h3>Skill Gaps Analysis</h3>
                  <div className="gap-stats">
                    <div className="stat">
                      <div className="stat-value">{prediction.total_gap_score}</div>
                      <div className="stat-label">Total Gap Score</div>
                    </div>
                    <div className="stat">
                      <div className="stat-value">{prediction.critical_gaps}</div>
                      <div className="stat-label">Critical Gaps</div>
                    </div>
                  </div>

                  {prediction.top_skill_gaps.length > 0 && (
                    <div className="top-gaps">
                      <h4>Top Areas for Development</h4>
                      {prediction.top_skill_gaps.map((gap, idx) => (
                        <div key={idx} className="gap-item">
                          <div className="gap-name">{gap.skill.replace(/_/g, ' ')}</div>
                          <div className="gap-values">
                            <span>{gap.emp_level} → {gap.req_level}</span>
                            <span className="gap-label">{gap.gap_label}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {!prediction && !error && (
              <div className="placeholder">
                <Zap size={64} opacity={0.1} />
                <p>Fill the form and click "Predict Readiness" to see results</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default PredictionForm
