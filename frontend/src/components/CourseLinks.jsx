import '../styles/courses.css'

// Suggested learning topics for one skill gap, each with links to find courses on Coursera, Udemy and YouTube.
export default function CourseLinks({ courses = [] }) {
  if (!courses.length) return null
  return (
    <div className="cs-list">
      {courses.map(c => (
        <div className="cs-item" key={c.topic}>
          <div className="cs-topic">
            <span className="material-icons-round">school</span>
            <span className="cs-topic-name">{c.topic}</span>
            <span className="cs-level">{c.level}</span>
          </div>
          <div className="cs-links">
            {c.resources.map(r => (
              <a key={r.provider} href={r.url} target="_blank" rel="noopener noreferrer"
                 className={`cs-link${r.free ? ' cs-link-free' : ''}`}
                 title={`Find "${c.topic}" courses on ${r.provider}`}>
                {r.provider}
                {r.free && <small>Free</small>}
                <span className="material-icons-round">open_in_new</span>
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
