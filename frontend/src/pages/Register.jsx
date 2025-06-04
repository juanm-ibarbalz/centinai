// frontend/src/pages/Register.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../App.css"; // Asegúrate que la ruta es correcta
import { API_URL } from "../config"; // Asumiendo que config.js está en frontend/src/

// Renombré la prop setAuthError a setAuthErrorOuter
export default function RegisterPage({ onSuccess, setAuthErrorOuter }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    if (setAuthErrorOuter) setAuthErrorOuter(null);
    console.log("Register.jsx: handleRegister iniciado"); // LOG 1 (Register)

    if (password !== repeatPassword) {
      setMessage('❌ Las contraseñas no coinciden');
      if (setAuthErrorOuter) setAuthErrorOuter('Las contraseñas no coinciden');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      console.log("Register.jsx: Respuesta de API fetch:", res); // LOG 1.5 (Register)

      const data = await res.json();
      console.log("Register.jsx: Datos de API (después de .json()):", data); // LOG 2 (Register)

      if (res.ok && data.token && data.user) { // Verifica también data.user
        console.log("Register.jsx: Token y usuario recibidos:", data.token, data.user); // LOG 3 (Register)
        // Asumiendo que data.user es el objeto usuario completo

        if (typeof onSuccess === 'function') {
          console.log("Register.jsx: Llamando a onSuccess (setupSession)..."); // LOG 4 (Register)
          onSuccess(data.user, data.token); // Llama a setupSession
          // navigate("/home"); // La navegación la maneja el cambio de estado en App.jsx
        } else {
          console.error("Register.jsx: onSuccess no es una función.");
          setMessage("❌ Error interno al procesar el registro.");
        }
      } else {
        const errorMsg = data.message || 'Error al registrar o respuesta inválida.';
        console.error("Register.jsx: " + errorMsg, data); // LOG 5 (Register)
        setMessage(`❌ ${errorMsg}`);
        if (setAuthErrorOuter) setAuthErrorOuter(errorMsg);
      }
    } catch (err) {
      console.error("Register.jsx: Error en fetch o .json():", err); // LOG 6 (Register)
      const errorMsg = err.message || "Error al conectar con el servidor";
      setMessage(`❌ ${errorMsg}`);
      if (setAuthErrorOuter) setAuthErrorOuter(errorMsg);
    }
  };

  return (
    <div className="auth-form">
      {/* <h2>Crear cuenta</h2> // El título ya está en AuthPage/MobileAuthPage */}
      <form onSubmit={handleRegister}>
        <input type="text" placeholder="Nombre completo" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <input type="password" placeholder="Repetir contraseña" value={repeatPassword} onChange={(e) => setRepeatPassword(e.target.value)} required />
        <button type="submit">Registrarse</button>
      </form>
      {message && <p className={`msg ${message.startsWith('❌') ? 'error' : 'success'}`}>{message}</p>}
    </div>
  );
}