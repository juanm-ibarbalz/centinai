// frontend/src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css"; // Asegúrate que la ruta es correcta si Login.jsx está en pages/
import { API_URL } from "../config"; // Asumiendo que config.js está en frontend/src/

// Renombré la prop setAuthError a setAuthErrorOuter para evitar confusión con un estado local
export default function LoginPage({ onSuccess, setAuthErrorOuter }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(""); // Limpiar mensaje previo
    if (setAuthErrorOuter) setAuthErrorOuter(null); // Limpiar error global previo
    console.log("Login.jsx: handleSubmit iniciado con datos:", { email }); // LOG 1

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      console.log("Login.jsx: Respuesta de API fetch:", res); // LOG 1.5

      const data = await res.json();
      console.log("Login.jsx: Datos de API (después de .json()):", data); // LOG 2

      if (res.ok && data.token && data.user) { // Importante: Verifica también data.user
        console.log("Login.jsx: Token y usuario recibidos:", data.token, data.user); // LOG 3

        // data.user debería ser el objeto del usuario, no solo el ID.
        // Si tu API solo devuelve ID en el login, necesitarás otra llamada para obtener el usuario completo,
        // o modificar el backend. setupSession espera el objeto usuario.
        // Por ahora, asumiré que data.user es el objeto completo.

        if (typeof onSuccess === 'function') {
          console.log("Login.jsx: Llamando a onSuccess (que es setupSession)..."); // LOG 4
          onSuccess(data.user, data.token); // Llama a setupSession
          // La navegación la maneja el cambio de estado de isAuthenticated en App.jsx
          // navigate("/home"); // No es estrictamente necesario aquí si App.jsx redirige bien
        } else {
          console.error("Login.jsx: onSuccess no es una función.");
          setMessage("❌ Error interno al procesar el login.");
        }
      } else {
        const errorMsg = data.message || "Error al iniciar sesión o respuesta inválida.";
        console.error("Login.jsx: " + errorMsg, data); // LOG 5
        setMessage(`❌ ${errorMsg}`);
        if (setAuthErrorOuter) setAuthErrorOuter(errorMsg);
      }
    } catch (err) {
      console.error("Login.jsx: Error en fetch o .json():", err); // LOG 6
      const errorMsg = err.message || "Error al conectar con el servidor";
      setMessage(`❌ ${errorMsg}`);
      if (setAuthErrorOuter) setAuthErrorOuter(errorMsg);
    }
  };

  return (
    <div className="auth-form">
      {/* <h2>Iniciar Sesión</h2> // El título ya está en AuthPage/MobileAuthPage */}
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Ingresar</button>
      </form>
      {message && <p className={`msg ${message.startsWith('❌') ? 'error' : 'success'}`}>{message}</p>}
    </div>
  );
}