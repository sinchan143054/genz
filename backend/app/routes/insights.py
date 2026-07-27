from datetime import datetime, timedelta, timezone
from collections import Counter
from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app import auth, database, models, schemas, openai_client, utils

router = APIRouter()

@router.get("/summary", response_model=schemas.InsightSnapshot)
async def insights(
    current_user: models.User = Depends(auth.get_current_user),
    session: AsyncSession = Depends(database.get_session),
):
    # 1. Fetch all journal entries
    entries = (
        await session.execute(
            select(models.JournalEntry).where(
                models.JournalEntry.user_id == current_user.id,
                models.JournalEntry.deleted_at.is_(None),
            )
        )
    ).scalars().all()

    # 2. Fetch companion messages count
    messages = (
        await session.execute(
            select(models.CompanionMessage).where(models.CompanionMessage.user_id == current_user.id)
        )
    ).scalars().all()

    # 3. Fetch user memory facts count
    memories = (
        await session.execute(
            select(models.UserMemory).where(models.UserMemory.user_id == current_user.id)
        )
    ).scalars().all()

    total_entries = len(entries)
    total_messages = len(messages)
    total_memories = len(memories)

    if total_entries == 0 and total_messages == 0:
        return {
            "happiness_percentage": 50,
            "stress_level": 30,
            "confidence_level": 50,
            "gratitude_score": 20,
            "mindfulness_score": 20,
            "weekly_streak": 1,
            "monthly_growth": current_user.tree_points or 10,
            "top_moods": ["calm"],
            "emotion_timeline": [],
            "weekly_summary": f"Welcome, {current_user.name}! Write your first reflection or chat with Nova AI to build your real emotional growth analytics.",
            "achievements": [
                {"id": "first_step", "title": "First Step", "desc": "Write your first guided reflection", "unlocked": False},
                {"id": "gratitude_guru", "title": "Gratitude Glow", "desc": "Log gratitude 3 times", "unlocked": False},
                {"id": "streak_master", "title": "Streak Builder", "desc": "Maintain a multi-day streak", "unlocked": False},
                {"id": "tree_nurturer", "title": "Life Tree Nurturer", "desc": "Grow your Life Tree to Sprout stage", "unlocked": (current_user.tree_points or 0) >= 25},
                {"id": "nova_connection", "title": "Nova AI Partner", "desc": "Connect with Nova AI companion", "unlocked": total_messages > 0},
            ],
            "stress_mentions": 0,
            "anxiety_mentions": 0,
            "total_reflections": 0,
            "total_memories": 0,
        }

    positive = sum(1 for e in entries if utils.mood_score(getattr(e, 'mood', 'calm') or 'calm') >= 0)
    happiness_percentage = round((positive / total_entries * 100)) if total_entries > 0 else 50

    today = datetime.now(timezone.utc).date()
    journal_days = {e.created_at.date() for e in entries if e.created_at is not None}

    check_day = today if today in journal_days else (today - timedelta(days=1))
    streak = 0
    while check_day in journal_days and (check_day - timedelta(days=streak)) in journal_days:
        streak += 1

    growth_score = current_user.tree_points or 10

    mood_counter = Counter(getattr(e, 'mood', 'calm') or 'calm' for e in entries)
    top_moods = [mood for mood, _ in mood_counter.most_common(3)]
    if not top_moods:
        top_moods = ["calm"]

    emotion_timeline = [
        {
            "date": e.created_at.strftime("%Y-%m-%d") if e.created_at else today.isoformat(),
            "mood": getattr(e, 'mood', 'calm') or 'calm',
            "emoji": getattr(e, 'emoji', '✨') or '✨',
        }
        for e in sorted(entries, key=lambda x: x.created_at or datetime.now(timezone.utc))
    ]

    gratitude_count = sum(1 for e in entries if e.gratitude)
    lesson_count = sum(1 for e in entries if e.lesson_learned)
    checkin_count = sum(1 for e in entries if e.emotional_checkin)

    # Keywords analysis
    all_text = " ".join([f"{e.title} {e.reflection} {e.highlight}" for e in entries] + [m.content for m in messages]).lower()
    stress_mentions = all_text.count("stress") + all_text.count("overwhelm") + all_text.count("tired")
    anxiety_mentions = all_text.count("anxious") + all_text.count("anxiety") + all_text.count("worry")

    stress_level = max(10, min(90, 40 + stress_mentions * 5 + (total_entries - positive) * 8 - positive * 3))
    confidence_level = max(20, min(100, 50 + positive * 5 + lesson_count * 5 + total_memories * 2))
    gratitude_score = max(10, min(100, gratitude_count * 20 + 20))
    mindfulness_score = max(10, min(100, checkin_count * 15 + total_entries * 5 + total_messages * 3))

    # Generate AI growth summary narrative
    recent_titles = ", ".join([e.title for e in entries[:3]]) if entries else "recent check-ins"
    summary_prompt = (
        f"Synthesize an empowering 2-sentence emotional growth report for {current_user.name}.\n"
        f"Data: {total_entries} journal reflections ({', '.join(top_moods)} moods), {total_memories} long-term memories stored, Life Tree points: {growth_score}.\n"
        f"Highlights: {recent_titles}."
    )
    weekly_summary = await openai_client.generate_chat_completion(
        [{"role": "system", "content": "You are an analytical personal growth coach."}, {"role": "user", "content": summary_prompt}]
    )
    if not weekly_summary:
        weekly_summary = f"Over your past {total_entries} reflections and companion check-ins, you have cultivated emotional balance centered on {', '.join(top_moods)}."

    achievements = [
        {"id": "first_step", "title": "First Step", "desc": "Write your first guided reflection", "unlocked": total_entries >= 1},
        {"id": "gratitude_guru", "title": "Gratitude Glow", "desc": "Log gratitude 3 times", "unlocked": gratitude_count >= 3},
        {"id": "streak_master", "title": "Streak Builder", "desc": "Maintain a multi-day streak", "unlocked": streak >= 3},
        {"id": "tree_nurturer", "title": "Life Tree Nurturer", "desc": "Grow your Life Tree to Sprout stage", "unlocked": growth_score >= 25},
        {"id": "nova_connection", "title": "Nova AI Partner", "desc": "Connect with Nova AI companion", "unlocked": total_messages > 0},
    ]

    return {
        "happiness_percentage": happiness_percentage,
        "stress_level": stress_level,
        "confidence_level": confidence_level,
        "gratitude_score": gratitude_score,
        "mindfulness_score": mindfulness_score,
        "weekly_streak": streak,
        "monthly_growth": growth_score,
        "top_moods": top_moods,
        "emotion_timeline": emotion_timeline,
        "weekly_summary": weekly_summary,
        "achievements": achievements,
        "stress_mentions": stress_mentions,
        "anxiety_mentions": anxiety_mentions,
        "total_reflections": total_entries,
        "total_memories": total_memories,
    }