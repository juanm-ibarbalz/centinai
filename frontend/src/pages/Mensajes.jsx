import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import "./Mensajes.css";
import { API_URL } from "../config";

export default function Mensajes() {
  const { id: conversationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [mensajes, setMensajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [agentName, setAgentName] = useState(location.state?.agentName || "");

  // ✅ Extraer phoneNumberId desde conversationId
const phoneNumberId = conversationId.split("-")[2];
  console.log("📞 phoneNumberId extraído:", phoneNumberId);

  // ✅ Si no vino desde location.state, buscamos el name desde /agents
  useEffect(() => {
    if (!agentName && phoneNumberId) {
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
          console.log("🤖 Agente encontrado:", match);
          if (match) setAgentName(match.name);
        } catch (err) {
          console.error("Error al obtener nombre del agente:", err);
        }
      };

      fetchAgentName();
    }
  }, [agentName, phoneNumberId]);

  console.log("🧠 agentName en render:", agentName);

  // ✅ Obtener mensajes
  useEffect(() => {
    const obtenerMensajes = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${API_URL}/messages?conversationId=${encodeURIComponent(conversationId)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const result = await res.json();
        setMensajes(result.messages || []);
      } catch (error) {
        console.error("Error al obtener mensajes:", error);
      } finally {
        setLoading(false);
      }
    };

    obtenerMensajes();
  }, [conversationId]);

  const formatDate = (date) => {
    const d = new Date(date);
    return isNaN(d.getTime())
      ? "-"
      : d.toLocaleString("es-AR", {
          timeZone: "America/Argentina/Buenos_Aires",
          hour12: false,
        });
  };

  return (
    <div className="mensajes-container">
      <button className="back-dashboard-btn" onClick={() => navigate(-1)}>
        Volver
      </button>

      

      <h1 className="mensajes-titulo">
        📩 Conversación con{" "}
        <span style={{ color: "#29FFD8" }}>{agentName || "el bot"}</span>
      </h1>

      {loading ? (
        <p>Cargando mensajes...</p>
      ) : mensajes.length === 0 ? (
        <p>No se encontraron mensajes.</p>
      ) : (
        <ul className="mensaje-lista">
          {mensajes.map((msg) => (
            <li
              key={msg._id}
              className={`mensaje-item ${
                msg.direction === "user" ? "mensaje-user" : "mensaje-agent"
              }`}
            >
              <div className="mensaje-contenido">
                <strong>
                  {msg.direction === "user"
                    ? msg.userName || "Vos"
                    : agentName || "Bot"}
                  :
                </strong>{" "}
                {msg.text}
              </div>
              <p className="mensaje-timestamp">{formatDate(msg.timestamp)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
