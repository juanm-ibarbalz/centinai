import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import circuitBG from "../assets/video/circuit_background.mp4";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* 🎥 Video de fondo */}
      <video className="home-video" autoPlay loop muted playsInline>
        <source src={circuitBG} type="video/mp4" />
        Tu navegador no soporta video HTML5.
      </video>

      {/* Capa oscura */}
      <div className="home-overlay" />

      {/* Contenido encima */}
      <div className="home-content">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="home-title"
        >
          Bienvenido a <span className="text-highlight">CentinAI</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="home-subtitle"
        >
          Supervisión inteligente de tus agentes conversacionales.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="home-actions"
        >
          {/* Botón principal */}
          <button
            onClick={() => navigate("/createAgent")}
            className="primary-btn"
          >
            Crear Agente
          </button>

          {/* Botones secundarios */}
          <button
            onClick={() => navigate("/myAgents")}
            className="secondary-btn"
          >
            Ver Bots
          </button>

          <button
            onClick={() => navigate("/dashboards")}
            className="secondary-btn"
          >
            Ver Métricas
          </button>
        </motion.div>

        {/* Snackbar inferior */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.6 }}
          className="snackbar"
        >
          🟢 <span className="snackbar-highlight">Novedades:</span> Bienvenido a
          CentinAI, ¡ya podés crear tu primer agente conversacional!
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
