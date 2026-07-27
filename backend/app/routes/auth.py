from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app import auth, database, models, schemas

router = APIRouter()

@router.post("/register", response_model=schemas.Token)
async def register(user: schemas.UserCreate, session: AsyncSession = Depends(database.get_session)):
    result = await session.execute(select(models.User).filter(models.User.email == user.email))
    existing = result.scalars().first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email is already registered")
    
    hashed_pwd = auth.get_password_hash(user.password) if user.password else None
    new_user = models.User(
        email=user.email,
        name=user.name or "Growth Explorer",
        hashed_password=hashed_pwd,
        bio=user.bio or "Dream big, feel deeply, grow daily.",
        avatar_url=user.avatar_url or "",
        theme=user.theme or "dark",
        accent_color=user.accent_color or "#7c3aed",
        language=user.language or "en",
        share_insights=user.share_insights if user.share_insights is not None else True,
        tree_points=0,
    )
    session.add(new_user)
    await session.commit()
    await session.refresh(new_user)
    
    access_token = auth.create_access_token({"user_id": new_user.id, "email": new_user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=schemas.Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), session: AsyncSession = Depends(database.get_session)):
    user = await auth.authenticate_user(session, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    access_token = auth.create_access_token({"user_id": user.id, "email": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.UserResponse)
async def read_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

