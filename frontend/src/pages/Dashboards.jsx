import React, { useState } from "react";
import "./Dashboards.css";

// Importa data y componentes de métricas
import DATAPRUEBA from "../data/DATAPRUEBA";
import Sesiones from "../metricas/Sesiones";
import Conversaciones from "../metricas/Conversaciones";
import TotalTokens from "../metricas/TotalTokens";
import TotalCostRate from "../metricas/TotalCostRate";
import CostPerSession from "../metricas/CostPerSession";

const Dashboards = () => {
  const [selectedDays, setSelectedDays] = useState(7); // default: 7 días
  const graphCards = ["Daily Session Volume", "Costo total por LLM"];

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
        <Sesiones data={DATAPRUEBA} days={selectedDays} />
        <Conversaciones data={DATAPRUEBA} days={selectedDays} />
        <TotalTokens data={DATAPRUEBA} days={selectedDays} />
        <TotalCostRate data={DATAPRUEBA} days={selectedDays} />
        <CostPerSession data={DATAPRUEBA} days={selectedDays} />
      </div>

      {/* Gráficas (inferior) */}
      <div className="graphs-row">
        {graphCards.map((title, i) => (
          <div className="graph-card" key={i}>
            <h3>{title}</h3>
            <div className="graph-placeholder">GRAFICO</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboards;
