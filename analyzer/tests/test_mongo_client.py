# analyzer/test_mongo_client.py

import sys
import os
from db.mongo_client import db

def test_can_connect_and_find_conversation():
    convo = db["conversations"].find_one({}, {"_id": 0})
    assert convo is not None, "No se encontró ninguna conversación."
    print("✅ Conexión exitosa. Conversación encontrada:")
    print(convo)

test_can_connect_and_find_conversation()