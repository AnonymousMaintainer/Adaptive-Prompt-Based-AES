from pydantic import BaseModel, field_validator
from typing import List


class ExamStatsResponse(BaseModel):
    total_exams: int
    pending_exams: int
    completed_exams: int
    score_distribution: List[int]

    @field_validator("score_distribution")
    def validate_distribution(cls, v):
        if len(v) != 10:
            raise ValueError("score_distribution must have 10 buckets.")
        return v