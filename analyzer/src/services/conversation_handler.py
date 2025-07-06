# analyzer/services/process.py

from typing import Any, Dict, List
from datetime import datetime
import os
import json
from storage.session_writter import save_session
from utils.util_get_messages_by_direction import get_messages_by_direction

from db.agent_repo import AgentRepo
from services.token_utils import tokenize_texts, calculate_cost_with_tokonomics
from db.sessions_repo import SessionRepo
from services.latency_calculator import LatencyCalculator
from behavior_analysis.success_context import SuccessEvaluationContext
from behavior_analysis.success_engine import SuccessEvaluatorEngine
from services.language_detector import ConversationLanguageDetector

def process_conversation(raw_json: Dict[str, Any]) -> Dict[str, Any]:
    conv = raw_json["conversation"]
    msgs = raw_json["messages"]

    normalized_msgs = _normalize_messages(msgs)#Normaliza el timestampt
    normalized_msgs.sort(key=lambda m: m["timestamp_dt"] or datetime.min)#Ordena los mensajes por timestamp

    user_count = _calc_messages_by_direction(normalized_msgs, direction="user")
    agent_count = _calc_messages_by_direction(normalized_msgs, direction="agent")
    total_count = len(normalized_msgs)
    message_stats = {
        "user_count": user_count,
        "agent_count": agent_count,
        "total_count": total_count
    }

    duration = _calc_conversation_duration(normalized_msgs)
    full_agent = _get_agent_data_from_conversation(conv)
    agent_data = {
        "agentId": full_agent.get("_id"),
        "modelLLM": full_agent.get("modelName"),
        "agentName": full_agent.get("name"),
        "userId": full_agent.get("userId")
    }

    token_usage = _calc_tokens(normalized_msgs, conv, agent_data)

    latency_info = LatencyCalculator(normalized_msgs).calculate_average_latency()


    
    lang_detector = ConversationLanguageDetector(normalized_msgs)
    language = lang_detector.get_predominant_language() or "unknown"

    metadata = {
        "language": language,
    }
  

    successEngine = SuccessEvaluatorEngine(SuccessEvaluationContext(conv,msgs,message_stats))

    successful = successEngine.run()
    tags = successEngine.get_tags()

    session_doc = {
        "_id": conv["_id"],
        "userId": conv["userId"],
        "userCellphone": conv["from"],
        "agentData": agent_data,
        "createdAt": conv["createdAt"],
        "endTime": conv.get("updatedAt"),
        "durationSeconds": duration,
        "tokenUsage": token_usage,
        "successful": successful,
        "tags": tags,
        "messageCount": {
            "user": user_count,
            "agent": agent_count,
            "total": total_count
        },
        "latency": latency_info,
        "metadata": metadata,
        "conversationId": conv["_id"]
    }

    output_path = os.path.join(os.path.dirname(__file__), "resultSession.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(session_doc, f, ensure_ascii=False, indent=2)

    save_session(session_doc)
    # Guardar también en la colección 'metrics'
    repo = SessionRepo()
    try:
        repo.save_session(session_doc)
    finally:
        repo.close()
    return session_doc


def _normalize_messages(raw_messages: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    normalized = []
    for m in raw_messages:
        try:
            ts_dt = datetime.fromisoformat(m["timestamp"])
        except Exception:
            ts_dt = None
        normalized.append({**m, "timestamp_dt": ts_dt})
    return normalized


def _calc_messages_by_direction(messages: List[Dict[str, Any]], direction: str) -> int:
    return sum(1 for m in messages if m.get("direction") == direction)


def _calc_conversation_duration(messages: List[Dict[str, Any]]) -> int:
    if not messages:
        return 0
    first = messages[0].get("timestamp_dt")
    last = messages[-1].get("timestamp_dt")
    if first and last:
        return int((last - first).total_seconds())
    return 0


def _calc_tokens(messages: List[Dict[str, Any]], conversation: Dict[str, Any], agent_data: Dict[str, Any]) -> Dict[str, Any]:
    user_id = conversation.get("userId")
    if not user_id:
        raise ValueError("Conversation sin clave 'userId'.")

    model_name = agent_data.get("modelLLM")
    if not model_name:
        raise ValueError(f"agent_data no contiene 'modelLLM' para userId={user_id}")

    agent_msgs = get_messages_by_direction(messages, "agent")
    texts: List[str] = [m.get("text", "") for m in agent_msgs]

    tokens_info = tokenize_texts(texts, model_name)
    prompt_tokens = tokens_info["promptTokens"]
    completion_tokens = tokens_info["completionTokens"]
    total_tokens = tokens_info["totalTokens"]

    cost_usd = calculate_cost_with_tokonomics(
        model_name=model_name,
        prompt_tokens=prompt_tokens,
        completion_tokens=completion_tokens
    )

    return {
        "promptTokens": prompt_tokens,
        "completionTokens": completion_tokens,
        "totalTokens": total_tokens,
        "cost": cost_usd
    }


def _get_agent_data_from_conversation(conversation: Dict[str, Any]) -> Dict[str, Any]:
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



