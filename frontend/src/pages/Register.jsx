import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { API_URL } from "../config";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function RegisterPage({ onSuccess, setAuthErrorOuter }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [showRequirements, setShowRequirements] = useState(false);

  const navigate = useNavigate();

  const validatePassword = (pwd) => {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,15}$/;
    return regex.test(pwd);
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    const isValid = validatePassword(value);
    setPasswordValid(isValid);

    // Mostrar requisitos si está tocado o vuelve a fallar
    if (passwordTouched) {
      setShowRequirements(!isValid);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    if (setAuthErrorOuter) setAuthErrorOuter(null);

    if (password !== repeatPassword) {
      setMessage("❌ Las contraseñas no coinciden");
      if (setAuthErrorOuter) setAuthErrorOuter("Las contraseñas no coinciden");
      return;
    }

    if (!validatePassword(password)) {
      setMessage("❌ La contraseña no cumple con los requisitos de seguridad.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (res.ok && data.user) {
        console.log("✅ Usuario creado, redirigiendo al login...");
        setMessage("✔️ Usuario creado con éxito. Redirigiendo...");
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      }
    } catch (err) {
      const errorMsg = err.message || "Error al conectar con el servidor";
      setMessage(`❌ ${errorMsg}`);
      if (setAuthErrorOuter) setAuthErrorOuter(errorMsg);
    }
  };

  return (
    <div className="auth-form">
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Nombre completo"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={20}
          required
        />
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          maxLength={30}
          required
        />

        <div className="password-input-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Contraseña"
            value={password}
            onChange={handlePasswordChange}
            onFocus={() => {
              setPasswordTouched(true);
              setShowRequirements(true);
            }}
            onBlur={() => {
              setTimeout(() => {
                if (!validatePassword(password)) {
                  setShowRequirements(true);
                } else {
                  setShowRequirements(false);
                }
              }, 100);
            }}
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

        {showRequirements && (
          <ul
            className={`password-requirements ${
              passwordValid ? "valid" : "invalid"
            }`}
          >
            <li
              className={
                password.length >= 8 && password.length <= 15
                  ? "valid"
                  : "invalid"
              }
            >
              {password.length >= 8 && password.length <= 15 ? "✅" : "❌"}{" "}
              Entre 8 y 15 caracteres
            </li>
            <li className={/[A-Z]/.test(password) ? "valid" : "invalid"}>
              {/[A-Z]/.test(password) ? "✅" : "❌"} Al menos una mayúscula
            </li>
            <li className={/[0-9]/.test(password) ? "valid" : "invalid"}>
              {/[0-9]/.test(password) ? "✅" : "❌"} Al menos un número
            </li>
            <li
              className={
                /[!@#$%^&*(),.?":{}|<>]/.test(password) ? "valid" : "invalid"
              }
            >
              {/[!@#$%^&*(),.?":{}|<>]/.test(password) ? "✅" : "❌"} Al menos
              un símbolo
            </li>
          </ul>
        )}

        <input
          type="password"
          placeholder="Repetir contraseña"
          value={repeatPassword}
          onChange={(e) => setRepeatPassword(e.target.value)}
          maxLength={15}
          required
        />

        <button type="submit">Registrarse</button>
      </form>

      {message && (
        <p className={`msg ${message.startsWith("❌") ? "error" : ""}`}>
          {message}
        </p>
      )}
    </div>
  );
}
