from pydantic import BaseModel, model_validator, Field
from enum import Enum
from typing import Optional
from datetime import datetime
import json


class StatusEnum(str, Enum):
    pending: str = 'pending'
    processing: str = 'processing'
    processed: str = 'processed'
    failed: str = 'failed'


class EvaluationTypeEnum(str, Enum):
    full: str = 'full'  # Both OCR and AI evaluation
    ai_only: str = 'ai_only'  # Only AI evaluation


class SourceEnum(str, Enum):
    internal = "internal"
    external = "external"


class ExamModel(BaseModel):
    status: StatusEnum = StatusEnum.pending
    page: int
    exam_image_url: Optional[str] = None

    student_id: Optional[str] = None
    student_section: Optional[str] = None
    student_seat: Optional[str] = None
    student_room: Optional[str] = None
    exam_extracted_text: Optional[str] = None
    exam_improved_text: Optional[str] = None
    scoring_justification: Optional[str] = None
    score_task_completion: Optional[float] = None
    score_organization: Optional[float] = None
    score_style_language_expression: Optional[float] = None
    score_structural_variety_accuracy: Optional[float] = None
    ai_comment: Optional[str] = None

    is_embedded: bool = False
    source: SourceEnum = SourceEnum.internal

    user_id: int
    project_id: int

    @model_validator(mode='before')
    @classmethod
    def validate_to_json(cls, value):
        if isinstance(value, str):
            return cls(**json.loads(value))
        return value


class ExamInDB(ExamModel):
    id: int
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
