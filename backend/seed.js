import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import { User }         from './src/models/User.js'
import { Employee }     from './src/models/Employee.js'
import { JobRole }      from './src/models/JobRole.js'
import { Organization } from './src/models/Organization.js'
import { Prediction }   from './src/models/Prediction.js'
dotenv.config()

const hash = (pw) => bcrypt.hashSync(pw, 10)

// ── Skills ────────────────────────────────────────────────────────────────────
const ALL_SKILLS = [
  'machine_operation','equipment_setup','troubleshooting','machine_startup',
  'product_changeover','process_knowledge','gmp_compliance','hygiene_ppe',
  'haccp_knowledge','ccp_monitoring','cleaning_sanitation','safety_compliance',
  'quality_inspection','quality_sampling','documentation','record_keeping',
  'communication','teamwork','problem_solving','adaptability',
  'time_management','leadership',
]

// ── Job Roles ─────────────────────────────────────────────────────────────────
const JOB_ROLES = [
  { name:'Line Operator',           category:'Production',  level:'Entry',
    description:'Operates production line machinery under supervision',
    requirements:{ machine_operation:3, equipment_setup:2, troubleshooting:2, machine_startup:3, product_changeover:2, gmp_compliance:3, hygiene_ppe:3, safety_compliance:3, communication:2, teamwork:3 } },
  { name:'Senior Line Operator',    category:'Production',  level:'Mid',
    description:'Experienced operator capable of solo line management',
    requirements:{ machine_operation:4, equipment_setup:3, troubleshooting:3, machine_startup:4, product_changeover:3, process_knowledge:3, gmp_compliance:4, hygiene_ppe:3, safety_compliance:4, communication:3, teamwork:3, problem_solving:3 } },
  { name:'Line Supervisor',         category:'Production',  level:'Senior',
    description:'Supervises production line team and ensures output targets',
    requirements:{ machine_operation:4, equipment_setup:4, troubleshooting:4, process_knowledge:4, gmp_compliance:4, hygiene_ppe:4, safety_compliance:4, communication:4, leadership:4, teamwork:4, problem_solving:4, time_management:4 } },
  { name:'Production Manager',      category:'Production',  level:'Manager',
    description:'Manages entire production department across all shifts',
    requirements:{ process_knowledge:5, communication:5, leadership:5, teamwork:4, problem_solving:5, adaptability:4, time_management:5, gmp_compliance:4, safety_compliance:4, documentation:4 } },
  { name:'Quality Inspector',       category:'Quality',     level:'Mid',
    description:'Inspects products and processes for compliance',
    requirements:{ quality_inspection:4, quality_sampling:4, documentation:4, record_keeping:4, gmp_compliance:4, haccp_knowledge:3, ccp_monitoring:3, communication:3 } },
  { name:'Quality Assurance Technician', category:'Quality', level:'Mid',
    description:'Ensures processes meet quality standards and specifications',
    requirements:{ quality_inspection:4, quality_sampling:4, documentation:5, record_keeping:5, gmp_compliance:5, haccp_knowledge:4, ccp_monitoring:4, problem_solving:3, communication:4 } },
  { name:'Food Safety Officer',     category:'Food Safety', level:'Senior',
    description:'Manages site food safety programme and compliance',
    requirements:{ gmp_compliance:5, hygiene_ppe:4, haccp_knowledge:5, ccp_monitoring:5, cleaning_sanitation:4, safety_compliance:5, documentation:4, record_keeping:4, communication:4, leadership:3 } },
  { name:'Maintenance Technician',  category:'Engineering', level:'Mid',
    description:'Maintains and repairs production equipment',
    requirements:{ machine_operation:4, equipment_setup:5, troubleshooting:5, machine_startup:4, process_knowledge:4, problem_solving:5, safety_compliance:4, documentation:3 } },
  { name:'Maintenance Engineer',    category:'Engineering', level:'Senior',
    description:'Plans and oversees engineering maintenance programme',
    requirements:{ machine_operation:4, equipment_setup:5, troubleshooting:5, machine_startup:4, process_knowledge:5, problem_solving:5, safety_compliance:5, documentation:4, leadership:3, time_management:4 } },
  { name:'Sanitation Operator',     category:'Hygiene',     level:'Entry',
    description:'Carries out cleaning and sanitation of production areas',
    requirements:{ cleaning_sanitation:4, hygiene_ppe:4, gmp_compliance:3, safety_compliance:3, documentation:2, record_keeping:2 } },
  { name:'Sanitation Supervisor',   category:'Hygiene',     level:'Senior',
    description:'Leads sanitation team and ensures compliance standards',
    requirements:{ cleaning_sanitation:5, hygiene_ppe:5, gmp_compliance:4, safety_compliance:4, documentation:4, record_keeping:4, leadership:4, communication:4, teamwork:4 } },
  { name:'Warehouse Operative',     category:'Logistics',   level:'Entry',
    description:'Handles goods-in, storage and despatch operations',
    requirements:{ process_knowledge:2, gmp_compliance:3, hygiene_ppe:3, safety_compliance:3, documentation:2, record_keeping:2, teamwork:3 } },
  { name:'Shift Manager',           category:'Management',  level:'Manager',
    description:'Manages all operations across a production shift',
    requirements:{ process_knowledge:4, communication:5, leadership:5, problem_solving:4, adaptability:5, time_management:5, gmp_compliance:4, safety_compliance:4, teamwork:4, documentation:3 } },
  { name:'Packer',                  category:'Production',  level:'Entry',
    description:'Packs finished goods to specification',
    requirements:{ machine_operation:2, gmp_compliance:3, hygiene_ppe:3, safety_compliance:3, quality_inspection:2, teamwork:3, time_management:2 } },
  { name:'Process Technician',      category:'Production',  level:'Mid',
    description:'Monitors and controls production processes',
    requirements:{ machine_operation:3, process_knowledge:4, troubleshooting:3, gmp_compliance:4, documentation:4, record_keeping:4, problem_solving:3, communication:3 } },
]

