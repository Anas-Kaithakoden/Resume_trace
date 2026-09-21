from fastapi import FastAPI, UploadFile, File, Form, HTTPException

from app.resume_parser import parse_resume
from app.resume_analyzer import analyze_with_gemini
from app.llm_schemas import ResumeAnalysis

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500","http://127.0.0.1:5173", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze", response_model=ResumeAnalysis)
async def analyze_resume(
    resume: UploadFile = File(...),
    job_description_text: str | None = Form(...)
):
    if not job_description_text or not job_description_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Provide job description text."
        )

    resume_path = f"./resumes/{resume.filename}"
    with open(resume_path, "wb") as file:
        file.write(await resume.read())

    resume_text = parse_resume(resume_path)

    result = analyze_with_gemini(
        resume_text,
        job_description_text
    )

    return result