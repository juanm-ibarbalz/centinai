import { useParams, useNavigate } from "react-router-dom"; // Asegurate de tener useNavigate
import { useEffect, useState } from "react";
import ConversationTable from "../components/ConversationTable";
import "../App.css";
import "./ConversationsDash.css";
import { API_URL } from "../config";

export default function Dashboard() {
  const { phoneNumberId } = useParams();
  const navigate = useNavigate(); // 👈 Agregá esta línea
  const [agentName, setAgentName] = useState("");

  useEffect(() => {
    const fetchAgentName = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/agents`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const agents = await res.json();
        const match = agents.find((a) => a.phoneNumberId === phoneNumberId);
        if (match) setAgentName(match.name);
      } catch (err) {
        console.error("Error al obtener nombre del agente:", err);
      }
    };

    fetchAgentName();
  }, [phoneNumberId]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>CentinAI - Dashboard del bot {agentName || phoneNumberId}</h1>
      </div>

      <button className="back-dashboard-btn" onClick={() => navigate("/myAgents")}>
        Volver
      </button>

      <div className="dashboard-content">
        <ConversationTable phoneNumberId={phoneNumberId} />
      </div>
    </div>
  );
}
