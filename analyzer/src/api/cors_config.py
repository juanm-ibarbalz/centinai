import os
from dotenv import load_dotenv

load_dotenv()
raw = os.getenv('CORS_ALLOWED_ORIGINS', '')
whitelist = [u.strip() for u in raw.split(',') if u.strip()]

cors_config = {
    "origins": whitelist,
    "methods": ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
    "allow_headers": ["Content-Type","Authorization","x-agent-secret"],
    "supports_credentials": True,
    "max_age": 600
}