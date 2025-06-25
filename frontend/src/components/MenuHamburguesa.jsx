import React, { useEffect, useState } from "react";
import "./MenuHamburguesa.css";
import { useNavigate } from "react-router-dom";
import LogoutButton from "./LogoutButton";

import homeIcon from "../assets/icons/ic_house.svg";
import dashboardIcon from "../assets/icons/ic_dashboard.svg";
import toolIcon from "../assets/icons/ic_tool.svg";
import configIcon from "../assets/icons/ic_settings.svg";
import userIcon from "../assets/icons/ic_user.svg";
import robotIcon from "../assets/icons/ic_robot.svg";
import agentsIcon from "../assets/icons/ic_agents.svg";

import { API_URL } from "../config"; // Asegurate de tener la URL base

const HamburgerMenu = ({ onLogout }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showLabels, setShowLabels] = useState(false);
  const [userName, setUserName] = useState("Usuario");

  // 🟢 Al montar, traemos el name desde la API usando el id del localStorage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser?.name) {
      setUserName(storedUser.name);
    }
  }, []);

  const handleNavigate = (path) => {
    setShowLabels(false);
    setTimeout(() => {
      setIsOpen(false);
      navigate(path);
    }, 125);
  };

  const toggleMenu = () => {
    if (!isOpen) {
      setIsOpen(true);
      setTimeout(() => setShowLabels(true), 125);
    } else {
      setShowLabels(false);
      setTimeout(() => setIsOpen(false), 0);
    }
  };

  useEffect(() => {
    const updateUserName = () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (storedUser?.name) {
        setUserName(storedUser.name);
      }
    };

    updateUserName(); // ✅ ya lo carga al inicio
    window.addEventListener("user-updated", updateUserName);

    return () => {
      window.removeEventListener("user-updated", updateUserName);
    };
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

        <li onClick={() => handleNavigate("/createAgent")} title="Add Agent">
          <img src={robotIcon} alt="CreateAgent" className="menu-icon" />
          {showLabels && <span>Add Agents</span>}
        </li>

        <li onClick={() => handleNavigate("/myAgents")} title="My Agents">
          <img src={agentsIcon} alt="My Agents" className="menu-icon" />
          {showLabels && <span>My Agents</span>}
        </li>

        <li
          onClick={() => handleNavigate("/configuracion")}
          title="Configuración"
        >
          <img src={configIcon} alt="Configuración" className="menu-icon" />
          {showLabels && <span>Configuración</span>}
        </li>
      </ul>

      {isOpen && (
        <div className="logout-button-container">
          <LogoutButton onClick={onLogout} />
        </div>
      )}

      <div className="menu-footer" title={userName}>
        <img src={userIcon} alt="Usuario" className="menu-icon" />
        {showLabels && <span>{userName}</span>}
      </div>
    </div>
  );
};

export default HamburgerMenu;
