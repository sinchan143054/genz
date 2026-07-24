from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[int] = None

class UserBase(BaseModel):
    email: EmailStr
    name: str = Field(..., min_length=2, max_length=120)
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    theme: Optional[str] = None
    accent_color: Optional[str] = None
    language: Optional[str] = None
    share_insights: Optional[bool] = True

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    name: str
    bio: Optional[str]
    avatar_url: Optional[str]
    theme: str
    accent_color: str
    language: str
    share_insights: bool
    created_at: datetime

    class Config:
        orm_mode = True

class UserUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    theme: Optional[str] = None
    accent_color: Optional[str] = None
    language: Optional[str] = None
    share_insights: Optional[bool] = None

class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)

class CompanionMessageCreate(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    personality: str = Field(default="gentle guide")

class CompanionMessageResponse(BaseModel):
    id: int
    role: str
    content: str
    personality: str
    created_at: datetime

    class Config:
        orm_mode = True

class JournalEntryBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=180)
    content: str = Field(..., min_length=1)
    mood: str = Field(default="reflective")
    emoji: str = Field(default="📝")
    font_style: str = Field(default="handwritten")

class JournalEntryCreate(JournalEntryBase):
    pass

class JournalEntryUpdate(BaseModel):
    title: Optional[str]
    content: Optional[str]
    mood: Optional[str]
    emoji: Optional[str]
    font_style: Optional[str]
    deleted_at: Optional[datetime]

class JournalEntryResponse(JournalEntryBase):
    id: int
    deleted_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class GrowthMetric(BaseModel):
    stage: str
    water_level: int
    growth_score: int
    mood_balance: str
    dry_branches: int
    flowers: int

class TreeState(BaseModel):
    root_label: str
    trunk_health: int
    branches: int
    leaves: int
    fruits: int
    water_level: int
    status: str
    positive_events: int
    difficult_days: int

class InsightSnapshot(BaseModel):
    happiness_percentage: int
    weekly_streak: int
    monthly_growth: int
    emotion_timeline: List[dict]
    top_moods: List[str]

class UploadResponse(BaseModel):
    url: str
    filename: str
