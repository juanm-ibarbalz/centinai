import React from "react";
import "./Dashboards.css";
import { useNavigate } from "react-router-dom";

const Dashboards = () => {
  const navigate = useNavigate();

  const dashboards = [
    {
      title: "Conversaciones",
      path: "/conversationsDash/105222000222002",
    },
    {
      title: "Dashboard 2",
      path: "/inProgress",
    },
    {
      title: "Dashboard 3",
      path: "/inProgress",
    },
    {
      title: "Dashboard 4",
      path: "/inProgress",
    },
    {
      title: "Dashboard 5",
      path: "/inProgress",
    },
    {
      title: "Dashboard 6",
      path: "/inProgress",
    },
  ];

  return (
    <div className="dashboards-container">
      <h1 className="dashboards-title">📊 Dashboards</h1>
      <div className="dashboards-grid">
        {dashboards.map((dash, index) => (
          <div className="dashboard-card" key={index}>
            <h3 className="card-title">{dash.title}</h3>
            <div className="chart-placeholder">GRAFICO</div>
            <button
              className="details-button"
              onClick={() => navigate(dash.path)}
            >
              DETALLES
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboards;