// ── Name pools ────────────────────────────────────────────────────────────────
const FIRST_NAMES = [
  'Aaron','Amara','Ali','Bella','Ben','Carl','Chloe','Chris','David','Diana',
  'Derek','Elena','Emil','Ethan','Eva','Faye','Felix','Fiona','Frank','George',
  'Gina','Grace','Gus','Hannah','Henry','Holly','Hugo','Ian','Irene','Ivan',
  'Jake','James','Joy','Julia','Kai','Karen','Kira','Kyle','Laura','Leo',
  'Liam','Lily','Maya','Max','Mia','Mike','Nathan','Nadia','Nina','Noah',
  'Oliver','Olivia','Ora','Oscar','Paul','Pete','Priya','Quinn','Rachel','Ravi',
  'Rosa','Sam','Sara','Sean','Tara','Ted','Tina','Tom','Uma','Usman',
  'Val','Vera','Victor','Vicky','Wade','Wendy','Will','Wren','Xander','Xena',
  'Xia','Xin','Yara','Yvonne','Yuki','Yusuf','Zack','Zara','Zoe','James',
  'Karen','Leo','Maya','Nathan','Olivia','Paul','Quinn','Rachel','Sam','Tara',
]
const LAST_NAMES = [
  'Ali','Allen','Anderson','Baker','Bell','Brown','Campbell','Carter','Chen','Collins',
  'Cook','Costa','Davis','Edwards','Evans','Ferreira','Fischer','Garcia','Green','Gupta',
  'Hall','Harris','Hoffmann','Iyer','Johnson','Jones','Kaur','Khan','King','Koch',
  'Krishna','Kumar','Lewis','Lopes','Martin','Martinez','Mehta','Miller','Mitchell','Morgan',
  'Morris','Murphy','Nair','Nelson','Nguyen','Oliveira','Park','Patel','Perez','Phillips',
  'Pillai','Rao','Reddy','Reed','Roberts','Robinson','Rogers','Romano','Russo','Sanchez',
  'Schmidt','Scott','Shah','Sharma','Singh','Smith','Sousa','Stewart','Taylor','Thompson',
  'Turner','Walker','White','Williams','Wilson','Wright','Young','Zhang','Zhou','Costa',
  'Ferreira','Silva','Santos','Oliveira','Souza','Lima','Pereira','Carvalho','Alves','Dias',
  'Brown','Davis','Garcia','Johnson','Lee','Lopez','Moore','Thomas','Wilson','Harris',
]

// ── Helpers ───────────────────────────────────────────────────────────────────
const rnd        = (min, max) => Math.floor(Math.random()*(max-min+1))+min
const pick       = (arr)      => arr[Math.floor(Math.random()*arr.length)]
const daysAgo    = (n)        => new Date(Date.now()-n*86400000)
const daysFromNow= (n)        => new Date(Date.now()+n*86400000)

function generateSkillProfile(roleReqs, experienceYears) {
  const profile  = {}
  const expBonus = Math.min(Math.floor(experienceYears/3), 2)
  ALL_SKILLS.forEach(skill => {
    const required = roleReqs[skill] || 0
    if (required === 0) {
      profile[skill] = rnd(1, 3)
    } else {
      profile[skill] = Math.max(1, Math.min(5, required + rnd(-2,2) + (expBonus>0?rnd(0,expBonus):0)))
    }
  })
  return profile
}

