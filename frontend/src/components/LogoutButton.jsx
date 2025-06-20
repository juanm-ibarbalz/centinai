import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleClick = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return createPortal(
    <button className="logout-button" onClick={handleClick}>
      Cerrar sesión
    </button>,
    document.body
  );
}
