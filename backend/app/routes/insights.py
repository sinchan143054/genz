from datetime import datetime, timedelta
from collections import Counter
from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app import auth, database, models, schemas, utils

router = APIRouter()

@router.get("/summary", response_model=schemas.InsightSnapshot)
async def insights(current_user: models.User = Depends(auth.get_current_user), session: AsyncSession = Depends(database.get_session)):
    entries_result = await session.execute(
        select(models.JournalEntry).filter(models.JournalEntry.user_id == current_user.id, models.JournalEntry.deleted_at.is_(None))
    )
    entries = entries_result.scalars().all()
    total = len(entries)
    positive_count = sum(1 for entry in entries if utils.mood_score(entry.mood) >= 0)
    happiness_percentage = int((positive_count / total) * 100) if total else 62

    now = datetime.utcnow()
    weekly = [(now - timedelta(days=i)).date() for i in range(7)]
    entry_dates = {entry.created_at.date() for entry in entries}
    weekly_streak = 0
    for day in weekly:
        if day in entry_dates:
            weekly_streak += 1
        else:
            break

    growth_result = await session.execute(select(func.sum(models.GrowthEvent.score)).filter(models.GrowthEvent.user_id == current_user.id))
    total_score = growth_result.scalar_one_or_none() or 0
    monthly_growth = int(max(0, min(100, total_score + 20)))

    mood_counts = Counter(entry.mood for entry in entries)
    emotion_timeline = [
        {"date": entry.created_at.date().isoformat(), "mood": entry.mood, "emoji": entry.emoji}
        for entry in sorted(entries, key=lambda e: e.created_at)[-12:]
    ]
    top_moods = [mood for mood, _ in mood_counts.most_common(3)]
    if not top_moods:
        top_moods = ["reflective", "calm"]

    return {
        "happiness_percentage": happiness_percentage,
        "weekly_streak": weekly_streak,
        "monthly_growth": monthly_growth,
        "emotion_timeline": emotion_timeline,
        "top_moods": top_moods,
    }
