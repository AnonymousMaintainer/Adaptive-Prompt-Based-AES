from enum import Enum
from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel

from .exam_schema import SourceEnum

# VectorExamReadMetadata Schema
class VectorExamMetadata(BaseModel):
    exam_id: int
    student_id: Optional[str]
    project_id: int
    score: float
    created_at: datetime
    is_embedded: bool
    source: SourceEnum

class VectorExamSummary(BaseModel):
    total: int
    exams: List[VectorExamMetadata]

class VectorExamStatusOverview(BaseModel):
    embedded: VectorExamSummary
    not_embedded: VectorExamSummary

# EmbedExamCreationResponse Schema
class EmbedStatusEnum(str, Enum):
    embedded: str = 'embedded'
    skipped: str = 'skipped'
    failed: str = 'failed'

class EmbedBatchRequest(BaseModel):
    exam_ids: List[int]
    overwrite: bool = False

class EmbedResult(BaseModel):
    exam_id: int
    status: EmbedStatusEnum
    detail: str

class EmbedBatchResponse(BaseModel):
    results: List[EmbedResult]

