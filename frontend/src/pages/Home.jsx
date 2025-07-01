import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import circuitBG from "../assets/video/circuit_background.mp4";
import "./Home.css";
import logo from "../assets/centinai-iso.png";

const Home = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="home-video-background">
        <video className="home-video" autoPlay loop muted playsInline>
          <source src={circuitBG} type="video/mp4" />
          Tu navegador no soporta video HTML5.
        </video>
        <div className="home-overlay" />
      </div>

      <div className="home-container">
        <div className="home-content">
          <motion.div
            className="home-emoji"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            style={{ marginBottom: 0 }}
          >
            <img src={logo} alt="CentinAI Logo" className="home-logo" />
          </motion.div>

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
            <button
              onClick={() => navigate("/createAgent")}
              className="primary-btn"
            >
              Añadir Agente
            </button>
            <button
              onClick={() => navigate("/myAgents")}
              className="secondary-btn"
            >
              Ver Agentes
            </button>
            <button
              onClick={() => navigate("/dashboards")}
              className="secondary-btn"
            >
              Ver Métricas
            </button>
          </motion.div>

          <motion.div
            className="home-status"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 0.7 }}
          >
            <span className="status-dot green" /> Sistema Operativo — Última sync:
            hace 2 min
          </motion.div>

          <div className="home-panels">
            <motion.div
              className="home-news"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
            >
              <h3>📰 Novedades recientes</h3>
              <ul>
                <li>✅ Nuevo módulo de métricas semánticas ya disponible</li>
                <li>⚙️ Mantenimiento el 23/06 de 2:00 a 4:00 AM</li>
                <li>🧠 Entrenamiento mejorado para bots con frases reales</li>
              </ul>
            </motion.div>

            <motion.div
              className="home-activity"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.8 }}
            >
              <h3>📊 Actividad reciente</h3>
              <ul>
                <li>🤖 Bot "Lucía" respondió 128 veces hoy</li>
                <li>📁 Exportaste métricas el 19/06</li>
                <li>🛠️ Se editó el agente "Soporte Técnico"</li>
              </ul>
            </motion.div>
          </div>

          <motion.div
            className="home-tip"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 0.7 }}
          >
            💬 "Usá métricas semánticas para detectar desviaciones de intención."
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Home;
