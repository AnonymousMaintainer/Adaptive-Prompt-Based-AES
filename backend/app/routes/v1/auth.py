from typing import Annotated

from fastapi import APIRouter, status, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import select

from ...core import database, security
from ...models import user_model
from ...schemas import auth_schema

router = APIRouter(
    prefix='/auth',
    tags=['auth']
)


@router.post('/token', status_code=status.HTTP_201_CREATED)
async def token(
    request: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: database.SessionDep
) -> auth_schema.Token:
    """
    Generate an access token for the user.
    """
    statement = select(user_model.User).where(user_model.User.username == request.username)
    user_in_db = session.exec(statement).first()

    if not user_in_db:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User not found')

    if not security.verify_password(request.password, user_in_db.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Incorrect username or password')

    access_token = security.create_access_token(
        subject=user_in_db.username
    )

    return auth_schema.Token(access_token=access_token, token_type='bearer')