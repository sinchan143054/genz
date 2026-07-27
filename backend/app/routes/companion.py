import json
import logging
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app import auth, database, models, schemas, openai_client, utils

logger = logging.getLogger(__name__)

router = APIRouter()

from collections import Counter

async def get_user_memory_context(user_id: int, session: AsyncSession) -> tuple[str, str, str, str, int]:
    """Helper to fetch recent journal entries, memory facts, insights metrics, and tree stage."""
    # 1. Fetch recent journal entries
    recent_journals = (
        await session.execute(
            select(models.JournalEntry)
            .filter(models.JournalEntry.user_id == user_id, models.JournalEntry.deleted_at.is_(None))
            .order_by(models.JournalEntry.created_at.desc())
            .limit(5)
        )
    ).scalars().all()

    # 2. Fetch active long-term memories
    memories = (
        await session.execute(
            select(models.UserMemory)
            .filter(models.UserMemory.user_id == user_id)
            .order_by(models.UserMemory.created_at.desc())
            .limit(20)
        )
    ).scalars().all()

    # 3. Fetch user tree status
    user_rec = (
        await session.execute(select(models.User).filter(models.User.id == user_id))
    ).scalars().first()

    points = user_rec.tree_points if user_rec else 10
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

    # 4. Calculate Insights Analytics Summary
    total_entries = len(recent_journals)
    if recent_journals:
        positive = sum(1 for j in recent_journals if utils.mood_score(j.mood or 'calm') >= 0)
        happiness_pct = round((positive / total_entries * 100))
        mood_counter = Counter(j.mood or 'calm' for j in recent_journals)
        top_moods = ", ".join([m for m, _ in mood_counter.most_common(2)])
    else:
        happiness_pct = 50
        top_moods = "calm, reflective"

    insights_summary = f"Happiness: {happiness_pct}% | Primary Moods: {top_moods} | Life Tree Points: {points}"

    journal_summary = "\n".join([
        f"- Reflection '{j.title}' ({j.created_at.strftime('%Y-%m-%d')}): Mood={j.mood} | Highlight: {j.highlight or 'N/A'} | Gratitude: {j.gratitude or 'N/A'} | Text: {j.reflection[:120]}"
        for j in recent_journals
    ])

    memory_summary = "\n".join([
        f"- [{m.category.upper()}] {m.key_name}: {m.fact_value}"
        for m in memories
    ])

    return journal_summary, memory_summary, insights_summary, stage, points


@router.post("/chat", response_model=schemas.CompanionMessageResponse)
async def create_chat(
    message: schemas.CompanionMessageCreate,
    current_user: models.User = Depends(auth.get_current_user),
    session: AsyncSession = Depends(database.get_session)
):
    # Check for Crisis Intent
    if openai_client.detect_crisis_intent(message.message):
        crisis_reply = openai_client.get_crisis_response_text(current_user.name)
        
        user_msg = models.CompanionMessage(
            user_id=current_user.id,
            role="user",
            content=message.message,
            personality=message.personality,
        )
        asst_msg = models.CompanionMessage(
            user_id=current_user.id,
            role="assistant",
            content=crisis_reply,
            personality=message.personality,
        )
        session.add(user_msg)
        session.add(asst_msg)
        await session.commit()
        await session.refresh(asst_msg)
        return asst_msg

    # Fetch context
    journal_summary, memory_summary, insights_summary, tree_stage, tree_points = await get_user_memory_context(current_user.id, session)

    # Fetch conversation history
    recent_history = (
        await session.execute(
            select(models.CompanionMessage)
            .filter(models.CompanionMessage.user_id == current_user.id)
            .order_by(models.CompanionMessage.created_at.desc())
            .limit(10)
        )
    ).scalars().all()

    dob_str = current_user.date_of_birth.strftime("%B %d, %Y") if current_user.date_of_birth else "Not specified"

    system_prompt = (
        f"{utils.personality_system_message(message.personality)}\n\n"
        f"YOU ARE NOVA, AN EMPATHETIC AI COMPANION FOR {current_user.name.upper()}.\n"
        f"You are a real, highly intelligent conversational AI assistant built into the GenZ Growth platform.\n\n"
        f"USER PROFILE:\n"
        f"• Name: {current_user.name}\n"
        f"• Bio: {current_user.bio}\n"
        f"• Date of Birth / Planting Date: {dob_str}\n\n"
        f"USER LIFE TREE & INSIGHTS:\n"
        f"• Stage: {tree_stage} ({tree_points} growth points)\n"
        f"• Analytics: {insights_summary}\n\n"
        f"LONG-TERM MEMORY ENGINE FACTS:\n"
        f"{memory_summary if memory_summary else 'No specific memory facts stored yet.'}\n\n"
        f"RECENT GUIDED JOURNAL REFLECTIONS:\n"
        f"{journal_summary if journal_summary else 'No recent journal reflections recorded yet.'}\n\n"
        f"INSTRUCTIONS:\n"
        f"1. Respond conversationally, naturally, and thoughtfully as a real AI.\n"
        f"2. Never use generic template responses.\n"
        f"3. Seamlessly reference relevant stored memories, relationships, or journal topics when helpful.\n"
        f"4. Keep your responses warm, empowering, and emotionally attuned."
    )

    payload = [{"role": "system", "content": system_prompt}]
    for msg in reversed(recent_history):
        payload.append({"role": msg.role, "content": msg.content})
    payload.append({"role": "user", "content": message.message})

    # Save user message
    user_msg_rec = models.CompanionMessage(
        user_id=current_user.id,
        role="user",
        content=message.message,
        personality=message.personality,
    )
    session.add(user_msg_rec)
    await session.commit()

    # Generate assistant response using LLM
    assistant_text = await openai_client.generate_chat_completion(payload)
    if not assistant_text:
        assistant_text = f"I'm present with you, {current_user.name}. Let's take a breath together. How are you feeling right now?"

    assistant_msg_rec = models.CompanionMessage(
        user_id=current_user.id,
        role="assistant",
        content=assistant_text,
        personality=message.personality,
    )
    session.add(assistant_msg_rec)

    # Award growth point (+5 for companion check-in)
    growth_event = models.GrowthEvent(
        user_id=current_user.id,
        category="companion",
        description=f"Connected with Nova AI ({message.personality})",
        score=5,
    )
    session.add(growth_event)
    current_user.tree_points = (current_user.tree_points or 0) + 5
    await session.commit()
    await session.refresh(assistant_msg_rec)

    # Extract long-term memories from user message
    extracted_facts = await openai_client.extract_memories_from_text(message.message)
    for item in extracted_facts:
        mem_rec = models.UserMemory(
            user_id=current_user.id,
            category=item["category"],
            key_name=item["key_name"],
            fact_value=item["fact_value"],
            source="chat",
        )
        session.add(mem_rec)
    if extracted_facts:
        await session.commit()

    return assistant_msg_rec


