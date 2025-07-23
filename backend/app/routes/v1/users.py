from fastapi import APIRouter, status, HTTPException
from sqlmodel import select

from ...core import database, security
from ...models import user_model
from ...schemas import user_schema

router = APIRouter(
    prefix='/users',
    tags=['users']
)


@router.get(
    '/me',
    response_model=user_schema.UserModel,
    status_code=status.HTTP_200_OK
)
async def read_users_me(
        current_user: security.UserDep,
):
    return current_user


@router.post(
    '/register',
    status_code=status.HTTP_201_CREATED,
    response_model=user_schema.UserModel,
)
async def register(
    request: user_schema.CreateUserModel,
    current_user: security.UserDep,
    session: database.SessionDep
) -> user_schema.UserModel:
    """
    Register a new user. Only accessible by admin users.
    """
    if current_user.role != user_schema.RoleEnum.admin:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Unauthorized')
    
    statement = select(user_model.User).where(user_model.User.username == request.username)
    existing_user = session.exec(statement).one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Username already exists.'
        )

    new_user = user_model.User(**request.model_dump())
    new_user.password = security.get_password_hash(new_user.password)

    session.add(new_user)
    session.commit()
    session.refresh(new_user)

    return new_user


@router.put(
    '/settings/profile',
    status_code=status.HTTP_201_CREATED,
    response_model=user_schema.ResponseUserSettingProfileModel,
)
async def profile_setting(
    request: user_schema.UserSettingProfileModel,
    current_user: security.UserDep,
    session: database.SessionDep
) -> user_schema.ResponseUserSettingProfileModel:
    """
    Profile setting update email and phonenumber
    """
    statement = select(user_model.User).where(user_model.User.id == current_user.id)
    user_data = session.exec(statement).first()

    for key, value in request.model_dump(exclude_unset=True).items():
        setattr(user_data, key, value)

    session.commit()
    session.refresh(user_data)

    return user_data


@router.put(
    '/settings/password',
    status_code=status.HTTP_201_CREATED,
    response_model=user_schema.ResponseNewPassword,
)
async def password_setting(
    request: user_schema.NewPassword,
    current_user: security.UserDep,
    session: database.SessionDep
) -> user_schema.ResponseNewPassword:
    """
    Profile setting update password
    """    
    statement = select(user_model.User).where(user_model.User.id == current_user.id)
    user_data = session.exec(statement).first()

    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not security.verify_password(request.password, user_data.password):
        raise HTTPException(status_code=400, detail="Incorrect current password")

    user_data.password = security.get_password_hash(request.new_password)

    session.commit()
    session.refresh(user_data)

    return {"message": "Password updated successfully"}
