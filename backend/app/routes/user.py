from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app import auth, database, models, schemas

router = APIRouter()

@router.put("/profile", response_model=schemas.UserResponse)
async def update_profile(data: schemas.UserUpdate, current_user: models.User = Depends(auth.get_current_user), session: AsyncSession = Depends(database.get_session)):
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(current_user, field, value)
    session.add(current_user)
    await session.commit()
    await session.refresh(current_user)
    return current_user

@router.put("/profile/password")
async def change_password(data: schemas.PasswordChange, current_user: models.User = Depends(auth.get_current_user), session: AsyncSession = Depends(database.get_session)):
    if not auth.verify_password(data.current_password, current_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect")
    current_user.hashed_password = auth.get_password_hash(data.new_password)
    session.add(current_user)
    await session.commit()
    return {"message": "Password updated successfully."}