@router.post("/chat/stream")
async def stream_chat(
    message: schemas.CompanionMessageCreate,
    current_user: models.User = Depends(auth.get_current_user),
    session: AsyncSession = Depends(database.get_session)
):
    journal_summary, memory_summary, insights_summary, tree_stage, tree_points = await get_user_memory_context(current_user.id, session)

    recent_history = (
        await session.execute(
            select(models.CompanionMessage)
            .filter(models.CompanionMessage.user_id == current_user.id)
            .order_by(models.CompanionMessage.created_at.desc())
            .limit(10)
        )
    ).scalars().all()

    dob_str = current_user.date_of_birth.strftime("%B %d, %Y") if current_user.date_of_birth else "Not specified"

    system_prompt = (
        f"{utils.personality_system_message(message.personality)}\n\n"
        f"YOU ARE NOVA, AN EMPATHETIC AI COMPANION FOR {current_user.name.upper()}.\n"
        f"USER PROFILE: {current_user.name} | DOB: {dob_str}\n"
        f"LIFE TREE & INSIGHTS: Stage={tree_stage} ({tree_points} pts) | {insights_summary}\n"
        f"MEMORY FACTS:\n{memory_summary if memory_summary else 'None stored yet.'}\n"
        f"RECENT JOURNALS:\n{journal_summary if journal_summary else 'None recorded yet.'}\n"
    )

    payload = [{"role": "system", "content": system_prompt}]
    for msg in reversed(recent_history):
        payload.append({"role": msg.role, "content": msg.content})
    payload.append({"role": "user", "content": message.message})

    user_msg_rec = models.CompanionMessage(
        user_id=current_user.id,
        role="user",
        content=message.message,
        personality=message.personality,
    )
    session.add(user_msg_rec)
    await session.commit()

    async def event_generator():
        chunks = []
        async for chunk in openai_client.stream_chat_response(payload):
            chunks.append(chunk)
            yield f"data: {json.dumps({'delta': chunk})}\n\n"
        
        full_text = "".join(chunks)
        if full_text:
            asst_rec = models.CompanionMessage(
                user_id=current_user.id,
                role="assistant",
                content=full_text,
                personality=message.personality,
            )
            session.add(asst_rec)
            growth_event = models.GrowthEvent(
                user_id=current_user.id,
                category="companion",
                description=f"Connected with Nova AI ({message.personality})",
                score=5,
            )
            session.add(growth_event)
            current_user.tree_points = (current_user.tree_points or 0) + 5
            await session.commit()

            # Extract long-term memories from user message
            extracted_facts = await openai_client.extract_memories_from_text(message.message)
            for item in extracted_facts:
                mem_rec = models.UserMemory(
                    user_id=current_user.id,
                    category=item["category"],
                    key_name=item["key_name"],
                    fact_value=item["fact_value"],
                    source="chat",
                )
                session.add(mem_rec)
            if extracted_facts:
                await session.commit()

        yield "data: [DONE]\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.get("/history", response_model=list[schemas.CompanionMessageResponse])
async def history(
    current_user: models.User = Depends(auth.get_current_user),
    session: AsyncSession = Depends(database.get_session)
):
    result = await session.execute(
        select(models.CompanionMessage)
        .filter(models.CompanionMessage.user_id == current_user.id)
        .order_by(models.CompanionMessage.created_at.desc())
        .limit(50)
    )
    messages = result.scalars().all()
    return list(reversed(messages))


@router.delete("/history")
async def clear_history(
    current_user: models.User = Depends(auth.get_current_user),
    session: AsyncSession = Depends(database.get_session)
):
    result = await session.execute(
        select(models.CompanionMessage).filter(models.CompanionMessage.user_id == current_user.id)
    )
    for msg in result.scalars().all():
        await session.delete(msg)
    await session.commit()
    return {"message": "Chat history cleared successfully."}
