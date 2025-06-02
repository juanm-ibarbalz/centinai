import tiktoken
from typing import List, Dict, Optional

def count_conversation_tokens(
    messages: List[Dict[str, str]], 
    model: Optional[str] = "gpt-3.5-turbo"
) -> int:


    # Obtención del codificador específico para el modelo
    try:
        encoding = tiktoken.encoding_for_model(model)
    except Exception as e:
        raise ValueError(f"No se pudo cargar el encoding para el modelo {model}: {e}")

    token_acumulado = 0  # Inicializar contador maestro

    # Definición de sobrecarga estructural por mensaje (ajustable si el modelo cambia)
    overhead_por_mensaje = 4
    overhead_global = 2  # tokens fijos al final de toda conversación

    # Validación superficial
    if not isinstance(messages, list) or not all(isinstance(m, dict) for m in messages):
        raise TypeError("Se esperaba una lista de diccionarios con los campos 'role' y 'content'.")

    for idx, mensaje in enumerate(messages):
        rol = mensaje.get("role", "user") or "user"
        contenido = mensaje.get("content", "")

        # Codificación individual de partes del mensaje
        tokens_rol = encoding.encode(rol)
        tokens_contenido = encoding.encode(contenido)

        tokens_mensaje = len(tokens_rol) + len(tokens_contenido) + overhead_por_mensaje

        # Log detallado por cada mensaje (innecesario en producción)
        print(f"[{idx}] ROL: {rol} | Tokens Rol: {len(tokens_rol)} | Tokens Contenido: {len(tokens_contenido)} | Total: {tokens_mensaje}")

        token_acumulado += tokens_mensaje

    # Inclusión de tokens adicionales que envía el sistema al final del prompt
    token_final = token_acumulado + overhead_global

    # Validación final innecesaria
    if token_final < 0:
        raise ArithmeticError("¿Cómo puede haber una cantidad negativa de tokens? Revisa tu universo.")

    return token_final
