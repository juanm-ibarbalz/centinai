# analyzer/tests/test_sessions_repo.py

import os
import json
import pytest
from bson import ObjectId
from pymongo.errors import DuplicateKeyError
from analyzer.db.sessions_repo import SessionRepo

@pytest.fixture(autouse=True)
def check_env_vars():
    """
    Verifica que estén definidas las variables de entorno necesarias:
      - MONGO_URI
      - MONGO_DB_TEST
    Si faltan, saltea el test.
    """
    missing = []
    if not os.getenv("MONGO_URI"):
        missing.append("MONGO_URI")
    if not os.getenv("MONGO_DB_TEST"):
        missing.append("MONGO_DB_TEST")
    if missing:
        pytest.skip(f"Variables de entorno faltantes: {', '.join(missing)}")


def test_save_and_delete_session():
    # 1) Leer el JSON previamente generado en analyzer/services/resultSession.json
    json_path = os.path.join(
        os.path.dirname(__file__),
        os.pardir,          # sube a 'analyzer'
        "services",
        "resultSession.json"
    )
    json_path = os.path.abspath(json_path)
    assert os.path.isfile(json_path), f"No se encontró el archivo {json_path}"

    with open(json_path, "r", encoding="utf-8") as f:
        session_doc = json.load(f)

    # 2) Insertar la sesión en MongoDB (colección 'metrics')
    repo = SessionRepo()
    try:
        try:
            inserted_id = repo.save_session(session_doc)
        except DuplicateKeyError:
            # Si ya existía, tomamos el ID que ya estaba en session_doc
            inserted_id = session_doc.get("_id")

        # 3) Verificar el tipo de inserted_id:
        if "_id" in session_doc:
            assert inserted_id == session_doc["_id"], \
                "Inserted ID debe coincidir con session_doc['_id']"
        else:
            assert isinstance(inserted_id, ObjectId), \
                "Inserted ID debe ser un ObjectId cuando no se provee _id en el session_doc"

        # 4) Confirmar que el documento existe en 'metrics'
        fetched = repo.metrics_col.find_one({"_id": inserted_id})
        assert fetched is not None, "El documento insertado no se encontró en la colección 'metrics'"

        # 5) Limpiar: eliminar el documento recién insertado
        delete_result = repo.metrics_col.delete_one({"_id": inserted_id})
        assert delete_result.deleted_count == 1, \
            "No se pudo eliminar el documento insertado"

    finally:
        repo.close()
