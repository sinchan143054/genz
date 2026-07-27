import os
import logging
from datetime import datetime, timedelta
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from .database import get_session
from . import models

logger = logging.getLogger(__name__)

security = HTTPBearer(auto_error=False)

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "genz_growth_secret_key_2026")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not hashed_password:
        return False
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

async def authenticate_user(session: AsyncSession, email: str, password: str) -> Optional[models.User]:
    result = await session.execute(select(models.User).filter(models.User.email == email))
    user = result.scalars().first()
    if not user or not user.hashed_password:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

async def get_current_user(
    auth_credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    session: AsyncSession = Depends(get_session)
) -> models.User:
    if not auth_credentials or not auth_credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = auth_credentials.credentials
    user_id: Optional[int] = None
    email: Optional[str] = None
    clerk_id: Optional[str] = None

    try:
        # First try decoding as local signed JWT
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        email = payload.get("email")
    except JWTError:
        try:
            # Fall back to decoding unverified claims (e.g. Clerk JWTs)
            unverified = jwt.get_unverified_claims(token)
            clerk_id = unverified.get("sub")
            email = unverified.get("email") or unverified.get("primary_email")
        except Exception as e:
            logger.error(f"Failed to decode token: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

    user: Optional[models.User] = None

    if user_id:
        result = await session.execute(select(models.User).filter(models.User.id == user_id))
        user = result.scalars().first()

    if not user and (clerk_id or email):
        filters = []
        if clerk_id:
            filters.append(models.User.clerk_id == clerk_id)
        if email:
            filters.append(models.User.email == email)

        if filters:
            from sqlalchemy import or_
            result = await session.execute(select(models.User).filter(or_(*filters)))
            user = result.scalars().first()

    if not user and (clerk_id or email):
        # Auto-provision Clerk or verified email user
        user = models.User(
            clerk_id=clerk_id,
            email=email or f"user_{clerk_id[:8]}@genzgrowth.app",
            hashed_password="",
            name="Growth Explorer",
            bio="Dream big, feel deeply, grow daily.",
            theme="dark",
            accent_color="#7c3aed",
            language="en",
            share_insights=True,
            tree_points=0,
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user

