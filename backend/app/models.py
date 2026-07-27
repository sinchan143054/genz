from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    clerk_id = Column(String(255), unique=True, nullable=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=True)
    name = Column(String(120), nullable=False, default="Growth Explorer")
    bio = Column(String(320), default="Dream big, feel deeply, grow daily.")
    avatar_url = Column(String(512), default="")
    theme = Column(String(32), default="dark")
    accent_color = Column(String(32), default="#7c3aed")
    language = Column(String(16), default="en")
    share_insights = Column(Boolean, default=True)
    notify_daily_reminder = Column(Boolean, default=True)
    notify_streak_milestones = Column(Boolean, default=True)
    notify_weekly_digest = Column(Boolean, default=True)
    tree_points = Column(Integer, default=10)
    date_of_birth = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    journal_entries = relationship("JournalEntry", back_populates="owner", cascade="all, delete-orphan")
    companion_messages = relationship("CompanionMessage", back_populates="owner", cascade="all, delete-orphan")
    growth_events = relationship("GrowthEvent", back_populates="owner", cascade="all, delete-orphan")
    memories = relationship("UserMemory", back_populates="owner", cascade="all, delete-orphan")

class UserMemory(Base):
    __tablename__ = "user_memories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category = Column(String(64), nullable=False)  # person, goal, dream, fear, hobby, achievement, event, preference
    key_name = Column(String(128), nullable=False) # e.g. Sister, Priya, Exam
    fact_value = Column(Text, nullable=False)       # e.g. Priya graduates next month
    source = Column(String(32), default="journal") # journal | chat
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="memories")

class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    title = Column(String(180), nullable=False)
    reflection = Column(Text, nullable=False)
    mood = Column(String(32), default="calm")
    emoji = Column(String(16), default="✨")

    highlight = Column(Text, default="")
    emotional_checkin = Column(Text, default="")
    lesson_learned = Column(Text, default="")
    gratitude = Column(Text, default="")
    tomorrow_focus = Column(Text, default="")
    memory_note = Column(Text, default="")
    is_pinned = Column(Boolean, default=False)
    ai_reflection = Column(Text, default="")

    deleted_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="journal_entries")
    attachments = relationship("JournalAttachment", back_populates="journal_entry", cascade="all, delete-orphan")

class CompanionMessage(Base):
    __tablename__ = "companion_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String(16), nullable=False)
    content = Column(Text, nullable=False)
    personality = Column(String(64), default="gentle guide")
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="companion_messages")

class GrowthEvent(Base):
    __tablename__ = "growth_events"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category = Column(String(80), nullable=False)
    description = Column(String(280), nullable=False)
    score = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="growth_events")

class JournalAttachment(Base):
    __tablename__ = "journal_attachments"

    id = Column(Integer, primary_key=True, index=True)
    journal_id = Column(Integer, ForeignKey("journal_entries.id", ondelete="CASCADE"), nullable=False)
    file_name = Column(String(255))
    file_url = Column(String(1000))
    file_type = Column(String(50))
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    journal_entry = relationship("JournalEntry", back_populates="attachments")