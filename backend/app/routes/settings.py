from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app import auth, database, models, schemas

router = APIRouter()

@router.get("/settings", response_model=schemas.UserResponse)
async def get_settings(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@router.put("/settings", response_model=schemas.UserResponse)
async def update_settings(
    data: schemas.UserUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    session: AsyncSession = Depends(database.get_session)
):
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(current_user, field, value)
    session.add(current_user)
    await session.commit()
    await session.refresh(current_user)
    return current_user

@router.get("/settings/export")
async def export_user_data(
    current_user: models.User = Depends(auth.get_current_user),
    session: AsyncSession = Depends(database.get_session)
):
    journals = (
        await session.execute(
            select(models.JournalEntry).filter(models.JournalEntry.user_id == current_user.id)
        )
    ).scalars().all()

    messages = (
        await session.execute(
            select(models.CompanionMessage).filter(models.CompanionMessage.user_id == current_user.id)
        )
    ).scalars().all()

    export_payload = {
        "user": {
            "name": current_user.name,
            "email": current_user.email,
            "bio": current_user.bio,
            "tree_points": current_user.tree_points,
            "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
        },
        "journal_entries": [
            {
                "title": j.title,
                "reflection": j.reflection,
                "mood": j.mood,
                "emoji": j.emoji,
                "highlight": j.highlight,
                "gratitude": j.gratitude,
                "created_at": j.created_at.isoformat() if j.created_at else None,
            }
            for j in journals
        ],
        "companion_messages": [
            {
                "role": m.role,
                "content": m.content,
                "personality": m.personality,
                "created_at": m.created_at.isoformat() if m.created_at else None,
            }
            for m in messages
        ],
    }

    return JSONResponse(
        content=export_payload,
        headers={"Content-Disposition": f"attachment; filename=genz_growth_backup_{current_user.id}.json"}
    )

@router.delete("/settings/account")
async def delete_account(
    current_user: models.User = Depends(auth.get_current_user),
    session: AsyncSession = Depends(database.get_session)
):
    await session.delete(current_user)
    await session.commit()
    return {"message": "Account deleted successfully."}
