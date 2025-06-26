# analyzer/test_mongo_client.py

import sys
import os
from db.mongo_client import db
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB = os.getenv("MONGO_DB")
print(MONGO_DB + " " + MONGO_URI)
def test_can_connect_and_find_conversation():
    convo = db["conversations"].find_one({}, {"_id": 0})
    assert convo is not None, "No se encontró ninguna conversación."
    print("✅ Conexión exitosa. Conversación encontrada:")
    print(convo)

test_can_connect_and_find_conversation()