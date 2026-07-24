from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app import auth, database, models, schemas, utils

router = APIRouter()

@router.get("/status", response_model=schemas.TreeState)
async def tree_status(current_user: models.User = Depends(auth.get_current_user), session: AsyncSession = Depends(database.get_session)):
    journal_result = await session.execute(
        select(models.JournalEntry.mood, func.count())
        .filter(models.JournalEntry.user_id == current_user.id, models.JournalEntry.deleted_at.is_(None))
        .group_by(models.JournalEntry.mood)
    )
    mood_rows = journal_result.all()
    positive = 0
    negative = 0
    top_moods = []
    total_entries = 0
    for mood, count in mood_rows:
        total_entries += count
        score = utils.mood_score(mood)
        if score >= 0:
            positive += score * count
        else:
            negative += abs(score) * count
        top_moods.append((mood, count))
    top_moods = [m for m, _ in sorted(top_moods, key=lambda item: item[1], reverse=True)][:3]

    event_result = await session.execute(select(func.count()).filter(models.GrowthEvent.user_id == current_user.id))
    event_count = event_result.scalar_one_or_none() or 0

    health = max(24, min(100, 60 + positive * 2 - negative * 2))
    branches = max(2, min(9, 3 + positive // 3))
    leaves = max(12, min(80, 12 + positive // 2 - negative))
    fruits = max(0, min(8, positive // 5))
    water = max(0, min(100, 40 + positive * 2 - negative))
    status = "flourishing" if health >= 70 else "steady" if health >= 45 else "needs nurture"

    return {
        "root_label": f"Born {current_user.created_at.date()}",
        "trunk_health": health,
        "branches": branches,
        "leaves": leaves,
        "fruits": fruits,
        "water_level": water,
        "status": status,
        "positive_events": positive,
        "difficult_days": negative,
    }
