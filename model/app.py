"""
app_simple.py — Simple Flask REST API for HuggingFace Spaces
============================================================
Works with HuggingFace Spaces without Gradio compatibility issues.
Includes HTML web interface + REST API.
"""

from flask import Flask, jsonify, request, render_template_string
from flask_cors import CORS
import pandas as pd
import numpy as np
import joblib
import ast
import os
from typing import Dict, Tuple, List
import json

# Import dynamic job configuration
from job_config import SKILLS, JOBS, list_all_jobs, get_job_requirements

app = Flask(__name__)
CORS(app)

# ── Paths ─────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
MODELS_DIR = os.path.join(BASE_DIR, 'models')

# ── Load Model & Data ─────────────────────────────────────────────────
print("Loading model and data...")
try:
    model = joblib.load(os.path.join(MODELS_DIR, 'xgb_readiness_model.pkl'))
    feature_cols = joblib.load(os.path.join(MODELS_DIR, 'feature_names.pkl'))
    emp_df = pd.read_csv(os.path.join(DATA_DIR, 'employees.csv'))
    feat_df = pd.read_csv(os.path.join(DATA_DIR, 'employee_features.csv'))
    modules_df = pd.read_csv(os.path.join(DATA_DIR, 'training_modules.csv'))
    print(f"✅ Model loaded")
    print(f"✅ Data: {len(emp_df)} employees, {len(modules_df)} modules")
except Exception as e:
    print(f"⚠️ Warning: {e}")
    model = None

# ── Constants ─────────────────────────────────────────────────────────
LABELS = {0: 'Ready', 1: 'Partially Ready', 2: 'Not Ready'}
GAP_NAMES = {0: 'No Gap', 1: 'Low', 2: 'Medium', 3: 'High'}
EXP_MAP = {'<1': 0, '1-3': 1, '3-5': 2, '>5': 3}
ROLE_MAP = {r: i for i, r in enumerate(sorted(JOBS.keys()))}

print(f"✅ Ready: {len(JOBS)} jobs, {len(SKILLS)} skills")

# ─────────────────────────────────────────────────────────────────────
# HELPER FUNCTIONS
# ─────────────────────────────────────────────────────────────────────

def normalize_experience(value):
    """Accept an experience bucket ('<1', '1-3', '3-5', '>5') or a number of years."""
    if isinstance(value, str) and value in EXP_MAP:
        return value
    if isinstance(value, bool) or not isinstance(value, (int, float)) or value < 0:
        return None
    if value < 1:
        return '<1'
    if value <= 3:
        return '1-3'
    if value <= 5:
        return '3-5'
    return '>5'

def label_gap(gap):
    if gap <= 0: return 0
    elif gap == 1: return 1
    elif gap == 2: return 2
    else: return 3

def build_feature_vector(skill_scores: dict, job_name: str, experience: str) -> np.ndarray:
    """Build the 46-feature vector."""
    req = get_job_requirements(job_name)
    row = {}
    
    for skill in SKILLS:
        emp_level = int(skill_scores.get(skill, 3))
        req_level = int(req[skill])
        row[f'{skill}_gap'] = req_level - emp_level
        row[f'{skill}_emp'] = emp_level
    
    row['role_code'] = ROLE_MAP.get(job_name, 0)
    row['exp_code'] = EXP_MAP.get(experience, 1)
    
    return np.array([row[f] for f in feature_cols]).reshape(1, -1)

def compute_gaps(skills_input: dict, job_name: str) -> Tuple[Dict, int, int]:
    """Compute gap scores."""
    req = get_job_requirements(job_name)
    gaps = {}
    total = 0
    crits = 0
    
    for skill in SKILLS:
        emp_level = int(skills_input.get(skill, 3))
        req_level = int(req[skill])
        gap = req_level - emp_level
        gl = label_gap(gap)
        
        gaps[skill] = {
            'emp_level': emp_level,
            'req_level': req_level,
            'gap_score': gap,
            'gap_label': GAP_NAMES[gl],
        }
        total += max(gap, 0)
        if gl == 3:
            crits += 1
    
    return gaps, total, crits

# ─────────────────────────────────────────────────────────────────────
# HTML WEB INTERFACE
# ─────────────────────────────────────────────────────────────────────

HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Adaptive Skill Development Tracker</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
        }
        header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        header p {
            font-size: 1.1em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .tabs {
            display: flex;
            gap: 10px;
            margin-bottom: 30px;
            border-bottom: 2px solid #eee;
        }
        .tab-btn {
            padding: 12px 24px;
            border: none;
            background: none;
            cursor: pointer;
            font-size: 1em;
            color: #666;
            border-bottom: 3px solid transparent;
            transition: all 0.3s;
        }
        .tab-btn.active {
            color: #667eea;
            border-bottom-color: #667eea;
        }
        .tab-content {
            display: none;
        }
        .tab-content.active {
            display: block;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #333;
        }
        select, input {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 1em;
        }
        select:focus, input:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 5px rgba(102, 126, 234, 0.3);
        }
        .skills-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        .skill-slider {
            padding: 15px;
            background: #f9f9f9;
            border-radius: 5px;
        }
        .skill-slider label {
            margin-bottom: 10px;
        }
        input[type="range"] {
            width: 100%;
        }
        .skill-value {
            text-align: center;
            margin-top: 5px;
            font-weight: 600;
            color: #667eea;
        }
        button.btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 30px;
            border: none;
            border-radius: 5px;
            font-size: 1em;
            cursor: pointer;
            transition: transform 0.2s;
        }
        button.btn:hover {
            transform: translateY(-2px);
        }
        .results {
            margin-top: 30px;
            padding: 20px;
            background: #f0f4ff;
            border-radius: 5px;
            border-left: 4px solid #667eea;
        }
        .results.error {
            background: #ffe0e0;
            border-left-color: #cc0000;
        }
        .results h3 {
            color: #333;
            margin-bottom: 10px;
        }
        .results p {
            margin: 5px 0;
            color: #555;
        }
        .readiness-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
            margin: 10px 0;
            font-size: 1.1em;
        }
        .readiness-badge.ready {
            background: #d4edda;
            color: #155724;
        }
        .readiness-badge.partial {
            background: #fff3cd;
            color: #856404;
        }
        .readiness-badge.not-ready {
            background: #f8d7da;
            color: #721c24;
        }
        .job-requirements {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        .category {
            padding: 15px;
            background: #f9f9f9;
            border-radius: 5px;
        }
        .category h4 {
            color: #667eea;
            margin-bottom: 10px;
        }
        .skill-item {
            margin: 8px 0;
            font-size: 0.9em;
        }
        .skill-bar {
            display: flex;
            align-items: center;
            gap: 10px;
            margin: 5px 0;
        }
        .skill-dots {
            display: flex;
            gap: 3px;
        }
        .dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #ddd;
        }
        .dot.filled {
            background: #667eea;
        }
        footer {
            background: #f5f5f5;
            padding: 20px;
            text-align: center;
            color: #666;
            border-top: 1px solid #eee;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🎯 Adaptive Skill Development Tracker</h1>
            <p>AI-Powered Workforce Skill Assessment System</p>
        </header>

        <div class="content">
            <div class="tabs">
                <button class="tab-btn active" onclick="switchTab('predict')">Predict Readiness</button>
                <button class="tab-btn" onclick="switchTab('jobs')">View Jobs</button>
                <button class="tab-btn" onclick="switchTab('about')">About</button>
            </div>

            <!-- TAB 1: PREDICT -->
            <div id="predict" class="tab-content active">
                <h2>Predict Employee Readiness</h2>
                <form id="predictForm">
                    <div class="form-group">
                        <label>Job Role *</label>
                        <select id="jobRole" required>
                            <option value="">Select a job...</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Experience Level *</label>
                        <select id="experience" required>
                            <option value="<1">&lt;1 year</option>
                            <option value="1-3" selected>1-3 years</option>
                            <option value="3-5">3-5 years</option>
                            <option value=">5">&gt;5 years</option>
                        </select>
                    </div>

                    <h3 style="margin: 30px 0 20px 0;">Rate Employee Skills (1-5)</h3>
                    <div class="skills-grid" id="skillsContainer"></div>

                    <button type="button" class="btn" onclick="predictReadiness()" style="width: 100%; margin-top: 20px; padding: 15px;">
                        🚀 Predict Readiness
                    </button>

                    <div id="results"></div>
                </form>
            </div>

            <!-- TAB 2: JOBS -->
            <div id="jobs" class="tab-content">
                <h2>Job Skill Requirements</h2>
                <div class="form-group">
                    <label>Select Job</label>
                    <select id="jobSelector" onchange="showJobDetails(this.value)">
                        <option value="">Select a job...</option>
                    </select>
                </div>
                <div id="jobDetails"></div>
            </div>

            <!-- TAB 3: ABOUT -->
            <div id="about" class="tab-content">
                <h2>About This System</h2>
                <div style="line-height: 1.8; color: #555;">
                    <p><strong>Adaptive Skill Development Tracker</strong> is an AI-powered system for assessing employee readiness across 30 food industry roles.</p>
                    <h3 style="margin-top: 20px; color: #333;">Features</h3>
                    <ul style="margin-left: 20px; margin-top: 10px;">
                        <li>30 food industry jobs</li>
                        <li>22 skill dimensions</li>
                        <li>88% accuracy ML model</li>
                        <li>Instant predictions</li>
                        <li>REST API integration</li>
                    </ul>
                    <h3 style="margin-top: 20px; color: #333;">Technology</h3>
                    <ul style="margin-left: 20px; margin-top: 10px;">
                        <li>XGBoost ML model</li>
                        <li>Flask REST API</li>
                        <li>4,470 training employees</li>
                        <li>22 skill assessment dimensions</li>
                    </ul>
                    <p style="margin-top: 20px; padding: 10px; background: #f0f4ff; border-radius: 5px;">
                        <strong>Project:</strong> R-26-IT-161 | SLIIT Final Year Research | May 2026
                    </p>
                </div>
            </div>
        </div>

        <footer>
            <p>Adaptive Skill Development Tracker | AI-Powered Workforce Assessment | <a href="/api/jobs" style="color: #667eea;">REST API</a></p>
        </footer>
    </div>

    <script>
        const SKILLS = ['machine_operation','equipment_setup','troubleshooting','process_knowledge','cleaning_sanitation','gmp_compliance','hygiene_ppe','haccp_knowledge','ccp_monitoring','quality_inspection','documentation','communication','teamwork','problem_solving','adaptability','time_management','leadership','machine_startup','product_changeover','safety_compliance','quality_sampling','record_keeping'];
        const SKILL_LABELS = {
            'machine_operation': 'Machine Operation',
            'equipment_setup': 'Equipment Setup',
            'troubleshooting': 'Troubleshooting',
            'process_knowledge': 'Process Knowledge',
            'cleaning_sanitation': 'Cleaning & Sanitation',
            'gmp_compliance': 'GMP Compliance',
            'hygiene_ppe': 'Hygiene & PPE',
            'haccp_knowledge': 'HACCP Knowledge',
            'ccp_monitoring': 'CCP Monitoring',
            'quality_inspection': 'Quality Inspection',
            'documentation': 'Documentation',
            'communication': 'Communication',
            'teamwork': 'Teamwork',
            'problem_solving': 'Problem Solving',
            'adaptability': 'Adaptability',
            'time_management': 'Time Management',
            'leadership': 'Leadership',
            'machine_startup': 'Machine Startup',
            'product_changeover': 'Product Changeover',
            'safety_compliance': 'Safety Compliance',
            'quality_sampling': 'Quality Sampling',
            'record_keeping': 'Record Keeping'
        };

        // Load jobs on page load
        fetch('/api/jobs')
            .then(r => r.json())
            .then(data => {
                const select1 = document.getElementById('jobRole');
                const select2 = document.getElementById('jobSelector');
                data.jobs.forEach(job => {
                    select1.innerHTML += `<option value="${job}">${job}</option>`;
                    select2.innerHTML += `<option value="${job}">${job}</option>`;
                });
            });

        // Create skill sliders
        const container = document.getElementById('skillsContainer');
        SKILLS.forEach(skill => {
            container.innerHTML += `
                <div class="skill-slider">
                    <label>${SKILL_LABELS[skill]}</label>
                    <input type="range" id="${skill}" min="1" max="5" value="3" onchange="updateValue(this)">
                    <div class="skill-value"><span id="${skill}_val">3</span>/5</div>
                </div>
            `;
        });

        function updateValue(el) {
            document.getElementById(el.id + '_val').textContent = el.value;
        }

        function switchTab(tab) {
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.getElementById(tab).classList.add('active');
            event.target.classList.add('active');
        }

        async function predictReadiness() {
            const jobRole = document.getElementById('jobRole').value;
            const experience = document.getElementById('experience').value;

            if (!jobRole) {
                alert('Please select a job role');
                return;
            }

            const skills = {};
            SKILLS.forEach(skill => {
                skills[skill] = parseInt(document.getElementById(skill).value);
            });

            const response = await fetch('/api/predict', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({job_name: jobRole, experience, skills})
            });

            const result = await response.json();
            const resultsDiv = document.getElementById('results');

            if (result.error) {
                resultsDiv.innerHTML = `<div class="results error"><h3>Error</h3><p>${result.error}</p></div>`;
                return;
            }

            const badge = result.readiness === 'Ready' ? 'ready' : result.readiness === 'Partially Ready' ? 'partial' : 'not-ready';
            resultsDiv.innerHTML = `
                <div class="results">
                    <h3>Prediction Results</h3>
                    <div class="readiness-badge ${badge}">${result.readiness}</div>
                    <p><strong>Job:</strong> ${result.job}</p>
                    <p><strong>Confidence:</strong> ${(result.confidence * 100).toFixed(1)}%</p>
                    <p><strong>Total Gap Score:</strong> ${result.total_gap}</p>
                    <p><strong>Critical Gaps:</strong> ${result.critical_gaps}</p>
                </div>
            `;
        }

        async function showJobDetails(job) {
            if (!job) return;
            const response = await fetch(`/api/jobs/${encodeURIComponent(job)}/skills`);
            const data = await response.json();
            const req = data.requirements;

            let html = `<h3>${job}</h3><div class="job-requirements">`;
            const categories = {
                'Technical': ['machine_operation','equipment_setup','troubleshooting','process_knowledge','cleaning_sanitation'],
                'Food Safety': ['gmp_compliance','hygiene_ppe','haccp_knowledge','ccp_monitoring','quality_inspection','documentation'],
                'Soft Skills': ['communication','teamwork','problem_solving','adaptability','time_management','leadership'],
                'Task-Based': ['machine_startup','product_changeover','safety_compliance','quality_sampling','record_keeping']
            };

            for (const [cat, skills] of Object.entries(categories)) {
                html += `<div class="category"><h4>${cat}</h4>`;
                skills.forEach(skill => {
                    const level = req[skill];
                    const dots = '●'.repeat(level) + '○'.repeat(5-level);
                    html += `<div class="skill-item"><strong>${SKILL_LABELS[skill]}</strong><br><span>${dots}</span></div>`;
                });
                html += '</div>';
            }

            document.getElementById('jobDetails').innerHTML = html + '</div>';
        }
    </script>
