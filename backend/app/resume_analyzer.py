# resume_analyzer.py
import json
import os
from typing import Any

from dotenv import load_dotenv
from google import genai
from pydantic import ValidationError

try:
    from openai import OpenAI
except ImportError:  # pragma: no cover - optional dependency until installed
    OpenAI = None

from app.llm_schemas import ResumeAnalysis

load_dotenv()

DEFAULT_MODELS = {
    "gemini": os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
    "openrouter": os.getenv("OPENROUTER_MODEL", "openrouter/free"),
    "groq": os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile"),
}


def resolve_model_name(model_name: str | None) -> str:
    normalized = (model_name or "gemini").strip().lower()
    aliases = {
        "gemini": "gemini",
        "gemini-flash": "gemini",
        "google-gemini": "gemini",
        "openrouter": "openrouter",
        "or": "openrouter",
        "groq": "groq",
        "llama": "groq",
    }
    return aliases.get(normalized, normalized)


def _parse_json_response(raw_response: str | None) -> dict[str, Any]:
    if not raw_response:
        raise ValueError("LLM returned an empty response.")

    cleaned = raw_response.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.strip("`")
        if cleaned.lower().startswith("json"):
            cleaned = cleaned[4:].lstrip()

    return json.loads(cleaned)


def _normalize_matching_skill(item: Any) -> dict[str, str]:
    if isinstance(item, dict):
        skill = item.get("skill") or item.get("name") or "Matching skill"
        evidence = (
            item.get("evidence")
            or item.get("details")
            or item.get("reason")
            or "Demonstrated in resume."
        )
        return {"skill": str(skill), "evidence": str(evidence)}

    return {"skill": str(item), "evidence": "Demonstrated in resume."}


def _normalize_missing_skill(item: Any) -> dict[str, str]:
    if isinstance(item, dict):
        skill = item.get("skill") or item.get("name") or "Unknown skill"
        importance = (
            item.get("importance")
            or item.get("severity")
            or item.get("priority")
            or "medium"
        )
        importance_str = str(importance).strip().lower()
        if importance_str not in {"high", "medium", "low"}:
            importance_str = "medium"
        return {"skill": str(skill), "importance": importance_str}

    return {"skill": str(item), "importance": "medium"}


def _normalize_weak_area(item: Any) -> dict[str, str]:
    if isinstance(item, dict):
        area = item.get("area") or item.get("title") or item.get("skill") or "Weak evidence area"
        reason = item.get("reason") or item.get("details") or item.get("description") or "Insufficient evidence in the resume."
        return {"area": str(area), "reason": str(reason)}

    return {
        "area": "Weak evidence area",
        "reason": str(item),
    }


def _normalize_bullet_improvement(item: Any) -> dict[str, str]:
    if isinstance(item, dict):
        original = item.get("original") or item.get("bullet") or item.get("current") or ""
        suggested = item.get("suggested") or item.get("improved") or item.get("rewrite") or original
        reason = (
            item.get("reason")
            or item.get("explanation")
            or item.get("details")
            or "Improves alignment with the job requirements."
        )
        return {"original": str(original), "suggested": str(suggested), "reason": str(reason)}

    return {
        "original": str(item),
        "suggested": str(item),
        "reason": "Improves alignment with the job requirements.",
    }


def _normalize_ats_issue(item: Any) -> str:
    if isinstance(item, dict):
        return str(
            item.get("issue")
            or item.get("description")
            or item.get("text")
            or next(iter(item.values()), "ATS issue identified.")
        )

    return str(item)


def _normalize_recommendation(item: Any) -> str:
    if isinstance(item, dict):
        return str(
            item.get("recommendation")
            or item.get("rec")
            or item.get("text")
            or item.get("description")
            or item.get("action")
            or next(iter(item.values()), "Follow recommended resume best practices.")
        )

    return str(item)


