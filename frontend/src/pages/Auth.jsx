import { useNavigate, useLocation } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import './Auth.css';
import logo from '../assets/centinai-logo.png';

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();

  const isLogin = location.pathname === "/login";

  const handleSuccess = () => {
    navigate('/home');
  };

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
              : "Para unirte a nuestra comunidad por favor registrate con tus datos"}
          </p>
          <button onClick={() => navigate(isLogin ? "/register" : "/login")}>
            {isLogin ? "¿No tenés cuenta? Registrate" : "¿Ya tenés cuenta? Iniciá sesión"}
          </button>
        </div>

        <div className="auth-right">
          {isLogin
            ? <Login onSuccess={handleSuccess} />
            : <Register onSuccess={handleSuccess} />}
        </div>
      </div>
    </div>
  );
}
