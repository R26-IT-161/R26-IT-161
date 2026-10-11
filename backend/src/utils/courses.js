// Course suggestions for skill gaps.
//
// For each skill we keep two search topics. Rather than hardcoding specific course
// titles/URLs (which go stale or disappear), each suggestion links to a search for that
// topic, worded for the employee's current level, on Coursera, Udemy and YouTube (free).

const TOPICS = {
  machine_operation:   ['industrial machine operation basics', 'food processing equipment operation'],
  equipment_setup:     ['equipment setup and changeover', 'production line setup'],
  troubleshooting:     ['industrial troubleshooting', 'root cause troubleshooting manufacturing'],
  process_knowledge:   ['food manufacturing processes', 'lean manufacturing fundamentals'],
  cleaning_sanitation: ['cleaning and sanitation in food processing', 'sanitation standard operating procedures SSOP'],
  gmp_compliance:      ['good manufacturing practices GMP food', 'GMP training food industry'],
  hygiene_ppe:         ['food hygiene and personal protective equipment', 'food handler hygiene'],
  haccp_knowledge:     ['HACCP principles', 'HACCP food safety plan'],
  ccp_monitoring:      ['critical control point monitoring HACCP', 'food safety monitoring and verification'],
  quality_inspection:  ['quality inspection techniques', 'quality control in food manufacturing'],
  documentation:       ['manufacturing documentation and batch records', 'good documentation practices'],
  communication:       ['workplace communication skills', 'team communication at work'],
  teamwork:            ['teamwork skills', 'collaboration in the workplace'],
  problem_solving:     ['problem solving skills', 'root cause analysis 5 whys'],
  adaptability:        ['adaptability and change at work', 'resilience at work'],
  time_management:     ['time management skills', 'prioritization and productivity at work'],
  leadership:          ['team leadership skills', 'first time supervisor leadership'],
  machine_startup:     ['machine startup and shutdown procedures', 'lockout tagout equipment safety'],
  product_changeover:  ['production changeover reduction SMED', 'lean changeover'],
  safety_compliance:   ['occupational health and safety', 'workplace safety in manufacturing'],
  quality_sampling:    ['quality sampling methods', 'acceptance sampling quality control'],
  record_keeping:      ['accurate record keeping in manufacturing', 'data integrity basics'],
}

export const SKILL_LABELS = {
  machine_operation: 'Machine Operation', equipment_setup: 'Equipment Setup', troubleshooting: 'Troubleshooting',
  process_knowledge: 'Process Knowledge', cleaning_sanitation: 'Cleaning & Sanitation', gmp_compliance: 'GMP Compliance',
  hygiene_ppe: 'Hygiene & PPE', haccp_knowledge: 'HACCP Knowledge', ccp_monitoring: 'CCP Monitoring',
  quality_inspection: 'Quality Inspection', documentation: 'Documentation', communication: 'Communication',
  teamwork: 'Teamwork', problem_solving: 'Problem Solving', adaptability: 'Adaptability',
  time_management: 'Time Management', leadership: 'Leadership', machine_startup: 'Machine Startup',
  product_changeover: 'Product Changeover', safety_compliance: 'Safety Compliance',
  quality_sampling: 'Quality Sampling', record_keeping: 'Record Keeping',
}

// Level of material to look for, based on where the employee is now.
export const learningLevel = (empLevel) => (empLevel >= 4 ? 'Advanced' : empLevel === 3 ? 'Intermediate' : 'Beginner')

// Bigger gaps are more urgent.
export const gapPriority = (gap) => (gap >= 3 ? 'High' : gap === 2 ? 'Medium' : 'Low')

const LEVEL_WORDS = { Beginner: 'for beginners', Intermediate: 'intermediate', Advanced: 'advanced' }
const q = encodeURIComponent

export function getCourseSuggestions(skill, empLevel) {
  const topics = TOPICS[skill]
  if (!topics) return []
  const level = learningLevel(empLevel ?? 1)
  return topics.map(topic => {
    const query = `${topic} ${LEVEL_WORDS[level]}`
    return {
      topic,
      level,
      resources: [
        { provider: 'Coursera', free: false, url: `https://www.coursera.org/search?query=${q(query)}` },
        { provider: 'Udemy',    free: false, url: `https://www.udemy.com/courses/search/?q=${q(query)}` },
        { provider: 'YouTube',  free: true,  url: `https://www.youtube.com/results?search_query=${q(`${topic} tutorial`)}` },
      ],
    }
  })
}
