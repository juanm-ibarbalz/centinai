import { useEffect, useState } from "react";
import ConversationList from "./ConversationList";

const ConversationTable = ({ phoneNumberId }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!phoneNumberId) return;

    const token = localStorage.getItem("token");
    const API_URL = import.meta.env.VITE_API_URL;

    fetch(`${API_URL}/conversations?agentPhoneNumberId=${phoneNumberId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setData)
      .catch((err) => console.error("Error:", err));
  }, [phoneNumberId]);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>📊 Conversaciones del usuario {phoneNumberId}</h2>
      {data.length > 0 ? (
        <ConversationList conversations={data} />
      ) : (
        <p style={{ color: "#B0BEC5", textAlign: "center" }}>
          Este bot aún no tiene conversaciones registradas.
        </p>
      )}
    </div>
  );
};

export default ConversationTable;
