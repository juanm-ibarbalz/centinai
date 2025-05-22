import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { API_URL } from "../config";

const Home = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("token");
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
    <div className="dashboard-container">
      {/* Botón de logout */}
      <button onClick={handleLogout} className="logout-button">
        Cerrar sesión
      </button>

      <h1>¡Hola desde la Home pública! 👋</h1>

      {loading ? (
        <p>Cargando agentes...</p>
      ) : agents.length === 0 ? (
        <p>No tenés agentes registrados todavía.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Nombre del Bot</th>
              <th>Teléfono</th>
              <th>Descripción</th>
              <th>Conversaciones</th> {/* nueva columna */}
            </tr>
          </thead>
          <tbody>
            {agents.map((agent) => (
              <tr key={agent._id}>
                <td>{agent.name}</td>
                <td>{agent.phoneNumberId}</td>
                <td>{agent.description}</td>
                <td>
                  <button
                    className="view-button"
                    onClick={() => navigate(`/dashboard/${agent.phoneNumberId}`)}
                  >
                    Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Home;
