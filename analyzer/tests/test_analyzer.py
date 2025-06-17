# analyzer/tests/test_initiate_analyzer.py

import os
import json
import pytest
# services/processor.py
from ..storage.session_writter import save_session
from ..init_analyzer import initiate_analyzer


@pytest.fixture(autouse=True)
def check_env_vars():
    """
    Verifica que las variables de entorno necesarias estén definidas:
      - MONGO_URI
      - MONGO_DB_TEST
    Si faltan, saltea los tests, porque en este caso queremos que el código
    se ejecute contra una base de datos real.
    """



def test_initiate_analyzer_missing_keys():
    """
    Si faltan 'conversation' o 'messages' en el JSON,
    debe lanzarse ValueError.
    """
    with pytest.raises(ValueError):
        initiate_analyzer({})

    with pytest.raises(ValueError):
        initiate_analyzer({"conversation": {}})

    with pytest.raises(ValueError):
        initiate_analyzer({"messages": []})


def test_initiate_analyzer_full_cycle():
    """
    Usa el JSON real en analyzer/tests/test.json. 
    El código conectará a MongoDB y procesará la conversación completa.
    Se asume que la BD contiene el agente cuyo userId aparece en test.json.
    """
    # 1) Ubicar y cargar test.json
    tests_dir = os.path.dirname(__file__)
    json_path = os.path.join(tests_dir, "test.json")

    with open(json_path, "r", encoding="utf-8") as f:
        raw_json = json.load(f)

    # 2) Llamamos a initiate_analyzer con el JSON cargado
    result = initiate_analyzer(raw_json)

    # 3) Verificamos que el resultado sea un dict con las claves esperadas
    assert isinstance(result, dict)

    expected_keys = [
        "_id",
        "userId",
        "userCellphone",
        "agentData",
        "startTime",
        "endTime",
        "durationSeconds",
        "tokenUsage",
        "successful",
        "tags",
        "messageCount",
        "metadata",
        "conversationId"
    ]
    for key in expected_keys:
        assert key in result, f"Falta la clave '{key}' en el resultado de initiate_analyzer"

    # 4) Verificamos tokenUsage contiene los campos correctos y tipos adecuados
    token_usage = result.get("tokenUsage")
    assert isinstance(token_usage, dict)

    # Esperamos que test.json tenga al menos un mensaje de agente,
    # por lo que promptTokens y totalTokens deberían ser > 0
    assert "promptTokens" in token_usage and isinstance(token_usage["promptTokens"], int)
    assert "completionTokens" in token_usage and isinstance(token_usage["completionTokens"], int)
    assert "totalTokens" in token_usage and isinstance(token_usage["totalTokens"], int)
    assert "cost" in token_usage and isinstance(token_usage["cost"], float)

    # Check consistency: totalTokens == promptTokens + completionTokens
    assert token_usage["totalTokens"] == (
        token_usage["promptTokens"] + token_usage["completionTokens"]
    )
