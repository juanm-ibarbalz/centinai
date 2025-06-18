from analyzer.db.mongo_client import db

def save_session(session_data: dict):
    """
    Inserta una sesión en la colección 'sessions'
    """
    result = db["sessions"].insert_one(session_data)
    print(f"✅ Sesión guardada con _id: {result.inserted_id}")
