import { useEffect, useState } from "react";

const ConversationTable = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/conversations")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error("❌ Error al obtener datos:", err));
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>📊 Conversaciones Analizadas</h2>
      <table style={{
        width: "100%",
        borderCollapse: "collapse",
        marginTop: "1rem"
      }}>
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
            <tr key={conv.conversationId} style={{ background: "#f0f0f0" }}>
              <td style={td}>{conv.conversationId}</td>
              <td style={td}>{conv.userName}</td>
              <td style={td}>{conv.totalMessages}</td>
              <td style={td}>{conv.userMessages}</td>
              <td style={td}>{conv.agentMessages}</td>
              <td style={td}>{conv.durationMinutes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const th = { padding: "10px", border: "1px solid #ccc" };
const td = { padding: "10px", border: "1px solid #ccc", textAlign: "center" };

export default ConversationTable;
