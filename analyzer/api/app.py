from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from analyzer.init_analyzer import initiate_analyzer

app = Flask(__name__)
CORS(app)

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
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.getenv("PORT", 8000))
    app.run(host="0.0.0.0", port=port) 