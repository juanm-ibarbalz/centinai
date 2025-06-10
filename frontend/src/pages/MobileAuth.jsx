// frontend/src/pages/MobileAuth.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import LoginPage from "./Login"; // Cambiado para claridad
import RegisterPage from "./Register"; // Cambiado para claridad
import "./MobileAuth.css";
import logo from "../assets/centinai-logo.png";

// Recibe onAuthSuccess, setAuthError, e isRegisterMode
export default function MobileAuthPage({ onAuthSuccess, setAuthError, isRegisterMode }) {
  const navigate = useNavigate();
  const isLoginView = !isRegisterMode;

  return (
    <div className="mobile-auth-container">
      <img src={logo} alt="CentinAI Logo" className="mobile-logo" />

      {isLoginView ? (
        <>
          <h2 className="mobile-title">Bienvenid@</h2>
          <p className="mobile-subtitle">Ingresá tus credenciales</p>
          <LoginPage onSuccess={onAuthSuccess} setAuthErrorOuter={setAuthError} />
        </>
      ) : (
        <>
          <h2 className="mobile-title">Crear cuenta</h2>
          <p className="mobile-subtitle">Ingresá tus datos</p>
          <RegisterPage onSuccess={onAuthSuccess} setAuthErrorOuter={setAuthError} />
        </>
      )}

      <button
        className="mobile-alt-button"
        onClick={() => navigate(isLoginView ? "/register" : "/login")}
      >
        {isLoginView
          ? "¿No tenés cuenta? Registrate"
          : "¿Ya tenés cuenta? Iniciá sesión"}
      </button>
    </div>
  );
}