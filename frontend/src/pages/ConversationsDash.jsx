import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ConversationTable from "../components/ConversationTable";
import "../App.css";
import "./ConversationsDash.css";
import { API_URL } from "../config";

export default function Dashboard() {
  const { phoneNumberId } = useParams();
  const navigate = useNavigate();
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
      <button className="back-dashboard-btn" onClick={() => navigate(-1)}>
        Volver
      </button>

      <div className="dashboard-header">
        <h1>CentinAI - Dashboard del bot {agentName || phoneNumberId}</h1>
      </div>

      <div className="dashboard-content">
        <ConversationTable phoneNumberId={phoneNumberId} />
      </div>
    </div>
  );
}
