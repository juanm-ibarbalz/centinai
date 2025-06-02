from flask import Flask, jsonify, request
from dotenv import load_dotenv
from pymongo import MongoClient
import json, os

load_dotenv()

uri = os.getenv("MONGO_URI")
client = MongoClient(uri)
db = client["tu_nombre_de_bd"]
conversations_coll = db["Conversations"]

app = Flask(__name__)

@app.route("/api/conversations", methods=["GET"])
def get_conversations():
    # 1. Parámetros de filtro y paginación
    user_id = request.args.get("userId")
    agent_id = request.args.get("agentPhoneNumberId")
    try:
        limit  = int(request.args.get("limit",  10))
        offset = int(request.args.get("offset", 0))
    except ValueError:
        return jsonify({"error": "limit y offset deben ser enteros"}), 400

    # 2. Construir filtro
    filtro = {}
    if user_id:
        filtro["userId"] = user_id
    if agent_id:
        filtro["agentPhoneNumberId"] = agent_id

    # 3. Ejecutar consulta
    cursor = (
        conversations_coll
        .find(filtro, {"_id": False})
        .sort("lastUpdated", -1)
        .skip(offset)
        .limit(limit)
    )
    docs = list(cursor)

    # 4. Guardar y responder
    with open("conversations.json", "w", encoding="utf-8") as f:
        json.dump(docs, f, ensure_ascii=False, indent=2)
    print("succefull record of conversations")
    return jsonify(docs)

if __name__ == "__main__":
    os.makedirs(os.path.dirname(os.path.abspath(__file__)), exist_ok=True)
    app.run(host="0.0.0.0", port=5000, debug=True)
