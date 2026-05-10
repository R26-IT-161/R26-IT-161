from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import numpy as np
import joblib
import ast
import os
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler

app = Flask(__name__)
CORS(app)   # allow requests from React / any frontend

#Paths
BASE_DIR    = os.path.dirname(os.path.abspath(__file__))
DATA_DIR    = os.path.join(BASE_DIR, 'data')
MODELS_DIR  = os.path.join(BASE_DIR, 'models')

#Load all data once at startup
print("Loading model and data...")

model         = joblib.load(os.path.join(MODELS_DIR, 'xgb_readiness_model.pkl'))
feature_cols  = joblib.load(os.path.join(MODELS_DIR, 'feature_names.pkl'))
emp_df        = pd.read_csv(os.path.join(DATA_DIR, 'employees.csv'))
feat_df       = pd.read_csv(os.path.join(DATA_DIR, 'employee_features.csv'))
gap_df        = pd.read_csv(os.path.join(DATA_DIR, 'gap_scores.csv'))
modules_df    = pd.read_csv(os.path.join(DATA_DIR, 'training_modules.csv'))
onet_df       = pd.read_csv(os.path.join(DATA_DIR, 'onet_requirements.csv'), index_col='skill')

#Constants
SKILLS = [
    'machine_operation', 'equipment_setup', 'troubleshooting',
    'process_knowledge', 'cleaning_sanitation',
    'gmp_compliance', 'hygiene_ppe', 'haccp_knowledge',
    'ccp_monitoring', 'quality_inspection', 'documentation',
    'communication', 'teamwork', 'problem_solving',
    'adaptability', 'time_management', 'leadership',
    'machine_startup', 'product_changeover', 'safety_compliance',
    'quality_sampling', 'record_keeping',
]

JOB_ROLES   = ['Machine Operator', 'Production Worker', 'QA Technician', 'Packer', 'Supervisor']
LABELS      = {0: 'Ready', 1: 'Partially Ready', 2: 'Not Ready'}
GAP_NAMES   = {0: 'No Gap', 1: 'Low', 2: 'Medium', 3: 'High'}
EXP_MAP     = {'<1': 0, '1-3': 1, '3-5': 2, '>5': 3}
ROLE_MAP    = {r: i for i, r in enumerate(JOB_ROLES)}

#Build module-skill matrix
def build_module_matrix():
    rows = []
    for _, m in modules_df.iterrows():
        row = {s: 0.0 for s in SKILLS}
        try:
            skill_list = m['skills'] if isinstance(m['skills'], list) else ast.literal_eval(str(m['skills']))
            for skill in skill_list:
                if skill in row:
                    row[skill] = 1.0
        except Exception:
            pass
        row['module_id'] = m['id']
        rows.append(row)
    df = pd.DataFrame(rows).set_index('module_id')
    return df[SKILLS]

MODULE_MATRIX = build_module_matrix()
print(f"✅ Loaded: {len(emp_df)} employees | {len(modules_df)} modules | {len(feature_cols)} features")


#HELPER FUNCTIONS

def label_gap(gap):
    if gap <= 0:   return 0
    elif gap == 1: return 1
    elif gap == 2: return 2
    else:          return 3


def compute_gaps_for_new_employee(skills_input: dict, job_role: str) -> dict:
    """Compute gap scores for a new (not in database) employee."""
    req    = onet_df[job_role]
    gaps   = {}
    total  = 0
    crits  = 0
    for skill in SKILLS:
        emp_level = int(skills_input.get(skill, 3))
        req_level = int(req[skill])
        gap       = req_level - emp_level
        gl        = label_gap(gap)
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


def build_feature_vector(skill_scores: dict, job_role: str, experience: str) -> np.ndarray:
    """Build the 48-feature vector the model expects."""
    req  = onet_df[job_role]
    row  = {}
    for skill in SKILLS:
        emp_level = int(skill_scores.get(skill, 3))
        req_level = int(req[skill])
        row[f'{skill}_gap'] = req_level - emp_level
        row[f'{skill}_emp'] = emp_level

    row['role_code']          = ROLE_MAP.get(job_role, 0)
    row['exp_code']           = EXP_MAP.get(experience, 1)
    row['total_gap_score']    = sum(max(int(onet_df[job_role][s]) - int(skill_scores.get(s, 3)), 0) for s in SKILLS)
    row['critical_gap_count'] = sum(1 for s in SKILLS if (int(onet_df[job_role][s]) - int(skill_scores.get(s, 3))) >= 3)

    return np.array([row[f] for f in feature_cols]).reshape(1, -1)