def _normalize_analysis_payload(payload: dict[str, Any]) -> dict[str, Any]:
    if not isinstance(payload, dict):
        raise TypeError("Analysis payload must be a dictionary.")

    normalized = dict(payload)

    if "overall_match" in normalized:
        try:
            match_int = int(normalized["overall_match"])
            normalized["overall_match"] = max(0, min(100, match_int))
        except (TypeError, ValueError):
            normalized["overall_match"] = 0
    else:
        normalized["overall_match"] = 0

    if "matching_skills" in normalized:
        matching = normalized["matching_skills"]
        if isinstance(matching, list):
            normalized["matching_skills"] = [
                _normalize_matching_skill(item) for item in matching
            ]
        else:
            normalized["matching_skills"] = []

    if "missing_skills" in normalized:
        missing = normalized["missing_skills"]
        if isinstance(missing, list):
            normalized["missing_skills"] = [
                _normalize_missing_skill(item) for item in missing
            ]
        else:
            normalized["missing_skills"] = []

    if "weak_areas" in normalized:
        weak_areas = normalized["weak_areas"]
        if isinstance(weak_areas, list):
            normalized["weak_areas"] = [
                _normalize_weak_area(item) for item in weak_areas
            ]
        else:
            normalized["weak_areas"] = []

    if "ats_issues" in normalized:
        ats_issues = normalized["ats_issues"]
        if isinstance(ats_issues, list):
            normalized["ats_issues"] = [
                _normalize_ats_issue(item) for item in ats_issues
            ]
        else:
            normalized["ats_issues"] = []

    if "bullet_improvements" in normalized:
        improvements = normalized["bullet_improvements"]
        if isinstance(improvements, list):
            normalized["bullet_improvements"] = [
                _normalize_bullet_improvement(item) for item in improvements
            ]
        else:
            normalized["bullet_improvements"] = []

    if "recommendations" in normalized:
        recommendations = normalized["recommendations"]
        if isinstance(recommendations, list):
            normalized["recommendations"] = [
                _normalize_recommendation(item) for item in recommendations
            ]
        else:
            normalized["recommendations"] = []

    return normalized


def _validate_analysis_payload(payload: dict[str, Any]) -> ResumeAnalysis:
    try:
        parsed = ResumeAnalysis.model_validate(payload)
        return parsed
    except ValidationError:
        normalized = _normalize_analysis_payload(payload)
        return ResumeAnalysis.model_validate(normalized)


def analyze_with_gemini(resume_text: str, job_description: str):
    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
    model_name = DEFAULT_MODELS["gemini"]
    response = client.models.generate_content(
        model=model_name,
        contents=f"{build_prompt(resume_text, job_description)}",
    )
    return _validate_analysis_payload(_parse_json_response(response.text))


def analyze_with_openrouter(resume_text: str, job_description: str):
    if OpenAI is None:
        raise ModuleNotFoundError(
            "openai package is required for OpenRouter and Groq support."
        )

    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise ValueError("OPENROUTER_API_KEY is not set.")

    client = OpenAI(
        api_key=api_key,
        base_url="https://openrouter.ai/api/v1",
    )
    model_name = DEFAULT_MODELS["openrouter"]
    response = client.chat.completions.create(
        model=model_name,
        messages=[
            {"role": "user", "content": build_prompt(resume_text, job_description)}
        ],
        temperature=0.2,
        response_format={"type": "json_object"},
    )
    content = response.choices[0].message.content
    return _validate_analysis_payload(_parse_json_response(content))


def analyze_with_groq(resume_text: str, job_description: str):
    if OpenAI is None:
        raise ModuleNotFoundError(
            "openai package is required for OpenRouter and Groq support."
        )

    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY is not set.")

    client = OpenAI(
        api_key=api_key,
        base_url="https://api.groq.com/openai/v1",
    )
    model_name = DEFAULT_MODELS["groq"]
    response = client.chat.completions.create(
        model=model_name,
        messages=[
            {"role": "user", "content": build_prompt(resume_text, job_description)}
        ],
        temperature=0.2,
        response_format={"type": "json_object"},
    )
    content = response.choices[0].message.content
    return _validate_analysis_payload(_parse_json_response(content))


