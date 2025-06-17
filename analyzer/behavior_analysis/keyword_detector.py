# analyzer/behavior_analysis/keyword_detector.py

from .keyword_loader import load_keywords
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .success_evaluator import SuccessEvaluator

class KeywordDetector:
    def __init__(self):
        self.keywords = load_keywords()

    def run(self, evaluator: "SuccessEvaluator") -> "SuccessEvaluator":
        negative_categories = ["frustration", "repetition", "escalation", "confusion"]
        positive_category = "positive_closing"

        user_messages = [
            msg for msg in evaluator.messages
            if msg.get("direction") == "user" and msg.get("text")
        ]

        # Evaluar negativas
        for category in negative_categories:
            hits = 0
            for kw in self.keywords.get(category, []):
                if any(kw in msg["text"].lower() for msg in user_messages):
                    hits += 1
            if hits >= 2:
                evaluator.score -= min(2, hits)
                if category not in evaluator.tags:
                    evaluator.tags.append(category)

        # Evaluar positivas
        hits = 0
        for kw in self.keywords.get(positive_category, []):
            if any(kw in msg["text"].lower() for msg in user_messages):
                hits += 1
        evaluator.score += hits
        if hits >= 2 and positive_category not in evaluator.tags:
            evaluator.tags.append(positive_category)

        return evaluator
