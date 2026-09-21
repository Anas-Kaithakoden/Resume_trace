# test_validation.py
from fastapi.testclient import TestClient

from app.main import app
from app.resume_analyzer import _validate_analysis_payload


client = TestClient(app)


def test_root_route():
    """The API should respond at the root URL instead of returning 404."""

    response = client.get("/")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"


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


def test_validate_analysis_payload_handles_llm_schema_drift():
    """LLM responses with alternative field names should still validate."""

    payload = {
        "overall_match": 78,
        "matching_skills": [
            {
                "skill": "Python",
                "evidence": "Used Python in backend development.",
            }
        ],
        "missing_skills": [
            {"skill": "Data structures", "severity": "high"},
            {"skill": "HTTP protocol", "severity": "medium"},
        ],
        "weak_areas": [
            "HTTP is not named explicitly and its usage is not shown.",
            "SQL and PostgreSQL are discussed but no concrete project example is provided.",
        ],
        "ats_issues": [
            {"issue": "The keywords 'backend' and 'HTTP' are underrepresented."},
            {"issue": "The job's required data structures concept is not explicit."},
        ],
        "bullet_improvements": [
            {
                "original": "Built a backend service.",
                "suggested": "Built a Python backend service for data processing.",
            },
        ],
        "recommendations": ["Add explicit HTTP and SQL examples."],
    }

    analysis = _validate_analysis_payload(payload)

    assert analysis.overall_match == 78
    assert analysis.missing_skills[0].importance == "high"
    assert analysis.missing_skills[1].importance == "medium"
    assert analysis.weak_areas[0].area == "Weak evidence area"
    assert analysis.ats_issues[0] == "The keywords 'backend' and 'HTTP' are underrepresented."
    assert analysis.bullet_improvements[0].reason == (
        "Improves alignment with the job requirements."
    )


def test_validate_analysis_payload_handles_dict_recommendations():
    """LLM responses where recommendations or matching_skills are dicts/strings should normalize."""

    payload = {
        "overall_match": 85,
        "matching_skills": ["Python", {"skill": "FastAPI"}],
        "missing_skills": [{"skill": "Docker", "importance": "critical"}],
        "weak_areas": [{"area": "System design", "reason": "No large-scale project mentioned."}],
        "ats_issues": ["Missing keywords."],
        "bullet_improvements": [
            {
                "original": "Wrote backend code.",
                "suggested": "Developed Python backend APIs.",
                "reason": "Clearer impact.",
            }
        ],
        "recommendations": [
            {"recommendation": "Seek experience with Kafka."},
            {"recommendation": "Elaborate on error handling."},
        ],
    }

    analysis = _validate_analysis_payload(payload)

    assert analysis.overall_match == 85
    assert analysis.matching_skills[0].skill == "Python"
    assert analysis.matching_skills[0].evidence == "Demonstrated in resume."
    assert analysis.matching_skills[1].skill == "FastAPI"
    assert analysis.missing_skills[0].importance == "medium"  # 'critical' normalized to 'medium'
    assert analysis.recommendations[0] == "Seek experience with Kafka."
    assert analysis.recommendations[1] == "Elaborate on error handling."


def test_build_prompt_renders_valid_string():
    """build_prompt should render successfully with arbitrary text without f-string errors."""
    from app.resume_analyzer import build_prompt

    prompt = build_prompt(
        resume_text="Senior Python developer with FastAPI and SQL experience.",
        job_description="Seeking a Python Engineer with cloud and microservices skills.",
    )

    assert "Senior Python developer" in prompt
    assert "Seeking a Python Engineer" in prompt
    assert "OUTPUT SCHEMA (JSON)" in prompt




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