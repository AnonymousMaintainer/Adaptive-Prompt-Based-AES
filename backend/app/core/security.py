from typing import Any, Annotated
from datetime import datetime, timedelta, timezone

import jwt
from jwt.exceptions import InvalidTokenError
from pydantic import ValidationError
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import select

from ..models import user_model
from ..core import database
from ..schemas import user_schema, auth_schema
from .config import Settings

# Configuration settings
ALGORITHM = Settings().ALGORITHM
SECRET_KEY: str = Settings().SECRET_KEY
ACCESS_TOKEN_EXPIRE_MINUTES = Settings().ACCESS_TOKEN_EXPIRE_MINUTES

# Password hashing context
pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl='api/v1/auth/token')

def get_password_hash(password: str) -> str:
    """
    Hash a plain password using bcrypt.
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against a hashed password.
    """
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(
    subject: str | Any,
    expires_delta: timedelta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
) -> str:
    """
    Create a JWT access token.
    """
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode = {'exp': expire, 'sub': str(subject)}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def get_user_from_username(username: str, session: database.SessionDep) -> user_schema.UserInDB:
    """
    Retrieve a user from the database by username.
    """
    statement = select(user_model.User).where(user_model.User.username == username)
    result = session.exec(statement)
    user_in_db = result.first()
    if not user_in_db:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User not found')
    return user_schema.UserInDB(**user_in_db.model_dump())



def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], session: database.SessionDep) -> user_schema.UserInDB:
    """
    Retrieve the current authenticated user based on the JWT token.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail='Could not validate credentials',
        headers={'WWW-Authenticate': 'Bearer'},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get('sub')
        if username is None:
            raise credentials_exception
        token_data = auth_schema.TokenData(username=username)
    except (InvalidTokenError, ValidationError):
        raise credentials_exception
    user = get_user_from_username(username=token_data.username, session=session)
    if user is None:
        raise credentials_exception
    return user

# Type alias for dependency injection
UserDep = Annotated[user_schema.UserModel, Depends(get_current_user)]