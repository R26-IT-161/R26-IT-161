import PDFDocument from 'pdfkit'

const GREEN     = '#1E8E3E'
const AMBER     = '#F29900'
const RED       = '#C5221F'
const DARK      = '#1F2937'
const MID       = '#6B7280'
const LIGHT_BG  = '#F9FAFB'
const BORDER    = '#E5E7EB'
const PRIMARY   = '#1A73E8'

function readinessColor(r) {
  if (r === 'Ready')           return GREEN
  if (r === 'Partially Ready') return AMBER
  return RED
}

export function generateDevelopmentPlan(stream, { employee, prediction, recommendations, nextReviewDate }) {
  const doc = new PDFDocument({ margin:50, size:'A4' })
  doc.pipe(stream)

  const W = doc.page.width - 100  // usable width

  // ── Header bar ───────────────────────────────────────────────────────────────
  doc.rect(0, 0, doc.page.width, 80).fill(PRIMARY)
  doc.fontSize(22).fillColor('#FFFFFF').font('Helvetica-Bold')
    .text('Employee Development Plan', 50, 25)
  doc.fontSize(10).fillColor('rgba(255,255,255,0.8)').font('Helvetica')
    .text(`Adaptive Skill Development Tracker  ·  Generated ${new Date().toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })}`, 50, 54)

  let y = 100

  // ── Employee info block ───────────────────────────────────────────────────────
  doc.rect(50, y, W, 80).fillAndStroke(LIGHT_BG, BORDER)
  // Avatar circle
  doc.circle(88, y+40, 24).fill(PRIMARY)
  doc.fontSize(18).fillColor('#FFFFFF').font('Helvetica-Bold')
    .text((employee.firstName?.[0]||'?').toUpperCase(), 76, y+28)

  doc.fontSize(16).fillColor(DARK).font('Helvetica-Bold')
    .text(`${employee.firstName} ${employee.lastName}`, 125, y+10)
  doc.fontSize(10).fillColor(MID).font('Helvetica')
    .text(employee.email, 125, y+30)
    .text(`Current Role: ${employee.jobRole || '—'}`, 125, y+46)
    .text(`Role Assessed: ${prediction.jobRole}`, 125, y+62)

  y += 100

  // ── Readiness summary ─────────────────────────────────────────────────────────
  const rc = readinessColor(prediction.readiness)
  doc.rect(50, y, W, 60).fillAndStroke('#FFFFFF', BORDER)
  doc.rect(50, y, 6, 60).fill(rc)  // left colour bar

  doc.fontSize(11).fillColor(MID).font('Helvetica').text('READINESS STATUS', 70, y+10)
  doc.fontSize(18).fillColor(rc).font('Helvetica-Bold').text(prediction.readiness, 70, y+26)

  // Confidence
  doc.fontSize(11).fillColor(MID).font('Helvetica').text('CONFIDENCE', 280, y+10)
  doc.fontSize(18).fillColor(DARK).font('Helvetica-Bold')
    .text(`${Math.round((prediction.confidence||0)*100)}%`, 280, y+26)

  // Total gap
  doc.fontSize(11).fillColor(MID).font('Helvetica').text('TOTAL GAP', 380, y+10)
  doc.fontSize(18).fillColor(DARK).font('Helvetica-Bold')
    .text(`${prediction.totalGap||0}`, 380, y+26)

  // Review date
  if (nextReviewDate) {
    doc.fontSize(11).fillColor(MID).font('Helvetica').text('NEXT REVIEW', 450, y+10)
    doc.fontSize(12).fillColor(DARK).font('Helvetica-Bold')
      .text(new Date(nextReviewDate).toLocaleDateString('en-GB'), 450, y+26)
  }

  y += 80

  // ── Development Actions ───────────────────────────────────────────────────────
  if (recommendations.length > 0) {
    doc.fontSize(13).fillColor(DARK).font('Helvetica-Bold').text('Development Actions', 50, y)
    doc.moveTo(50, y+18).lineTo(50+W, y+18).lineWidth(1).stroke(BORDER)
    y += 28

    recommendations.forEach((rec, i) => {
      const blockH = 96
      if (y + blockH > doc.page.height - 60) { doc.addPage(); y = 50 }

      // row background
      doc.rect(50, y, W, blockH).fillAndStroke(i%2===0?LIGHT_BG:'#FFFFFF', BORDER)

      // skill name + gap badge
      doc.fontSize(12).fillColor(DARK).font('Helvetica-Bold')
        .text(skillLabel(rec.skill), 62, y+8, { width: 260 })

      // gap badge
      const badgeTxt = `Gap +${rec.gap}`
      doc.rect(W-20, y+6, 58, 20).fill(RED+'22')
      doc.fontSize(9).fillColor(RED).font('Helvetica-Bold').text(badgeTxt, W-18, y+11)

      // action
      doc.fontSize(9).fillColor(MID).font('Helvetica').text('ACTION', 62, y+26)
      doc.fontSize(10).fillColor(DARK).font('Helvetica')
        .text(rec.action, 62, y+37, { width: W-30, lineBreak: false, ellipsis: true })

      // resource + timeframe
      doc.fontSize(9).fillColor(MID).font('Helvetica')
        .text(`Resource: ${rec.resource}`, 62, y+54, { width: 300 })
        .text(`Timeframe: ${rec.timeframe}`, W-80, y+54)

      // suggested courses (each topic links to a Coursera search)
      let cx = 62
      doc.fontSize(9).fillColor(MID).font('Helvetica-Bold').text('Courses:', cx, y+72, { lineBreak: false })
      cx += doc.widthOfString('Courses:') + 8
      doc.font('Helvetica')
      for (const c of (rec.courses || [])) {
        const label = `${c.topic} (${c.level})`
        const link  = c.resources?.[0]?.url
        const w = doc.widthOfString(label)
        if (cx + w > W + 30) break
        doc.fillColor('#1A73E8').text(label, cx, y+72, { lineBreak: false })
        doc.moveTo(cx, y+82).lineTo(cx+w, y+82).lineWidth(0.5).stroke('#1A73E8')
        if (link) doc.link(cx, y+72, w, 11, link)
        cx += w + 14
      }

      y += blockH + 4
    })
  } else {
    doc.rect(50, y, W, 60).fillAndStroke('#E6F4EA', '#1E8E3E')
    doc.fontSize(14).fillColor(GREEN).font('Helvetica-Bold')
      .text('✓  No skill gaps — this employee is fully ready for the role.', 62, y+20)
    y += 80
  }

  // ── Footer ────────────────────────────────────────────────────────────────────
  const footerY = doc.page.height - 40
  doc.rect(0, footerY-10, doc.page.width, 50).fill('#F3F4F6')
  doc.fontSize(8).fillColor(MID).font('Helvetica')
    .text('This development plan was generated automatically by the Adaptive Skill Development Tracker system.', 50, footerY, { align:'center', width: doc.page.width-100 })

  doc.end()
}

function skillLabel(key) {
  const MAP = {
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
  return MAP[key] || key
}
