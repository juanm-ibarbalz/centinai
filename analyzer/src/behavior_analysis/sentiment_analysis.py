#This class we aint sure we will develope it. Its unnecesary, but maybe in an future. It will consult to an sentiment extractor API.
# analyzer/behavior_analysis/sentiment_analysis.py

from pysentimiento import EmotionAnalyzer
from analyzer.behavior_analysis.emotion_result import EmotionResult

# Inicializamos el analizador solo una vez
_emotion_analyzer = EmotionAnalyzer(lang="es")

def analyze_emotion(text: str) -> EmotionResult:
    """
    Analiza un texto y retorna la emoción principal junto con su nivel de confianza.
    """
    resultado = _emotion_analyzer.predict(text)
    emotion = resultado.output
    confidence = resultado.probas[emotion]

    return EmotionResult(emotion, confidence)
