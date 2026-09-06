# test_analyze.py
from fastapi.testclient import TestClient

from app.main import app
from app.llm_schemas import ResumeAnalysis


client = TestClient(app)


def mock_analysis():
    """Return deterministic LLM output for API tests."""
    return ResumeAnalysis(
        overall_match=80,
        matching_skills=[
            {
                "skill": "Python",
                "evidence": "Python is listed in the resume.",
            }
        ],
        missing_skills=[],
        weak_areas=[],
        ats_issues=[],
        bullet_improvements=[],
        recommendations=[],
    )


def test_analyze_with_jd_text(monkeypatch, sample_resume):
    """POST /analyze accepts a resume and JD supplied as text."""

    from app import main

    monkeypatch.setattr(
        main,
        "analyze_with_gemini",
        lambda resume, jd: mock_analysis(),
    )

    with open(sample_resume, "rb") as resume_file:
        response = client.post(
            "/analyze",
            files={
                "resume": (
                    "test_resume.pdf",
                    resume_file,
                    "application/pdf",
                )
            },
            data={
                "job_description_text": (
                    "Looking for a Python backend developer."
                )
            },
        )

    assert response.status_code == 200

    data = response.json()

    assert data["overall_match"] == 80
    assert isinstance(data["matching_skills"], list)
    assert isinstance(data["missing_skills"], list)
    assert isinstance(data["weak_areas"], list)
    assert isinstance(data["ats_issues"], list)
    assert isinstance(data["bullet_improvements"], list)
    assert isinstance(data["recommendations"], list)


def test_analyze_with_jd_file(monkeypatch, sample_resume, tmp_path):
    """POST /analyze accepts a resume and JD supplied as a file."""

    from app import main

    monkeypatch.setattr(
        main,
        "analyze_with_gemini",
        lambda resume, jd: mock_analysis(),
    )

    jd_path = tmp_path / "test_job_description.txt"

    jd_path.write_text(
        "Looking for a Python backend developer.",
        encoding="utf-8",
    )

    with open(sample_resume, "rb") as resume_file:
        with open(jd_path, "rb") as jd_file:

            response = client.post(
                "/analyze",
                files={
                    "resume": (
                        "test_resume.pdf",
                        resume_file,
                        "application/pdf",
                    ),
                    "job_description": (
                        "test_job_description.txt",
                        jd_file,
                        "text/plain",
                    ),
                },
            )

    assert response.status_code == 200

    data = response.json()

    ResumeAnalysis.model_validate(data)