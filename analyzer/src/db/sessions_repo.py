# analyzer/db/sessions_repo.py

from dotenv import load_dotenv
from pymongo import MongoClient
from typing import Dict, Any
import os

# Cargar variables de entorno desde .env
load_dotenv()

class SessionRepo:
    """
    Clase responsable de insertar documentos de sesión en la colección 'metrics'
    dentro de la base de datos indicada por MONGO_DB.
    """

    def __init__(self):
        # Tomar URI y nombre de la base de datos de variables de entorno
        mongo_uri = os.getenv("MONGO_URI", "")
        mongo_db = os.getenv("MONGO_DB", "")
        if not mongo_uri:
            raise ValueError("Debe definir la variable de entorno MONGO_URI con el URI de MongoDB Atlas")
        if not mongo_db:
            raise ValueError("Debe definir la variable de entorno MONGO_DB con el nombre de la BD de prueba")

        # Inicializar cliente y seleccionar BD/colección 'metrics'
        self.client = MongoClient(mongo_uri)
        self.db = self.client[mongo_db]
        self.metrics_col = self.db["metrics"]

    def save_session(self, session_doc: Dict[str, Any]) -> Any:
        """
        Inserta el documento de sesión en la colección 'metrics'.

        Parámetros:
            session_doc: dict que contiene la estructura de la sesión producida
                         por process_conversation.

        Retorna:
            El ID generado por MongoDB para el documento insertado.
        """
        result = self.metrics_col.insert_one(session_doc)
        return result.inserted_id

    def close(self):
        """
        Cierra la conexión con MongoDB.
        """
        self.client.close()
