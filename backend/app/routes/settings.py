from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app import auth, database, models, schemas

router = APIRouter()

@router.get("/settings", response_model=schemas.UserResponse)
async def get_settings(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@router.put("/settings", response_model=schemas.UserResponse)
async def update_settings(data: schemas.UserUpdate, current_user: models.User = Depends(auth.get_current_user), session: AsyncSession = Depends(database.get_session)):
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(current_user, field, value)
    session.add(current_user)
    await session.commit()
    await session.refresh(current_user)
    return current_user

@router.put("/settings/password")
async def update_password(data: schemas.PasswordChange, current_user: models.User = Depends(auth.get_current_user), session: AsyncSession = Depends(database.get_session)):
    if not auth.verify_password(data.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    current_user.hashed_password = auth.get_password_hash(data.new_password)
    session.add(current_user)
    await session.commit()
    return {"message": "Password changed successfully."}
