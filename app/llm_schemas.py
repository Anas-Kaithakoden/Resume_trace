# llm_schemas.py

from pydantic import BaseModel, Field
from typing import Literal


class MatchingSkill(BaseModel):
    skill: str
    evidence: str


class MissingSkill(BaseModel):
    skill: str
    importance: Literal["high", "medium", "low"]


class WeakArea(BaseModel):
    area: str
    reason: str


class BulletImprovement(BaseModel):
    original: str
    suggested: str
    reason: str


class ResumeAnalysis(BaseModel):
    overall_match: int = Field(ge=0, le=100)
    matching_skills: list[MatchingSkill]
    missing_skills: list[MissingSkill]
    weak_areas: list[WeakArea]
    ats_issues: list[str]
    bullet_improvements: list[BulletImprovement]
    recommendations: list[str]