from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app import auth, database, models, schemas, utils

router = APIRouter()

@router.get("/status", response_model=schemas.TreeState)
async def tree_status(
    current_user: models.User = Depends(auth.get_current_user),
    session: AsyncSession = Depends(database.get_session)
):
    journal_result = await session.execute(
        select(models.JournalEntry.mood, func.count())
        .filter(models.JournalEntry.user_id == current_user.id, models.JournalEntry.deleted_at.is_(None))
        .group_by(models.JournalEntry.mood)
    )
    mood_rows = journal_result.all()
    positive = 0
    negative = 0
    total_entries = 0

    for mood, count in mood_rows:
        mood_str = mood or "calm"
        total_entries += count
        score = utils.mood_score(mood_str)
        if score >= 0:
            positive += count
        else:
            negative += count

    points = current_user.tree_points or 10

    # 8 Growth Stages
    if points >= 650:
        stage = "Ancient Tree"
    elif points >= 450:
        stage = "Blooming Tree"
    elif points >= 300:
        stage = "Strong Tree"
    elif points >= 200:
        stage = "Growing Tree"
    elif points >= 120:
        stage = "Young Tree"
    elif points >= 60:
        stage = "Small Plant"
    elif points >= 25:
        stage = "Sprout"
    else:
        stage = "Seed"

    health = min(100, max(10, 30 + points // 5 + positive * 5 - negative * 3))
    branches = min(24, points // 25)
    leaves = min(200, points // 2)
    fruits = min(20, max(0, (points - 200) // 20))
    flowers = min(30, max(0, (points - 100) // 15))
    water = min(100, max(10, 40 + (points % 50) + positive * 4))

    status = "flourishing" if health >= 75 else "steady" if health >= 45 else "needs nurture"

    planting_dt = current_user.date_of_birth or current_user.created_at
    planting_str = planting_dt.strftime("%B %d, %Y") if planting_dt else "Today"

    # Fetch recent growth activity logs
    events_result = await session.execute(
        select(models.GrowthEvent)
        .filter(models.GrowthEvent.user_id == current_user.id)
        .order_by(models.GrowthEvent.created_at.desc())
        .limit(10)
    )
    recent_events = events_result.scalars().all()
    activities = [
        {
            "id": ev.id,
            "category": ev.category,
            "description": ev.description,
            "score": ev.score,
            "date": ev.created_at.strftime("%b %d, %H:%M") if ev.created_at else "Recently",
        }
        for ev in recent_events
    ]

    return {
        "root_label": f"Planting Date: {planting_str}",
        "stage": stage,
        "trunk_health": health,
        "branches": branches,
        "leaves": leaves,
        "fruits": fruits,
        "flowers": flowers,
        "water_level": water,
        "status": status,
        "positive_events": positive,
        "difficult_days": negative,
        "points": points,
        "planting_date": planting_str,
        "recent_activities": activities,
    }

@router.post("/water")
async def water_tree(
    current_user: models.User = Depends(auth.get_current_user),
    session: AsyncSession = Depends(database.get_session)
):
    score = 10
    current_user.tree_points = (current_user.tree_points or 0) + score

    event = models.GrowthEvent(
        user_id=current_user.id,
        category="nurture",
        description="Nurtured and watered Life Tree 🌱",
        score=score,
    )
    session.add(event)
    await session.commit()
    await session.refresh(current_user)

    return {
        "message": "Your Life Tree has been watered! 🌱 (+10 pts)",
        "new_points": current_user.tree_points
    }
