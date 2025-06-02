# analyzer/tests/test_token_utils.py

import os
import json
import pytest

from analyzer.services.token_utils import tokenize_texts, calculate_cost_with_tokonomics

@pytest.fixture(scope="module")
def agent_texts():
    """
    Carga analyzer/tests/test.json, extrae todos los textos de mensajes
    cuya dirección sea 'agent' y los devuelve como lista de strings.
    """
    tests_dir = os.path.dirname(__file__)
    json_path = os.path.join(tests_dir, "test.json")

    with open(json_path, "r", encoding="utf-8") as f:
        raw = json.load(f)

    messages = raw.get("messages", [])
    # Filtramos solo los mensajes donde direction == "agent"
    return [m.get("text", "") for m in messages if m.get("direction") == "agent"]


def test_tokenize_agent_texts_default_model(agent_texts):
    """
    Verifica que tokenize_texts devuelva la estructura esperada
    al recibir los textos del agente y el modelo predeterminado 'gpt-3.5-turbo'.
    Además imprime en consola el resultado para inspección.
    """
    # Asegurarnos de tener al menos un texto de agente en test.json
    assert agent_texts, "No se encontraron mensajes de agente en test.json"

    result = tokenize_texts(agent_texts, model_name="gpt-3.5-turbo")

    # Imprimimos en consola para ver cuántos tokens se contabilizaron
    print("\n[DEBUG] Resultado de tokenize_texts:", result)

    # Debe ser un dict que contenga los tres campos indicados
    assert isinstance(result, dict)
    for key in ("promptTokens", "completionTokens", "totalTokens"):
        assert key in result, f"Falta la clave '{key}' en el resultado"
        assert isinstance(result[key], int), f"'{key}' debe ser int"

    # Para este test, completionTokens debe ser 0 (sin separar aún)
    assert result["completionTokens"] == 0

    # totalTokens debe coincidir con promptTokens
    assert result["totalTokens"] == result["promptTokens"]

    # Debe haber al menos 1 token en total
    assert result["totalTokens"] > 0


def test_token_counts_consistency(agent_texts):
    """
    Verifica que al tokenizar los mismos textos con gpt-3.5-turbo,
    el conteo repetido sea igual.
    """
    first = tokenize_texts(agent_texts, model_name="gpt-3.5-turbo")
    second = tokenize_texts(agent_texts, model_name="gpt-3.5-turbo")

    assert first["promptTokens"] == second["promptTokens"]
    assert first["totalTokens"] == second["totalTokens"]
    assert first["completionTokens"] == second["completionTokens"]


def test_calculate_cost_with_tokonomics():
    """
    Verifica que calculate_cost_with_tokonomics devuelva un float >= 0
    para un ejemplo de prompt_tokens y completion_tokens.
    """
    model_name = "gpt-3.5-turbo"
    prompt_tokens = 100
    completion_tokens = 50

    cost = calculate_cost_with_tokonomics(
        model_name=model_name,
        prompt_tokens=prompt_tokens,
        completion_tokens=completion_tokens
    )

    # Imprimimos en consola para inspección
    print(f"\n[DEBUG] Costo calculado para {prompt_tokens} prompt + {completion_tokens} completion tokens ({model_name}): USD {cost}")

    assert isinstance(cost, float), "El costo debe ser un float"
    assert cost >= 0, "El costo no puede ser negativo"

    # Llamamos de nuevo para confirmar consistencia
    cost_repeat = calculate_cost_with_tokonomics(
        model_name=model_name,
        prompt_tokens=prompt_tokens,
        completion_tokens=completion_tokens
    )
    assert cost == cost_repeat
