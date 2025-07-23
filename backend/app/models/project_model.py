from datetime import datetime

from sqlmodel import SQLModel, Field

class Project(SQLModel, table=True):
    __tablename__ = 'projects'

    id: int = Field(default=None, primary_key=True)
    project_name: str
    course_name: str
    section: str
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    # Foreign key to User & Task
    user_id: int = Field(foreign_key="users.id", index=True)
    task_id: int = Field(foreign_key="tasks.id", index=True)