</body>
</html>
"""

# ─────────────────────────────────────────────────────────────────────
# ROUTES
# ─────────────────────────────────────────────────────────────────────

@app.route('/', methods=['GET'])
def index():
    """Web interface"""
    return render_template_string(HTML_TEMPLATE)

@app.route('/health', methods=['GET'])
def health():
    """Health check"""
    return jsonify({
        'status': 'ok',
        'jobs': len(JOBS),
        'skills': len(SKILLS),
        'model': 'loaded' if model is not None else 'not loaded'
    })

@app.route('/api/jobs', methods=['GET'])
def api_jobs():
    """List all jobs"""
    return jsonify({'jobs': sorted(list_all_jobs()), 'total': len(JOBS)})

@app.route('/api/jobs/<job_name>/skills', methods=['GET'])
def api_job_skills(job_name):
    """Get job requirements"""
    job_name = job_name.replace('%20', ' ')
    if job_name not in JOBS:
        return jsonify({'error': f'Job "{job_name}" not found'}), 404
    return jsonify({'job': job_name, 'requirements': get_job_requirements(job_name)})

@app.route('/api/predict', methods=['POST'])
def api_predict():
    """Predict readiness"""
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({'error': 'Request body must be a JSON object'}), 400

    job_name = data.get('job_name')
    experience = data.get('experience', '1-3')
    skills = data.get('skills', {})

    if job_name not in JOBS:
        return jsonify({'error': f'Job "{job_name}" not found'}), 400

    experience = normalize_experience(experience)
    if experience is None:
        return jsonify({'error': f'experience must be one of {list(EXP_MAP)} or a number of years'}), 400

    if not isinstance(skills, dict):
        return jsonify({'error': 'skills must be an object'}), 400
    for skill, level in skills.items():
        if skill not in SKILLS:
            return jsonify({'error': f'Unknown skill "{skill}"'}), 400
        if isinstance(level, bool) or not isinstance(level, (int, float)) or not 1 <= level <= 5:
            return jsonify({'error': f'Skill "{skill}" must be a number from 1 to 5'}), 400
    
    if model is None:
        return jsonify({'error': 'Model not loaded'}), 500
    
    try:
        X_input = build_feature_vector(skills, job_name, experience)
        pred = int(model.predict(X_input)[0])
        proba = model.predict_proba(X_input)[0]
        gaps, total_gap, crits = compute_gaps(skills, job_name)

        return jsonify({
            'job': job_name,
            'readiness': LABELS[pred],
            'confidence': round(float(proba[pred]), 4),
            'probabilities': {
                'ready': round(float(proba[0]), 4),
                'partially_ready': round(float(proba[1]), 4),
                'not_ready': round(float(proba[2]), 4),
            },
            'total_gap': int(total_gap),
            'critical_gaps': int(crits),
            'gaps': [
                {
                    'skill': skill,
                    'empLevel': g['emp_level'],
                    'reqLevel': g['req_level'],
                    'gap': g['gap_score'],
                    'gapLabel': g['gap_label'],
                }
                for skill, g in gaps.items() if g['gap_score'] > 0
            ],
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ─────────────────────────────────────────────────────────────────────

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
