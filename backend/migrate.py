import asyncio
import os
from dotenv import load_dotenv
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

async def migrate():
    engine = create_async_engine(DATABASE_URL, connect_args={"ssl": "require"})
    async with engine.begin() as conn:
        print("Migrating schema...")
        await conn.execute(text("ALTER TABLE users ALTER COLUMN hashed_password DROP NOT NULL;"))
        await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS clerk_id VARCHAR(255);"))
        await conn.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS ix_users_clerk_id ON users(clerk_id);"))
        await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS bio VARCHAR(320) DEFAULT 'Dream big, feel deeply, grow daily.';"))
        await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(512) DEFAULT '';"))
        await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth TIMESTAMP WITHOUT TIME ZONE;"))
        await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS theme VARCHAR(32) DEFAULT 'dark';"))
        await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS accent_color VARCHAR(32) DEFAULT '#7c3aed';"))
        await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS language VARCHAR(16) DEFAULT 'en';"))
        await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS share_insights BOOLEAN DEFAULT TRUE;"))
        await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS notify_daily_reminder BOOLEAN DEFAULT TRUE;"))
        await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS notify_streak_milestones BOOLEAN DEFAULT TRUE;"))
        await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS tree_points INTEGER DEFAULT 10;"))
        
        # journal_entries columns
        await conn.execute(text("ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS mood VARCHAR(32) DEFAULT 'calm';"))
        await conn.execute(text("ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS emoji VARCHAR(16) DEFAULT '✨';"))
        await conn.execute(text("ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS highlight TEXT DEFAULT '';"))
        await conn.execute(text("ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS emotional_checkin TEXT DEFAULT '';"))
        await conn.execute(text("ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS lesson_learned TEXT DEFAULT '';"))
        await conn.execute(text("ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS gratitude TEXT DEFAULT '';"))
        await conn.execute(text("ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS tomorrow_focus TEXT DEFAULT '';"))
        await conn.execute(text("ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS memory_note TEXT DEFAULT '';"))
        await conn.execute(text("ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;"))
        await conn.execute(text("ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS ai_reflection TEXT DEFAULT '';"))
        await conn.execute(text("ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITHOUT TIME ZONE;"))

        # companion_messages columns
        await conn.execute(text("ALTER TABLE companion_messages ADD COLUMN IF NOT EXISTS personality VARCHAR(64) DEFAULT 'gentle guide';"))
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS user_memories (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                category VARCHAR(64) NOT NULL,
                key_name VARCHAR(128) NOT NULL,
                fact_value TEXT NOT NULL,
                source VARCHAR(32) DEFAULT 'journal',
                created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """))
        await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_user_memories_user_id ON user_memories(user_id);"))
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS growth_events (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                category VARCHAR(80) NOT NULL,
                description VARCHAR(280) NOT NULL,
                score INTEGER NOT NULL,
                created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """))
        await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_growth_events_user_id ON growth_events(user_id);"))
        print("Migration complete!")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(migrate())
