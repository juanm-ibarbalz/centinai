import React from "react";
import { useNavigate } from "react-router-dom";
import useIsMobile from "../hooks/useIsMobile";
import "./ConversationList.css";

export default function ConversationList({ conversations }) {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const formatDate = (date) => {
    const d = new Date(date);
    return isNaN(d.getTime())
      ? "-"
      : d.toLocaleString("es-AR", {
          timeZone: "America/Argentina/Buenos_Aires",
          hour12: false,
        });
  };

  const calcularDuracion = (start, end) => {
    const inicio = new Date(start);
    const fin = new Date(end);
    const min = Math.round((fin - inicio) / 60000);
    return isNaN(min) ? "-" : min;
  };

  const handleVerMensajes = (convId) => {
    navigate(`/mensajes/${convId}`);
  };

  if (isMobile) {
    return (
      <div className="mobile-conv-list">
        {conversations.map((conv) => (
          <div className="conv-card" key={conv._id}>
            <p><strong>ID:</strong> {conv._id || "-"}</p>
            <p><strong>Usuario:</strong> {conv.from || "-"}</p>
            <p><strong>Estado:</strong> {conv.status || "-"}</p>
            <p><strong>Inicio:</strong> {formatDate(conv.startTime)}</p>
            <p><strong>Fin:</strong> {formatDate(conv.endTime)}</p>
            <p><strong>Actualizado:</strong> {formatDate(conv.updatedAt)}</p>
            <p><strong>Duración:</strong> {calcularDuracion(conv.startTime, conv.endTime)} min</p>
            <button onClick={() => handleVerMensajes(conv._id)}>Ver mensajes</button>
          </div>
        ))}
      </div>
    );
  }

  return (
    <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
      <thead>
        <tr style={{ background: "#222", color: "#fff" }}>
          <th style={th}>ID</th>
          <th style={th}>Usuario</th>
          <th style={th}>Estado</th>
          <th style={th}>Duración (min)</th>
          <th style={th}>Inicio</th>
          <th style={th}>Fin</th>
          <th style={th}>Actualizado</th>
          <th style={th}>Mensajes</th>
        </tr>
      </thead>
      <tbody>
        {conversations.map((conv) => (
          <tr key={conv._id} style={{ background: "#f0f0f0" }}>
            <td style={td}>{conv._id || "-"}</td>
            <td style={td}>{conv.from || "-"}</td>
            <td style={td}>{conv.status || "-"}</td>
            <td style={td}>{calcularDuracion(conv.startTime, conv.endTime)}</td>
            <td style={td}>{formatDate(conv.startTime)}</td>
            <td style={td}>{formatDate(conv.endTime)}</td>
            <td style={td}>{formatDate(conv.updatedAt)}</td>
            <td style={td}>
              <button onClick={() => navigate(`/mensajes/${conv._id}`)}>Ver mensajes</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const th = { padding: "10px", border: "1px solid #ccc" };
const td = { padding: "10px", border: "1px solid #ccc", textAlign: "center" };
