# analyzer/tests/test_agent_repo.py

import os
import pytest
from dotenv import load_dotenv

# 1) Cargar .env antes de cualquier get_env
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

from analyzer.db.agent_repo import AgentRepo

@pytest.fixture(scope="module", autouse=True)
def check_env_vars():
    missing = []
    if not os.getenv("MONGO_URI"):
        missing.append("MONGO_URI")
    if not os.getenv("MONGO_DB"):
        missing.append("MONGO_DB")
    if missing:
        pytest.skip(f"Variables de entorno faltantes: {', '.join(missing)}")

def test_get_agent_by_user_id_found():
    repo = AgentRepo()
    try:
        test_user_id = "usr-0ce94eea-3356-419f-a6f9-ae8a68f3a74c"
        agent = repo.get_agent_by_user_id(test_user_id)
        assert agent is not None, f"No se encontró agente con userId={test_user_id}"
        assert agent.get("userId") == test_user_id
        assert "name" in agent
        assert "modelName" in agent
        print(agent)
    finally:
        repo.close()

def test_get_agent_by_user_id_not_found():
    repo = AgentRepo()
    try:
        fake_user_id = "usr-no-existe-1234567890"
        agent = repo.get_agent_by_user_id(fake_user_id)
        assert agent is None, f"Se devolvió un documento inesperado para userId={fake_user_id}"
    finally:
        repo.close()
