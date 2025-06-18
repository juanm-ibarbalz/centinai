# analyzer/initi_analyzer.py

import json
from typing import Any, Dict, List, Union

# Importamos la función principal de procesamiento desde services/process.py
from analyzer.services.processor import process_conversation


def initiate_analyzer(raw_json: Union[Dict[str, Any], List[Dict[str, Any]]]) -> Union[Dict[str, Any], List[Dict[str, Any]]]:
    """
    1. Recibe un dict con la conversación completa (un JSON ya parseado), o una lista de dichos dicts.
    2. Si es una lista, procesa cada elemento recursivamente.
    3. Hace un chequeo mínimo para asegurarse de que existan las claves 'conversation' y 'messages'.
       Si falta alguna, lanza ValueError.
    4. Si la estructura está ok, llama a process_conversation(raw_json) y devuelve el resultado.
    """
    # Si recibimos una lista, procesamos cada elemento recursivamente
    if isinstance(raw_json, list):
        return [initiate_analyzer(item) for item in raw_json]

    # Ahora raw_json es un dict, chequeamos la estructura
    if "conversation" not in raw_json or "messages" not in raw_json:
        raise ValueError("The JSON received doesn't have the structure expected.")

    # Procesamiento normal de una sola sesión
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
