import os
import json
import logging
from typing import Any, AsyncGenerator, Dict

import httpx

logger = logging.getLogger(__name__)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "llama-3.3-70b-versatile")
OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL", "https://api.groq.com/openai/v1")

async def stream_chat_response(messages: Any) -> AsyncGenerator[str, None]:
    if not OPENAI_API_KEY or OPENAI_API_KEY == "your-openai-api-key":
        logger.warning("OPENAI_API_KEY is not configured with a real value; returning fallback companion response.")
        yield "I’m here with you — the AI companion is not configured yet. Add a real OpenAI API key to enable assistant replies."
        return

    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json",
    }
    payload: Dict[str, Any] = {
        "model": OPENAI_MODEL,
        "messages": messages,
        "temperature": 0.8,
        "max_tokens": 800,
        "stream": True,
    }

    async with httpx.AsyncClient(timeout=180.0) as client:
        try:
            async with client.stream("POST", f"{OPENAI_BASE_URL}/chat/completions", headers=headers, json=payload) as response:
                response.raise_for_status()
                async for raw_line in response.aiter_lines():
                    if not raw_line:
                        continue
                    if raw_line.startswith("data: "):
                        data = raw_line.removeprefix("data: ")
                        if data.strip() == "[DONE]":
                            break
                        try:
                            event = json.loads(data)
                            delta = event["choices"][0]["delta"].get("content", "")
                            if delta:
                                yield delta
                        except json.JSONDecodeError:
                            continue
        except httpx.HTTPStatusError as exc:
            logger.warning("OpenAI request failed with status %s: %s", exc.response.status_code if exc.response else "unknown", exc)
            yield "I’m here with you — the AI companion is temporarily unavailable. Please verify your OpenAI API key and try again."
            return
 