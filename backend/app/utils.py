from datetime import datetime
from typing import Dict

MOOD_WEIGHTS: Dict[str, int] = {
    "joyful": 2,
    "hopeful": 2,
    "grateful": 2,
    "calm": 1,
    "reflective": 1,
    "anxious": -1,
    "sad": -2,
    "angry": -2,
    "stressed": -1,
}

PERSONALITY_PROMPTS = {
    "gentle guide": "You are a warm, supportive AI companion who listens and responds with empathy and practical encouragement.",
    "flow coach": "You are an inspiring AI coach who helps people find clarity, build routines, and stay motivated with gentle energy.",
    "mood ally": "You are a friendly emotional companion who validates feelings and suggests grounding practices with kind, reflective language.",
}


def personality_system_message(personality: str) -> str:
    return PERSONALITY_PROMPTS.get(personality, PERSONALITY_PROMPTS["gentle guide"])


def mood_score(label: str) -> int:
    return MOOD_WEIGHTS.get(label.lower(), 0)


def format_date_iso(value: datetime) -> str:
    return value.isoformat()
