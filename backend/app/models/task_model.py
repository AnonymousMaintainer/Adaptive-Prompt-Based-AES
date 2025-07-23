from datetime import datetime
from sqlmodel import SQLModel, Field


class Task(SQLModel, table=True):
    __tablename__ = 'tasks'

    id: int = Field(default=None, primary_key=True)
    course_name: str
    course_code: str
    year: str
    rubrics: str
    example_evaluation: str
    student_instruction: str
    created_at: datetime = datetime.now().isoformat()