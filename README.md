A grounded resume-engineering system that analyzes the relationship between a candidate's actual evidence and a job's requirements, then produces traceable tailoring suggestions without fabricating qualifications.

problem:
A candidate has a truthful master resume, but tailoring it to each job requires repeatedly identifying which existing experience is relevant, which requirements are unsupported, and how the relevant evidence should be presented

# Resume Engineering Assistant

A backend-focused tool that analyzes a resume against a job description and returns structured feedback using an LLM.

The project currently provides a **FastAPI backend** with PDF/DOCX resume parsing, structured LLM responses using Pydantic, and a simple React frontend for interacting with the API.

> **Version:** V0 — working prototype

---

## Features

* Upload a resume as:

  * PDF
  * DOCX
* Provide a job description as:

  * Pasted text
  * Text file
* Extract text from resumes
* Analyze the resume against the job description
* Return structured analysis containing:

  * Overall match score
  * Matching skills
  * Missing skills
  * Weak areas
  * ATS issues
  * Bullet-point improvements
  * Recommendations
* FastAPI REST API
* React frontend
* Pydantic request/response validation
* Automated backend tests

---

## Architecture

```text
                         React Frontend
                              │
                              │ POST /analyze
                              ▼
                       FastAPI Backend
                              │
                 ┌────────────┼────────────┐
                 │            │            │
                 ▼            ▼            ▼
          Resume Parser   Job Description   API
                 │            │          Validation
                 └────────────┼────────────┘
                              │
                              ▼
                       LLM Analyzer
                              │
                              ▼
                       ResumeAnalysis
                              │
                              ▼
                         JSON Response
                              │
                              ▼
                       React Frontend
```

---

## Project Structure

```text
Resume_trace/
│
├── backend/
│   ├── app/
│   │   ├── main.py              ← FastAPI application and /analyze endpoint
│   │   ├── resume_parser.py     ← PDF/DOCX text extraction
│   │   ├── resume_analyzer.py   ← LLM analysis
│   │   ├── llm_schemas.py       ← Pydantic models for LLM output
│   │   └── api_schemas.py       ← API request models
│   │
│   ├── tests/
│   │   ├── conftest.py          ← shared test fixtures
│   │   ├── test_analyze.py      ← successful /analyze requests
│   │   ├── test_parser.py       ← PDF/DOCX parsing
│   │   └── test_validation.py   ← invalid API requests
│   │
│   ├── resumes/                 ← local resume/JD files
│   ├── .env                     ← environment variables
│   ├── requirements.txt         ← Python dependencies
│   └── .venv/                   ← Python virtual environment
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ResumeUpload.jsx       ← resume upload UI
│   │   │   ├── JobDescription.jsx     ← job description input
│   │   │   ├── AnalyzeButton.jsx      ← analyze button/loading state
│   │   │   └── AnalysisResult.jsx     ← displays analysis results
│   │   │
│   │   ├── App.jsx                    ← application state and logic
│   │   ├── App.css                    ← application styling
│   │   ├── index.css                  ← global styling
│   │   └── main.jsx                   ← React entry point
│   │
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## Backend

The backend is built with **FastAPI**.

### API Endpoint

```http
POST /analyze
```

The endpoint accepts multipart form data.

### Request

A request must contain:

```text
resume                  → PDF/DOCX file
```

And either:

```text
job_description_text    → pasted job description
```

or:

```text
job_description         → job description file
```

### Response

The API returns a structured `ResumeAnalysis` object.

Example:

```json
{
  "overall_match": 80,
  "matching_skills": [
    {
      "skill": "Python",
      "evidence": "Python is listed in the resume."
    }
  ],
  "missing_skills": [
    {
      "skill": "Kubernetes",
      "importance": "high"
    }
  ],
  "weak_areas": [
    {
      "area": "Cloud experience",
      "reason": "Limited evidence of cloud deployment experience."
    }
  ],
  "ats_issues": [],
  "bullet_improvements": [
    {
      "original": "Built a resume analyzer API.",
      "suggested": "Developed a FastAPI-based resume analyzer API.",
      "reason": "Adds technical context and makes the project clearer."
    }
  ],
  "recommendations": [
    "Add cloud deployment experience."
  ]
}
```

---

## LLM Output Schema

The LLM response is validated using Pydantic.

```python
class ResumeAnalysis(BaseModel):
    overall_match: int
    matching_skills: list[MatchingSkill]
    missing_skills: list[MissingSkill]
    weak_areas: list[WeakArea]
    ats_issues: list[str]
    bullet_improvements: list[BulletImprovement]
    recommendations: list[str]
