# analyzer/behavior_analysis/behavior_extras_evaluator.py

from difflib import SequenceMatcher
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .success_evaluator import SuccessEvaluator

class BehaviorExtrasEvaluator:
    def run(self, evaluator: "SuccessEvaluator") -> "SuccessEvaluator":
        # 1. Penalizar exceso de mensajes del usuario
        if evaluator.message_stats["user_count"] > 10:
            evaluator.score -= 1
            if "long_user_interaction" not in evaluator.tags:
                evaluator.tags.append("long_user_interaction")

        # 2. Penalizar mensajes repetidos
        if self._detect_repeated_messages(evaluator.messages):
            evaluator.score -= 1
            if "repeated_message" not in evaluator.tags:
                evaluator.tags.append("repeated_message")

        # 3. Penalizar duración excesiva de la conversación
        if self._is_long_duration(evaluator.conversation):
            evaluator.score -= 1
            if "long_duration" not in evaluator.tags:
                evaluator.tags.append("long_duration")

        return evaluator

    def _detect_repeated_messages(self, messages: list) -> bool:
        user_texts = [msg["text"].lower() for msg in messages if msg["direction"] == "user"]
        for i in range(len(user_texts)):
            for j in range(i + 1, len(user_texts)):
                if self._is_similar(user_texts[i], user_texts[j]):
                    return True
        return False

    def _is_similar(self, msg1: str, msg2: str, min_words=20, threshold=0.6) -> bool:
        if len(msg1.split()) < min_words or len(msg2.split()) < min_words:
            return False
        ratio = SequenceMatcher(None, msg1, msg2).ratio()
        return ratio >= threshold

    def _is_long_duration(self, conversation: dict) -> bool:
        from datetime import datetime
        try:
            start = datetime.fromisoformat(conversation["startTime"].replace("Z", "+00:00"))
            end = datetime.fromisoformat(conversation["endTime"].replace("Z", "+00:00"))
            duration_minutes = (end - start).total_seconds() / 60
            return duration_minutes > 20
        except Exception:
            return False
