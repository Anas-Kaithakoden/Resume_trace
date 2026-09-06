from fastapi import FastAPI

from app.resume_parser import parse_resume, parse_job_description
from app.resume_analyzer import analyze_with_gemini


app = FastAPI()


@app.post("/analyze")
def analyze_resume():
    resume_text = parse_resume(
        "./resumes/Anas_Kaithakoden_Python.docx"
    )

    job_description = parse_job_description(
        "./resumes/job_description.txt"
    )

    result = analyze_with_gemini(
        resume_text,
        job_description
    )

    return result