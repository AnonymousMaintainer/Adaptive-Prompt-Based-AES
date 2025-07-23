from datetime import datetime
from sqlmodel import Field, SQLModel
from typing import Optional, Literal

from ..schemas import exam_schema


class Exam(SQLModel, table=True):
    __tablename__ = 'exams'

    id: int = Field(default=None, primary_key=True)
    status: exam_schema.StatusEnum = Field(default=exam_schema.StatusEnum.pending, index=True)
    page: int = Field(index=True)
    total_pages: Optional[int] = Field(default=None)
    exam_image_url: str | None = None

    student_id: str | None = None
    student_section: str | None = None
    student_seat: str | None = None
    student_room: str | None = None
    exam_extracted_text: str | None = None

    exam_improved_text: str | None = None
    scoring_justification: str | None = None
    score_task_completion: float | None = None
    score_organization: float | None = None
    score_style_language_expression: float | None = None
    score_structural_variety_accuracy: float | None = None
    ai_comment: str | None = None

    is_embedded: bool = Field(default=False, index=True)
    source: exam_schema.SourceEnum = Field(default=exam_schema.SourceEnum.internal)

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    # Foreign key to Project
    user_id: int = Field(foreign_key="users.id", index=True)
    project_id: int = Field(foreign_key="projects.id", index=True)
    
    @property
    def score(self) -> float:
        """Total score as the sum of 4 sub-scores."""
        return sum([
            self.score_task_completion or 0,
            self.score_organization or 0,
            self.score_style_language_expression or 0,
            self.score_structural_variety_accuracy or 0
        ])