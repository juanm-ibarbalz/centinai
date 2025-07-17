import json
from typing import Any, Dict, List, Union
from .services.conversation_handler import process_conversation


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


    try:
        result = initiate_analyzer(raw_json)
        # Print to console (can be redirected to a file if desired)
        print(json.dumps(result, indent=2, ensure_ascii=False, default=str))
    except Exception as e:
        print(f"An error occurred during analysis: {e}")
        sys.exit(1)
