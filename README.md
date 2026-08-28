# Adaptive Skill Development Tracker

**An AI-powered system for identifying employee skill gaps and recommending personalized training pathways using machine learning and hybrid recommendation engines.**

**Project ID:** R-26-IT-161  
**Institution:** Sri Lanka Institute of Information Technology (SLIIT)  
**Degree:** B.Sc. (Hons) Information Technology  
**Student ID:** IT22026002  
**Supervisor:** Dr. Junius Anjana | Ms. Kaushika Kahatapitiya

---


---

## Overview

The **Adaptive Skill Development Tracker** addresses a critical gap in workforce management systems by integrating:

1. **Skill Gap Analysis** — Compare employee competencies against O*NET standardized requirements
2. **Readiness Prediction** — XGBoost classifier predicts workforce readiness (Ready / Partially Ready / Not Ready)
3. **Hybrid Recommendations** — Content-based + collaborative filtering to suggest personalized training modules
4. **REST API** — Production-ready Flask API for integration with HR systems

**Target Domain:** Food processing industry with compliance requirements (HACCP, GMP, ISO 22000)

**Key Research Contribution:** Demonstrates how ML can enhance traditional rule-based skill assessment by learning non-obvious feature interactions across 46 individual skill dimensions.

---

## Features

**Real Dataset Integration**
- IBM HR Analytics (1,470 employees)
- Custom Employee Data (3,000+ employees)
- 601 real training modules (Udemy + Coursera)
- O*NET standardized skill taxonomy

**22 Skill Dimensions**
- Technical (5): machine operation, equipment setup, troubleshooting, process knowledge, cleaning
- Food Safety (6): GMP, hygiene/PPE, HACCP, CCP monitoring, quality inspection, documentation
- Soft Skills (6): communication, teamwork, problem-solving, adaptability, time management, leadership
- Task-Based (5): startup, changeover, safety, sampling, record-keeping

**Machine Learning**
- XGBoost classifier with 46 features
- 88% accuracy (after data leakage fix)
- 5-fold cross-validation
- Feature importance analysis

**Hybrid Recommendation Engine**
- Content-based filtering (60% weight): matches employee gaps to module skill coverage via cosine similarity
- Collaborative filtering (40% weight): finds similar peers with lower gaps, recommends what helped them
- Realistic performance without overfitting

**Production API**
- 13 REST endpoints
- CORS-enabled for frontend integration
- Predict readiness for new employees
- Get personalized training recommendations
- Query role-level analytics

---



---

## Technologies

**Data & ML:**
- Python 3.9+
- Pandas, NumPy
- Scikit-learn (preprocessing, metrics)
- XGBoost (classification)
- Joblib (model serialization)

**Backend:**
- Flask 3.0
- Flask-CORS
- Gunicorn (production server)

**Frontend (Reference):**
- React (optional — API works with any frontend)
- Axios/Fetch

**Cloud/Deployment:**
- Google Colab (training)
- Render / Railway (API hosting)
- HuggingFace Spaces (alternative)

**Data Sources:**
- IBM HR Analytics (Kaggle)
- Custom Employee Dataset (Kaggle)
- O*NET Database (official)
- Udemy Courses Dataset (Kaggle)
- Coursera Courses Dataset (Kaggle)

---

## Project Structure

```
adaptive-skill-tracker/
│
├── ml_pipeline/
│   ├── Adaptive_Skill_Tracker_CLEAN.ipynb    # Main Colab notebook
│
├── flask_api/
│   ├── app.py                                # Main Flask application
│   ├── app_fixed.py                          # Updated with 46 features
│   ├── requirements.txt                      # Python dependencies
│   ├── README.md                             # API documentation
│   ├── data/                                 # CSV files (from Colab output)
│   │   ├── employees.csv                     # 4,470 employee profiles
│   │   ├── employee_features.csv             # ML feature matrix
│   │   ├── gap_scores.csv                    # Per-skill gap analysis
│   │   ├── training_modules.csv              # 601 training courses
│   │   └── onet_requirements.csv             # Required levels per role
│   └── models/                               # Trained model files
│       ├── xgb_readiness_model.pkl           # XGBoost classifier
│       └── feature_names.pkl                 # Feature column ordering
│
├── reports/
│   ├── classification_report.txt             # Model evaluation metrics
│   ├── feature_importance.csv                # Top features ranking
│   ├── model_evaluation.png                  # Confusion matrix + importance plot
│   ├── gap_distribution.png                  # Dataset overview
│   └── gap_profile_*.png                     # Per-employee skill profiles
│
└── README.md                                 
```

