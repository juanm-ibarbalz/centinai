import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { API_URL } from "../config";
import "./MyAgents.css";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const MyAgents = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);


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
    <div className="agents-container">
      <div className="agents-header">
        <h1>Mis Agentes</h1>
        <p className="subtitle">Visualizá y gestioná tus bots activos</p>
      </div>

      {loading ? (
        <p className="loading-text">Cargando agentes...</p>
      ) : agents.length === 0 ? (
        <p className="no-agents-text">No tenés agentes registrados todavía.</p>
      ) : (
        <div className="agents-grid">
          {agents.map((agent) => {
            const isActive = agent.name === "DeltaAI" ? true : agent.active;

            return (
              <div
                key={agent._id}
                className={`agent-card ${isActive ? "glow-green" : "glow-red"}`}
              >
                <h3>{agent.name}</h3>
                <p>
                  <strong>Teléfono:</strong> {agent.phoneNumberId}
                </p>
                <p>
                  <strong>Descripción:</strong> {agent.description}
                </p>

                <p className="agent-status">
                  <strong>Estado:</strong>{" "}
                  <span
                    className={`status-badge ${
                      isActive ? "active" : "inactive"
                    }`}
                  >
                    {isActive ? (
                      <>
                        <FaCheckCircle className="status-icon" /> Activo
                      </>
                    ) : (
                      <>
                        <FaTimesCircle className="status-icon" /> Inactivo
                      </>
                    )}
                  </span>
                </p>

                <button
                  className="view-button"
                  onClick={() =>
                    navigate(`/conversationsDash/${agent.phoneNumberId}`)
                  }
                >
                  Ver Conversaciones
                </button>

                <div className="card-actions">
                  <button
                    className="secondary-button"
                    onClick={() => navigate(`/editAgent/${agent._id}`)}
                  >
                    Editar
                  </button>

                  <button
                    className="secondary-button danger"
                    onClick={async () => {
                      const confirmed = window.confirm(
                        `¿Eliminar agente "${agent.name}"?`
                      );
                      if (!confirmed) return;

                      try {
                        const token = localStorage.getItem("token");
                        const res = await fetch(
                          `${API_URL}/agents/${agent._id}`,
                          {
                            method: "DELETE",
                            headers: {
                              Authorization: `Bearer ${token}`,
                            },
                          }
                        );

                        if (res.ok) {
                          setAgents((prev) =>
                            prev.filter((a) => a._id !== agent._id)
                          );
                        } else {
                          console.error("Error al eliminar el agente.");
                        }
                      } catch (error) {
                        console.error("Error:", error);
                      }
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyAgents;
