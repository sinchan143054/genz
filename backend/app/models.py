from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    name = Column(String(120), nullable=False)
    bio = Column(String(320), default="Dream big, feel deeply.")
    avatar_url = Column(String(512), default="")
    theme = Column(String(32), default="system")
    accent_color = Column(String(32), default="#7c3aed")
    language = Column(String(16), default="en")
    share_insights = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    journal_entries = relationship("JournalEntry", back_populates="owner", cascade="all, delete-orphan")
    companion_messages = relationship("CompanionMessage", back_populates="owner", cascade="all, delete-orphan")
    growth_events = relationship("GrowthEvent", back_populates="owner", cascade="all, delete-orphan")

class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(180), nullable=False)
    content = Column(Text, nullable=False)
    mood = Column(String(40), nullable=False, default="calm")
    emoji = Column(String(8), default="🧠")
    font_style = Column(String(64), default="handwritten")
    deleted_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="journal_entries")

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
