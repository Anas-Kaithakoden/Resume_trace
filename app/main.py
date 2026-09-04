from resume_parser import parse_resume, parse_job_description



resume_text = parse_resume("resumes/Anas_Kaithakoden_Python.docx")
job_description = parse_job_description("resumes/job_description.txt")

print("RESUME:")
print(resume_text)

print("\nJOB DESCRIPTION:")
print(job_description)