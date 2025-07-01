import React, { useEffect, useState } from "react";
import "./configuracion.css";
import { API_URL } from "../config";

const Configuracion = () => {
  const [userData, setUserData] = useState({ name: "", email: "" });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUserData({
        name: storedUser.name || "",
        email: storedUser.email || "",
      });
    }
  }, []);
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    const storedUser = JSON.parse(localStorage.getItem("user"));

    const updates = {};
    if (userData.name && userData.name !== storedUser.name) {
      updates.name = userData.name;
    }
    if (userData.email && userData.email !== storedUser.email) {
      updates.email = userData.email;
    }

    if (Object.keys(updates).length === 0) {
      setErrorMsg("⚠️ No hiciste ningún cambio.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/users/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error al actualizar perfil.");
      }

      setSuccessMsg("✅ Perfil actualizado correctamente.");
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("user-updated"));
      setTimeout(() => setSuccessMsg(""), 1500);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await fetch(`${API_URL}/users/me/password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (res.status === 401) {
        setErrorMsg("❌ La contraseña actual es incorrecta.");
        return;
      }

      if (!res.ok) {
        throw new Error(data.message || "Error al cambiar contraseña.");
      }

      setSuccessMsg("✅ Contraseña actualizada correctamente.");
      setCurrentPassword("");
      setNewPassword("");

      setTimeout(() => {
        setSuccessMsg("");
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="config-container">
      <h2>Configuración de Usuario</h2>
      {successMsg && <div className="success-msg">{successMsg}</div>}
      {errorMsg && <div className="error-msg">{errorMsg}</div>}

      <form onSubmit={handleProfileUpdate} className="config-form">
        <label>Nombre:</label>
        <input
          type="text"
          value={userData.name}
          maxLength={20}
          onChange={(e) => setUserData({ ...userData, name: e.target.value })}
        />

        <label>Email:</label>
        <input
          type="email"
          value={userData.email}
          maxLength={30}
          onChange={(e) => setUserData({ ...userData, email: e.target.value })}
        />

        <button type="submit">Guardar cambios</button>
      </form>

      <hr />

      <form onSubmit={handlePasswordUpdate} className="config-form">
        <label>Contraseña actual:</label>
        <input
          type="password"
          value={currentPassword}
          maxLength={15}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />

        <label>Nueva contraseña:</label>
        <input
          type="password"
          value={newPassword}
          maxLength={15}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <button type="submit">Cambiar contraseña</button>
      </form>
      {successMsg && (
        <div className="success-overlay">
          <div className="success-box">
            <p>{successMsg}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Configuracion;