function scoreProfile(profile, requirements) {
  const reqEntries = Object.entries(requirements)
  let totalGap=0, criticalGaps=0
  const gaps=[]
  reqEntries.forEach(([skill,required]) => {
    const empLevel = profile[skill]||0
    const gap = Math.max(0, required-empLevel)
    if (gap>0) { totalGap+=gap; if(gap>=2) criticalGaps++; gaps.push({skill,empLevel,reqLevel:required,gap}) }
  })
  const metCount = reqEntries.filter(([s,r])=>(profile[s]||0)>=r).length
  const readiness = totalGap===0 ? 'Ready' : criticalGaps===0 ? 'Partially Ready' : 'Not Ready'
  const confidence = Math.max(0.20, Math.min(0.99, (metCount/reqEntries.length)*0.85+Math.random()*0.15))
  return { readiness, confidence, totalGap, criticalGaps, gaps:gaps.sort((a,b)=>b.gap-a.gap) }
}

function generatePredictionHistory(employeeId, role, profile, numPredictions) {
  const predictions=[]
  for (let i=numPredictions; i>=1; i--) {
    const olderProfile={}
    ALL_SKILLS.forEach(skill => {
      const current = profile[skill]||1
      const degradation = i>1 ? rnd(0,Math.min(i-1,2)) : 0
      olderProfile[skill] = Math.max(1, current-degradation)
    })
    const score = scoreProfile(olderProfile, role.requirements)
    predictions.push({ employeeId, jobRole:role.name, skillInput:olderProfile, ...score, createdAt:daysAgo(i*rnd(20,45)) })
  }
  return predictions
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function seed() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('✅ Connected')

  await Promise.all([User,Employee,JobRole,Organization,Prediction].map(M=>M.deleteMany({})))
  console.log('🗑  Cleared')

  const org = await Organization.create({ name:'TechCorp Ltd', domain:'company.com' })
  console.log(`🏢 ${org.name}`)

  const roles = await JobRole.insertMany(JOB_ROLES)
  const roleMap = {}
  roles.forEach(r => { roleMap[r.name]=r })
  console.log(`💼 ${roles.length} job roles`)

  // ── Staff accounts (unchanged) ─────────────────────────────────────────────
  await User.insertMany([
    { firstName:'Admin',  lastName:'User',    email:'admin@company.com',     password:hash('admin123'), role:'admin',      organizationId:org._id },
    { firstName:'Sarah',  lastName:'Johnson', email:'hr@company.com',        password:hash('hr123'),    role:'hr_manager', organizationId:org._id },
    { firstName:'Tom',    lastName:'Lee',     email:'supervisor@company.com',password:hash('super123'), role:'supervisor', organizationId:org._id },
    { firstName:'Alice',  lastName:'Chen',    email:'employee1@company.com', password:hash('emp123'),   role:'employee',   organizationId:org._id },
    { firstName:'Bob',    lastName:'Kumar',   email:'employee2@company.com', password:hash('emp123'),   role:'employee',   organizationId:org._id },
  ])
  console.log('👤 Staff accounts created')

  // ── Role distribution for 100 employees ───────────────────────────────────
  const ROLE_WEIGHTS = [
    { role:'Packer',                       dept:'Production Line A', weight:12 },
    { role:'Packer',                       dept:'Production Line B', weight:10 },
    { role:'Line Operator',                dept:'Production Line A', weight:14 },
    { role:'Line Operator',                dept:'Production Line B', weight:12 },
    { role:'Senior Line Operator',         dept:'Production Line A', weight:6  },
    { role:'Senior Line Operator',         dept:'Production Line B', weight:5  },
    { role:'Process Technician',           dept:'Production Line A', weight:4  },
    { role:'Process Technician',           dept:'Production Line B', weight:4  },
    { role:'Line Supervisor',              dept:'Production Line A', weight:2  },
    { role:'Line Supervisor',              dept:'Production Line B', weight:2  },
    { role:'Quality Inspector',            dept:'Quality Assurance', weight:5  },
    { role:'Quality Assurance Technician', dept:'Quality Assurance', weight:3  },
    { role:'Food Safety Officer',          dept:'Food Safety',       weight:2  },
    { role:'Maintenance Technician',       dept:'Engineering',       weight:5  },
    { role:'Maintenance Engineer',         dept:'Engineering',       weight:2  },
    { role:'Sanitation Operator',          dept:'Sanitation',        weight:6  },
    { role:'Sanitation Supervisor',        dept:'Sanitation',        weight:1  },
    { role:'Warehouse Operative',          dept:'Warehouse',         weight:5  },
    { role:'Shift Manager',                dept:'Management',        weight:2  },
    { role:'Production Manager',           dept:'Management',        weight:1  },
  ]

  const roleSlots = []
  ROLE_WEIGHTS.forEach(rw => { for(let i=0;i<rw.weight;i++) roleSlots.push(rw) })
  for(let i=roleSlots.length-1;i>0;i--){const j=rnd(0,i);[roleSlots[i],roleSlots[j]]=[roleSlots[j],roleSlots[i]]}

  // shuffle name pairs
  const namePairs=[]
  FIRST_NAMES.forEach(f=>LAST_NAMES.forEach(l=>namePairs.push([f,l])))
  for(let i=namePairs.length-1;i>0;i--){const j=rnd(0,i);[namePairs[i],namePairs[j]]=[namePairs[j],namePairs[i]]}

  // ── Generate 100 employees ─────────────────────────────────────────────────
  console.log('👥 Generating 100 employees…')
  const usedEmails = new Set()
  const employeeData = []

  for (let i=0; i<100; i++) {
    const slot    = roleSlots[i % roleSlots.length]
    const role    = roleMap[slot.role]
    const expYrs  = rnd(0,15)
    const profile = generateSkillProfile(role.requirements, expYrs)
    const [fn,ln] = namePairs[i]

    let email = `${fn.toLowerCase()}.${ln.toLowerCase()}@company.com`
    if (usedEmails.has(email)) email = `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@company.com`
    usedEmails.add(email)

    const reviewDate = Math.random()<0.4
      ? (Math.random()<0.25 ? daysAgo(rnd(1,15)) : daysFromNow(rnd(1,60)))
      : null

    employeeData.push({
      firstName:      fn,
      lastName:       ln,
      email,
      jobRole:        slot.role,
      organizationId: org._id,
      skillProfile:   profile,
      nextReviewDate: reviewDate,
      createdAt:      daysAgo(rnd(30,730)),
    })
  }

  const employees = await Employee.insertMany(employeeData)
  console.log(`👥 ${employees.length} employees created`)

  // ── Generate predictions ───────────────────────────────────────────────────
  console.log('🔮 Generating prediction history…')
  const predictionDocs = []

  for (const emp of employees) {
    const role = roleMap[emp.jobRole]
    if (!role) continue
    const profile  = Object.fromEntries(emp.skillProfile)
    const numPreds = Math.random()<0.3 ? 3 : Math.random()<0.57 ? 2 : 1
    generatePredictionHistory(emp._id, role, profile, numPreds).forEach(p => predictionDocs.push(p))
  }

  for (let i=0; i<predictionDocs.length; i+=50) {
    await Prediction.insertMany(predictionDocs.slice(i,i+50))
  }
  console.log(`🔮 ${predictionDocs.length} predictions created`)

  // ── Summary ────────────────────────────────────────────────────────────────
  const latest = {}
  predictionDocs.forEach(p => {
    const k = p.employeeId.toString()
    if (!latest[k] || p.createdAt > latest[k].createdAt) latest[k]=p
  })
  const counts = { Ready:0,'Partially Ready':0,'Not Ready':0 }
  Object.values(latest).forEach(p => { if(counts[p.readiness]!==undefined) counts[p.readiness]++ })
  const dueCount = employeeData.filter(e=>e.nextReviewDate).length

  console.log('\n✅ Seed complete!\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`  Org:         TechCorp Ltd`)
  console.log(`  Employees:   ${employees.length}`)
  console.log(`  Predictions: ${predictionDocs.length}`)
  console.log(`  Job Roles:   ${roles.length}`)
  console.log(`  Ready:       ${counts['Ready']}`)
  console.log(`  Partial:     ${counts['Partially Ready']}`)
  console.log(`  Not Ready:   ${counts['Not Ready']}`)
  console.log(`  Review Due:  ${dueCount} employees`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('\n  LOGIN CREDENTIALS')
  console.log('  Admin:      admin@company.com      / admin123')
  console.log('  HR Manager: hr@company.com         / hr123')
  console.log('  Supervisor: supervisor@company.com / super123')
  console.log('  Employee 1: employee1@company.com  / emp123')
  console.log('  Employee 2: employee2@company.com  / emp123')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  process.exit(0)
}

seed().catch(e => { console.error(e); process.exit(1) })
