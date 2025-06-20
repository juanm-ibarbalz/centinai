# analyzer/behavior_analysis/emotion_result.py

class EmotionResult:
    def __init__(self, emotion: str, confidence: float):
        self.emotion = emotion
        self.confidence = confidence

    def __repr__(self):
        return f"EmotionResult(emotion='{self.emotion}', confidence={self.confidence:.2f})"

    def to_dict(self):
        return {
            "emotion": self.emotion,
            "confidence": self.confidence
        }
