import { useNavigate } from 'react-router-dom';
import LoginPage from './Login'; 
import RegisterPage from './Register'; 
import './Auth.css';
import logo from '../assets/centinai-logo.png';

export default function AuthPage({ onAuthSuccess, setAuthError, isLoginMode }) {
  const navigate = useNavigate();

  return (
    <div className="auth-container">
      <div className="auth-split-container">
        <div className="auth-logo-wrapper">
          <img src={logo} alt="CentinAI Logo" className="auth-logo" />
        </div>

        <div className="auth-left">
          <h2>{isLoginMode ? "¡Qué bueno verte de nuevo!" : "Bienvenido"}</h2>
          <p>
            {isLoginMode
              ? "Inicia sesión con tus credenciales para continuar."
              : "Para unirte a nuestra comunidad por favor registrate con tus datos"}
          </p>
          <button onClick={() => navigate(isLoginMode ? "/register" : "/login")}>
            {isLoginMode ? "¿No tenés cuenta? Registrate" : "¿Ya tenés cuenta? Iniciá sesión"}
          </button>
        </div>

        <div className="auth-right">
          {isLoginMode
            ? <LoginPage onSuccess={onAuthSuccess} setAuthErrorOuter={setAuthError} />
            : <RegisterPage onSuccess={onAuthSuccess} setAuthErrorOuter={setAuthError} />}
        </div>
      </div>
    </div>
  );
}