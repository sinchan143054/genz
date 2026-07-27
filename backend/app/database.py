import os

from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import declarative_base

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable is not set.")

is_sqlite = DATABASE_URL.startswith("sqlite")
is_ssl_required = "neon.tech" in DATABASE_URL or "sslmode=require" in DATABASE_URL or os.getenv("DB_SSL_REQUIRE", "").lower() == "true"

connect_args = {}
if is_ssl_required and not is_sqlite:
    connect_args["ssl"] = "require"
    connect_args["command_timeout"] = 60

engine_kwargs = {
    "echo": False,
    "future": True,
    "connect_args": connect_args,
}

if not is_sqlite:
    engine_kwargs.update({
        "pool_pre_ping": True,
        "pool_recycle": 300,
        "pool_size": 5,
        "max_overflow": 10,
    })

engine = create_async_engine(
    DATABASE_URL,
    **engine_kwargs,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

Base = declarative_base()


async def get_session():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()