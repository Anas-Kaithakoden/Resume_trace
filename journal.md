## V0
Resume ↔ Job Description Analyzer


resume.pdf
    ↓
extract text
    ↓
job description
    ↓
FastAPI
    ↓
LLM
    ↓
structured analysis
    ↓
JSON response

backend/
├── app/
│   ├── main.py
│   ├── resume_parser.py
│   ├── resume_analyzer.py
│   ├── llm_schemas.py
│   └── spi_schemas.py
│
├── resumes/
│   ├── resume.pdf
│   └── job_description.txt
└──

##### LLM
problem: tried ollama mode tinyllama, but gave weak response
solution 1: changed model to qwen3:8b
issue: pc can't handle
solution 2: switch model to qwen3:4b
issue : pc still can't handle
solution 3: use openrouter API 
issue : very slow ~ 3-5 minutes and hallucinations/inaccuracies
solution: switch to gemini free models ✅

The next step is turning that working script into a proper backend service.

                ┌─────────────────────┐
                │      FastAPI        │
                │                     │
                │  POST /analyze      │
                └──────────┬──────────┘
                           │
                    ┌──────┴──────┐
                    ↓             ↓
              resume.pdf      JD text
                    ↓              │
              PDF parser           │
                    └──────┬───────┘
                           ↓
                     LLM / Ollama
                           ↓
                    structured result
                           ↓
                    FastAPI response

Adding request/response models:

Client
   │
   │ request
   ▼
FastAPI
   │
   │ validated input
   ▼
LLM
   │
   │ model output
   ▼
Pydantic validation
   │
   │ validated response
   ▼
Client

Adding basic tests:
    POST /analyze accepts the resume + JD.
    The endpoint returns 200.
    The response matches ResumeAnalysis.
    Missing resume is rejected.
    Missing JD file/text is rejected.

backend/
├── app/
│   ├── main.py              ← API entry point / endpoints
│   ├── resume_parser.py     ← extracts text from files
│   ├── resume_analyzer.py   ← communicates with Gemini
│   ├── llm_schemas.py       ← validates LLM output
│   └── api_schemas.py       ← API request models
│
└── tests/
    ├── conftest.py          ← shared test fixtures
    ├── test_analyze.py      ← successful /analyze requests
    ├── test_parser.py       ← PDF/DOCX parsing
    └── test_validation.py   ← invalid API requests

### frontend
┌─────────────────────┐
│ React + Vite        │
│                     │
│ Upload Resume       │
│ Enter JD            │
│ View Analysis       │
└──────────┬──────────┘
           │
           │ HTTP POST /analyze
           ↓
┌─────────────────────┐
│ FastAPI             │
│                     │
│ Parse resume        │
│ Analyze with Gemini │
│ Validate response   │
└─────────────────────┘

frontend/
├── src/
│   ├── components/
│   │   ├── ResumeUpload.jsx       ← resume file upload UI
│   │   ├── JobDescription.jsx     ← job description input UI
│   │   ├── AnalyzeButton.jsx      ← analyze button + loading state
│   │   └── AnalysisResult.jsx     ← displays the analysis results
│   │
│   ├── App.jsx                    ← main app; manages state and connects components
│   ├── App.css                    ← styles for the application UI
│   ├── index.css                  ← global/base styles
│   └── main.jsx                   ← frontend entry point; starts the React app
│
├── public/                        ← static files
├── package.json                   ← frontend dependencies and scripts
├── vite.config.js                 ← Vite configuration
└── index.html                     ← HTML page React is mounted into