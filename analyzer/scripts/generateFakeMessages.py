import os
import requests
import json
import random
import csv
import time

def send_webhook_message(
    entry_id: str,
    display_phone_number: str,
    phone_number_id: str,
    profile_name: str,
    wa_id: str,
    msg_id: str,
    timestamp: int,
    body_text: str,
    webhook_url: str = "https://1585-2803-9800-9008-7725-142d-ffe5-c1f0-ade3.ngrok-free.app/webhook"
):
    payload = {
        "object": "whatsapp_business_account",
        "entry": [
            {
                "id": entry_id,
                "changes": [
                    {
                        "field": "messages",
                        "value": {
                            "messaging_product": "whatsapp",
                            "metadata": {
                                "display_phone_number": display_phone_number,
                                "phone_number_id": phone_number_id
                            },
                            "contacts": [
                                {
                                    "profile": {"name": profile_name},
                                    "wa_id": wa_id
                                }
                            ],
                            "messages": [
                                {
                                    "from": wa_id,
                                    "id": msg_id,
                                    "timestamp": str(timestamp),
                                    "type": "text",
                                    "text": {"body": body_text}
                                }
                            ]
                        }
                    }
                ]
            }
        ]
    }

    headers = {'Content-Type': 'application/json'}

    try:
        response = requests.post(webhook_url, json=payload, headers=headers)
        response.raise_for_status()
        print(f"Success! Status code: {response.status_code}")
        print(f"Response: {response.text}")
    except requests.exceptions.RequestException as e:
        print(f"Error sending webhook: {e}")


def get_random_message(messages: list) -> str:
    """
    Recibe una lista de mensajes y devuelve uno aleatorio.
    """
    if not messages:
        raise ValueError("La lista de mensajes está vacía.")
    idx = int(random.random() * len(messages))
    return messages[idx]


if __name__ == "__main__":
    # 1. Determinar la ruta del script actual
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # 2. Construir la ruta al CSV en la carpeta padre
    csv_file = os.path.join(script_dir, "..", "Prederminated messages.csv")

    # Debug: opcional, para verificar rutas
    print("Directorio del script:", script_dir)
    print("Buscando CSV en:", csv_file)
    print("Archivos en scripts/:", os.listdir(script_dir))

    # 3. Carga previa del CSV en una lista
    with open(csv_file, newline="", encoding="utf-8") as f:
        reader = csv.reader(f)
        messages = [
            row[0] for row in reader
            if row and row[0].lower() != "message"
        ]

    # 4. Obtiene un mensaje aleatorio
    random_msg = get_random_message(messages)
    print("Mensaje aleatorio:", random_msg)

    # 5. Ejemplo de envío al webhook con el mensaje elegido
    send_webhook_message(
        entry_id="123456789",
        display_phone_number="16505551111",
        phone_number_id="123456123",
        profile_name="Cliente Ejemplo",
        wa_id="549112233445",
        msg_id=f"msg-{int(time.time())}",
        timestamp=int(time.time()),
        body_text=random_msg
    )
