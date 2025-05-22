import { useParams, useNavigate } from "react-router-dom";
import ConversationTable from "../components/ConversationTable";
import "../App.css";
import "./Dashboard.css";

export default function Dashboard() {
const { phoneNumberId } = useParams();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

return (
  <div className="dashboard-container">
    <div style={{ display: "flex", justifyContent: "space-between", padding: "1rem" }}>
      <button onClick={() => navigate("/home")} className="go-back-button">
        Volver al Home
      </button>

      <button onClick={handleLogout} className="logout-button">
        Cerrar sesión
      </button>
    </div>

    <div className="dashboard-header">
      <h1>
        <span role="img" aria-label="dashboard">📊</span> CentinAI - Dashboard del bot {phoneNumberId}
      </h1>
    </div>

    <div className="dashboard-content">
      <ConversationTable phoneNumberId={phoneNumberId} />
    </div>
  </div>
);
}