def content_based_recommend(gap_vector: dict, top_n: int = 5):
    """Cosine similarity between gap profile and module skill coverage."""
    vec = np.array([max(gap_vector.get(s, 0), 0) for s in SKILLS], dtype=float)
    if vec.sum() == 0:
        return []
    vec_norm = vec / vec.sum()
    scores   = cosine_similarity([vec_norm], MODULE_MATRIX.values)[0]

    results = modules_df[['id', 'title', 'source', 'subject', 'level', 'duration_hrs']].copy()
    results.columns = ['module_id', 'title', 'source', 'subject', 'level', 'duration_hrs']
    results['cb_score'] = scores
    top = results.sort_values('cb_score', ascending=False).head(top_n)
    return top.to_dict(orient='records')


def collaborative_recommend(gap_vector: dict, job_role: str, total_gap: int, top_n: int = 5):
    """Find similar peers with lower gaps → surface modules from their gap areas."""
    gap_cols  = [f'{s}_gap' for s in SKILLS]
    same_role = feat_df[feat_df['job_role'] == job_role].copy()
    if same_role.empty:
        return []

    query_vec   = np.array([gap_vector.get(s, 0) for s in SKILLS], dtype=float).reshape(1, -1)
    peer_matrix = same_role[gap_cols].values
    sims        = cosine_similarity(query_vec, peer_matrix)[0]
    same_role   = same_role.copy()
    same_role['similarity'] = sims

    improved = same_role[same_role['total_gap_score'] < total_gap].nlargest(10, 'similarity')
    if improved.empty:
        return []

    peer_gaps    = improved[gap_cols].clip(lower=0).mean()
    peer_gap_vec = {s: float(peer_gaps[f'{s}_gap']) for s in SKILLS}
    return content_based_recommend(peer_gap_vec, top_n=top_n)


def hybrid_recommend(gap_vector: dict, job_role: str, total_gap: int, top_n: int = 5,
                     cb_weight: float = 0.6, cf_weight: float = 0.4):
    """Blend CB (60%) + CF (40%) scores."""
    cb_list = content_based_recommend(gap_vector, top_n=20)
    cf_list = collaborative_recommend(gap_vector, job_role, total_gap, top_n=20)

    if not cb_list:
        return []

    cb_df = pd.DataFrame(cb_list)
    cf_df = pd.DataFrame(cf_list) if cf_list else pd.DataFrame()

    merged = cb_df.copy()
    if not cf_df.empty and 'cb_score' in cf_df.columns:
        cf_df = cf_df.rename(columns={'cb_score': 'cf_score'})
        merged = merged.merge(cf_df[['module_id', 'cf_score']], on='module_id', how='left').fillna(0)
    else:
        merged['cf_score'] = 0.0

    scaler = MinMaxScaler()
    if merged['cb_score'].max() > 0:
        merged['cb_score'] = scaler.fit_transform(merged[['cb_score']]).flatten()
    if merged['cf_score'].max() > 0:
        merged['cf_score'] = scaler.fit_transform(merged[['cf_score']]).flatten()

    merged['hybrid_score'] = cb_weight * merged['cb_score'] + cf_weight * merged['cf_score']
    merged['rank']         = range(1, len(merged) + 1)
    top = merged.sort_values('hybrid_score', ascending=False).head(top_n)
    top['rank'] = range(1, len(top) + 1)

    return top[['rank', 'module_id', 'title', 'source', 'subject', 'level',
                'duration_hrs', 'cb_score', 'cf_score', 'hybrid_score']].to_dict(orient='records')


#ROUTES


