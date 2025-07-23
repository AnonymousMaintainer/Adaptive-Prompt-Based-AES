from enum import Enum
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, field_validator
from email_validator import validate_email, EmailNotValidError
import phonenumbers


class RoleEnum(str, Enum):
    admin = 'admin'
    teacher = 'teacher'


class CreateUserModel(BaseModel):
    username: str
    password: str
    role: RoleEnum = RoleEnum.teacher
    created_at: datetime = datetime.now().isoformat()


class UserModel(BaseModel):
    id: int
    username: str
    email: str | None
    phone: str | None
    role: RoleEnum = RoleEnum.teacher
    created_at: datetime = datetime.now().isoformat()

class UserInDB(UserModel):
    password: str


class UserSettingProfileModel(BaseModel):
    email: Optional[str] = None
    phone: Optional[str] = None

    @field_validator("email")
    def validate_email_format(cls, value):
        if value is None:
            return value
        try:
            # This normalizes and validates
            return validate_email(value).email
        except EmailNotValidError as e:
            raise ValueError(f"Invalid email: {str(e)}")

    @field_validator("phone")
    def validate_phone_format(cls, value):
        if not value.replace(" ", "").replace("-", "").isdigit():
            raise ValueError("Phone number must contain digits only (no letters or symbols)")

        if value is None:
            return value
        try:
            number = phonenumbers.parse(value, "TH")
            if not phonenumbers.is_valid_number(number):
                raise ValueError("Invalid phone number format")
            return phonenumbers.format_number(number, phonenumbers.PhoneNumberFormat.E164)
        except phonenumbers.NumberParseException as e:
            raise ValueError(f"Invalid phone number: {str(e)}")
        
class ResponseUserSettingProfileModel(BaseModel):
    email: str
    phone: str


class NewPassword(BaseModel):
    password: str
    new_password: str


class ResponseNewPassword(BaseModel):
    message: str