import os
from dotenv import load_dotenv
from pymongo import MongoClient
import pandas as pd
from datetime import datetime

# Cargar URI de Mongo desde .env
load_dotenv()
client = MongoClient(os.getenv("MONGO_URI"))
db = client["test"]
messages_col = db["messages"]
conversations_col = db["conversations"]

def get_messages(conversation_id):
    return list(messages_col.find(
        { "conversationId": conversation_id },
        { "_id": 0, "timestamp": 1, "direction": 1 }
    ))

def analyze_conversation(convo_doc):
    convo_id = convo_doc["conversationId"]
    messages = get_messages(convo_id)

    if len(messages) < 2:
        return None  # No se puede analizar con solo 1 mensaje

    df = pd.DataFrame(messages)
    df["timestamp"] = pd.to_datetime(df["timestamp"], unit="s")

    total_messages = len(df)
    user_messages = df[df["direction"] == "user"].shape[0]
    agent_messages = df[df["direction"] == "agent"].shape[0]
    duration = (df["timestamp"].max() - df["timestamp"].min()).total_seconds() / 60

    return {
        "conversationId": convo_id,
        "userName": convo_doc.get("userName"),
        "totalMessages": total_messages,
        "userMessages": user_messages,
        "agentMessages": agent_messages,
        "durationMinutes": round(duration, 2)
    }

def main():
    resolved_convos = list(conversations_col.find())
    results = []

    for convo in resolved_convos:
        summary = analyze_conversation(convo)
        if summary:
            results.append(summary)

    df_results = pd.DataFrame(results)
    print(df_results)

    # ✅ Guardar CSV en la misma carpeta del archivo .py
    csv_path = os.path.join(os.path.dirname(__file__), "conversation_summaries.csv")
    df_results.to_csv(csv_path, index=False)
    print(f"✅ Análisis completo. Archivo CSV generado en: {csv_path}")


if __name__ == "__main__":
    main()