def analyze_with_model(resume_text: str, job_description: str, model_name: str = "gemini"):
    provider = resolve_model_name(model_name)

    if provider == "gemini":
        return analyze_with_gemini(resume_text, job_description)
    if provider == "openrouter":
        return analyze_with_openrouter(resume_text, job_description)
    if provider == "groq":
        return analyze_with_groq(resume_text, job_description)

    raise ValueError(f"Unsupported model provider: {model_name}")


def build_prompt(resume_text, job_description):
    prompt = f"""
You are a Resume Engineering Assistant.

Your task is to analyze a candidate's resume against a target job description.

Your analysis must be based ONLY on information explicitly present in:

1. TARGET JOB DESCRIPTION
2. CANDIDATE RESUME

Do not use outside knowledge about the candidate.

====================
CORE RULE
====================

Treat the resume and job description as the only sources of truth.

NEVER invent, assume, or infer facts about the candidate.

Do not invent:

- skills
- technologies
- programming languages
- frameworks
- libraries
- work experience
- years of experience
- projects
- responsibilities
- achievements
- metrics
- performance improvements
- user counts
- team size
- collaboration experience
- debugging experience
- code review experience
- certifications
- education
- job titles
- business impact

If something is not supported by the resume, do not claim that the candidate has it.

When uncertain, prefer "not demonstrated" over making an assumption.

====================
EVIDENCE RULES
====================

A skill is considered DEMONSTRATED only when:

1. The skill is explicitly mentioned in the resume, OR
2. The resume contains a concrete project, task, technology, or experience that directly demonstrates the skill.

Do NOT infer skills from related technologies.

Examples:

- JavaScript does NOT mean Java.
- JavaScript does NOT mean Node.js.
- Python does NOT mean Django.
- Python does NOT mean FastAPI.
- PostgreSQL does NOT mean MongoDB.
- SQL does NOT mean NoSQL.
- Git does NOT automatically prove code review experience.
- Git does NOT automatically prove teamwork.
- pytest does NOT automatically prove professional debugging experience.
- Having an API project does NOT automatically prove professional collaboration.
- Having a project does NOT automatically prove teamwork.
- Being a student does NOT prove eagerness to learn.
- Listing many technologies does NOT prove professional-level proficiency.

Only claim what the resume actually supports.

====================
JOB REQUIREMENTS
====================

Separate the job description into:

1. Clearly required skills and qualifications.
2. Preferred or optional skills and qualifications.
3. Responsibilities.
4. Soft skills.

Do NOT treat optional requirements as mandatory.

If the job description presents alternatives, treat them as alternatives.

For example:

"Python, Java, Node.js, or PHP"

If the resume explicitly contains Python, Python satisfies that language requirement.

Do NOT mark Java, Node.js, or PHP as missing simply because the candidate does not have them.

====================
MATCHING SKILLS
====================

List skills that:

1. Are relevant to the job description, AND
2. Are clearly demonstrated in the resume.

For every matching skill:

- Use the actual skill name.
- Provide concise evidence from the resume.
- Do not exaggerate the evidence.
- Do not infer additional technologies or responsibilities.

The evidence must describe something actually present in the resume.

====================
MISSING SKILLS
====================

List skills or qualifications that are:

1. Required by the job description, AND
2. Not explicitly demonstrated in the resume.

Do NOT list optional technologies as missing.

Do NOT list alternative technologies as missing when another technology satisfies the requirement.

For each genuine missing requirement, assign:

- "high" = important required requirement
- "medium" = relevant but less important requirement
- "low" = minor requirement

If there are no meaningful missing required skills, return an empty array.

====================
WEAK AREAS
====================

Identify areas where the resume contains some relevant evidence but the evidence is:

- weak
- incomplete
- vague
- poorly presented
- insufficiently connected to the job requirement

Do NOT call something a weakness simply because you assume the candidate lacks it.

If the resume does not provide enough information to determine whether the candidate has a skill, describe the evidence as limited rather than claiming the candidate lacks the skill.

====================
ATS ISSUES
====================

Identify concrete ATS-related issues based ONLY on the resume and job description.

Possible issues include:

- Important required keywords are absent.
- A relevant skill is written using wording that does not clearly match the job description.
- Important relevant experience is difficult to identify.
- A required technology is mentioned only indirectly.
- Resume wording does not clearly demonstrate an important requirement.

Do NOT claim that a formatting choice will definitely cause ATS failure.

Do NOT invent ATS problems.

Do NOT say that the resume will definitely be rejected by an ATS.

====================
BULLET IMPROVEMENTS
====================

Identify resume bullets that could be improved for this specific job.

For every improvement:

"original":
Use the ACTUAL existing resume bullet.

"suggested":
Rewrite that bullet using ONLY facts already present in the resume.

You may:

- improve clarity
- improve sentence structure
- use stronger action verbs
- make existing technical details clearer
- emphasize relevant technologies
- remove unnecessary wording
- improve alignment with the job description

You MAY NOT:

- invent metrics
- invent achievements
- invent users
- invent performance improvements
- invent collaboration
- invent responsibilities
- invent technologies
- invent business impact

If a measurable result is not present, do not create one.

====================
RECOMMENDATIONS
====================

Provide practical recommendations for improving the resume for this specific job.

Recommendations must be based on the actual resume and job description.

Do NOT recommend falsely adding skills.

Focus on:

- improving presentation of existing experience
- making relevant evidence easier to find
- improving alignment with the job description
- clarifying weakly demonstrated skills
- addressing genuine skill gaps
- improving ATS keyword alignment when appropriate

Never recommend lying or exaggerating experience.

====================
OVERALL MATCH
====================

Calculate "overall_match" as an integer from 0 to 100.

Base the score on:

1. Required skills demonstrated.
2. Required qualifications demonstrated.
3. Relevant experience demonstrated.
4. Important responsibilities demonstrated.
5. Genuine gaps between the resume and job description.

Do NOT choose the score arbitrarily.

Do NOT give a high score simply because the resume looks professional.

Do NOT reward skills that are only implied.

Do NOT penalize the candidate for optional technologies they do not have.

Do NOT penalize the candidate for alternative technologies when another listed technology satisfies the requirement.

====================
FACTUALITY CHECK
====================

Before producing the final response, verify every claim.

For every matching skill:

Ask:
"Where exactly is this demonstrated in the resume?"

For every missing skill:

Ask:
"Is this genuinely required by the job description?"

For every weak area:

Ask:
"Does the resume actually provide evidence for this weakness?"

For every ATS issue:

Ask:
"Can this issue be supported by comparing the resume and job description?"

For every suggested bullet:

Ask:
"Is every fact in this rewritten bullet present in the original resume?"

If the answer is NO, remove or correct the claim.

====================
OUTPUT SCHEMA (JSON)
====================

Return a valid JSON object matching this exact structure:
{{
  "overall_match": <integer from 0 to 100>,
  "matching_skills": [
    {{
      "skill": "<skill name>",
      "evidence": "<concise evidence from resume>"
    }}
  ],
  "missing_skills": [
    {{
      "skill": "<skill name>",
      "importance": "high" | "medium" | "low"
    }}
  ],
  "weak_areas": [
    {{
      "area": "<area name>",
      "reason": "<reason why this area is weak>"
    }}
  ],
  "ats_issues": [
    "<issue description string>"
  ],
  "bullet_improvements": [
    {{
      "original": "<original bullet point>",
      "suggested": "<improved bullet point>",
      "reason": "<reason for improvement>"
    }}
  ],
  "recommendations": [
    "<recommendation string>"
  ]
}}


CRITICAL: "recommendations" and "ats_issues" must be arrays of plain strings (NOT arrays of objects or dictionaries).
Do not return Markdown, explanations, reasoning, code fences, or text outside the JSON object.


====================
TARGET JOB DESCRIPTION
====================

{job_description}

====================
CANDIDATE RESUME
====================

{resume_text}
"""

    return prompt