@app.route('/', methods=['GET'])
def index():
    """Health check / API info."""
    return jsonify({
        'api':     'Adaptive Skill Development Tracker',
        'version': '1.0.0',
        'status':  'running',
        'endpoints': {
            'GET  /health':                          'Health check',
            'GET  /employees':                       'List all employees (paginated)',
            'GET  /employees/<id>':                  'Get single employee profile',
            'GET  /employees/<id>/gaps':             'Get skill gap analysis for employee',
            'GET  /employees/<id>/readiness':        'Predict readiness label for employee',
            'GET  /employees/<id>/recommendations':  'Get training recommendations for employee',
            'POST /predict':                         'Predict readiness for a NEW employee (send skill scores in body)',
            'POST /recommend':                       'Get recommendations for a NEW employee',
            'GET  /roles':                           'List all job roles',
            'GET  /roles/<role>/gaps':               'Average gap scores for a job role',
            'GET  /skills':                          'List all 22 skill dimensions',
            'GET  /modules':                         'List training modules (paginated)',
            'GET  /onet':                            'O*NET required skill levels per role',
        }
    })


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'employees': len(emp_df), 'modules': len(modules_df)})


#Employee endpoints

@app.route('/employees', methods=['GET'])
def list_employees():
    """
    GET /employees?page=1&limit=20&role=QA+Technician&source=IBM
    """
    page   = int(request.args.get('page',   1))
    limit  = int(request.args.get('limit',  20))
    role   = request.args.get('role',   None)
    source = request.args.get('source', None)

    df = emp_df.copy()
    if role:   df = df[df['job_role'] == role]
    if source: df = df[df['source']   == source]

    total   = len(df)
    start   = (page - 1) * limit
    end     = start + limit
    records = df.iloc[start:end][['employee_id', 'job_role', 'experience', 'source']].to_dict(orient='records')

    return jsonify({
        'total':    total,
        'page':     page,
        'limit':    limit,
        'pages':    (total + limit - 1) // limit,
        'employees': records,
    })


@app.route('/employees/<employee_id>', methods=['GET'])
def get_employee(employee_id):
    """
    GET /employees/IBM0001
    Returns full skill profile for one employee.
    """
    row = emp_df[emp_df['employee_id'] == employee_id]
    if row.empty:
        return jsonify({'error': f'Employee {employee_id} not found'}), 404

    emp = row.iloc[0].to_dict()
    skills = {s: int(emp[s]) for s in SKILLS}

    return jsonify({
        'employee_id': emp['employee_id'],
        'job_role':    emp['job_role'],
        'experience':  emp['experience'],
        'source':      emp['source'],
        'skills':      skills,
    })


@app.route('/employees/<employee_id>/gaps', methods=['GET'])
def get_employee_gaps(employee_id):
    """
    GET /employees/IBM0001/gaps
    Returns per-skill gap scores with labels.
    """
    emp_row = emp_df[emp_df['employee_id'] == employee_id]
    if emp_row.empty:
        return jsonify({'error': f'Employee {employee_id} not found'}), 404

    rows = gap_df[gap_df['employee_id'] == employee_id]
    feat = feat_df[feat_df['employee_id'] == employee_id].iloc[0]

    gap_list = []
    for _, r in rows.iterrows():
        gap_list.append({
            'skill':     r['skill'],
            'emp_level': int(r['emp_level']),
            'req_level': int(r['req_level']),
            'gap_score': int(r['gap_score']),
            'gap_label': r['gap_name'],
        })

    # Sort: highest gap first
    gap_list.sort(key=lambda x: x['gap_score'], reverse=True)

    return jsonify({
        'employee_id':      employee_id,
        'job_role':         emp_row.iloc[0]['job_role'],
        'total_gap_score':  int(feat['total_gap_score']),
        'critical_gaps':    int(feat['critical_gap_count']),
        'gaps':             gap_list,
    })


@app.route('/employees/<employee_id>/readiness', methods=['GET'])
def get_employee_readiness(employee_id):
    """
    GET /employees/IBM0001/readiness
    Returns readiness prediction with confidence scores.
    """
    feat_row = feat_df[feat_df['employee_id'] == employee_id]
    if feat_row.empty:
        return jsonify({'error': f'Employee {employee_id} not found'}), 404

    X_input = feat_row[feature_cols].values
    pred    = int(model.predict(X_input)[0])
    proba   = model.predict_proba(X_input)[0]

    return jsonify({
        'employee_id':      employee_id,
        'job_role':         feat_row.iloc[0]['job_role'],
        'readiness_label':  LABELS[pred],
        'readiness_code':   pred,
        'confidence': {
            'ready':           round(float(proba[0]), 4),
            'partially_ready': round(float(proba[1]), 4),
            'not_ready':       round(float(proba[2]), 4),
        },
        'total_gap_score':  int(feat_row.iloc[0]['total_gap_score']),
        'critical_gaps':    int(feat_row.iloc[0]['critical_gap_count']),
    })


