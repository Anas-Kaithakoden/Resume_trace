# test_validation.py
from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_missing_resume():
    """A request without the required resume should be rejected."""

    response = client.post(
        "/analyze",
        data={
            "job_description_text": (
                "Looking for a Python backend developer."
            )
        },
    )

    assert response.status_code == 422


def test_missing_job_description(sample_resume):
    """A request without JD text or a JD file should be rejected."""

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
        )

    assert response.status_code == 400

    assert response.json()["detail"] == (
        "Provide either a job description file "
        "or job description text."
    )


def test_empty_job_description(sample_resume):
    """An empty JD text should be rejected."""

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
                "job_description_text": "",
            },
        )

    assert response.status_code == 400

    assert response.json()["detail"] == (
        "Provide either a job description file "
        "or job description text."
    )