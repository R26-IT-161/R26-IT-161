// Hardcoded per-skill recommendations
// Each skill has: action (what to do), resource (where/how), timeframe
const RECS = {
  machine_operation:    { action:'Schedule supervised floor practice on primary production line',  resource:'On-the-job training with line lead',       timeframe:'2–3 weeks' },
  equipment_setup:      { action:'Complete equipment setup checklist with senior operator',        resource:'Standard Operating Procedure manual',       timeframe:'1–2 weeks' },
  troubleshooting:      { action:'Shadow maintenance technician during shift changeovers',         resource:'Maintenance team mentorship',               timeframe:'2–4 weeks' },
  machine_startup:      { action:'Practice startup sequence under supervision for 5 shifts',      resource:'Line lead sign-off after each session',     timeframe:'1–2 weeks' },
  product_changeover:   { action:'Observe and assist 3 full changeovers before solo attempt',     resource:'Changeover SOP and line supervisor',        timeframe:'2–3 weeks' },
  process_knowledge:    { action:'Complete internal process overview training module',             resource:'LMS: Process Fundamentals course',          timeframe:'1 week'    },
  gmp_compliance:       { action:'Retake GMP Level 1 certification course',                       resource:'Internal training portal — GMP-101',        timeframe:'3–5 days'  },
  hygiene_ppe:          { action:'Attend hygiene and PPE refresher workshop',                     resource:'Food Safety team — monthly workshop',       timeframe:'1 day'     },
  haccp_knowledge:      { action:'Complete HACCP Level 2 certification training',                 resource:'Internal HACCP course or BRC e-learning',   timeframe:'1–2 weeks' },
  ccp_monitoring:       { action:'Practice CCP log completion on the floor for 2 weeks',          resource:'Food Safety Officer supervision',           timeframe:'2 weeks'   },
  cleaning_sanitation:  { action:'Complete cleaning and sanitation procedure sign-off',           resource:'Sanitation team and C&S SOP document',     timeframe:'3–5 days'  },
  safety_compliance:    { action:'Attend site safety induction and fire safety refresher',        resource:'HSE team — mandatory safety training',     timeframe:'1 day'     },
  quality_inspection:   { action:'Shadow QA technician for 1 week and complete 10 inspections',  resource:'Quality Assurance department',              timeframe:'1–2 weeks' },
  quality_sampling:     { action:'Train on sampling procedures with QA team',                    resource:'QA sampling SOP and team supervisor',      timeframe:'3–5 days'  },
  documentation:        { action:'Practice completing production logs and batch records',         resource:'Document control team guidance',            timeframe:'1 week'    },
  record_keeping:       { action:'Review record keeping standards and complete 2-week log audit', resource:'Quality Assurance department review',      timeframe:'2 weeks'   },
  communication:        { action:'Participate in team briefings and present one shift report',    resource:'Line supervisor coaching',                 timeframe:'Ongoing'   },
  teamwork:             { action:'Assign to cross-functional project or task force',              resource:'HR-led team collaboration programme',      timeframe:'4–6 weeks' },
  problem_solving:      { action:'Complete root cause analysis (RCA) training module',           resource:'LMS: Problem Solving & RCA course',         timeframe:'1 week'    },
  adaptability:         { action:'Rotate across 2 different lines or departments for 1 month',   resource:'Line supervisor and HR coordination',      timeframe:'4 weeks'   },
  time_management:      { action:'Implement daily task prioritisation with supervisor check-in',  resource:'1-to-1 coaching with line manager',        timeframe:'2–3 weeks' },
  leadership:           { action:'Assign as acting team lead for one shift per week',            resource:'Supervisor mentoring and feedback sessions',timeframe:'4–6 weeks' },
}

const DEFAULT = {
  action:    'Identify training resources and create a targeted development plan',
  resource:  'HR department and line manager',
  timeframe: '2–4 weeks',
}

export function getRecommendations(gaps) {
  return gaps.map(g => ({
    skill:     g.skill,
    gap:       g.gap,
    empLevel:  g.empLevel  ?? null,
    reqLevel:  g.reqLevel  ?? null,
    ...( RECS[g.skill] || { ...DEFAULT }),
  }))
}
