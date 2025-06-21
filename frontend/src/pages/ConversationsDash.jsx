import { useParams, useNavigate } from "react-router-dom";
import ConversationTable from "../components/ConversationTable";
import "../App.css";
import "./ConversationsDash.css";

export default function Dashboard() {
  const { phoneNumberId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
  <button className="back-dashboard-btn" onClick={() => navigate(-1)}>
  Volver
  </button>

  <div className="dashboard-header">
    <h1>
      CentinAI - Dashboard del bot {phoneNumberId}
    </h1>
  </div>

  <div className="dashboard-content">
    <ConversationTable phoneNumberId={phoneNumberId} />
  </div>
</div>
  );
}
