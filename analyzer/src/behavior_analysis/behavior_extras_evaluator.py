# analyzer/behavior_analysis/behavior_extras_evaluator.py

from datetime import datetime
from difflib import SequenceMatcher
from .success_context import SuccessEvaluationContext

class BehaviorExtrasEvaluator:
    def run(self, context: SuccessEvaluationContext) -> SuccessEvaluationContext:
        if context.message_stats["user_count"] > 10:
            context.score -= 1
            if "long_user_interaction" not in context.tags:
                context.tags.append("long_user_interaction")

            if self._detect_repeated_messages(context.messages):
                context.score -= 1
                if "soft.repetition" in context.tags:
                    tag_to_add = "hard.repetition"
                else:
                    tag_to_add = "soft.repetition"
                if tag_to_add not in context.tags:
                    context.tags.append(tag_to_add)


        if self._is_long_duration(context.conversation):
            context.score -= 1
            if "long_duration" not in context.tags:
                context.tags.append("long_duration")

        return context

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
        try:
            start = datetime.fromisoformat(conversation["startTime"].replace("Z", "+00:00"))
            end = datetime.fromisoformat(conversation["endTime"].replace("Z", "+00:00"))
            duration_minutes = (end - start).total_seconds() / 60
            return duration_minutes > 20
        except Exception:
            return False
