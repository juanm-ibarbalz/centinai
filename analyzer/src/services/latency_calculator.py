from typing import List, Dict, Optional
from datetime import datetime

class LatencyCalculator:
    def __init__(self, messages: List[Dict]):
        self.messages = sorted(
            [m for m in messages if m.get("timestamp_dt")],
            key=lambda m: m["timestamp_dt"]
        )

    def calculate_average_latency(self) -> Dict[str, Optional[float]]:
        total_latency = 0.0
        interaction_count = 0

        i = 0
        while i < len(self.messages):
            current_msg = self.messages[i]
            if current_msg.get("direction") == "user":
                user_time = current_msg["timestamp_dt"]
                # Buscar siguiente respuesta del agente
                for j in range(i + 1, len(self.messages)):
                    next_msg = self.messages[j]
                    if next_msg.get("direction") == "agent":
                        agent_time = next_msg["timestamp_dt"]
                        if agent_time > user_time:
                            latency = (agent_time - user_time).total_seconds()
                            total_latency += latency
                            interaction_count += 1
                            i = j  # continuar desde este punto
                        break
            i += 1

        average_latency = (total_latency / interaction_count) if interaction_count > 0 else None

        return {
            "averageSeconds": average_latency,
            "interactionsCount": interaction_count
        }
