# analyzer/db/agent_repo.py

from typing import Optional, Dict
from .mongo_client import client, db

class AgentRepo:
    def __init__(self):
        self.client = client
        self.db = db
        self.agents_col = self.db["agents"]

    def get_all_agents(self) -> list[Dict]:
        return list(self.agents_col.find({}))

    def get_agent_by_user_id(self, user_id: str) -> Optional[Dict]:
        return self.agents_col.find_one({"userId": user_id})

