import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { API_URL } from "../config";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function LoginPage({ onSuccess, setAuthErrorOuter }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Iniciando sesión...");
    if (setAuthErrorOuter) setAuthErrorOuter(null);
    console.log("Login.jsx: handleSubmit iniciado con datos:", { email });

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      console.log("Login.jsx: Respuesta de API fetch:", res);

      const data = await res.json();
      console.log("Login.jsx: Datos de API (después de .json()):", data);

      if (res.ok && data.token && data.user) {
        console.log(
          "Login.jsx: Token y usuario recibidos:",
          data.token,
          data.user
        );

        if (typeof onSuccess === "function") {
          console.log(
            "Login.jsx: Llamando a onSuccess (que es setupSession)..."
          );
          onSuccess(data.user, data.token);
        } else {
          console.error("Login.jsx: onSuccess no es una función.");
          setMessage("❌ Error interno al procesar el login.");
        }
      } else {
        const errorMsg =
          data.message || "Error al iniciar sesión o respuesta inválida.";
        console.error("Login.jsx: " + errorMsg, data);
        setMessage(`❌ ${errorMsg}`);
        if (setAuthErrorOuter) setAuthErrorOuter(errorMsg);
      }
    } catch (err) {
      console.error("Login.jsx: Error en fetch o .json():", err);
      const errorMsg = err.message || "Error al conectar con el servidor";
      setMessage(`❌ ${errorMsg}`);
      if (setAuthErrorOuter) setAuthErrorOuter(errorMsg);
    }
  };

  return (
    <div className="auth-form">
      <form onSubmit={handleSubmit}>
        <input
          name="email"
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          maxLength={30}
          required
        />

        <div className="password-input-wrapper">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            maxLength={15}
            required
          />
          <span
            className="toggle-password"
            onClick={() => setShowPassword((prev) => !prev)}
            title={showPassword ? "Ocultar" : "Mostrar"}
          >
            {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </span>
        </div>

        <button type="submit">Ingresar</button>
      </form>
      {message && (
        <p className={`msg ${message.startsWith("❌") ? "error" : "success"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
