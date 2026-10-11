import { Link } from 'react-router-dom'
import '../styles/landing.css'

const SYSTEM_NAME = 'Priority-Aware AI Workflow'

/*
 * The three modules of the project. Only modules with an `href` get an "Open" button;
 * whoever owns the other two modules can add their route here (e.g. href: '/deadline-risk').
 */
const MODULES = [
  {
    id: 'C1',
    icon: 'event_busy',
    title: 'Adaptive Deadline Risk Predictor',
    text: 'Classifies every production order as Low, Medium or High deadline risk using machine learning, so managers can act before a delay happens.',
    points: ['Random Forest + Logistic Regression baseline', 'Explainable: feature importance and a review threshold', 'Suggests corrective actions for High Risk orders'],
    href: null,
  },
  {
    id: 'C2',
    icon: 'account_tree',
    title: 'Smart Task Management System',
    text: 'Prioritizes tasks with a hybrid of rule-based scoring and ML, then schedules them with a constraint solver that reacts to changes in real time.',
    points: ['Hybrid rule + Random Forest priority score', 'Google OR-Tools CP-SAT scheduling', 'Event-driven rescheduling with an audit log'],
    href: null,
  },
  {
    id: 'C3',
    icon: 'school',
    title: 'Adaptive Skill Development Tracker',
    text: 'Finds employee skill gaps against role requirements, predicts readiness, and recommends personalized training to close them.',
    points: ['22 skills aligned with O*NET, HACCP and GMP', 'XGBoost readiness prediction', 'Course suggestions ranked by gap size'],
    href: '/login',
    cta: 'Open Skill Tracker',
  },
]

const LOOP = [
  { n: '1', title: 'Predict risk',      text: 'Each incoming order gets a deadline risk score.' },
  { n: '2', title: 'Prioritize & plan', text: 'Risk, urgency and dependencies produce an optimized schedule.' },
  { n: '3', title: 'Check readiness',   text: 'The schedule is checked against each worker’s skill readiness before tasks are assigned.' },
  { n: '4', title: 'Develop & update',  text: 'Training closes skill gaps and refreshed profiles flow back into scheduling.' },
]

// Projected / simulated results reported in the research paper (Table I and Section IV)
const STATS = [
  ['≥ 88%',   'Deadline-risk accuracy'],
  ['22.4%',        'Less task tardiness vs FIFO'],
  ['≥ 0.87',  'Skill-gap F1-score'],
  ['< 10 s',       'Reschedule latency'],
]

const SKILL_FEATURES = [
  { icon: 'query_stats',  title: 'Skill Gap Analysis',      text: 'Compare every employee against role requirements across 22 skill dimensions and see exactly where the gaps are.' },
  { icon: 'psychology',   title: 'Readiness Prediction',    text: 'An XGBoost model classifies each employee as Ready, Partially Ready or Not Ready, with confidence scores.' },
  { icon: 'school',       title: 'Personalized Courses',    text: 'Every gap comes with a recommended action and course topics matched to the employee’s level, with links to Coursera, Udemy and free YouTube.' },
  { icon: 'person_search',title: 'Find the Best Match',     text: 'Match employees to job roles based on current skill levels and readiness to fill the right position faster.' },
  { icon: 'insights',     title: 'Workforce Analytics',     text: 'Role-level dashboards highlight critical gaps, readiness distribution and reviews that are coming due.' },
  { icon: 'verified_user',title: 'Compliance Focused',      text: 'Built for food processing teams, with first-class tracking of HACCP, GMP and ISO 22000 competencies.' },
]

const SKILL_GROUPS = [
  { icon: 'precision_manufacturing', title: 'Technical',   count: 5, text: 'Machine operation, equipment setup, troubleshooting, process knowledge, cleaning' },
  { icon: 'health_and_safety',       title: 'Food Safety', count: 6, text: 'GMP, hygiene & PPE, HACCP, CCP monitoring, quality inspection, documentation' },
  { icon: 'groups',                  title: 'Soft Skills', count: 6, text: 'Communication, teamwork, problem-solving, adaptability, time management, leadership' },
  { icon: 'checklist',               title: 'Task-Based',  count: 5, text: 'Startup, changeover, safety, sampling, record-keeping' },
]

