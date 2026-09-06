# test_parser.py
import pymupdf
import pytest

from app.resume_parser import (
    parse_docx,
    parse_pdf,
    parse_resume,
)


def test_parse_pdf(tmp_path):
    """PDF text should be extracted correctly."""

    pdf_path = tmp_path / "resume.pdf"

    doc = pymupdf.open()
    page = doc.new_page()

    page.insert_text(
        (72, 72),
        "Python Backend Developer",
    )

    doc.save(pdf_path)
    doc.close()

    text = parse_pdf(pdf_path)

    assert "Python Backend Developer" in text


def test_parse_docx(tmp_path):
    """DOCX paragraph text should be extracted correctly."""

    from docx import Document

    docx_path = tmp_path / "resume.docx"

    doc = Document()
    doc.add_paragraph("Python Backend Developer")
    doc.save(docx_path)

    text = parse_docx(docx_path)

    assert "Python Backend Developer" in text


def test_parse_resume_pdf(tmp_path):
    """parse_resume should route PDF files correctly."""

    pdf_path = tmp_path / "resume.pdf"

    doc = pymupdf.open()
    page = doc.new_page()

    page.insert_text(
        (72, 72),
        "Python",
    )

    doc.save(pdf_path)
    doc.close()

    text = parse_resume(pdf_path)

    assert "Python" in text


def test_parse_resume_unsupported_file_type(tmp_path):
    """Unsupported file types should raise ValueError."""

    txt_path = tmp_path / "resume.txt"

    txt_path.write_text(
        "Python",
        encoding="utf-8",
    )

    with pytest.raises(
        ValueError,
        match="Unsupported file type",
    ):
        parse_resume(txt_path)