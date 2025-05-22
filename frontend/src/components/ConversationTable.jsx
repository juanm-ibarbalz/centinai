import { useEffect, useState } from "react";

const ConversationTable = ({ phoneNumberId }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!phoneNumberId) {
      console.warn("⛔ phoneNumberId no está definido");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("⛔ Token no encontrado en localStorage");
      return;
    }

    const API_URL = import.meta.env.VITE_API_URL;

    console.log("🔄 Fetching conversations for:", phoneNumberId);

    fetch(`${API_URL}/conversations?agentPhoneNumberId=${phoneNumberId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          console.error("❌ Respuesta no OK:", res.status);
        }
        return res.json();
      })
      .then((json) => {
        console.log("✅ Conversaciones recibidas:", json);
        setData(json);
      })
      .catch((err) => {
        console.error("❌ Error al obtener datos:", err);
      });
  }, [phoneNumberId]);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>📊 Conversaciones del usuario {phoneNumberId}</h2>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "1rem",
        }}
      >
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
          {data.map((conv) => (
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
      {data.length === 0 && (
        <p style={{ marginTop: "1rem", color: "#B0BEC5", textAlign: "center" }}>
          Este bot aún no tiene conversaciones registradas.
        </p>
      )}
    </div>
  );
};

const th = { padding: "10px", border: "1px solid #ccc" };
const td = { padding: "10px", border: "1px solid #ccc", textAlign: "center" };

export default ConversationTable;
