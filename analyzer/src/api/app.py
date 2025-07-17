from flask import Flask, jsonify, request, Response
from flask_cors import CORS
import os, sys
from .cors_config import cors_config

# Añadir el directorio raíz del analyzer al path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Cambiar al directorio raíz del analyzer para que las importaciones relativas funcionen
os.chdir(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from init_analyzer import initiate_analyzer

app = Flask(__name__)
CORS(app, **cors_config)

@app.route('/')
def ping():
    """
    Endpoint simple para testear si el API Flask está funcionando.
    """
    return jsonify({"status": "OK"}), 200

@app.route('/analyze', methods=['POST'])
def analyze():
    """
    Endpoint interno para procesar una conversación.
    Recibe JSON en el body y devuelve el resultado de initiate_analyzer.
    """
    raw = request.get_json()
    try:
        result = initiate_analyzer(raw)
        return jsonify({"status": "ok"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port) 