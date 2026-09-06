from pydantic import BaseModel


class AnalyzeRequest(BaseModel):
    job_description_text: str | None = None