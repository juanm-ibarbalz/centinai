import React from "react";
import useIsMobile from "../hooks/useIsMobile";
import "./ConversationList.css";

export default function ConversationList({ conversations }) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="mobile-conv-list">
        {conversations.map((conv) => (
          <div className="conv-card" key={conv._id}>
            <p><strong>ID:</strong> {conv._id}</p>
            <p><strong>Usuario:</strong> {conv.userName}</p>
            <p><strong>Total Msg:</strong> {conv.totalMessages}</p>
            <p><strong>Mensajes del Usuario:</strong> {conv.userMessages}</p>
            <p><strong>Mensajes del Agente:</strong> {conv.agentMessages}</p>
            <p><strong>Duración:</strong> {conv.durationMinutes} min</p>
          </div>
        ))}
      </div>
    );
  }

  // Desktop (tabla actual)
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
      <thead>
        <tr style={{ background: "#222", color: "#fff" }}>
          <th style={th}>ID</th>
          <th style={th}>Usuario</th>
          <th style={th}>Total Msg</th>
          <th style={th}>Usuario</th>
          <th style={th}>Agente</th>
          <th style={th}>Duración (min)</th>
        </tr>
      </thead>
      <tbody>
        {conversations.map((conv) => (
          <tr key={conv._id} style={{ background: "#f0f0f0" }}>
            <td style={td}>{conv._id}</td>
            <td style={td}>{conv.userName}</td>
            <td style={td}>{conv.totalMessages}</td>
            <td style={td}>{conv.userMessages}</td>
            <td style={td}>{conv.agentMessages}</td>
            <td style={td}>{conv.durationMinutes}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const th = { padding: "10px", border: "1px solid #ccc" };
const td = { padding: "10px", border: "1px solid #ccc", textAlign: "center" };