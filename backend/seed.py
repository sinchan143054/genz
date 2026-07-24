import asyncio
import os
from datetime import datetime, timedelta

from dotenv import load_dotenv
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_password_hash
from app.database import Base, AsyncSessionLocal, engine
from app import models

load_dotenv()

async def create_sample_data():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        result = await session.execute(select(models.User).filter(models.User.email == "hello@genzgrowth.app"))
        if result.scalars().first():
            print("Seed user already exists.")
            return

        user = models.User(
            email="hello@genzgrowth.app",
            hashed_password=get_password_hash("Growth2026!"),
            name="Avery",
            bio="Crafting emotional wellness through daily rhythm.",
            avatar_url="",
            theme="dark",
            accent_color="#7c3aed",
            language="en",
            share_insights=True,
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)

        moods = ["hopeful", "reflective", "calm", "anxious", "joyful"]
        for i in range(5):
            entry = models.JournalEntry(
                user_id=user.id,
                title=f"Evening reflection {i + 1}",
                content=f"Today I explored how I feel about the week and uncovered a quiet joy in the everyday. Entry {i + 1}.",
                mood=moods[i],
                emoji="✨" if i % 2 == 0 else "🌿",
                font_style="handwritten",
                created_at=datetime.utcnow() - timedelta(days=5 - i),
                updated_at=datetime.utcnow() - timedelta(days=5 - i),
            )
            session.add(entry)
            await session.commit()
            score = 2 if moods[i] in ["hopeful", "joyful"] else -1 if moods[i] == "anxious" else 1
            event = models.GrowthEvent(
                user_id=user.id,
                category="journal",
                description=f"Sample journal mood {moods[i]}",
                score=score,
            )
            session.add(event)
            await session.commit()

        print("Seed data created. Email: hello@genzgrowth.app, Password: Growth2026!")

if __name__ == "__main__":
    asyncio.run(create_sample_data())
