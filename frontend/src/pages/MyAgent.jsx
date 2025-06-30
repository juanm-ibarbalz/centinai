import React, { useEffect, useState } from "react";
import { API_URL } from "../config";
import "../App.css";
import "./MyAgents.css";

const MyAgents = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [agentToDelete, setAgentToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [showToken, setShowToken] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [currentAgent, setCurrentAgent] = useState(null);
  const [fieldMapping, setFieldMapping] = useState({
    text: "",
    from: "",
    timestamp: "",
    to: "",
  });

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/agents`, {
          headers: { Authorization: `Bearer ${token}` },
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
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setAgents((prev) => prev.filter((a) => a._id !== agentToDelete._id));
        setSuccessMessage("✅ Agente eliminado con éxito.");
        setTimeout(() => setSuccessMessage(""), 2000);
      }
    } catch (error) {
      console.error("❌ Error:", error);
    } finally {
      setAgentToDelete(null);
      setShowDeleteModal(false);
    }
  };

  const openEditModal = (agent) => {
    setCurrentAgent(agent);
    setFieldMapping(
      agent.fieldMapping || {
        text: "",
        from: "",
        timestamp: "",
        to: "",
      }
    );
    setShowEditModal(true);
  };

  const handleMappingUpdate = async (e) => {
    e.preventDefault();

    if (currentAgent.payloadFormat !== "custom") {
      console.warn("❌ Este agente no permite editar mapping.");
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/agents/${currentAgent._id}/mapping`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fieldMapping }),
      });

      if (!res.ok) throw new Error("Error al actualizar el mapping");

      setSuccessMessage("✅ Mapping actualizado correctamente.");
      setShowEditModal(false);
      setTimeout(() => setSuccessMessage(""), 2000);
    } catch (err) {
      console.error(err.message);
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
            const isActive = agent.name === "DeltaAI" || agent.active;
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

                <button
                  className="view-button"
                  onClick={() =>
                    (window.location.href = `/conversationsDash/${agent.phoneNumberId}`)
                  }
                >
                  Ver Conversaciones
                </button>

                <div className="card-actions">
                  {agent.payloadFormat === "custom" && (
                    <button
                      className="secondary-button"
                      onClick={() => openEditModal(agent)}
                    >
                      Editar
                    </button>
                  )}
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

      {/* Modal eliminar */}
      {showDeleteModal && agentToDelete && (
        <div className="success-overlay">
          <div className="success-box">
            <p>
              ¿Eliminar agente <strong>{agentToDelete.name}</strong>?
            </p>
            <div className="modal-buttons">
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

      {/* Modal editar */}
      {showEditModal && currentAgent && (
        <div className="overlay-modal">
          <div className="edit-card">
            <h3>
              Editar Mapping de{" "}
              <span className="agent-name">{currentAgent.name}</span>
            </h3>
            <p className="agent-phone">📞 {currentAgent.phoneNumberId}</p>

            {/* 🔐 TOKEN DISPLAY */}
            <div className="token-box">
              <p className="token-label">🔐 Secret Token:</p>
              <div className="token-wrapper">
                <input
                  type={showToken ? "text" : "password"}
                  className="token-input"
                  value={currentAgent.secretToken}
                  readOnly
                />
                <button
                  className="token-btn"
                  onClick={() => setShowToken(!showToken)}
                  title={showToken ? "Ocultar" : "Mostrar"}
                >
                  {showToken ? "🙈" : "👁"}
                </button>
                <button
                  className="token-btn"
                  onClick={() => {
                    navigator.clipboard.writeText(currentAgent.secretToken);
                    setCopySuccess(true);
                    setTimeout(() => setCopySuccess(false), 30000);
                  }}
                  title="Copiar token"
                >
                  📋
                </button>
              </div>
              {copySuccess && (
                <p className="copied-msg">✅ Copiado al portapapeles</p>
              )}
            </div>

            {/* FORMULARIO DE MAPPING */}
            <form onSubmit={handleMappingUpdate}>
              <label>Text:</label>
              <input
                type="text"
                value={fieldMapping.text}
                maxLength={30}
                onChange={(e) =>
                  setFieldMapping({ ...fieldMapping, text: e.target.value })
                }
              />

              <label>From:</label>
              <input
                type="text"
                value={fieldMapping.from}
                maxLength={30}
                onChange={(e) =>
                  setFieldMapping({ ...fieldMapping, from: e.target.value })
                }
              />

              <label>Timestamp:</label>
              <input
                type="text"
                value={fieldMapping.timestamp}
                maxLength={30}
                onChange={(e) =>
                  setFieldMapping({
                    ...fieldMapping,
                    timestamp: e.target.value,
                  })
                }
              />

              <label>To:</label>
              <input
                type="text"
                value={fieldMapping.to}
                maxLength={30}
                onChange={(e) =>
                  setFieldMapping({ ...fieldMapping, to: e.target.value })
                }
              />

              <button type="submit">Guardar mapping</button>
              <button
                type="button"
                className="secondary-button danger"
                onClick={() => setShowEditModal(false)}
              >
                Cancelar
              </button>
            </form>
          </div>
        </div>
      )}

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
