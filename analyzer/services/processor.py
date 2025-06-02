# analyzer/services/process.py

from typing import Any, Dict, List
from datetime import datetime
import os
import json


def process_conversation(raw_json: Dict[str, Any]) -> Dict[str, Any]:
    """
    Recibe un JSON con la forma:
      {
        "conversation": { … },
        "messages": [ … ]
      }
    y devuelve únicamente la “sesión” con esta estructura (2):
      {
        "_id": "<conversation_id>",                     # usamos el mismo ID de conversación
        "userId": "<userId>",
        "userCellphone": "<from>",
        "agentData": {
            "agentId": 1,
            "modelLLM": "gpt-4",
            "agentName": "Asistente IA"
        },
        "startTime": "<ISO startTime>",
        "endTime": "<ISO endTime>",
        "durationSeconds": 500,
        "tokenUsage": {
            "promptTokens": 50,
            "completionTokens": 200,
            "totalTokens": 250,
            "cost": 0.0075
        },
        "successful": True,
        "tags": ["consulta", "queja"],
        "messageCount": {
            "user": 5,
            "agent": 6,
            "total": 11
        },
        "metadata": {
            "language": "es",
            "channel": "webchat",
            "sentimentTrend": "negative"
        },
        "conversationId": "<conversation_id>"
      }
    """

    # 1) Extraer datos básicos de la conversación
    conv = raw_json["conversation"]
    msgs = raw_json["messages"]

    # 2) Normalizar timestamps de mensajes para calcular métricas
    normalized_msgs = _normalize_messages(msgs)
    normalized_msgs.sort(key=lambda m: m["timestamp_dt"] or datetime.min)

    # 3) Calcular messageCount (cantidad por dirección y total)
    user_count = _calc_messages_by_direction(normalized_msgs, direction="user")
    agent_count = _calc_messages_by_direction(normalized_msgs, direction="agent")
    total_count = len(normalized_msgs)

    # 4) Calcular duración en segundos (primer vs. último mensaje)
    duration = _calc_conversation_duration(normalized_msgs)

    # 5) Armar agentData (ejemplo estático; ajustalo según tu propia lógica)
    full_agent = _get_agent_data_from_conversation(conv)

    # Extraemos solo los campos que nos interesan, descartando createdAt/updatedAt:
    agent_data = {
        "agentId": full_agent.get("agentId"),
        "modelLLM": full_agent.get("modelName"),
        "agentName": full_agent.get("name"),
        "userId": full_agent.get("userId")
    }
    # 6) (Aquí podrías calcular tokenUsage, tags, successful, etc.)
    #    En este ejemplo usamos valores de ejemplo / place-holders.  
    token_usage = _calc_tokens(normalized_msgs, conv,agent_data)

    # 7) Armar tags y metadata (place-holders; complete según tu análisis NLP, etc.)
    tags = ["consulta", "queja"]
    metadata = {
        "language": "es",
        "channel": "webchat",
        "sentimentTrend": "negative"
    }

    # 8) Construir el diccionario final (sin mensajes individuales)
    session_doc = {
        "_id": conv["_id"],                       # mismo ID de la conversación
        "userId": conv["userId"],
        "userCellphone": conv["from"],
        "agentData": agent_data,
        "startTime": conv["startTime"],
        "endTime": conv.get("endTime"),
        "durationSeconds": duration,
        "tokenUsage": token_usage,
        "successful": True,
        "tags": tags,
        "messageCount": {
            "user": user_count,
            "agent": agent_count,
            "total": total_count
        },
        "metadata": metadata,
        "conversationId": conv["_id"]
    }
 
    # Guardar el resultado en un archivo JSON
    this_dir = os.path.dirname(__file__)
    output_path = os.path.join(this_dir, "resultSession.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(session_doc, f, ensure_ascii=False, indent=2)


    return session_doc


def _normalize_messages(raw_messages: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Convierte el campo 'timestamp' (cadena ISO-8601) de cada mensaje
    en un objeto datetime usando datetime.fromisoformat(). 
    Si el formato no es compatible, asigna None.
    """
    normalized = []
    for m in raw_messages:
        ts_dt = None
        try:
            # datetime.fromisoformat soporta el formato "YYYY-MM-DDTHH:MM:SS.sss±HH:MM"
            ts_dt = datetime.fromisoformat(m["timestamp"])
        except Exception:
            ts_dt = None

        normalized.append({**m, "timestamp_dt": ts_dt})
    return normalized


def _calc_messages_by_direction(messages: List[Dict[str, Any]], direction: str) -> int:
    """
    Cuenta cuántos mensajes hay según la dirección ("user" o "agent").
    """
    return sum(1 for m in messages if m.get("direction") == direction)


def _calc_conversation_duration(messages: List[Dict[str, Any]]) -> int:
    """
    Duración total en segundos: diferencia entre primer y último mensaje datetime.
    """
    if not messages:
        return 0
    first = messages[0].get("timestamp_dt")
    last = messages[-1].get("timestamp_dt")
    if first and last:
        return int((last - first).total_seconds())
    return 0

# analyzer/services/calc_tokens.py

from typing import Any, Dict, List

# Importamos el repositorio para acceder a la colección 'agents'
from analyzer.db.agent_repo import AgentRepo
from analyzer.services.token_utils import tokenize_texts, calculate_cost_with_tokonomics


def _calc_tokens(agent_messages: List[Dict[str, Any]], conversation: Dict[str, Any], agent_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Recibe:
      - agent_messages: lista de mensajes (cada uno es un dict con al menos la clave "text").
      - conversation: JSON con los datos de la conversación.

    Este método:
      1. Extrae userId de la conversación.
      2. Llama a AgentRepo.get_agent_by_user_id(userId) para obtener agent_data.
      3. Tokeniza todos los textos de agent_messages usando tokenize_texts.
      4. Calcula el costo en USD con calculate_cost_with_tokonomics.
      5. Devuelve un dict con la sección 'tokenUsage' estructurada así:
         {
           "promptTokens": <int>,
           "completionTokens": <int>,
           "totalTokens": <int>,
           "cost": <float>
         }
    """
    user_id = conversation.get("userId")
    if not user_id:
        raise ValueError("Conversation sin clave 'userId'.")
    
    # 3) Obtener el nombre del modelo LLM desde agent_data
    model_name = agent_data.get("modelLLM")
    if not model_name:
        raise ValueError(f"agent_data no contiene 'modelLLM' para userId={user_id}")

    # 4) Extraer los textos de los mensajes del agente
    texts: List[str] = [m.get("text", "") for m in agent_messages]

    # 5) Tokenizar con tokenize_texts y obtener el dict de conteo
    tokens_info = tokenize_texts(texts, model_name)
    prompt_tokens = tokens_info["promptTokens"]
    completion_tokens = tokens_info["completionTokens"]
    total_tokens = tokens_info["totalTokens"]

    # 6) Calcular costo en USD usando calculate_cost_with_tokonomics
    cost_usd = calculate_cost_with_tokonomics(
        model_name=model_name,
        prompt_tokens=prompt_tokens,
        completion_tokens=completion_tokens
    )

    # 7) Armar la sección 'tokenUsage'
    token_usage = {
        "promptTokens": prompt_tokens,
        "completionTokens": completion_tokens,
        "totalTokens": total_tokens,
        "cost": cost_usd
    }

    return token_usage

def _get_agent_data_from_conversation(conversation: Dict[str, Any]) -> Dict[str, Any]:
    """
    Dado un JSON de conversación, extrae 'userId', consulta MongoDB
    y devuelve el objeto 'agent_data' correspondiente.
    """
    user_id = conversation.get("userId")
    if not user_id:
        raise ValueError("Conversation sin clave 'userId'.")

    repo = AgentRepo()
    try:
        agent_data = repo.get_agent_by_user_id(user_id)
    finally:
        repo.close()

    if not agent_data:
        raise ValueError(f"No se encontró agente con userId={user_id}")

    return agent_data