import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Mensajes.css";

export default function Mensajes() {
  const { id } = useParams(); // ID de la conversación
  const navigate = useNavigate();
  const [mensajes, setMensajes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const obtenerMensajes = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/messages?conversationId=${encodeURIComponent(id)}`,
          
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await res.json();
        setMensajes(result.messages || []);
              console.log(result);
      } catch (error) {
        console.error("Error al obtener mensajes:", error);
      } finally {
        setLoading(false);
      }
    };

    obtenerMensajes();
  }, [id]);

  const formatDate = (date) => {
    const d = new Date(date);
    return isNaN(d.getTime())
      ? "-"
      : d.toLocaleString("es-AR", {
          timeZone: "America/Argentina/Buenos_Aires",
          hour12: false,
        });
  };

  return (
    <div className="mensajes-container">
      
      <button className="back-dashboard-btn" onClick={() => navigate(-1)}>
        Volver
      </button>

      <h1 className="mensajes-titulo">📩 Mensajes de la conversación</h1>


      {loading ? (
        <p>Cargando mensajes...</p>
      ) : mensajes.length === 0 ? (
        <p>No se encontraron mensajes.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {mensajes.map((msg) => (
            
            <li
              key={msg._id}
              className={`mensaje-item ${
                msg.from === "user" ? "mensaje-user" : ""
              }`}
            >
              <p className="mensaje-contenido">
                <strong>{msg.from === "user" ? "Usuario" : "Bot"}:</strong>{" "}
                {msg.content}
              </p>
              <p className="mensaje-timestamp">{formatDate(msg.timestamp)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
