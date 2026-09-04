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
│   └── resume_analyzer.py
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
solution 3: use openrouter API ✅
issue : very slow ~ 3-5 minutes and hallucinations/inaccuracies
solution: switch to gemini free models