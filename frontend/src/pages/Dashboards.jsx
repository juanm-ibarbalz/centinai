import React, { useState } from "react";
import "./Dashboards.css";

// Importa data y componentes de métricas
import Sesiones from "../metricas/Sesiones";
import Conversaciones from "../metricas/Conversaciones";
import TotalTokens from "../metricas/TotalTokens";
import TotalCostRate from "../metricas/TotalCostRate";
import CostPerSession from "../metricas/CostPerSession";
import GraficoDonaSessionStatus from "../metricas/GraficoDonaSessionStatus";
import AverageDurationChart from "../metricas/AverageDurationChart";

import { useMetricData } from "../hooks/useMetricData";
import { useSessionLoader } from "../hooks/useSessionLoader";

const Dashboards = () => {
  const [selectedDays, setSelectedDays] = useState(7); // default: 7 días
  const graphCards = ["Daily Session Volume", "Costo total por LLM"];

  const { user, token } = useSessionLoader();
  const agentPhoneNumberId = user?.agentPhoneNumberId; // o como corresponda

  const { data, loading } = useMetricData({ agentPhoneNumberId, source: "api", token });
  console.log("Datos métricas adaptados:", data, "loading:", loading);

  if (!loading && (!data || data.length === 0)) {
    return (
      <div style={{ color: "red", textAlign: "center", marginTop: "2rem" }}>
        No encontramos métricas para este agente.
      </div>
    );
  }

  return (
    <div className="dashboards-container" style={{ position: "relative" }}>
      {/* Botón de filtro */}
      <div className="filtro-rango">
        <select
          value={selectedDays}
          onChange={(e) => setSelectedDays(Number(e.target.value))}
        >
          <option value={7}>Últimos 7 días</option>
          <option value={14}>Últimos 14 días</option>
          <option value={30}>Últimos 30 días</option>
        </select>
      </div>

      <h1 className="dashboards-title">📊 Dashboard de Métricas</h1>

      {/* Métricas (superior) */}
      <div className="metrics-row">
        <Sesiones data={data} days={selectedDays} />
        <Conversaciones data={data} days={selectedDays} />
        <TotalTokens data={data} days={selectedDays} />
        <TotalCostRate data={data} days={selectedDays} />
        <CostPerSession data={data} days={selectedDays} />
      </div>

      {/* Gráficas (inferior) */}
      <div className="graphs-row">
        <div className="graph-card">
          <GraficoDonaSessionStatus data={data} days={selectedDays} />
        </div>
        <div className="graph-card">
          <AverageDurationChart days={selectedDays} />
        </div>
      </div>
    </div>
  );
};

export default Dashboards;
