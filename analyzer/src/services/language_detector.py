from langdetect import detect
from collections import Counter
from typing import List, Dict, Optional


class ConversationLanguageDetector:
    """
    Detecta el idioma predominante de los mensajes de una conversación.
    """
    def __init__(self, messages: List[Dict[str, any]]):
        direction: str = "user"#Dirección de los mensajes a analizar
        self.messages = messages
        self.direction = direction
        self.languages: List[str] = []

    def _get_texts(self) -> List[str]:
        """
        Extrae los textos de los mensajes con la dirección deseada.
        """
        return [
            m.get("text", "") for m in self.messages
            if m.get("direction") == self.direction and m.get("text")
        ]

    def detect_languages(self) -> List[str]:
        """
        Detecta el idioma de cada mensaje y guarda los resultados.
        """
        texts = self._get_texts()
        langs = []
        for text in texts:
            try:
                lang = detect(text)
            except Exception:
                lang = "unknown"
            langs.append(lang)
        self.languages = langs
        return langs

    def get_predominant_language(self) -> Optional[str]:
        """
        Devuelve el idioma predominante o None si no se pudo detectar.
        """
        if not self.languages:
            self.detect_languages()

        valid_langs = [l for l in self.languages if l != "unknown"]
        if not valid_langs:
            return None

        most_common = Counter(valid_langs).most_common(1)[0][0] #Obtiene el idioma más común; [0][0] significa [0] es el primer elemento de la lista y [0] es el primer elemento de la tupla 
        return most_common
