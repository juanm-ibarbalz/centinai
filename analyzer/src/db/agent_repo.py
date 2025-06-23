# analyzer/db/agent_repo.py

from dotenv import load_dotenv
from pymongo import MongoClient
from typing import Optional, Dict
import os

# 1) Cargar variables de entorno desde el archivo .env (en la raíz del proyecto)
load_dotenv()


class AgentRepo:
    """
    Clase responsable de todas las operaciones CRUD / consultas
    sobre la colección 'agents' en la base de datos indicada por MONGO_DB.
    """

    def __init__(self):
        # 2) Ahora os.getenv(...) podrá leer MONGO_URI y MONGO_DB desde el .env
        mongo_uri = os.getenv("MONGO_URI", "")
        mongo_db = os.getenv("MONGO_DB", "")
        if not mongo_uri:
            raise ValueError(
                "Debe definir la variable de entorno MONGO_URI con el URI de MongoDB Atlas"
            )
        if not mongo_db:
            raise ValueError(
                "Debe definir la variable de entorno MONGO_DB con el nombre de la BD de prueba"
            )

        # 3) Inicializamos el cliente y seleccionamos BD/colección
        self.client = MongoClient(mongo_uri)
        self.db = self.client[mongo_db]
        self.agents_col = self.db["agents"]

    def get_all_agents(self) -> list[Dict]:
        """
        Devuelve todos los documentos de la colección 'agents'.
        """
        cursor = self.agents_col.find({})
        return list(cursor)

    def get_agent_by_user_id(self, user_id: str) -> Optional[Dict]:
        """
        Busca un agente cuyo campo 'userId' coincida exactamente
        con el valor pasado en user_id.
        Si lo encuentra, retorna el documento completo (dict).
        Si no, retorna None.
        """
        query = {"userId": user_id}
        agent_doc = self.agents_col.find_one(query)
        return agent_doc

    def close(self):
        """
        Cierra la conexión con MongoDB.
        """
        self.client.close()
