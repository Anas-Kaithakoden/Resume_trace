import pytest
import pymupdf


@pytest.fixture
def sample_resume(tmp_path):
    """Create a minimal valid PDF resume for API tests."""
    pdf_path = tmp_path / "test_resume.pdf"

    doc = pymupdf.open()
    page = doc.new_page()

    page.insert_text(
        (72, 72),
        "Anas Sanu\n"
        "Python Backend Developer\n"
        "Skills: Python, FastAPI, PostgreSQL\n"
        "Projects: Resume Analyzer API",
    )

    doc.save(pdf_path)
    doc.close()

    return pdf_path