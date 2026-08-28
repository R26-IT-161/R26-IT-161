"""
job_config.py - Dynamic Job Configuration System
=================================================
Allows easy addition of new food industry jobs with customized skill requirements.
Each job defines which of the 22 skills are required at what level (1-5).
"""

from typing import Dict, List

# ── Core 22 Skills (constant across all jobs) ──────────────────────────────
SKILLS = [
    # Technical
    'machine_operation', 'equipment_setup', 'troubleshooting',
    'process_knowledge', 'cleaning_sanitation',
    # Food Safety
    'gmp_compliance', 'hygiene_ppe', 'haccp_knowledge',
    'ccp_monitoring', 'quality_inspection', 'documentation',
    # Soft Skills
    'communication', 'teamwork', 'problem_solving',
    'adaptability', 'time_management', 'leadership',
    # Task-Based
    'machine_startup', 'product_changeover', 'safety_compliance',
    'quality_sampling', 'record_keeping',
]

SKILL_CATEGORIES = {
    'Technical': ['machine_operation', 'equipment_setup', 'troubleshooting', 'process_knowledge', 'cleaning_sanitation'],
    'Food Safety': ['gmp_compliance', 'hygiene_ppe', 'haccp_knowledge', 'ccp_monitoring', 'quality_inspection', 'documentation'],
    'Soft Skills': ['communication', 'teamwork', 'problem_solving', 'adaptability', 'time_management', 'leadership'],
    'Task-Based': ['machine_startup', 'product_changeover', 'safety_compliance', 'quality_sampling', 'record_keeping'],
}

# ── JOB DEFINITIONS ────────────────────────────────────────────────────────
# 
# Each job specifies REQUIRED SKILL LEVELS (1-5) for all 22 skills
# 5 = High (critical), 3 = Medium (important), 1 = Low (basic)
#
# To ADD a new job:
# 1. Create a new dict with job name as key
# 2. List all 22 skills with required level (1-5)
# 3. Add to JOBS dict below
#

# ── Original 5 Jobs (from proposal) ────────────────────────────────────────
ORIGINAL_JOBS = {
    'Machine Operator': {
        'machine_operation': 5, 'equipment_setup': 5, 'troubleshooting': 3,
        'process_knowledge': 5, 'cleaning_sanitation': 3,
        'gmp_compliance': 5, 'hygiene_ppe': 5, 'haccp_knowledge': 3,
        'ccp_monitoring': 3, 'quality_inspection': 3, 'documentation': 3,
        'communication': 3, 'teamwork': 5, 'problem_solving': 3,
        'adaptability': 3, 'time_management': 5, 'leadership': 1,
        'machine_startup': 5, 'product_changeover': 5, 'safety_compliance': 5,
        'quality_sampling': 3, 'record_keeping': 3,
    },
    'Production Worker': {
        'machine_operation': 3, 'equipment_setup': 1, 'troubleshooting': 1,
        'process_knowledge': 3, 'cleaning_sanitation': 3,
        'gmp_compliance': 5, 'hygiene_ppe': 5, 'haccp_knowledge': 1,
        'ccp_monitoring': 1, 'quality_inspection': 1, 'documentation': 1,
        'communication': 3, 'teamwork': 5, 'problem_solving': 1,
        'adaptability': 3, 'time_management': 3, 'leadership': 1,
        'machine_startup': 1, 'product_changeover': 1, 'safety_compliance': 3,
        'quality_sampling': 1, 'record_keeping': 1,
    },
    'QA Technician': {
        'machine_operation': 1, 'equipment_setup': 1, 'troubleshooting': 1,
        'process_knowledge': 3, 'cleaning_sanitation': 5,
        'gmp_compliance': 5, 'hygiene_ppe': 5, 'haccp_knowledge': 5,
        'ccp_monitoring': 5, 'quality_inspection': 5, 'documentation': 5,
        'communication': 5, 'teamwork': 5, 'problem_solving': 5,
        'adaptability': 5, 'time_management': 5, 'leadership': 3,
        'machine_startup': 1, 'product_changeover': 1, 'safety_compliance': 5,
        'quality_sampling': 5, 'record_keeping': 5,
    },
    'Packer': {
        'machine_operation': 1, 'equipment_setup': 1, 'troubleshooting': 1,
        'process_knowledge': 1, 'cleaning_sanitation': 3,
        'gmp_compliance': 3, 'hygiene_ppe': 5, 'haccp_knowledge': 1,
        'ccp_monitoring': 1, 'quality_inspection': 1, 'documentation': 1,
        'communication': 1, 'teamwork': 3, 'problem_solving': 1,
        'adaptability': 3, 'time_management': 3, 'leadership': 1,
        'machine_startup': 1, 'product_changeover': 1, 'safety_compliance': 3,
        'quality_sampling': 1, 'record_keeping': 1,
    },
    'Supervisor': {
        'machine_operation': 3, 'equipment_setup': 3, 'troubleshooting': 5,
        'process_knowledge': 5, 'cleaning_sanitation': 5,
        'gmp_compliance': 5, 'hygiene_ppe': 5, 'haccp_knowledge': 5,
        'ccp_monitoring': 5, 'quality_inspection': 3, 'documentation': 5,
        'communication': 5, 'teamwork': 5, 'problem_solving': 5,
        'adaptability': 5, 'time_management': 5, 'leadership': 5,
        'machine_startup': 3, 'product_changeover': 3, 'safety_compliance': 5,
        'quality_sampling': 3, 'record_keeping': 5,
    },
}

