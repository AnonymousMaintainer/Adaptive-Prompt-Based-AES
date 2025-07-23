from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class ProjectBase(BaseModel):
    """Base schema for Project with common attributes."""
    project_name: str = Field(..., description="Name of the project")
    course_name: str = Field(..., description="Course ID associated with the project")
    section: str = Field(..., description="Section of the course")


class ProjectCreate(ProjectBase):
    """Schema for creating a new project."""
    # user_id is removed as it will be set from the current user
    task_id: int = Field(..., description="Task ID associated with the project")


class ProjectRead(ProjectBase):
    """Schema for reading project data."""
    id: int = Field(..., description="Unique identifier for the project")
    created_at: datetime = Field(..., description="Timestamp when the project was created")
    user_id: int = Field(..., description="ID of the user who created the project")
    task_id: int = Field(..., description="Task ID associated with the project")

    class Config:
        from_attributes = True


class ProjectUpdate(BaseModel):
    """Schema for updating an existing project."""
    project_name: Optional[str] = Field(None, description="Updated name of the project")
    course_name: Optional[str] = Field(None, description="Updated course ID")
    section: Optional[str] = Field(None, description="Updated section")
    task_id: Optional[int] = Field(None, description="Updated task ID")
