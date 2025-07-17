# analyzer/db/sessions_repo.py

from typing import Dict, Any
from .mongo_client import client, db

class SessionRepo:

    def __init__(self):
        self.client = client
        self.db = db
        self.metrics_col = self.db["metrics"]

    def save_session(self, session_doc: Dict[str, Any]) -> Any:
        result = self.metrics_col.insert_one(session_doc)
        return result.inserted_id
