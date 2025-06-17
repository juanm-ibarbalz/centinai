# analyzer/behavior_analysis/success_evaluator.py

from analyzer.behavior_analysis.keyword_detector import KeywordDetector
from analyzer.behavior_analysis.behavior_extras_evaluator import BehaviorExtrasEvaluator

class SuccessEvaluator:
    def __init__(self, conversation: dict, messages: list, message_stats: dict):
        self.conversation = conversation
        self.messages = messages
        self.message_stats = message_stats
        self.score = 0  # Acumulador de puntaje
        self.tags = []

    def is_successful(self) -> bool:
        # Ejecutar módulos de análisis
        KeywordDetector().run(self)
        BehaviorExtrasEvaluator().run(self)

        # Devolver resultado final según score
        return self._define_score_result()

    def _define_score_result(self) -> bool:
        if self.score > 0:
            self.tags.append("Successful")
            return True
        else:
            self.tags.append("Unsuccessful")
            return False


    # Getters útiles si necesitás acceder desde afuera
    def get_score(self) -> int:
        return self.score

    def get_tags(self) -> list:
        return self.tags
