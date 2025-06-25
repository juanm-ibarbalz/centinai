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
  const [successMessage, setSuccessMessage] = useState("");
  const [agentToDelete, setAgentToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

  const handleDelete = async () => {
    if (!agentToDelete) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/agents/${agentToDelete._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setAgents((prev) =>
          prev.filter((a) => a._id !== agentToDelete._id)
        );
        setSuccessMessage("✅ Agente eliminado con éxito.");
        setTimeout(() => setSuccessMessage(""), 2000);
      } else {
        console.error("❌ Error al eliminar el agente.");
      }
    } catch (error) {
      console.error("❌ Error:", error);
    } finally {
      setAgentToDelete(null);
      setShowDeleteModal(false);
    }
  };

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
                    onClick={() => {
                      setAgentToDelete(agent);
                      setShowDeleteModal(true);
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

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && agentToDelete && (
        <div className="success-overlay">
          <div className="success-box">
            <p>¿Eliminar agente <strong>{agentToDelete.name}</strong>?</p>
            <div style={{ marginTop: "1.2rem", display: "flex", gap: "1rem", justifyContent: "center" }}>
              <button onClick={handleDelete} className="modal-delete-btn">
                Sí, eliminar
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setAgentToDelete(null);
                }}
                className="secondary-button"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje de éxito */}
      {successMessage && (
        <div className="success-overlay">
          <div className="success-box">
            <p>{successMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAgents;
