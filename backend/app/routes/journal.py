from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app import auth, database, models, schemas, openai_client, utils

router = APIRouter()

@router.post("/entries", response_model=schemas.JournalEntryResponse)
async def create_entry(
    entry: schemas.JournalEntryCreate,
    current_user: models.User = Depends(auth.get_current_user),
    session: AsyncSession = Depends(database.get_session)
):
    entry_record = models.JournalEntry(
        user_id=current_user.id,
        title=entry.title,
        reflection=entry.reflection,
        mood=entry.mood,
        emoji=entry.emoji,
        highlight=entry.highlight,
        emotional_checkin=entry.emotional_checkin,
        lesson_learned=entry.lesson_learned,
        gratitude=entry.gratitude,
        tomorrow_focus=entry.tomorrow_focus,
        memory_note=entry.memory_note,
        is_pinned=entry.is_pinned,
    )
    session.add(entry_record)
    await session.commit()
    await session.refresh(entry_record)

    # Award growth points for Life Tree
    score = 15
    if entry.gratitude:
        score += 5
    if entry.lesson_learned:
        score += 5

    event = models.GrowthEvent(
        user_id=current_user.id,
        category="journal",
        description=f"Guided reflection: {entry.title}",
        score=score,
    )
    session.add(event)
    current_user.tree_points = (current_user.tree_points or 0) + score
    await session.commit()

    # Generate AI reflection for entry
    prompt = (
        f"Analyze this reflection by {current_user.name}.\n"
        f"Title: {entry.title}\n"
        f"Mood: {entry.mood}\n"
        f"Reflection: {entry.reflection}\n"
        f"Highlight: {entry.highlight or 'N/A'}\n"
        f"Gratitude: {entry.gratitude or 'N/A'}\n"
        f"Lesson Learned: {entry.lesson_learned or 'N/A'}\n\n"
        f"Provide a warm, empowering, 2-3 sentence AI insight highlighting their emotional growth, strengths, and one gentle action point."
    )
    ai_reflection_text = await openai_client.generate_chat_completion(
        [{"role": "system", "content": "You are a warm, empathetic AI personal growth coach."}, {"role": "user", "content": prompt}]
    )
    if ai_reflection_text:
        entry_record.ai_reflection = ai_reflection_text

    # Extract long-term memory facts automatically from reflection
    combined_text = f"{entry.title}. {entry.reflection} {entry.highlight} {entry.gratitude} {entry.lesson_learned}"
    extracted_facts = await openai_client.extract_memories_from_text(combined_text)
    for item in extracted_facts:
        mem_rec = models.UserMemory(
            user_id=current_user.id,
            category=item["category"],
            key_name=item["key_name"],
            fact_value=item["fact_value"],
            source="journal",
        )
        session.add(mem_rec)
    
    await session.commit()
    await session.refresh(entry_record)
    return entry_record

@router.get("/entries", response_model=list[schemas.JournalEntryResponse])
async def list_entries(
    query: Optional[str] = Query(None),
    mood: Optional[str] = Query(None),
    pinned_only: bool = False,
    include_deleted: bool = False,
    current_user: models.User = Depends(auth.get_current_user),
    session: AsyncSession = Depends(database.get_session)
):
    base = select(models.JournalEntry).filter(models.JournalEntry.user_id == current_user.id)
    if not include_deleted:
        base = base.filter(models.JournalEntry.deleted_at.is_(None))
    if pinned_only:
        base = base.filter(models.JournalEntry.is_pinned.is_(True))
    if mood:
        base = base.filter(models.JournalEntry.mood == mood)
    if query:
        search = f"%{query.lower()}%"
        base = base.filter(
            func.lower(models.JournalEntry.title).like(search)
            | func.lower(models.JournalEntry.reflection).like(search)
            | func.lower(models.JournalEntry.highlight).like(search)
            | func.lower(models.JournalEntry.emotional_checkin).like(search)
            | func.lower(models.JournalEntry.lesson_learned).like(search)
            | func.lower(models.JournalEntry.gratitude).like(search)
            | func.lower(models.JournalEntry.tomorrow_focus).like(search)
            | func.lower(models.JournalEntry.memory_note).like(search)
        )
    base = base.order_by(models.JournalEntry.updated_at.desc())
    result = await session.execute(base)
    return result.scalars().all()

