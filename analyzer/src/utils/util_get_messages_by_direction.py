# analyzer/utils/util_get_messages_by_direction.py

from typing import List, Dict

def get_messages_by_direction(messages: List[Dict], direction: str) -> List[Dict]:
    """

    """
    if direction not in {"user", "agent"}:
        raise ValueError(f"Invalid parameter: '{direction}'. It should be 'user' or 'agent'.")

    return [
        msg for msg in messages
        if msg.get("direction") == direction and msg.get("text")
    ]
