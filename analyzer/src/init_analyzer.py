# analyzer/initi_analyzer.py

import json
from typing import Any, Dict

# Importamos la función principal de procesamiento desde services/process.py
from .services.processor import process_conversation


def initiate_analyzer(raw_json: Dict[str, Any]) -> Dict[str, Any]:
    """
    1. Recibe un dict con la conversación completa (un JSON ya parseado).
    2. Hace un chequeo mínimo para asegurarse de que existan las claves
       'conversation' y 'messages'.
    3. Si falta alguna de esas claves, lanza una excepción ValueError.
    4. En caso contrario, llama a process_conversation(raw_json) y devuelve
       el resultado (por ejemplo, el JSON de la sesión ya armado).
    """
    # Chequeo mínimo de estructura
    if "conversation" not in raw_json or "messages" not in raw_json:
        raise ValueError("The JSON received dont have the structure expected.")

    # Si la estructura está ok, delegamos al módulo de procesamiento
    session_result = process_conversation(raw_json)
    return session_result


if __name__ == "__main__":
    """
    Este bloque sirve para ejecutar initi_analyzer.py como script independiente:
    Por ejemplo:
        python initi_analyzer.py ruta/al/archivo_conversacion.json
    """
    import os
    import sys

    # Verificamos argumentos de línea de comandos
    if len(sys.argv) != 2:
        print("Uso correcto: python initi_analyzer.py <ruta_al_json_de_conversación>")
        sys.exit(1)

    input_path = sys.argv[1]
    if not os.path.isfile(input_path):
        print(f"Error: No se encontró el archivo '{input_path}'.")
        sys.exit(1)

    # Cargamos el JSON desde disco
    try:
        with open(input_path, "r", encoding="utf-8") as f:
            raw_json = json.load(f)
    except Exception as e:
        print(f"Error al leer o parsear el archivo JSON: {e}")
        sys.exit(1)

    # Invocamos la función principal
    try:
        result = initiate_analyzer(raw_json)
        # Lo imprimimos por pantalla (puede redirigirse a un archivo si se desea)
        print(json.dumps(result, indent=2, ensure_ascii=False))
    except Exception as e:
        print(f"Ocurrió un error durante el análisis: {e}")
        sys.exit(1)
