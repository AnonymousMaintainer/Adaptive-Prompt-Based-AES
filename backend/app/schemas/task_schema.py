from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class TaskBase(BaseModel):
    """Base schema for Task with common attributes."""
    course_name: str = Field(..., description="Name of the course")
    course_code: str = Field(..., description="Code of the course")
    year: str = Field(..., description="Year of the task")
    rubrics: str = Field(..., description="Rubrics for the task")
    example_evaluation: str = Field(..., description="Example evaluation for the task")
    student_instruction: str = Field(..., description="Instructions for students")


class TaskCreate(TaskBase):
    """Schema for creating a new task."""
    # No additional fields needed for creation


class TaskRead(TaskBase):
    """Schema for reading task data."""
    id: int = Field(..., description="Unique identifier for the task")
    created_at: datetime = Field(..., description="Timestamp when the task was created")

    class Config:
        from_attributes = True


class TaskUpdate(BaseModel):
    """Schema for updating an existing task."""
    course_name: Optional[str] = Field(None, description="Updated name of the course")
    course_code: Optional[str] = Field(None, description="Updated code of the course")
    year: Optional[str] = Field(None, description="Updated year of the task")
    rubrics: Optional[str] = Field(None, description="Updated rubrics for the task")
    example_evaluation: Optional[str] = Field(None, description="Updated example evaluation")
    student_instruction: Optional[str] = Field(None, description="Updated student instructions")