@app.route('/employees/<employee_id>/recommendations', methods=['GET'])
def get_employee_recommendations(employee_id):
    """
    GET /employees/IBM0001/recommendations?top_n=5&cb_weight=0.6&cf_weight=0.4
    Returns hybrid training recommendations.
    """
    top_n     = int(request.args.get('top_n',     5))
    cb_weight = float(request.args.get('cb_weight', 0.6))
    cf_weight = float(request.args.get('cf_weight', 0.4))

    feat_row = feat_df[feat_df['employee_id'] == employee_id]
    if feat_row.empty:
        return jsonify({'error': f'Employee {employee_id} not found'}), 404

    gap_vector = {s: max(int(feat_row.iloc[0][f'{s}_gap']), 0) for s in SKILLS}
    job_role   = feat_row.iloc[0]['job_role']
    total_gap  = int(feat_row.iloc[0]['total_gap_score'])

    recs = hybrid_recommend(gap_vector, job_role, total_gap, top_n, cb_weight, cf_weight)

    return jsonify({
        'employee_id':   employee_id,
        'job_role':      job_role,
        'total_gap':     total_gap,
        'top_n':         top_n,
        'recommendations': recs,
    })


#Predict + Recommend for NEW employees

@app.route('/predict', methods=['POST'])
def predict_new():
    """
    POST /predict
    Body (JSON):
    {
        "job_role": "QA Technician",
        "experience": "1-3",
        "skills": {
            "machine_operation": 3,
            "gmp_compliance": 2,
            "haccp_knowledge": 1,
            ...  (all 22 skills, any missing default to 3)
        }
    }
    Returns readiness prediction + gap analysis.
    """
    data = request.get_json()
    if not data:
        return jsonify({'error': 'JSON body required'}), 400

    job_role   = data.get('job_role')
    experience = data.get('experience', '1-3')
    skills     = data.get('skills', {})

    if job_role not in JOB_ROLES:
        return jsonify({'error': f'job_role must be one of: {JOB_ROLES}'}), 400

    # Build feature vector and predict
    X_input = build_feature_vector(skills, job_role, experience)
    pred    = int(model.predict(X_input)[0])
    proba   = model.predict_proba(X_input)[0]

    # Compute gaps
    gaps, total_gap, crits = compute_gaps_for_new_employee(skills, job_role)
    gap_list = sorted(
        [{'skill': s, **v} for s, v in gaps.items()],
        key=lambda x: x['gap_score'], reverse=True
    )

    return jsonify({
        'job_role':        job_role,
        'experience':      experience,
        'readiness_label': LABELS[pred],
        'readiness_code':  pred,
        'confidence': {
            'ready':           round(float(proba[0]), 4),
            'partially_ready': round(float(proba[1]), 4),
            'not_ready':       round(float(proba[2]), 4),
        },
        'total_gap_score':  total_gap,
        'critical_gaps':    crits,
        'top_skill_gaps':   [g for g in gap_list if g['gap_score'] > 0][:5],
    })


@app.route('/recommend', methods=['POST'])
def recommend_new():
    """
    POST /recommend
    Body (JSON):
    {
        "job_role": "QA Technician",
        "experience": "1-3",
        "top_n": 5,
        "skills": {
            "gmp_compliance": 2,
            "haccp_knowledge": 1,
            ...
        }
    }
    Returns hybrid training recommendations.
    """
    data = request.get_json()
    if not data:
        return jsonify({'error': 'JSON body required'}), 400

    job_role   = data.get('job_role')
    experience = data.get('experience', '1-3')
    skills     = data.get('skills', {})
    top_n      = int(data.get('top_n', 5))
    cb_weight  = float(data.get('cb_weight', 0.6))
    cf_weight  = float(data.get('cf_weight', 0.4))

    if job_role not in JOB_ROLES:
        return jsonify({'error': f'job_role must be one of: {JOB_ROLES}'}), 400

    req    = onet_df[job_role]
    gap_vector = {s: max(int(req[s]) - int(skills.get(s, 3)), 0) for s in SKILLS}
    total_gap  = sum(gap_vector.values())

    recs = hybrid_recommend(gap_vector, job_role, total_gap, top_n, cb_weight, cf_weight)

    return jsonify({
        'job_role':        job_role,
        'experience':      experience,
        'total_gap':       total_gap,
        'recommendations': recs,
    })


