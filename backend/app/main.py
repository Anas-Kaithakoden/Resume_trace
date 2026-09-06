from fastapi import FastAPI, UploadFile, File, Form, HTTPException

from app.resume_parser import parse_resume, parse_job_description
from app.resume_analyzer import analyze_with_gemini
from app.llm_schemas import ResumeAnalysis

from fastapi.middleware.cors import CORSMiddleware

import os

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
    job_description: UploadFile | None = File(None),
    job_description_text: str | None = Form(None)
):
    # Save uploaded resume
    resume_path = f"./resumes/{resume.filename}"
    with open(resume_path, "wb") as file:
        file.write(await resume.read())

    # Get job description
    if job_description_text:
        job_description_content = job_description_text
    elif job_description:
        job_description_path = f"./resumes/{job_description.filename}"
        with open(job_description_path, "wb") as file:
            file.write(await job_description.read())

        job_description_content = parse_job_description(
            job_description_path
        )
        os.remove(job_description_path)
    else:
        raise HTTPException(
            status_code=400,
            detail="Provide either a job description file or job description text."
        )

    # Parse resume
    resume_text = parse_resume(resume_path)

    # Analyze
    result = analyze_with_gemini(
        resume_text,
        job_description_content
    )

    return result