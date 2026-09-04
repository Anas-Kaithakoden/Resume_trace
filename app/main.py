# main.py
from resume_parser import parse_resume, parse_job_description
from resume_analyzer import analyze_resume

def main():
    resume_text = parse_resume("./resumes/Anas_Kaithakoden_Python.docx")
    job_description = parse_job_description("./resumes/job_description.txt")

    result = analyze_resume(
        resume_text,
        job_description
    )

    print(result)


if __name__ == "__main__":
    main()