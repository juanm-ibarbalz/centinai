import { useState } from 'react';
import Login from './Login';
import Register from './Register';
import './Auth.css';
import logo from '../assets/centinai-logo.png'; 

export default function Auth() {
  const [isLogin, setIsLogin] = useState(false);

  return (
    <div className="auth-container">
  <div className="auth-split-container">
    <div className="auth-logo-wrapper">
      <img src={logo} alt="CentinAI Logo" className="auth-logo" />
    </div>

    <div className="auth-left">
      <h2>{isLogin ? "¡Qué bueno verte de nuevo!" : "Bienvenido"}</h2>
      <p>
        {isLogin
          ? "Inicia sesión con tus credenciales para continuar."
          : "Para unirte a nuestra comunidad por favor inicia sesión con tus datos"}
      </p>
      <button onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? "Registrarse" : "Iniciar Sesión"}
      </button>
    </div>

    <div className="auth-right">
      {isLogin ? <Login /> : <Register />}
    </div>
  </div>
</div>

  );
}