# ── NEW FOOD INDUSTRY JOBS ─────────────────────────────────────────────────
# Add your new jobs here using same 22-skill format as above
# 25 total food industry jobs for comprehensive workforce modeling

NEW_JOBS = {
    # ── Tier 1: Food Safety & Quality (Highest GMP/HACCP Focus) ──────────
    'Food Safety Manager': {
        'machine_operation': 2, 'equipment_setup': 2, 'troubleshooting': 1,
        'process_knowledge': 5, 'cleaning_sanitation': 5,
        'gmp_compliance': 5, 'hygiene_ppe': 5, 'haccp_knowledge': 5,
        'ccp_monitoring': 5, 'quality_inspection': 4, 'documentation': 5,
        'communication': 5, 'teamwork': 5, 'problem_solving': 5,
        'adaptability': 5, 'time_management': 5, 'leadership': 5,
        'machine_startup': 1, 'product_changeover': 1, 'safety_compliance': 5,
        'quality_sampling': 4, 'record_keeping': 5,
    },
    'Food Scientist': {
        'machine_operation': 1, 'equipment_setup': 2, 'troubleshooting': 3,
        'process_knowledge': 5, 'cleaning_sanitation': 4,
        'gmp_compliance': 5, 'hygiene_ppe': 4, 'haccp_knowledge': 5,
        'ccp_monitoring': 5, 'quality_inspection': 5, 'documentation': 5,
        'communication': 5, 'teamwork': 4, 'problem_solving': 5,
        'adaptability': 4, 'time_management': 4, 'leadership': 2,
        'machine_startup': 1, 'product_changeover': 2, 'safety_compliance': 5,
        'quality_sampling': 5, 'record_keeping': 5,
    },
    'Quality Assurance Inspector': {
        'machine_operation': 1, 'equipment_setup': 1, 'troubleshooting': 2,
        'process_knowledge': 3, 'cleaning_sanitation': 4,
        'gmp_compliance': 5, 'hygiene_ppe': 4, 'haccp_knowledge': 4,
        'ccp_monitoring': 4, 'quality_inspection': 5, 'documentation': 5,
        'communication': 4, 'teamwork': 3, 'problem_solving': 4,
        'adaptability': 3, 'time_management': 4, 'leadership': 1,
        'machine_startup': 1, 'product_changeover': 1, 'safety_compliance': 5,
        'quality_sampling': 5, 'record_keeping': 5,
    },
    'Laboratory Analyst': {
        'machine_operation': 1, 'equipment_setup': 3, 'troubleshooting': 3,
        'process_knowledge': 4, 'cleaning_sanitation': 5,
        'gmp_compliance': 5, 'hygiene_ppe': 4, 'haccp_knowledge': 5,
        'ccp_monitoring': 4, 'quality_inspection': 5, 'documentation': 5,
        'communication': 3, 'teamwork': 2, 'problem_solving': 5,
        'adaptability': 3, 'time_management': 4, 'leadership': 1,
        'machine_startup': 1, 'product_changeover': 1, 'safety_compliance': 5,
        'quality_sampling': 5, 'record_keeping': 5,
    },

    # ── Tier 2: Operations & Production Leadership ─────────────────────
    'Production Line Leader': {
        'machine_operation': 4, 'equipment_setup': 3, 'troubleshooting': 3,
        'process_knowledge': 4, 'cleaning_sanitation': 4,
        'gmp_compliance': 5, 'hygiene_ppe': 5, 'haccp_knowledge': 3,
        'ccp_monitoring': 3, 'quality_inspection': 2, 'documentation': 3,
        'communication': 4, 'teamwork': 5, 'problem_solving': 4,
        'adaptability': 4, 'time_management': 4, 'leadership': 4,
        'machine_startup': 4, 'product_changeover': 4, 'safety_compliance': 5,
        'quality_sampling': 2, 'record_keeping': 3,
    },
    'Production Manager': {
        'machine_operation': 3, 'equipment_setup': 3, 'troubleshooting': 4,
        'process_knowledge': 5, 'cleaning_sanitation': 4,
        'gmp_compliance': 5, 'hygiene_ppe': 5, 'haccp_knowledge': 4,
        'ccp_monitoring': 4, 'quality_inspection': 4, 'documentation': 5,
        'communication': 5, 'teamwork': 5, 'problem_solving': 5,
        'adaptability': 5, 'time_management': 5, 'leadership': 5,
        'machine_startup': 3, 'product_changeover': 4, 'safety_compliance': 5,
        'quality_sampling': 3, 'record_keeping': 4,
    },
    'Shift Supervisor': {
        'machine_operation': 3, 'equipment_setup': 3, 'troubleshooting': 3,
        'process_knowledge': 4, 'cleaning_sanitation': 4,
        'gmp_compliance': 5, 'hygiene_ppe': 5, 'haccp_knowledge': 4,
        'ccp_monitoring': 4, 'quality_inspection': 3, 'documentation': 4,
        'communication': 5, 'teamwork': 5, 'problem_solving': 4,
        'adaptability': 4, 'time_management': 5, 'leadership': 5,
        'machine_startup': 3, 'product_changeover': 3, 'safety_compliance': 5,
        'quality_sampling': 2, 'record_keeping': 4,
    },

    # ── Tier 3: Hygiene & Sanitation ──────────────────────────────────
    'Hygiene & Sanitation Specialist': {
        'machine_operation': 1, 'equipment_setup': 2, 'troubleshooting': 2,
        'process_knowledge': 3, 'cleaning_sanitation': 5,
        'gmp_compliance': 5, 'hygiene_ppe': 5, 'haccp_knowledge': 4,
        'ccp_monitoring': 3, 'quality_inspection': 4, 'documentation': 4,
        'communication': 3, 'teamwork': 3, 'problem_solving': 2,
        'adaptability': 3, 'time_management': 4, 'leadership': 1,
        'machine_startup': 1, 'product_changeover': 1, 'safety_compliance': 5,
        'quality_sampling': 3, 'record_keeping': 4,
    },
    'Environmental Health & Safety Officer': {
        'machine_operation': 1, 'equipment_setup': 2, 'troubleshooting': 2,
        'process_knowledge': 4, 'cleaning_sanitation': 5,
        'gmp_compliance': 5, 'hygiene_ppe': 5, 'haccp_knowledge': 4,
        'ccp_monitoring': 3, 'quality_inspection': 4, 'documentation': 5,
        'communication': 5, 'teamwork': 4, 'problem_solving': 4,
        'adaptability': 4, 'time_management': 4, 'leadership': 3,
        'machine_startup': 1, 'product_changeover': 1, 'safety_compliance': 5,
        'quality_sampling': 3, 'record_keeping': 5,
    },
    'Cleaning Supervisor': {
        'machine_operation': 1, 'equipment_setup': 2, 'troubleshooting': 1,
        'process_knowledge': 2, 'cleaning_sanitation': 5,
        'gmp_compliance': 5, 'hygiene_ppe': 5, 'haccp_knowledge': 3,
        'ccp_monitoring': 2, 'quality_inspection': 3, 'documentation': 3,
        'communication': 4, 'teamwork': 4, 'problem_solving': 2,
        'adaptability': 3, 'time_management': 4, 'leadership': 4,
        'machine_startup': 1, 'product_changeover': 1, 'safety_compliance': 5,
        'quality_sampling': 2, 'record_keeping': 3,
    },

    # ── Tier 4: Equipment & Maintenance ───────────────────────────────
    'Maintenance Technician': {
        'machine_operation': 4, 'equipment_setup': 5, 'troubleshooting': 5,
        'process_knowledge': 4, 'cleaning_sanitation': 4,
        'gmp_compliance': 4, 'hygiene_ppe': 4, 'haccp_knowledge': 2,
        'ccp_monitoring': 2, 'quality_inspection': 2, 'documentation': 3,
        'communication': 3, 'teamwork': 3, 'problem_solving': 5,
        'adaptability': 4, 'time_management': 4, 'leadership': 1,
        'machine_startup': 5, 'product_changeover': 4, 'safety_compliance': 5,
        'quality_sampling': 1, 'record_keeping': 3,
    },
    'Equipment Operator (CIP/SIP)': {
        'machine_operation': 5, 'equipment_setup': 4, 'troubleshooting': 3,
        'process_knowledge': 3, 'cleaning_sanitation': 5,
        'gmp_compliance': 5, 'hygiene_ppe': 5, 'haccp_knowledge': 2,
        'ccp_monitoring': 2, 'quality_inspection': 2, 'documentation': 3,
        'communication': 2, 'teamwork': 3, 'problem_solving': 2,
        'adaptability': 3, 'time_management': 4, 'leadership': 1,
        'machine_startup': 5, 'product_changeover': 4, 'safety_compliance': 5,
        'quality_sampling': 1, 'record_keeping': 2,
    },
    'HVAC Technician': {
        'machine_operation': 3, 'equipment_setup': 5, 'troubleshooting': 5,
        'process_knowledge': 2, 'cleaning_sanitation': 3,
        'gmp_compliance': 4, 'hygiene_ppe': 4, 'haccp_knowledge': 2,
        'ccp_monitoring': 2, 'quality_inspection': 2, 'documentation': 3,
        'communication': 3, 'teamwork': 2, 'problem_solving': 5,
        'adaptability': 3, 'time_management': 4, 'leadership': 1,
        'machine_startup': 4, 'product_changeover': 2, 'safety_compliance': 5,
        'quality_sampling': 1, 'record_keeping': 3,
    },

    # ── Tier 5: Packaging & Filling ───────────────────────────────────
    'Packaging Operator': {
        'machine_operation': 4, 'equipment_setup': 2, 'troubleshooting': 1,
        'process_knowledge': 2, 'cleaning_sanitation': 3,
        'gmp_compliance': 4, 'hygiene_ppe': 5, 'haccp_knowledge': 1,
        'ccp_monitoring': 1, 'quality_inspection': 2, 'documentation': 1,
        'communication': 2, 'teamwork': 4, 'problem_solving': 1,
        'adaptability': 3, 'time_management': 3, 'leadership': 1,
        'machine_startup': 4, 'product_changeover': 3, 'safety_compliance': 4,
        'quality_sampling': 1, 'record_keeping': 2,
    },
    'Filling Line Operator': {
        'machine_operation': 5, 'equipment_setup': 3, 'troubleshooting': 2,
        'process_knowledge': 3, 'cleaning_sanitation': 4,
        'gmp_compliance': 5, 'hygiene_ppe': 5, 'haccp_knowledge': 2,
        'ccp_monitoring': 3, 'quality_inspection': 3, 'documentation': 2,
        'communication': 2, 'teamwork': 4, 'problem_solving': 2,
        'adaptability': 3, 'time_management': 4, 'leadership': 1,
        'machine_startup': 5, 'product_changeover': 4, 'safety_compliance': 5,
        'quality_sampling': 2, 'record_keeping': 2,
    },
    'Labeling Technician': {
        'machine_operation': 3, 'equipment_setup': 2, 'troubleshooting': 1,
        'process_knowledge': 1, 'cleaning_sanitation': 2,
        'gmp_compliance': 3, 'hygiene_ppe': 4, 'haccp_knowledge': 1,
        'ccp_monitoring': 1, 'quality_inspection': 3, 'documentation': 4,
        'communication': 2, 'teamwork': 3, 'problem_solving': 1,
        'adaptability': 2, 'time_management': 3, 'leadership': 1,
        'machine_startup': 2, 'product_changeover': 2, 'safety_compliance': 3,
        'quality_sampling': 1, 'record_keeping': 4,
    },

    # ── Tier 6: Warehouse & Logistics ─────────────────────────────────
    'Warehouse & Logistics Coordinator': {
        'machine_operation': 2, 'equipment_setup': 2, 'troubleshooting': 1,
        'process_knowledge': 3, 'cleaning_sanitation': 3,
        'gmp_compliance': 4, 'hygiene_ppe': 4, 'haccp_knowledge': 2,
        'ccp_monitoring': 2, 'quality_inspection': 2, 'documentation': 3,
        'communication': 4, 'teamwork': 4, 'problem_solving': 3,
        'adaptability': 4, 'time_management': 5, 'leadership': 2,
        'machine_startup': 1, 'product_changeover': 2, 'safety_compliance': 4,
        'quality_sampling': 1, 'record_keeping': 4,
    },
    'Inventory Manager': {
        'machine_operation': 1, 'equipment_setup': 1, 'troubleshooting': 1,
        'process_knowledge': 4, 'cleaning_sanitation': 2,
        'gmp_compliance': 4, 'hygiene_ppe': 3, 'haccp_knowledge': 3,
        'ccp_monitoring': 3, 'quality_inspection': 3, 'documentation': 5,
        'communication': 4, 'teamwork': 4, 'problem_solving': 4,
        'adaptability': 4, 'time_management': 5, 'leadership': 3,
        'machine_startup': 1, 'product_changeover': 1, 'safety_compliance': 4,
        'quality_sampling': 2, 'record_keeping': 5,
    },
    'Forklift Operator': {
        'machine_operation': 4, 'equipment_setup': 2, 'troubleshooting': 2,
        'process_knowledge': 2, 'cleaning_sanitation': 2,
        'gmp_compliance': 3, 'hygiene_ppe': 4, 'haccp_knowledge': 1,
        'ccp_monitoring': 1, 'quality_inspection': 1, 'documentation': 1,
        'communication': 2, 'teamwork': 3, 'problem_solving': 2,
        'adaptability': 3, 'time_management': 3, 'leadership': 1,
        'machine_startup': 2, 'product_changeover': 1, 'safety_compliance': 5,
        'quality_sampling': 1, 'record_keeping': 1,
    },

    # ── Tier 7: Specialized Roles ─────────────────────────────────────
    'Regulatory Affairs Specialist': {
        'machine_operation': 1, 'equipment_setup': 1, 'troubleshooting': 1,
        'process_knowledge': 4, 'cleaning_sanitation': 2,
        'gmp_compliance': 5, 'hygiene_ppe': 2, 'haccp_knowledge': 5,
        'ccp_monitoring': 4, 'quality_inspection': 4, 'documentation': 5,
        'communication': 5, 'teamwork': 4, 'problem_solving': 5,
        'adaptability': 4, 'time_management': 4, 'leadership': 2,
        'machine_startup': 1, 'product_changeover': 1, 'safety_compliance': 5,
        'quality_sampling': 3, 'record_keeping': 5,
    },
    'Production Planner': {
        'machine_operation': 2, 'equipment_setup': 2, 'troubleshooting': 1,
        'process_knowledge': 5, 'cleaning_sanitation': 2,
        'gmp_compliance': 4, 'hygiene_ppe': 2, 'haccp_knowledge': 2,
        'ccp_monitoring': 2, 'quality_inspection': 2, 'documentation': 5,
        'communication': 4, 'teamwork': 4, 'problem_solving': 5,
        'adaptability': 5, 'time_management': 5, 'leadership': 2,
        'machine_startup': 2, 'product_changeover': 3, 'safety_compliance': 3,
        'quality_sampling': 1, 'record_keeping': 5,
    },
    'Training Coordinator': {
        'machine_operation': 2, 'equipment_setup': 2, 'troubleshooting': 1,
        'process_knowledge': 4, 'cleaning_sanitation': 3,
        'gmp_compliance': 5, 'hygiene_ppe': 4, 'haccp_knowledge': 5,
        'ccp_monitoring': 3, 'quality_inspection': 3, 'documentation': 5,
        'communication': 5, 'teamwork': 4, 'problem_solving': 4,
        'adaptability': 4, 'time_management': 4, 'leadership': 3,
        'machine_startup': 2, 'product_changeover': 2, 'safety_compliance': 5,
        'quality_sampling': 2, 'record_keeping': 5,
    },
}

