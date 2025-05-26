import { useParams, useNavigate } from "react-router-dom";
import ConversationTable from "../components/ConversationTable";
import "../App.css";
import "./ConversationsDash.css";

export default function Dashboard() {
const { phoneNumberId } = useParams();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    if (window.Android?.logoutToken) {
      window.Android.logoutToken();
    }
    navigate("/login");
  };  

return (
  <div className="dashboard-container">
    <div style={{ display: "flex", justifyContent: "space-between", padding: "1rem" }}>

    <LogoutButton onClick={handleLogout} />
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
