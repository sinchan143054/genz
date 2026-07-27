from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app import auth, database, models, schemas, openai_client

router = APIRouter()

@router.get("/facts", response_model=list[schemas.UserMemoryResponse])
async def list_user_memories(
    category: Optional[str] = Query(None),
    current_user: models.User = Depends(auth.get_current_user),
    session: AsyncSession = Depends(database.get_session)
):
    stmt = select(models.UserMemory).filter(models.UserMemory.user_id == current_user.id)
    if category:
        stmt = stmt.filter(models.UserMemory.category == category.lower())
    stmt = stmt.order_by(models.UserMemory.created_at.desc())
    result = await session.execute(stmt)
    return result.scalars().all()

@router.post("/facts", response_model=schemas.UserMemoryResponse)
async def create_user_memory(
    memory: schemas.UserMemoryCreate,
    current_user: models.User = Depends(auth.get_current_user),
    session: AsyncSession = Depends(database.get_session)
):
    rec = models.UserMemory(
        user_id=current_user.id,
        category=memory.category.lower().strip(),
        key_name=memory.key_name.strip(),
        fact_value=memory.fact_value.strip(),
        source=memory.source,
    )
    session.add(rec)
    await session.commit()
    await session.refresh(rec)
    return rec

@router.delete("/facts/{memory_id}")
async def delete_user_memory(
    memory_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    session: AsyncSession = Depends(database.get_session)
):
    result = await session.execute(
        select(models.UserMemory).filter(
            models.UserMemory.id == memory_id,
            models.UserMemory.user_id == current_user.id
        )
    )
    existing = result.scalars().first()
    if not existing:
        raise HTTPException(status_code=404, detail="Memory fact not found")
    await session.delete(existing)
    await session.commit()
    return {"message": "Memory fact deleted."}

@router.get("/search", response_model=list[schemas.JournalEntryResponse])
async def search_memories(
    query: Optional[str] = Query(None),
    pinned_only: bool = False,
    current_user: models.User = Depends(auth.get_current_user),
    session: AsyncSession = Depends(database.get_session)
):
    stmt = select(models.JournalEntry).filter(
        models.JournalEntry.user_id == current_user.id,
        models.JournalEntry.deleted_at.is_(None)
    )
    if pinned_only:
        stmt = stmt.filter(models.JournalEntry.is_pinned.is_(True))
    if query:
        search = f"%{query.lower()}%"
        stmt = stmt.filter(
            or_(
                func.lower(models.JournalEntry.title).like(search),
                func.lower(models.JournalEntry.reflection).like(search),
                func.lower(models.JournalEntry.highlight).like(search),
                func.lower(models.JournalEntry.gratitude).like(search),
                func.lower(models.JournalEntry.memory_note).like(search),
                func.lower(models.JournalEntry.lesson_learned).like(search),
            )
        )
    stmt = stmt.order_by(models.JournalEntry.created_at.desc())
    result = await session.execute(stmt)
    return result.scalars().all()

@router.get("/pinned", response_model=list[schemas.JournalEntryResponse])
async def pinned_memories(
    current_user: models.User = Depends(auth.get_current_user),
    session: AsyncSession = Depends(database.get_session)
):
    stmt = select(models.JournalEntry).filter(
        models.JournalEntry.user_id == current_user.id,
        models.JournalEntry.is_pinned.is_(True),
        models.JournalEntry.deleted_at.is_(None)
    ).order_by(models.JournalEntry.created_at.desc())
    result = await session.execute(stmt)
    return result.scalars().all()

@router.post("/recall")
async def ai_memory_recall(
    topic: Optional[str] = None,
    current_user: models.User = Depends(auth.get_current_user),
    session: AsyncSession = Depends(database.get_session)
):
    # Fetch journal entries
    entries_result = await session.execute(
        select(models.JournalEntry).filter(
            models.JournalEntry.user_id == current_user.id,
            models.JournalEntry.deleted_at.is_(None)
        ).order_by(models.JournalEntry.created_at.desc()).limit(10)
    )
    entries = entries_result.scalars().all()

    # Fetch memory facts
    facts_result = await session.execute(
        select(models.UserMemory).filter(models.UserMemory.user_id == current_user.id).limit(15)
    )
    facts = facts_result.scalars().all()

    if not entries and not facts:
        return {"recall_summary": "No journal memories recorded yet. Start writing your guided reflections to build your memory vault!"}

    memory_text = "\n".join([f"- Journal ({e.created_at.strftime('%b %d')}): {e.title} | Mood: {e.mood} | {e.highlight or e.reflection[:100]}" for e in entries])
    facts_text = "\n".join([f"- [{f.category}] {f.key_name}: {f.fact_value}" for f in facts])

    prompt = (
        f"You are a warm AI Memory Archivist for {current_user.name}.\n"
        f"Review recent journal highlights:\n{memory_text}\n\n"
        f"Review long-term memory facts:\n{facts_text}\n\n"
        f"Topic requested: {topic or 'General Growth'}\n"
        f"Synthesize a beautiful, insightful 3-sentence summary recalling key people, lessons learned, and emotional progress."
    )

    summary = await openai_client.generate_chat_completion(
        [{"role": "system", "content": "You are a thoughtful memory archivist."}, {"role": "user", "content": prompt}]
    )

    if not summary:
        summary = f"Looking back over your reflections and stored memories, you've shown resilience and gratitude. Your moments of highlight reflect positive growth across your journey."

    return {"recall_summary": summary}