#Role endpoints

@app.route('/roles', methods=['GET'])
def list_roles():
    """GET /roles — list all job roles with employee counts."""
    counts = emp_df['job_role'].value_counts()
    return jsonify({
        'roles': [
            {'role': r, 'employee_count': int(counts.get(r, 0))}
            for r in JOB_ROLES
        ]
    })


@app.route('/roles/<path:role_name>/gaps', methods=['GET'])
def get_role_gaps(role_name):
    """
    GET /roles/QA%20Technician/gaps
    Returns average gap scores for all employees in a role.
    """
    role_name = role_name.replace('%20', ' ')
    if role_name not in JOB_ROLES:
        return jsonify({'error': f'Role not found. Valid roles: {JOB_ROLES}'}), 404

    role_gaps = gap_df[gap_df['job_role'] == role_name]
    avg_gaps  = role_gaps.groupby('skill')['gap_score'].mean().clip(lower=0)
    label_dist = role_gaps.groupby('gap_name').size().to_dict()

    team_feat = feat_df[feat_df['job_role'] == role_name]
    readiness_dist = team_feat['readiness_label'].map(LABELS).value_counts().to_dict()

    return jsonify({
        'role':              role_name,
        'employee_count':    int(len(team_feat)),
        'readiness_distribution': readiness_dist,
        'average_gaps': [
            {'skill': s, 'avg_gap': round(float(avg_gaps.get(s, 0)), 2)}
            for s in sorted(avg_gaps.index, key=lambda x: avg_gaps[x], reverse=True)
        ],
        'gap_label_distribution': label_dist,
    })


#Skills & Modules endpoints

@app.route('/skills', methods=['GET'])
def list_skills():
    """GET /skills — return all 22 skill dimensions."""
    SKILL_CATEGORIES = {
        'Technical':   ['machine_operation','equipment_setup','troubleshooting','process_knowledge','cleaning_sanitation'],
        'Food Safety': ['gmp_compliance','hygiene_ppe','haccp_knowledge','ccp_monitoring','quality_inspection','documentation'],
        'Soft Skills': ['communication','teamwork','problem_solving','adaptability','time_management','leadership'],
        'Task-Based':  ['machine_startup','product_changeover','safety_compliance','quality_sampling','record_keeping'],
    }
    result = []
    for cat, skills in SKILL_CATEGORIES.items():
        for s in skills:
            result.append({'skill': s, 'category': cat})
    return jsonify({'skills': result, 'total': len(result)})


@app.route('/modules', methods=['GET'])
def list_modules():
    """
    GET /modules?page=1&limit=20&source=Udemy&skill=gmp_compliance
    """
    page   = int(request.args.get('page',   1))
    limit  = int(request.args.get('limit',  20))
    source = request.args.get('source', None)
    skill  = request.args.get('skill',  None)

    df = modules_df.copy()
    if source:
        df = df[df['source'] == source]
    if skill:
        df = df[df['skills'].apply(
            lambda x: skill in (x if isinstance(x, list) else ast.literal_eval(str(x)))
        )]

    total   = len(df)
    start   = (page - 1) * limit
    end     = start + limit
    records = df.iloc[start:end][['id','title','source','subject','level','duration_hrs','skills']].to_dict(orient='records')

    return jsonify({
        'total':   total,
        'page':    page,
        'limit':   limit,
        'pages':   (total + limit - 1) // limit,
        'modules': records,
    })


@app.route('/onet', methods=['GET'])
def get_onet():
    """GET /onet — O*NET required skill levels per role."""
    result = {}
    for role in JOB_ROLES:
        result[role] = {s: int(onet_df[role][s]) for s in SKILLS}
    return jsonify({'onet_requirements': result})


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)
