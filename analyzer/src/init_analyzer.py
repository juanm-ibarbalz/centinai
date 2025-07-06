import json
from typing import Any, Dict, List, Union
from services.processor import process_conversation


def initiate_analyzer(raw_json: Union[Dict[str, Any], List[Dict[str, Any]]]) -> Union[Dict[str, Any], List[Dict[str, Any]]]:
    """
    Procesa conversaciones.
    - Si es lista, procesa cada conversación recursivamente.
    - Verifica que existan las claves 'conversation' y 'messages'.
    - Lanza excepciones específicas si faltan claves.
    """
    if isinstance(raw_json, list):
        return [initiate_analyzer(item) for item in raw_json]

    if not isinstance(raw_json, dict):
        raise TypeError("Expected JSON as dict or list of dicts.")

    missing_keys = [key for key in ('conversation', 'messages') if key not in raw_json]
    if missing_keys:
        raise ValueError(f"Missing required keys: {', '.join(missing_keys)}")

    try:
        return process_conversation(raw_json)
    except Exception as e:
        raise RuntimeError(f"Error processing conversation: {e}") from e


if __name__ == "__main__":
    import os
    import sys

    if len(sys.argv) != 2:
        print("Uso: python initi_analyzer.py <ruta_json_conversacion>")
        sys.exit(1)

    input_path = sys.argv[1]

    if not os.path.isfile(input_path):
        print(f"Error: archivo '{input_path}' no encontrado.")
        sys.exit(1)

    try:
        with open(input_path, "r", encoding="utf-8") as f:
            raw_json = json.load(f)
    except json.JSONDecodeError as e:
        print(f"Error parseando JSON: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Error leyendo archivo: {e}")
        sys.exit(1)

    try:
        result = initiate_analyzer(raw_json)
        print(json.dumps(result, indent=2, ensure_ascii=False))
    except Exception as e:
        print(f"Error durante el análisis: {e}")
        sys.exit(1)
