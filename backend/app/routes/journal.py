from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app import auth, database, models, schemas, utils

router = APIRouter()

@router.post("/entries", response_model=schemas.JournalEntryResponse)
async def create_entry(entry: schemas.JournalEntryCreate, current_user: models.User = Depends(auth.get_current_user), session: AsyncSession = Depends(database.get_session)):
    entry_record = models.JournalEntry(
        user_id=current_user.id,
        title=entry.title,
        content=entry.content,
        mood=entry.mood,
        emoji=entry.emoji,
        font_style=entry.font_style,
    )
    session.add(entry_record)
    await session.commit()
    await session.refresh(entry_record)
    score = utils.mood_score(entry.mood)
    event = models.GrowthEvent(
        user_id=current_user.id,
        category="journal",
        description=f"Journal entry created with mood {entry.mood}",
        score=score,
    )
    session.add(event)
    await session.commit()
    return entry_record

@router.get("/entries", response_model=list[schemas.JournalEntryResponse])
async def list_entries(query: Optional[str] = Query(None), include_deleted: bool = False, current_user: models.User = Depends(auth.get_current_user), session: AsyncSession = Depends(database.get_session)):
    base = select(models.JournalEntry).filter(models.JournalEntry.user_id == current_user.id)
    if not include_deleted:
        base = base.filter(models.JournalEntry.deleted_at.is_(None))
    if query:
        search = f"%{query.lower()}%"
        base = base.filter(
            func.lower(models.JournalEntry.title).like(search)
            | func.lower(models.JournalEntry.content).like(search)
            | func.lower(models.JournalEntry.mood).like(search)
        )
    base = base.order_by(models.JournalEntry.updated_at.desc())
    result = await session.execute(base)
    return result.scalars().all()

@router.put("/entries/{entry_id}", response_model=schemas.JournalEntryResponse)
async def update_entry(entry_id: int, entry: schemas.JournalEntryUpdate, current_user: models.User = Depends(auth.get_current_user), session: AsyncSession = Depends(database.get_session)):
    result = await session.execute(select(models.JournalEntry).filter(models.JournalEntry.id == entry_id, models.JournalEntry.user_id == current_user.id))
    existing = result.scalars().first()
    if not existing:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    for field, value in entry.model_dump(exclude_unset=True).items():
        setattr(existing, field, value)
    await session.commit()
    await session.refresh(existing)
    return existing

@router.delete("/entries/{entry_id}")
async def soft_delete_entry(entry_id: int, current_user: models.User = Depends(auth.get_current_user), session: AsyncSession = Depends(database.get_session)):
    result = await session.execute(select(models.JournalEntry).filter(models.JournalEntry.id == entry_id, models.JournalEntry.user_id == current_user.id))
    existing = result.scalars().first()
    if not existing:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    existing.deleted_at = datetime.utcnow()
    session.add(existing)
    await session.commit()
    return {"message": "Journal entry moved to archive."}

@router.post("/entries/{entry_id}/restore")
async def restore_entry(entry_id: int, current_user: models.User = Depends(auth.get_current_user), session: AsyncSession = Depends(database.get_session)):
    result = await session.execute(select(models.JournalEntry).filter(models.JournalEntry.id == entry_id, models.JournalEntry.user_id == current_user.id))
    existing = result.scalars().first()
    if not existing:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    existing.deleted_at = None
    session.add(existing)
    await session.commit()
    return {"message": "Journal entry restored."}

@router.delete("/entries/{entry_id}/permanent")
async def permanent_delete_entry(entry_id: int, current_user: models.User = Depends(auth.get_current_user), session: AsyncSession = Depends(database.get_session)):
    result = await session.execute(select(models.JournalEntry).filter(models.JournalEntry.id == entry_id, models.JournalEntry.user_id == current_user.id))
    existing = result.scalars().first()
    if not existing:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    await session.delete(existing)
    await session.commit()
    return {"message": "Journal entry permanently deleted."}

@router.get("/calendar")
async def calendar_overview(current_user: models.User = Depends(auth.get_current_user), session: AsyncSession = Depends(database.get_session)):
    result = await session.execute(
        select(
            func.date(models.JournalEntry.created_at).label("day"),
            func.count().label("count"),
        )
        .filter(models.JournalEntry.user_id == current_user.id, models.JournalEntry.deleted_at.is_(None))
        .group_by(func.date(models.JournalEntry.created_at))
        .order_by(func.date(models.JournalEntry.created_at))
    )
    rows = result.all()
    return [{"date": row.day.isoformat(), "count": row.count} for row in rows]
