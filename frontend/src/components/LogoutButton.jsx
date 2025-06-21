import { createPortal } from "react-dom";

export default function LogoutButton({ onClick }) {
  return createPortal(
    <button className="logout-button" onClick={onClick}>
      Cerrar sesión
    </button>,
    document.body
  );
}
