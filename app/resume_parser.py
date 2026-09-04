import pymupdf
from docx import Document

def parse_pdf(file_path):
    """Extract text from a PDF file."""
    doc = pymupdf.open(file_path)

    text = []

    for page in doc:
        text.append(page.get_text())

    doc.close()

    return "\n".join(text)


def parse_docx(file_path):
    """Extract text from a DOCX file."""
    doc = Document(file_path)

    text = []

    for paragraph in doc.paragraphs:
        text.append(paragraph.text)

    return "\n".join(text)


def parse_resume(file_path):
    """Extract text from a supported resume file."""
    from pathlib import Path

    extension = Path(file_path).suffix.lower()

    if extension == ".pdf":
        return parse_pdf(file_path)

    elif extension == ".docx":
        return parse_docx(file_path)

    else:
        raise ValueError(f"Unsupported file type: {extension}")


def parse_job_description(file_path):
    """Extract text from a job description text file."""
    
    with open(file_path, "r", encoding="utf-8") as file:
        return file.read()