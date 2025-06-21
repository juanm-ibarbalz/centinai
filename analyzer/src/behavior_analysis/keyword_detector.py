# analyzer/behavior_analysis/keyword_detector.py

from behavior_analysis.success_context import SuccessEvaluationContext
from behavior_analysis.keyword_loader import load_keywords
from utils.util_get_messages_by_direction import get_messages_by_direction
import os

class KeywordDetector:
    def __init__(self):
        self.keywords = load_keywords()

    def run(self, context: SuccessEvaluationContext) -> SuccessEvaluationContext:
        negative_categories = ["frustration", "repetition", "escalation", "confusion"]
        positive_category = "positive_closing"

        user_messages = get_messages_by_direction(context.messages, "user")

        for category in negative_categories:
            hits = sum(1 for kw in self.keywords.get(category, []) if any(kw in msg["text"].lower() for msg in user_messages))
            if hits >= 2:
                context.score -= min(2, hits)
                if category not in context.tags:
                    tag_to_add = "soft.repetition" if category == "repetition" else category
                    context.tags.append(tag_to_add)


        hits = sum(1 for kw in self.keywords.get(positive_category, []) if any(kw in msg["text"].lower() for msg in user_messages))
        context.score += hits
        if hits >= 2 and positive_category not in context.tags:
            context.tags.append(positive_category)

        return context