## Data Pipeline

### Step 1: Raw Data Sources

| Source | Size | Purpose |
|--------|------|---------|
| IBM HR Attrition | 1,470 employees | Performance, training, education metrics |
| Employee Data | 3,000+ employees | Job titles, ratings, performance scores |
| Training Records | 4,000+ entries | Training history, pass rates |
| Engagement Survey | 4,000+ entries | Engagement, satisfaction, work-life balance |
| Udemy Courses | 3,678 courses | Real training modules (335 matched to skills) |
| Coursera Courses | 891 courses | Real training modules (256 matched to skills) |

### Step 2: Skill Derivation

Employee skill scores (1–5 scale) are derived from available metrics:

| Skill Type | Data Source | Proxy |
|--------|-----------|-------|
| Technical (operation, troubleshooting) | Performance Rating | 0–4 → 1–5 |
| Food Safety (GMP, HACCP, CCP) | Training Frequency | 0–6 → 1–5 |
| Documentation | Education Level | 1–5 direct |
| Soft Skills (communication, teamwork) | Job Involvement | 1–4 → 1–5 |

### Step 3: Gap Scoring

```python
gap_score = required_level - employee_level

# Example:
# QA Technician required HACCP knowledge = 5 (from O*NET)
# Employee current HACCP knowledge = 2 (derived from proxy)
# gap_score = 3  → "High" gap
```

**Gap Labels:**
- 0 = No Gap (employee meets or exceeds requirement)
- 1 = Low (gap of 1 level)
- 2 = Medium (gap of 2 levels)
- 3 = High (gap ≥ 3 levels)

### Step 4: Readiness Labeling

Ground truth labels for model training:

```python
if critical_gap_count >= 3 or total_gap_score >= 20:
    readiness = "Not Ready"
elif critical_gap_count >= 1 or total_gap_score >= 10:
    readiness = "Partially Ready"
else:
    readiness = "Ready"
```

### Step 5: Feature Engineering

46-feature vector per employee:

```
[gap_scores (22) | employee_levels (22) | role_code | exp_code]
```


---

## ML Model Details

### Model Architecture

**Algorithm:** XGBoost (Gradient Boosting)

**Hyperparameters:**
```python
XGBClassifier(
    n_estimators      = 200,    # 200 decision trees
    max_depth         = 6,      # Depth of each tree
    learning_rate     = 0.1,    # Step size (10%)
    subsample         = 0.8,    # Sample 80% of training data per tree
    colsample_bytree  = 0.8,    # Use 80% of features per tree
    eval_metric       = 'mlogloss',
    random_state      = 42,
)
```

### Performance Metrics

```
                 Precision  Recall  F1-Score  Support
         Ready       0.89     0.91      0.90      166
Partially Ready       0.87     0.86      0.86      304
     Not Ready       0.89     0.89      0.89      421

    Accuracy                           0.88       891
   F1-Macro                            0.88
   ROC-AUC                             0.92
```

**Cross-Validation (5-fold):**
- F1-Macro: 0.87 ± 0.02


---

## API Documentation

### Base URL

**Local:** `http://localhost:5000`  


### Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/` | API info + all endpoints |
| GET | `/health` | Health check |
| GET | `/employees` | List employees (paginated) |
| GET | `/employees/<id>` | Get employee skill profile |
| GET | `/employees/<id>/gaps` | Skill gap analysis |
| GET | `/employees/<id>/readiness` | Predict readiness |
| GET | `/employees/<id>/recommendations` | Training recommendations |
| POST | `/predict` | Predict for a NEW employee |
| POST | `/recommend` | Recommend for a NEW employee |
| GET | `/roles` | List all job roles |
| GET | `/roles/<role>/gaps` | Role-level gap analysis |
| GET | `/skills` | List all 22 skills |
| GET | `/modules` | Training module catalogue |
| GET | `/onet` | O*NET requirements |

### Example Requests