# ── COMBINED JOBS REGISTRY ────────────────────────────────────────────────
# Merge original and new jobs
JOBS = {**ORIGINAL_JOBS, **NEW_JOBS}

# ── VALIDATION ────────────────────────────────────────────────────────────

def validate_job_config(job_name: str, requirements: Dict[str, int]) -> bool:
    """
    Validate that a job configuration has all 22 skills with values 1-5.
    
    Args:
        job_name: Name of the job
        requirements: Dict of skill -> required_level
    
    Returns:
        True if valid, raises ValueError otherwise
    """
    # Check all skills present
    missing = set(SKILLS) - set(requirements.keys())
    if missing:
        raise ValueError(f"Job '{job_name}' missing skills: {missing}")
    
    extra = set(requirements.keys()) - set(SKILLS)
    if extra:
        raise ValueError(f"Job '{job_name}' has unknown skills: {extra}")
    
    # Check all values 1-5
    for skill, level in requirements.items():
        if not isinstance(level, int) or level < 1 or level > 5:
            raise ValueError(f"Job '{job_name}': skill '{skill}' must be 1-5, got {level}")
    
    return True

# Validate all jobs on import
for job_name, reqs in JOBS.items():
    try:
        validate_job_config(job_name, reqs)
    except ValueError as e:
        print(f"❌ Validation error: {e}")

