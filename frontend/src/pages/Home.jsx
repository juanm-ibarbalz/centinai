import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { API_URL } from "../config";
import AgentList from "../components/AgentList";
import LogoutButton from "../components/LogoutButton";

const Home = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("token");
    if (window.Android?.logoutToken) {
      window.Android.logoutToken();
    }
    navigate("/login");
  };

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_URL}/agents`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setAgents(data);
      } catch (err) {
        console.error("Error al obtener agentes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  return (
    <>
      <div className="dashboard-container">
        <h1>¡Hola desde la Home pública! 👋</h1>

        <button
          style={{
            marginBottom: "1rem",
            padding: "0.7rem 1.2rem",
            backgroundColor: "#29FFD8",
            color: "#0B0E23",
            border: "none",
            fontWeight: "bold",
            borderRadius: "8px",
            cursor: "pointer",
            boxShadow: "0 0 12px #29FFD8",
          }}
          onClick={() => navigate("/createAgent")}
        >
          AÑADIR AGENTE
        </button>

        {loading ? (
          <p>Cargando agentes...</p>
        ) : agents.length === 0 ? (
          <p>No tenés agentes registrados todavía.</p>
        ) : (
          <AgentList
            agents={agents}
            onViewConversations={(phoneNumberId) =>
              navigate(`/conversationsDash/${phoneNumberId}`)
            }
          />
        )}
      </div>
    </>
  );
};

export default Home;
