# analyzer/behavior_analysis/success_engine.py

from analyzer.behavior_analysis.success_context import SuccessEvaluationContext
from analyzer.behavior_analysis.keyword_detector import KeywordDetector
from analyzer.behavior_analysis.behavior_extras_evaluator import BehaviorExtrasEvaluator

class SuccessEvaluatorEngine:
    """
    Ejecuta los módulos de análisis sobre un contexto dado,
    y define si la conversación fue exitosa.
    """
    def __init__(self, context: SuccessEvaluationContext):
        self.context = context

    def run(self) -> bool:
        KeywordDetector().run(self.context)
        BehaviorExtrasEvaluator().run(self.context)
        return self._define_score_result()

    def _define_score_result(self) -> bool:
        if self.context.score > 0:
            self.context.tags.append("Successful")
            return True
        else:
            self.context.tags.append("Unsuccessful")
            return False
        
    def get_score (self) -> int:
        return self.context.get_score()

    def get_tags (self) -> int:
        return self.context.get_tags()