print(f"✅ Loaded {len(JOBS)} food industry jobs")
print(f"   Original: {list(ORIGINAL_JOBS.keys())}")
print(f"   New: {sorted(list(NEW_JOBS.keys()))}")

# ── HELPER FUNCTIONS ──────────────────────────────────────────────────────

def get_job_requirements(job_name: str) -> Dict[str, int]:
    """Get skill requirements for a specific job."""
    if job_name not in JOBS:
        raise ValueError(f"Job '{job_name}' not found. Available: {list(JOBS.keys())}")
    return JOBS[job_name]

def list_all_jobs() -> List[str]:
    """Get list of all available jobs."""
    return sorted(JOBS.keys())

def get_skill_requirement(job_name: str, skill_name: str) -> int:
    """Get specific skill requirement for a job."""
    if job_name not in JOBS:
        raise ValueError(f"Job '{job_name}' not found")
    if skill_name not in SKILLS:
        raise ValueError(f"Skill '{skill_name}' not found")
    return JOBS[job_name][skill_name]

def add_custom_job(job_name: str, requirements: Dict[str, int]) -> bool:
    """
    Dynamically add a new custom job to the system.
    
    Usage:
        add_custom_job('Custom Operator', {
            'machine_operation': 5,
            'gmp_compliance': 5,
            ... (all 22 skills)
        })
    """
    if validate_job_config(job_name, requirements):
        JOBS[job_name] = requirements
        print(f"✅ Added job: {job_name}")
        return True
    return False

if __name__ == "__main__":
    print("\n=== Job Configuration System ===")
    print(f"Total jobs: {len(JOBS)}")
    print(f"Total skills: {len(SKILLS)}")
    print(f"\nAvailable jobs:")
    for i, job in enumerate(list_all_jobs(), 1):
        print(f"  {i:2d}. {job}")
