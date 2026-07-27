from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[int] = None
    email: Optional[str] = None
    clerk_id: Optional[str] = None

class UserBase(BaseModel):
    email: EmailStr
    name: str = Field(default="Growth Explorer", min_length=1, max_length=120)
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    theme: Optional[str] = "dark"
    accent_color: Optional[str] = "#7c3aed"
    language: Optional[str] = "en"
    share_insights: Optional[bool] = True
    notify_daily_reminder: Optional[bool] = True
    notify_streak_milestones: Optional[bool] = True
    notify_weekly_digest: Optional[bool] = True
    date_of_birth: Optional[datetime] = None

class UserCreate(UserBase):
    clerk_id: Optional[str] = None
    password: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    clerk_id: Optional[str] = None
    email: EmailStr
    name: str
    bio: Optional[str]
    avatar_url: Optional[str]
    theme: str
    accent_color: str
    language: str
    share_insights: bool
    notify_daily_reminder: bool
    notify_streak_milestones: bool
    notify_weekly_digest: bool
    tree_points: int
    date_of_birth: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class UserUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    theme: Optional[str] = None
    accent_color: Optional[str] = None
    language: Optional[str] = None
    share_insights: Optional[bool] = None
    notify_daily_reminder: Optional[bool] = None
    notify_streak_milestones: Optional[bool] = None
    notify_weekly_digest: Optional[bool] = None
    date_of_birth: Optional[datetime] = None

class UserMemoryCreate(BaseModel):
    category: str
    key_name: str
    fact_value: str
    source: str = "journal"

class UserMemoryResponse(BaseModel):
    id: int
    category: str
    key_name: str
    fact_value: str
    source: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class CompanionMessageCreate(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    personality: str = Field(default="gentle guide")

class CompanionMessageResponse(BaseModel):
    id: int
    role: str
    content: str
    personality: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class JournalEntryBase(BaseModel):
    title: str
    reflection: str
    mood: str = "calm"
    emoji: str = "✨"
    highlight: str = ""
    emotional_checkin: str = ""
    lesson_learned: str = ""
    gratitude: str = ""
    tomorrow_focus: str = ""
    memory_note: str = ""
    is_pinned: bool = False

class JournalEntryCreate(JournalEntryBase):
    pass

class JournalEntryUpdate(BaseModel):
    title: Optional[str] = None
    reflection: Optional[str] = None
    mood: Optional[str] = None
    emoji: Optional[str] = None
    highlight: Optional[str] = None
    emotional_checkin: Optional[str] = None
    lesson_learned: Optional[str] = None
    gratitude: Optional[str] = None
    tomorrow_focus: Optional[str] = None
    memory_note: Optional[str] = None
    is_pinned: Optional[bool] = None

class JournalEntryResponse(JournalEntryBase):
    id: int
    ai_reflection: Optional[str] = ""
    deleted_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class GrowthMetric(BaseModel):
    stage: str
    water_level: int
    growth_score: int
    mood_balance: str
    dry_branches: int
    flowers: int

class TreeState(BaseModel):
    root_label: str
    stage: str
    trunk_health: int
    branches: int
    leaves: int
    fruits: int
    flowers: int = 0
    water_level: int
    status: str
    positive_events: int
    difficult_days: int
    points: int
    planting_date: Optional[str] = None
    recent_activities: List[dict] = []

class InsightSnapshot(BaseModel):
    happiness_percentage: int
    stress_level: int
    confidence_level: int
    gratitude_score: int
    mindfulness_score: int
    weekly_streak: int
    monthly_growth: int
    top_moods: List[str]
    emotion_timeline: List[dict]
    weekly_summary: str
    achievements: List[dict]
    stress_mentions: int = 0
    anxiety_mentions: int = 0
    total_reflections: int = 0
    total_memories: int = 0

class UploadResponse(BaseModel):
    url: str
    filename: str