```

This prevents the application from blindly accepting arbitrary LLM output.

---

## Resume Parsing

The backend currently supports:

```text
PDF
 ↓
PyMuPDF
 ↓
Extracted text
```

and:

```text
DOCX
 ↓
python-docx
 ↓
Extracted text
```

The parser selects the appropriate parser based on the file extension.

---

## Frontend

The frontend is a lightweight React application created with Vite.

Its responsibility is intentionally simple:

```text
Upload Resume
       +
Enter Job Description
       │
       ▼
   POST /analyze
       │
       ▼
Display Analysis
```

The frontend does not perform the resume analysis itself. The backend owns the application logic.

---

## Testing

The backend uses `pytest`.

Tests are organized by responsibility:

```text
tests/
├── conftest.py
│   └── shared test fixtures
│
├── test_analyze.py
│   └── successful /analyze requests
│
├── test_parser.py
│   └── PDF/DOCX parsing
│
└── test_validation.py
    └── invalid API requests
```

The API tests mock the LLM analyzer so that tests do not depend on an external LLM response.

Run the tests from the `backend` directory:

```bash
pytest
```

---

## Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd Resume_trace
```

### 2. Set up the backend

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment on Windows:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

### 3. Configure environment variables

Create:

```text
backend/.env
```

Add the required Gemini API key:

```env
GEMINI_API_KEY=your_api_key
```

Do not commit `.env` to Git.

### 4. Start the backend

From the `backend` directory:

```bash
uvicorn app.main:app --reload
```

The API will be available at:

```text
http://127.0.0.1:8000
```

### 5. Start the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite will provide the local frontend URL, typically:

```text
http://localhost:5173
```

---

## Current V0 Limitations

This is a prototype and is **not production-ready**.

Current limitations include:

* Uploaded files are temporarily stored locally.
* File names are currently used directly when saving uploads.
* No authentication or user accounts.
* No database.
* No persistent analysis history.
* No production deployment.
* No rate limiting.
* No advanced file validation.
* No production-grade error handling.
* LLM analysis is not yet evaluated systematically for accuracy.
* The frontend is intentionally minimal.
* CORS is configured for local development.
* The current development setup may use a stored analysis fixture while testing the frontend/backend integration.

---

## Planned Improvements

Possible next stages:

### V1 — Backend hardening

* Improve upload handling with temporary files
* Add file size/type validation
* Improve exception handling
* Remove development fixtures
* Improve API schemas
* Add more comprehensive tests
* Add structured logging

### V2 — Production backend

* Database
* Authentication
* Analysis history
* Rate limiting
* Background processing where appropriate
* Production configuration
* Deployment

### V3 — Resume Engineering Features

* Resume section analysis
* Job requirement extraction
* Skill prioritization
* Better ATS analysis
* More reliable evidence-based recommendations
* Resume bullet rewriting
* Multiple job-description comparisons

---

## Technology Stack

### Backend

* Python
* FastAPI
* Pydantic
* PyMuPDF
* python-docx
* Google Gemini API
* pytest

### Frontend

* React
* JavaScript
* Vite
* CSS

---

## Project Goal

The goal of Resume Engineering Assistant is to build a practical software system rather than a simple LLM wrapper.

The project focuses on:

* Backend API design
* File processing
* Structured LLM outputs
* Input/output validation
* Automated testing
* Frontend ↔ backend communication
* Gradually improving the system toward production-quality architecture

V0 establishes the basic end-to-end pipeline:

```text
Resume + Job Description
          │
          ▼
      FastAPI API
          │
          ▼
     Resume Parser
          │
          ▼
       LLM Analysis
          │
          ▼
    Structured Output
          │
          ▼
     React Frontend
```
