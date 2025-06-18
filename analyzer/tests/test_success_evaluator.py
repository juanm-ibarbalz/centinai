# analyzer/tests/test_success_evaluator.py

import os
import json
import pytest
from analyzer.behavior_analysis.success_engine import SuccessEvaluatorEngine
from analyzer.behavior_analysis.success_context import SuccessEvaluationContext

def _calc_messages_by_direction(messages, direction):
    return len([msg for msg in messages if msg.get("direction") == direction])

def _build_message_stats(messages):
    return {
        "user_count": _calc_messages_by_direction(messages, "user"),
        "agent_count": _calc_messages_by_direction(messages, "agent"),
        "total_count": len(messages)
    }

def test_success_evaluator_with_sample_json():
    # 1. Cargar JSON de prueba
    test_dir = os.path.dirname(__file__)
    json_path = os.path.join(test_dir, "test.json")

    with open(json_path, "r", encoding="utf-8") as f:
        test_data = json.load(f)

    conversation = test_data["conversation"]
    messages = test_data["messages"]
    message_stats = _build_message_stats(messages)

    # 2. Instanciar y ejecutar
    evaluator = SuccessEvaluatorEngine(
        SuccessEvaluationContext(conversation, messages, message_stats)
        )
    success = evaluator.run()

    # 3. Imprimir resultados
    print(f"✅ Resultado: {'Successful' if success else 'Unsuccessful'}")
    print(f"📊 Score: {evaluator.get_score()}")
    print(f"🏷️ Tags: {evaluator.get_tags()}")

    # 4. Validaciones básicas
    assert isinstance(success, bool)
    assert isinstance(evaluator.get_score(), int)
    assert isinstance(evaluator.get_tags(), list)
