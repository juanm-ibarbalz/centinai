# analyzer/services/token_utils.py

import tiktoken
import asyncio
from typing import List, Dict

from tokonomics import calculate_token_cost, get_model_limits

# Mapeo modelo → encoding
_MODEL_TO_ENCODING = {
    "gpt-3.5-turbo":    "cl100k_base",
    "gpt-4":            "cl100k_base",
    "text-davinci-003": "p50k_base",
    # …agregar otros modelos si los usás…
}


def tokenize_texts(
    texts: List[str],
    model_name: str
) -> Dict[str, int]:
    """
    Tokeniza una lista de strings (texts) usando tiktoken y devuelve un diccionario con:
      {
        "promptTokens": <int>,
        "completionTokens": <int>,
        "totalTokens": <int>
      }

    Actualmente:
      - promptTokens = suma de tokens para todos los textos.
      - completionTokens = 0 (se deja para calcular más adelante).
      - totalTokens = promptTokens + completionTokens.

    Parámetros:
      * texts: lista de strings a tokenizar.
      * model_name: nombre del LLM; determina encoding.

    Retorna:
      Un dict con las tres claves indicadas.
    """

    # 1) Determinar encoding a partir del modelo
    encoding_name = _MODEL_TO_ENCODING.get(model_name.lower(), "cl100k_base")
    encoding = tiktoken.get_encoding(encoding_name)

    # 2) Contar tokens de todos los textos
    prompt_tokens = 0
    for txt in texts:
        snippet = txt or ""
        token_ids = encoding.encode(snippet)
        prompt_tokens += len(token_ids)

    # 3) Asignar completionTokens y calcular totalTokens
    completion_tokens = 0
    total_tokens = prompt_tokens + completion_tokens

    return {
        "promptTokens": prompt_tokens,
        "completionTokens": completion_tokens,
        "totalTokens": total_tokens
    }


def calculate_cost_with_tokonomics(
    model_name: str,
    prompt_tokens: int,
    completion_tokens: int
) -> float:
    """
    Usa la librería 'tokonomics' para calcular el costo en USD. Ejecuta
    la coroutine internamente con asyncio.run para retornar de forma sincrónica.

    Recibe:
      - model_name: cadena exacta del modelo (p. ej. "gpt-4").
      - prompt_tokens: int, tokens de entrada.
      - completion_tokens: int, tokens de salida.

    Retorna:
      - total_cost (float): costo USD redondeado a 6 decimales.
    """

    async def _inner():
        return await calculate_token_cost(
            model=model_name,
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens
        )

    costos = asyncio.run(_inner())
    return round(costos.total_cost, 6)