**Get employee skill gaps:**
```bash
curl http://localhost:5000/employees/IBM0001/gaps
```

**Predict readiness for a new employee:**
```bash
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "job_role": "QA Technician",
    "experience": "1-3",
    "skills": {
      "gmp_compliance": 2,
      "haccp_knowledge": 1,
      "ccp_monitoring": 1,
      "quality_inspection": 3,
      "machine_operation": 2,
      "equipment_setup": 2,
      "troubleshooting": 2,
      "process_knowledge": 3,
      "cleaning_sanitation": 3,
      "hygiene_ppe": 3,
      "documentation": 2,
      "communication": 4,
      "teamwork": 4,
      "problem_solving": 3,
      "adaptability": 3,
      "time_management": 3,
      "leadership": 2,
      "machine_startup": 2,
      "product_changeover": 2,
      "safety_compliance": 3,
      "quality_sampling": 2,
      "record_keeping": 2
    }
  }'
```

**Response:**
```json
{
  "job_role": "QA Technician",
  "readiness_label": "Partially Ready",
  "readiness_code": 1,
  "confidence": {
    "ready": 0.12,
    "partially_ready": 0.76,
    "not_ready": 0.12
  },
  "total_gap_score": 8,
  "critical_gaps": 0,
  "top_skill_gaps": [
    {
      "skill": "gmp_compliance",
      "emp_level": 2,
      "req_level": 5,
      "gap_score": 3,
      "gap_label": "High"
    }
  ]
}
```

### Job Roles

All endpoints refer to one of these 5 roles:

1. **Machine Operator** — equipment operation, setup, troubleshooting
2. **Production Worker** — general production, compliance
3. **QA Technician** — quality control, inspection, testing
4. **Packer** — packaging, documentation, records
5. **Supervisor** — leadership, team management, compliance oversight

---

## Results

### Model Performance

| Metric | Value |
|--------|-------|
| Accuracy | 88.2% |
| Precision (macro) | 0.88 |
| Recall (macro) | 0.89 |
| F1-Score (macro) | 0.88 |
| ROC-AUC | 0.92 |

### Dataset

- **Total Employees:** 4,470
- **Ready:** 829 (18.6%)
- **Partially Ready:** 1,517 (34.1%)
- **Not Ready:** 2,105 (47.3%)

### Feature Importance (Top 10)

1. `ccp_monitoring_gap` — Critical control point gaps (food safety)
2. `quality_inspection_gap` — Quality assessment readiness
3. `haccp_gap` — HACCP knowledge
4. `gmp_compliance_gap` — GMP standard compliance
5. `communication_emp` — Current communication level
6. `hygiene_ppe_gap` — Safety & hygiene gaps
7. `documentation_emp` — Record-keeping capability
8. `teamwork_emp` — Collaboration skills
9. `problem_solving_gap` — Problem-solving readiness
10. `machine_operation_gap` — Equipment operation

**Insight:** Food safety gaps (CCP, HACCP, GMP) are the strongest predictors of overall readiness in this domain.

---

## Usage Examples

### Run API Locally

```bash
cd flask_api
python app.py
```

### Predict Readiness (cURL)

```bash
curl http://localhost:5000/employees/IBM0001/readiness
```

### Get Recommendations (cURL)

```bash
curl http://localhost:5000/employees/IBM0001/recommendations?top_n=5
```

### React Frontend Example

```javascript
// Fetch employee readiness
const response = await fetch('http://localhost:5000/employees/IBM0001/readiness');
const data = await response.json();
console.log(data.readiness_label);  // "Partially Ready"

// Get recommendations
const recs = await fetch('http://localhost:5000/employees/IBM0001/recommendations?top_n=5');
const modules = await recs.json();
console.log(modules.recommendations);  // Array of top 5 modules
```

---




---

---

## Contact & Support

- **Author:** Dalpathadu K Y H (IT22026002)
- **Supervisor:** Dr. Junius Anjana
- **Institution:** SLIIT, Sri Lanka
- **Email:** it22026002@my.sliit.lk

---

## Acknowledgments

- SLIIT Faculty of Computing
- IBM HR Analytics Kaggle Dataset Contributors
- O*NET Database (US Department of Labor)
- Udemy & Coursera for course data
- XGBoost, scikit-learn, Flask open-source communities

---

