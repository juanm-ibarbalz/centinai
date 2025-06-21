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

const dayOptions = [
  { value: 7, label: "Últimos 7 días" },
  { value: 14, label: "Últimos 14 días" },
  { value: 30, label: "Últimos 30 días" },
];

const Dashboards = () => {
  const [selectedDays, setSelectedDays] = useState(7);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { token } = useSessionLoader();

  // Al no pasar agentPhoneNumberId, el hook busca por usuario por defecto.
  const { data, loading } = useMetricData({ source: "mock", token });
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
      {/* Custom Filter Dropdown */}
      <div className="filtro-rango">
        <div
          className="custom-filter-trigger"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          {dayOptions.find((o) => o.value === selectedDays)?.label}
        </div>
        {isFilterOpen && (
          <div className="custom-filter-options">
            {dayOptions.map((option) => (
              <div
                key={option.value}
                className={`custom-filter-option ${
                  selectedDays === option.value ? "selected" : ""
                }`}
                onClick={() => {
                  setSelectedDays(option.value);
                  setIsFilterOpen(false);
                }}
              >
                {selectedDays === option.value && "✓ "}
                {option.label}
              </div>
            ))}
          </div>
        )}
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
          <h3>Session End States</h3>
          <GraficoDonaSessionStatus data={data} days={selectedDays} />
        </div>
        <div className="graph-card">
          <h3>Average Session Duration</h3>
          <AverageDurationChart days={selectedDays} />
        </div>
      </div>
    </div>
  );
};

export default Dashboards;
