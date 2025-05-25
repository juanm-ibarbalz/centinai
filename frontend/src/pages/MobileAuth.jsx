import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import "./MobileAuth.css";
import logo from "../assets/centinai-logo.png";

export default function MobileAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLogin = location.pathname === "/login";

  const handleSuccess = () => {
    navigate("/home");
  };

  return (
    <div className="mobile-auth-container">
      <img src={logo} alt="CentinAI Logo" className="mobile-logo" />

      {isLogin ? (
        <>
          <h2 className="mobile-title">Bienvenid@</h2>
          <p className="mobile-subtitle">Ingresá tus credenciales</p>
          <Login onSuccess={handleSuccess} />
        </>
      ) : (
        <>
          <h2 className="mobile-title">Crear cuenta</h2>
          <p className="mobile-subtitle">Ingresá tus datos</p>
          <Register onSuccess={handleSuccess} />
        </>
      )}

      <button
        className="mobile-alt-button"
        onClick={() => navigate(isLogin ? "/register" : "/login")}
      >
        {isLogin
          ? "¿No tenés cuenta? Registrate"
          : "¿Ya tenés cuenta? Iniciá sesión"}
      </button>
    </div>
  );
}