@router.put("/entries/{entry_id}", response_model=schemas.JournalEntryResponse)
async def update_entry(
    entry_id: int,
    entry: schemas.JournalEntryUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    session: AsyncSession = Depends(database.get_session)
):
    result = await session.execute(
        select(models.JournalEntry).filter(
            models.JournalEntry.id == entry_id,
            models.JournalEntry.user_id == current_user.id
        )
    )
    existing = result.scalars().first()
    if not existing:
        raise HTTPException(status_code=404, detail="Journal entry not found")

    for field, value in entry.model_dump(exclude_unset=True).items():
        setattr(existing, field, value)

    await session.commit()
    await session.refresh(existing)

    # Re-run memory extraction on updated entry
    combined_text = f"{existing.title}. {existing.reflection} {existing.highlight} {existing.gratitude}"
    extracted_facts = await openai_client.extract_memories_from_text(combined_text)
    for item in extracted_facts:
        mem_rec = models.UserMemory(
            user_id=current_user.id,
            category=item["category"],
            key_name=item["key_name"],
            fact_value=item["fact_value"],
            source="journal",
        )
        session.add(mem_rec)
    if extracted_facts:
        await session.commit()

    return existing

@router.post("/entries/{entry_id}/ai-reflection")
async def generate_ai_reflection(
    entry_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    session: AsyncSession = Depends(database.get_session)
):
    result = await session.execute(
        select(models.JournalEntry).filter(
            models.JournalEntry.id == entry_id,
            models.JournalEntry.user_id == current_user.id
        )
    )
    existing = result.scalars().first()
    if not existing:
        raise HTTPException(status_code=404, detail="Journal entry not found")

    prompt = (
        f"Analyze this reflection by {current_user.name}.\n"
        f"Title: {existing.title}\n"
        f"Mood: {existing.mood}\n"
        f"Reflection: {existing.reflection}\n"
        f"Highlight: {existing.highlight}\n"
        f"Gratitude: {existing.gratitude}\n"
        f"Lesson Learned: {existing.lesson_learned}\n\n"
        f"Provide a warm, empowering, 2-3 sentence AI insight highlighting their emotional growth, strengths, and one gentle action point."
    )

    reflection_text = await openai_client.generate_chat_completion(
        [{"role": "system", "content": "You are a warm, empathetic AI personal growth coach."}, {"role": "user", "content": prompt}]
    )

    if not reflection_text:
        reflection_text = f"Your reflection shows deep self-awareness. Taking time to acknowledge your feelings of {existing.mood} is a powerful step toward emotional balance."

    existing.ai_reflection = reflection_text
    await session.commit()
    await session.refresh(existing)

    return {"ai_reflection": reflection_text}

@router.post("/entries/{entry_id}/pin", response_model=schemas.JournalEntryResponse)
async def toggle_pin_entry(
    entry_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    session: AsyncSession = Depends(database.get_session)
):
    result = await session.execute(
        select(models.JournalEntry).filter(
            models.JournalEntry.id == entry_id,
            models.JournalEntry.user_id == current_user.id
        )
    )
    existing = result.scalars().first()
    if not existing:
        raise HTTPException(status_code=404, detail="Journal entry not found")

    existing.is_pinned = not existing.is_pinned
    await session.commit()
    await session.refresh(existing)
    return existing

@router.delete("/entries/{entry_id}")
async def soft_delete_entry(
    entry_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    session: AsyncSession = Depends(database.get_session)
):
    result = await session.execute(
        select(models.JournalEntry).filter(
            models.JournalEntry.id == entry_id,
            models.JournalEntry.user_id == current_user.id
        )
    )
    existing = result.scalars().first()
    if not existing:
        raise HTTPException(status_code=404, detail="Journal entry not found")

    existing.deleted_at = datetime.utcnow()
    await session.commit()
    return {"message": "Journal entry moved to archive."}

@router.post("/entries/{entry_id}/restore")
async def restore_entry(
    entry_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    session: AsyncSession = Depends(database.get_session)
):
    result = await session.execute(
        select(models.JournalEntry).filter(
            models.JournalEntry.id == entry_id,
            models.JournalEntry.user_id == current_user.id
        )
    )
    existing = result.scalars().first()
    if not existing:
        raise HTTPException(status_code=404, detail="Journal entry not found")

    existing.deleted_at = None
    await session.commit()
    return {"message": "Journal entry restored."}

@router.delete("/entries/{entry_id}/permanent")
async def permanent_delete_entry(
    entry_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    session: AsyncSession = Depends(database.get_session)
):
    result = await session.execute(
        select(models.JournalEntry).filter(
            models.JournalEntry.id == entry_id,
            models.JournalEntry.user_id == current_user.id
        )
    )
    existing = result.scalars().first()
    if not existing:
        raise HTTPException(status_code=404, detail="Journal entry not found")

    await session.delete(existing)
    await session.commit()
    return {"message": "Journal entry permanently deleted."}
