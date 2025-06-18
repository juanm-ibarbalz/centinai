# analyzer/behavior_analysis/success_context.py

class SuccessEvaluationContext:
    """
    Contiene el estado de una conversación que será evaluada para determinar si fue exitosa.
    """
    def __init__(self, conversation: dict, messages: list, message_stats: dict):
        self.conversation = conversation
        self.messages = messages
        self.message_stats = message_stats
        self.score = 0
        self.tags = []

    def get_score(self) -> int:
        return self.score

    def get_tags(self) -> list:
        return self.tags
