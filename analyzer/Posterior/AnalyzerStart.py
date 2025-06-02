from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv
import os

load_dotenv()

uri = os.getenv("MONGO_URI")

# Crea el cliente usando la Stable API v1
client = MongoClient(uri, server_api=ServerApi('1'))

# Envía un ping para verificar la conexión
try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print("Error de conexión:", e)
