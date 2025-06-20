import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { API_URL } from "../config";
import AgentList from "../components/AgentList";

const MyAgents = () => {
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

export default MyAgents;
