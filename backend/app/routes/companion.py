import json
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app import auth, database, models, schemas, openai_client, utils

router = APIRouter()

async def generate_response_text(messages: list[dict]) -> str:
    async for chunk in openai_client.stream_chat_response(messages):
        pass
    return ""

@router.post("/chat", response_model=schemas.CompanionMessageResponse)
async def create_chat(message: schemas.CompanionMessageCreate, current_user: models.User = Depends(auth.get_current_user), session: AsyncSession = Depends(database.get_session)):
    system_message = utils.personality_system_message(message.personality)
    payload = [
        {"role": "system", "content": system_message},
        {"role": "user", "content": message.message},
    ]
    user_message = models.CompanionMessage(
        user_id=current_user.id,
        role="user",
        content=message.message,
        personality=message.personality,
    )
    session.add(user_message)
    await session.commit()
    await session.refresh(user_message)

    assistant_text = ""
    async for chunk in openai_client.stream_chat_response(payload):
        assistant_text += chunk
    if not assistant_text:
        assistant_text = "I''m here with you — tell me more about what you''re feeling."

    assistant_message = models.CompanionMessage(
        user_id=current_user.id,
        role="assistant",
        content=assistant_text,
        personality=message.personality,
    )
    session.add(assistant_message)
    await session.commit()
    await session.refresh(assistant_message)
    return assistant_message

@router.post("/chat/stream")
async def stream_chat(message: schemas.CompanionMessageCreate, current_user: models.User = Depends(auth.get_current_user), session: AsyncSession = Depends(database.get_session)):
    system_message = utils.personality_system_message(message.personality)
    payload = [
        {"role": "system", "content": system_message},
        {"role": "user", "content": message.message},
    ]
    user_message = models.CompanionMessage(
        user_id=current_user.id,
        role="user",
        content=message.message,
        personality=message.personality,
    )
    session.add(user_message)
    await session.commit()
    await session.refresh(user_message)

    async def event_generator():
        assistant_text = ""
        try:
            async for chunk in openai_client.stream_chat_response(payload):
                assistant_text += chunk
                yield f"data: {json.dumps({'delta': chunk})}\n\n"
        finally:
            if assistant_text:
                assistant_message = models.CompanionMessage(
                    user_id=current_user.id,
                    role="assistant",
                    content=assistant_text,
                    personality=message.personality,
                )
                session.add(assistant_message)
                await session.commit()
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.get("/history", response_model=list[schemas.CompanionMessageResponse])
async def history(current_user: models.User = Depends(auth.get_current_user), session: AsyncSession = Depends(database.get_session)):
    result = await session.execute(
        select(models.CompanionMessage)
        .filter(models.CompanionMessage.user_id == current_user.id)
        .order_by(models.CompanionMessage.created_at.desc())
        .limit(50)
    )
    messages = result.scalars().all()
    return list(reversed(messages))
