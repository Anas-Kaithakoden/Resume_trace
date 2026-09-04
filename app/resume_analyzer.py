import json
import os

from dotenv import load_dotenv
from openai import OpenAI


load_dotenv()

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY")
)


MODEL = "openrouter/free"


schema = {
    "type": "object",
    "properties": {
        "overall_match": {
            "type": "integer"
        },
        "matching_skills": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "skill": {"type": "string"},
                    "evidence": {"type": "string"}
                },
                "required": ["skill", "evidence"]
            }
        },
        "missing_skills": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "skill": {"type": "string"},
                    "importance": {
                        "type": "string",
                        "enum": ["high", "medium", "low"]
                    }
                },
                "required": ["skill", "importance"]
            }
        },
        "weak_areas": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "area": {"type": "string"},
                    "reason": {"type": "string"}
                },
                "required": ["area", "reason"]
            }
        },
        "ats_issues": {
            "type": "array",
            "items": {
                "type": "string"
            }
        },
        "bullet_improvements": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "original": {"type": "string"},
                    "suggested": {"type": "string"},
                    "reason": {"type": "string"}
                },
                "required": ["original", "suggested", "reason"]
            }
        },
        "recommendations": {
            "type": "array",
            "items": {
                "type": "string"
            }
        }
    },
    "required": [
        "overall_match",
        "matching_skills",
        "missing_skills",
        "weak_areas",
        "ats_issues",
        "bullet_improvements",
        "recommendations"
    ]
}


def analyze_resume(resume_text, job_description):

    prompt = f"""
You are a Resume Engineering Assistant.

Your job is to analyze a candidate's resume against a target job description.

Evaluate the resume based ONLY on information explicitly present
in the resume and job description.

Do not invent:
- skills
- technologies
- work experience
- projects
- achievements
- education
- certifications

Distinguish between:

1. Skills clearly demonstrated in the resume.
2. Skills mentioned in the resume but weakly demonstrated.
3. Skills required by the job description but absent from the resume.
4. Potential improvements to how existing experience is presented.

Your analysis should be practical and actionable.

For every recommendation, explain what should be improved and why.

Do not recommend adding a skill unless the candidate has evidence
of actually possessing it.

IIMPORTANT:
Return ONLY a valid JSON object.
Do not use Markdown.
Do not use ```json.
Do not include headings, explanations, tables, or any text outside the JSON object.

The response must exactly follow this structure:

{{
  "overall_match": 0,
  "matching_skills": [],
  "missing_skills": [],
  "weak_areas": [],
  "ats_issues": [],
  "bullet_improvements": [],
  "recommendations": []
}}

TARGET JOB DESCRIPTION:

{job_description}

CANDIDATE RESUME:

{resume_text}
"""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    content = response.choices[0].message.content

    print("\n--- RAW MODEL RESPONSE ---")
    print(repr(content))
    print("--- END RESPONSE ---\n")

    return json.loads(content)