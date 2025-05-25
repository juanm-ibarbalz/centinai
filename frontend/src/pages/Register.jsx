import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../App.css";
import { API_URL } from "../config";

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // ✅ estaba faltando

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== repeatPassword) {
      setMessage('❌ Las contraseñas no coinciden');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al registrar');

      localStorage.setItem("token", data.token); // ✅ guarda el token
      setMessage('✅ Registro exitoso. Iniciando aplicación...');
      setTimeout(() => navigate("/home"), 1500); // ✅ redirige al dashboard
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    }
  };

  return (
    <div className="auth-form">
      <h2>Crear cuenta</h2>
      <form onSubmit={handleRegister}>
        <input type="text" placeholder="Nombre completo" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <input type="password" placeholder="Repetir contraseña" value={repeatPassword} onChange={(e) => setRepeatPassword(e.target.value)} required />
        <button type="submit">Registrarse</button>
      </form>
      {message && <p className="msg">{message}</p>}
    </div>
  );
}

export default Register;
