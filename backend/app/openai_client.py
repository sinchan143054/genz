import os
import json
import re
import logging
from typing import Any, AsyncGenerator, Dict, List, Optional

import httpx

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

def get_api_key() -> str:
    return os.getenv("OPENAI_API_KEY", "").strip()

def get_base_url() -> str:
    return os.getenv("OPENAI_BASE_URL", "https://api.groq.com/openai/v1").strip()

def get_fallback_models() -> List[str]:
    primary_model = os.getenv("OPENAI_MODEL", "llama-3.3-70b-versatile").strip()
    return [
        primary_model,
        "llama-3.1-8b-instant",
        "gemma2-9b-it",
    ]

def detect_crisis_intent(text: str) -> bool:
    """Detect if text contains crisis, self-harm, or suicidal intent."""
    if not text:
        return False
    lower = text.lower().strip()
    words = re.findall(r'\b\w+\b', lower)
    
    # Check exact crisis phrases or intent words
    if any(k in lower for k in ["want to die", "suicide", "kill myself", "end my life", "end it all", "better off dead"]):
        return True
    if "die" in words or "suicidal" in words:
        return True
    return False

def get_crisis_response_text(user_name: str = "friend") -> str:
    """Empathetic, crisis-support response encouraging professional & helpline outreach."""
    return (
        f"I hear how deeply painful and heavy things feel right now, {user_name}, and I want you to know that your life matters and you do not have to carry this alone.\n\n"
        f"Please reach out to someone trusted or connect with free, 24/7 confidential crisis support right now:\n\n"
        f"• **National Crisis Lifeline**: Call or text **988** (US & Canada)\n"
        f"• **Crisis Text Line**: Text **HOME** to **741741**\n"
        f"• **International Hotlines**: Visit [findahelpline.com](https://findahelpline.com) to find support in your country\n"
        f"• **Emergency Services**: Call 911 or your local emergency response\n\n"
        f"I am right here listening with empathy and care. Would you be open to taking a slow breath together or talking about what's feeling so heavy today?"
    )

async def generate_chat_completion(messages: List[Dict[str, Any]], temperature: float = 0.7, max_tokens: int = 1000) -> str:
    """Execute non-streaming LLM call across Groq models."""
    api_key = get_api_key()
    if not api_key or api_key == "your-openai-api-key":
        logger.warning("No valid Groq API key set.")
        return ""

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    base_url = get_base_url()
    for model_name in get_fallback_models():
        payload = {
            "model": model_name,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": False,
        }
        async with httpx.AsyncClient(timeout=15.0) as client:
            try:
                res = await client.post(f"{base_url}/chat/completions", headers=headers, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    content = data["choices"][0]["message"]["content"]
                    if content:
                        return content.strip()
                else:
                    logger.warning("Groq model %s returned status %s: %s", model_name, res.status_code, res.text[:200])
            except Exception as exc:
                logger.warning("Groq model %s completion failed: %s", model_name, exc)
                continue
    return ""

async def stream_chat_response(messages: Any) -> AsyncGenerator[str, None]:
    """Stream LLM completion tokens across Groq models."""
    msg_list = messages if isinstance(messages, list) else []
    
    # Check last user message for crisis intent
    last_user_msg = ""
    for m in reversed(msg_list):
        if m.get("role") == "user":
            last_user_msg = m.get("content", "")
            break
            
    if detect_crisis_intent(last_user_msg):
        user_name = "friend"
        for m in msg_list:
            if m.get("role") == "system" and "User Name:" in m.get("content", ""):
                try:
                    user_name = m.get("content").split("User Name:")[1].split("\n")[0].strip()
                except Exception:
                    pass
        yield get_crisis_response_text(user_name)
        return

    api_key = get_api_key()
    if not api_key or api_key == "your-openai-api-key":
        reply = await generate_chat_completion(msg_list)
        if reply:
            yield reply
        else:
            yield "I am tuned into your growth journey today. What is on your mind?"
        return

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    base_url = get_base_url()
    for model_name in get_fallback_models():
        payload: Dict[str, Any] = {
            "model": model_name,
            "messages": msg_list,
            "temperature": 0.7,
            "max_tokens": 1000,
            "stream": True,
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            try:
                async with client.stream("POST", f"{base_url}/chat/completions", headers=headers, json=payload) as response:
                    if response.status_code != 200:
                        logger.warning("Groq model %s returned status %s", model_name, response.status_code)
                        continue
                    
                    got_data = False
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
                                    got_data = True
                                    yield delta
                            except json.JSONDecodeError:
                                continue
                    if got_data:
                        return
            except Exception as exc:
                logger.warning("Groq model %s stream failed: %s", model_name, exc)
                continue

    fallback_reply = await generate_chat_completion(msg_list)
    if fallback_reply:
        yield fallback_reply
    else:
        yield "I hear you clearly and I'm right here with you. How can I best support your reflection today?"

async def extract_memories_from_text(text: str) -> List[Dict[str, str]]:
    """Extract structured long-term memory facts (people, goals, events, fears, hobbies, etc.) from text using LLM."""
    if not text or len(text.strip()) < 15:
        return []

    prompt = (
        f"Analyze the following text written by a user in a personal growth application:\n\n"
        f"\"{text}\"\n\n"
        f"Task: Extract explicit long-term memory facts about the user.\n"
        f"Categories permitted: 'person', 'goal', 'dream', 'fear', 'hobby', 'achievement', 'event', 'preference'.\n"
        f"Example output JSON:\n"
        f"[\n"
        f"  {{\"category\": \"person\", \"key_name\": \"Sister Priya\", \"fact_value\": \"Sister Priya graduates next month\"}},\n"
        f"  {{\"category\": \"goal\", \"key_name\": \"Exam Prep\", \"fact_value\": \"Preparing for upcoming university exams\"}}\n"
        f"]\n\n"
        f"Only return a valid JSON array of objects. If no significant facts exist, return []."
    )

    messages = [
        {"role": "system", "content": "You are a precise data extraction system that outputs valid JSON only."},
        {"role": "user", "content": prompt}
    ]

    try:
        res_text = await generate_chat_completion(messages, temperature=0.2, max_tokens=400)
        if not res_text:
            return []
        
        clean_text = re.sub(r'```(?:json)?\s*', '', res_text).replace('```', '').strip()
        parsed = json.loads(clean_text)
        if isinstance(parsed, list):
            valid_memories = []
            for item in parsed:
                if isinstance(item, dict) and "category" in item and "key_name" in item and "fact_value" in item:
                    valid_memories.append({
                        "category": str(item["category"]).strip().lower(),
                        "key_name": str(item["key_name"]).strip(),
                        "fact_value": str(item["fact_value"]).strip(),
                    })
            return valid_memories
    except Exception as e:
        logger.warning("Memory extraction failed: %s", e)
    return []