import pytest
from services.language_detector import ConversationLanguageDetector  # cambia `your_module` por el nombre correcto del archivo sin .py

    #Carefull with this module. in short text itll probably detect the language wrong

def test_conversation_language_detector():
    # Mensajes de prueba
    messages = [
        {"text": "Hola, ¿cómo estás?", "direction": "user"},          # español
        {"text": "How are you today? My name is John, how can I help you?", "direction": "user"},          # inglés
        {"text": "Tudo bem com você?", "direction": "user"},          # portugués
    ]

    detector = ConversationLanguageDetector(messages)

    # Detectar idiomas
    langs = detector.detect_languages()

    # Imprimir idiomas detectados
    for i, lang in enumerate(langs):
        print(f"Mensaje {i+1}: idioma detectado → {lang}")

    # Ver idioma predominante
    predominant = detector.get_predominant_language()
    print(f"Idioma predominante: {predominant}")

    # Aseguramos que detectó algo
    assert len(langs) == 3
    assert all(lang in ['es', 'en', 'pt', 'unknown'] for lang in langs)
    assert predominant in ['es', 'en', 'pt', None]
