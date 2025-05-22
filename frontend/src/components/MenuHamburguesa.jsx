import React, { useState, useEffect } from "react";
import "./MenuHamburguesa.css";
import { useNavigate } from "react-router-dom";

import homeIcon from "../assets/icons/ic_house.svg";
import dashboardIcon from "../assets/icons/ic_dashboard.svg";
import toolIcon from "../assets/icons/ic_tool.svg";
import configIcon from "../assets/icons/ic_settings.svg";
import userIcon from "../assets/icons/ic_user.svg";

const HamburgerMenu = ({ userName = "Usuario" }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showLabels, setShowLabels] = useState(false);

  const handleNavigate = (path) => {
  // Cierra menú con transición
  setShowLabels(false);
  setTimeout(() => {
    setIsOpen(false);
    navigate(path);
  }, 125);
};

  const toggleMenu = () => {
    if (!isOpen) {
      // ABRIR: primero expandir la barra, luego mostrar el texto
      setIsOpen(true);
      setTimeout(() => setShowLabels(true), 125);
    } else {
      // CERRAR: primero ocultar el texto, luego cerrar la barra
      setShowLabels(false);
      setTimeout(() => setIsOpen(false), 0);
    }
  };

  const [agentPhoneNumberId, setAgentPhoneNumberId] = useState(null);
  useEffect(() => {
    const fetchPhoneNumberId = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/agents`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();

        // Asumo que obtenés un array de agentes, y tomás el primero
        if (data.length > 0) {
          setAgentPhoneNumberId(data[0].phoneNumberId);
        }
      } catch (err) {
        console.error("❌ Error al obtener el phoneNumberId:", err);
      }
    };

    fetchPhoneNumberId();
  }, []);

  return (
    <div className={`sidebar-menu left ${!isOpen ? "collapsed" : "open"}`}>
      <button onClick={toggleMenu} className="toggle-menu-btn">
        {isOpen ? "«" : "»"}
      </button>

      <ul className="menu-items">
        <li onClick={() => handleNavigate("/home")} title="Home">
          <img src={homeIcon} alt="Home" className="menu-icon" />
          {showLabels && <span>Home</span>}
        </li>

        <li onClick={() => handleNavigate("/dashboards")} title="Dashboards">
          <img src={dashboardIcon} alt="Dashboards" className="menu-icon" />
          {showLabels && <span>Dashboards</span>}
        </li>

        <li onClick={() => handleNavigate("/xxx1")} title="XXX 1">
          <img src={toolIcon} alt="XXX 1" className="menu-icon" />
          {showLabels && <span>in progress...</span>}
        </li>

        <li onClick={() => handleNavigate("/xxx2")} title="XXX 2">
          <img src={toolIcon} alt="XXX 2" className="menu-icon" />
          {showLabels && <span>in progress...</span>}
        </li>

        <li onClick={() => handleNavigate("/xxx3")} title="XXX 3">
          <img src={toolIcon} alt="XXX 3" className="menu-icon" />
          {showLabels && <span>in progress...</span>}
        </li>

        <li
          onClick={() => handleNavigate("/configuracion")}
          title="Configuración"
        >
          <img src={configIcon} alt="Configuración" className="menu-icon" />
          {showLabels && <span>Configuración</span>}
        </li>
      </ul>

      <div className="menu-footer" title={userName}>
        <img src={userIcon} alt="Usuario" className="menu-icon" />
        {showLabels && <span>{userName}</span>}
      </div>
    </div>
  );
};

export default HamburgerMenu;
