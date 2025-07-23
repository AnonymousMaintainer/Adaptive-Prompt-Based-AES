from datetime import datetime
from typing import Optional

from sqlmodel import SQLModel, Field
from pydantic import EmailStr

from ..schemas import user_schema


class User(SQLModel, table=True):
    __tablename__ = 'users'

    id: Optional[int] = Field(default=None, primary_key=True)
    username: str
    password: str
    email: EmailStr | None = None
    phone: str | None = None
    role: user_schema.RoleEnum = user_schema.RoleEnum.teacher
    created_at: datetime = datetime.now().isoformat()