export default function Landing() {
  return (
    <div className="lp">
      <header className="lp-nav">
        <div className="lp-container lp-nav-inner">
          <a href="#top" className="lp-brand">
            <span className="material-icons-round">hub</span>
            <span>{SYSTEM_NAME}</span>
          </a>
          <nav className="lp-nav-links" aria-label="Primary">
            <a href="#modules">Modules</a>
            <a href="#how">How it works</a>
            <a href="#skill-tracker">Skill Tracker</a>
          </nav>
          <div className="lp-nav-actions">
            <Link to="/login" className="lp-btn lp-btn-text">Sign in</Link>
            <Link to="/register" className="lp-btn lp-btn-filled">Get started</Link>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="lp-hero">
          <div className="lp-container lp-hero-inner">
            <div className="lp-hero-copy">
              <span className="lp-chip">
                <span className="material-icons-round">auto_awesome</span>
                Adaptive intelligence for food processing
              </span>
              <h1>Predict delays.<br />Prioritize work.<br />Develop skills.</h1>
              <p>
                An integrated AI framework that predicts deadline risk, schedules tasks around it, and
                keeps your workforce skilled enough to deliver, built for food processing and
                manufacturing operations.
              </p>
              <div className="lp-hero-cta">
                <a href="#modules" className="lp-btn lp-btn-filled lp-btn-lg">
                  Explore the modules
                  <span className="material-icons-round">arrow_downward</span>
                </a>
                <Link to="/login" className="lp-btn lp-btn-outlined lp-btn-lg">Sign in</Link>
              </div>
            </div>

            <div className="lp-hero-visual" aria-hidden="true">
              <div className="lp-flow">
                {MODULES.map((m, i) => (
                  <div key={m.id}>
                    <div className="lp-card lp-node">
                      <div className="lp-node-icon"><span className="material-icons-round">{m.icon}</span></div>
                      <div>
                        <small>{m.id}</small>
                        <strong>{m.title}</strong>
                      </div>
                    </div>
                    {i < MODULES.length - 1 && <div className="lp-flow-arrow"><span className="material-icons-round">arrow_downward</span></div>}
                  </div>
                ))}
                <div className="lp-flow-loop">
                  <span className="material-icons-round">sync</span>
                  Continuous feedback loop
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="lp-stats" aria-label="Projected results">
          <div className="lp-container">
            <div className="lp-stats-grid">
              {STATS.map(([value, label]) => (
                <div className="lp-stat" key={label}>
                  <strong>{value}</strong>
                  <span>{label}</span>
                </div>
              ))}
            </div>
            <p className="lp-stats-note">Projected and simulated results from our research paper.</p>
          </div>
        </section>

        <section id="modules" className="lp-section">
          <div className="lp-container">
            <div className="lp-section-head">
              <span className="lp-eyebrow">Three modules, one system</span>
              <h2>Each module solves one part of the problem</h2>
              <p>They work independently, and together they form a closed loop in which every module improves the others.</p>
            </div>
            <div className="lp-grid lp-grid-3">
              {MODULES.map(m => (
                <article className="lp-card lp-module" key={m.id}>
                  <div className="lp-module-top">
                    <div className="lp-icon"><span className="material-icons-round">{m.icon}</span></div>
                    <span className="lp-module-id">{m.id}</span>
                  </div>
                  <h3>{m.title}</h3>
                  <p>{m.text}</p>
                  <ul className="lp-points">
                    {m.points.map(p => (
                      <li key={p}><span className="material-icons-round">check_circle</span>{p}</li>
                    ))}
                  </ul>
                  {m.href && (
                    <Link to={m.href} className="lp-btn lp-btn-outlined lp-module-cta">
                      {m.cta || 'Open'}
                      <span className="material-icons-round">arrow_forward</span>
                    </Link>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="how" className="lp-section lp-section-alt">
          <div className="lp-container">
            <div className="lp-section-head">
              <span className="lp-eyebrow">How it works</span>
              <h2>A closed loop from risk to readiness</h2>
              <p>Outputs from each module become inputs for the next, and the cycle repeats as conditions change.</p>
            </div>
            <ol className="lp-grid lp-grid-4 lp-steps">
              {LOOP.map(s => (
                <li className="lp-step" key={s.n}>
                  <span className="lp-step-n">{s.n}</span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="skill-tracker" className="lp-section">
          <div className="lp-container">
            <div className="lp-section-head">
              <span className="lp-eyebrow">Module C3</span>
              <h2>Inside the Skill Tracker</h2>
              <p>Identify competency gaps, predict readiness and guide every employee to the training they need.</p>
            </div>
            <div className="lp-grid lp-grid-3">
              {SKILL_FEATURES.map(f => (
                <article className="lp-card lp-feature" key={f.title}>
                  <div className="lp-icon"><span className="material-icons-round">{f.icon}</span></div>
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                </article>
              ))}
            </div>

            <div className="lp-subhead">
              <h3>22 skills across four categories</h3>
              <p>Aligned with O*NET and extended with HACCP, GMP and ISO 22000 requirements.</p>
            </div>
            <div className="lp-grid lp-grid-4">
              {SKILL_GROUPS.map(g => (
                <article className="lp-card lp-skillgroup" key={g.title}>
                  <div className="lp-icon lp-icon-alt"><span className="material-icons-round">{g.icon}</span></div>
                  <h3>{g.title} <span className="lp-count">{g.count}</span></h3>
                  <p>{g.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="lp-cta">
          <div className="lp-container lp-cta-inner">
            <h2>Ready to see where your team stands?</h2>
            <p>Sign in to your workspace or create an account to start tracking skills today.</p>
            <div className="lp-hero-cta lp-cta-actions">
              <Link to="/register" className="lp-btn lp-btn-white lp-btn-lg">Get started</Link>
              <Link to="/login" className="lp-btn lp-btn-ghost lp-btn-lg">Sign in</Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="lp-container lp-footer-inner">
          <div className="lp-brand lp-brand-muted">
            <span className="material-icons-round">hub</span>
            <span>{SYSTEM_NAME}</span>
          </div>
          <p>Project R-26-IT-161 &middot; Department of Information Technology, SLIIT</p>
        </div>
      </footer>
    </div>
  )
}
