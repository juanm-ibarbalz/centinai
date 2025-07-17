import React, { useState, useEffect } from "react";
import "./Dashboards.css";

import Sesiones from "../metricas/Sesiones";
import Conversaciones from "../metricas/Conversaciones";
import TotalTokens from "../metricas/TotalTokens";
import TotalCostRate from "../metricas/TotalCostRate";
import CostPerSession from "../metricas/CostPerSession";
import GraficoDonaSessionStatus from "../metricas/GraficoDonaSessionStatus";
import AverageDurationChart from "../metricas/AverageDurationChart";

import { useSessionLoader } from "../hooks/useSessionLoader";
import { useMetricData } from "../hooks/useMetricData";
import { API_URL } from "../config";

const dayOptions = [
  { value: 365, label: "Ultimo año" },
  { value: 7, label: "Últimos 7 días" },
  { value: 14, label: "Últimos 14 días" },
  { value: 30, label: "Últimos 30 días" },
];

const Dashboards = () => {
  const [selectedDays, setSelectedDays] = useState(365);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState("");
  const { token } = useSessionLoader();

  const getDateRange = () => {
    if (selectedDays === "all") return { dateFrom: null, dateTo: null };

    const now = new Date();
    const toDate = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        23, 59, 59, 999
      )
    );
    const fromDate = new Date(now);
    fromDate.setDate(now.getDate() - selectedDays + 1);
    const fromDateUTC = new Date(
      Date.UTC(
        fromDate.getUTCFullYear(),
        fromDate.getUTCMonth(),
        fromDate.getUTCDate(),
        0, 0, 0, 0
      )
    );

    return {
      dateFrom: fromDateUTC.toISOString(),
      dateTo: toDate.toISOString(),
    };
  };

  const { dateFrom, dateTo } = getDateRange();

  const { data: filteredData, loading } = useMetricData({
    agentPhoneNumberId: selectedAgent,
    dateFrom,
    dateTo,
    token,
    source: "api",
  });

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await fetch(`${API_URL}/agents`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("No se pudieron cargar los agentes");
        const data = await res.json();
        setAgents(data);
        if (data.length > 0 && !selectedAgent) {
          setSelectedAgent(data[0].phoneNumberId);
        }
      } catch (err) {
        console.error("Error al traer agentes:", err);
      }
    };

    if (token) fetchAgents();
  }, [token]);

  return (
    <div className="dashboards-container" style={{ position: "relative" }}>
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
      <div className="filtro-agente">
        <select
          className="filtro-select"
          value={selectedAgent}
          onChange={(e) => setSelectedAgent(e.target.value)}
        >
          {agents.map((agent) => (
            <option key={agent.phoneNumberId} value={agent.phoneNumberId}>
              {agent.name}
            </option>
          ))}
        </select>
      </div>

      <h1 className="dashboards-title">📊 Dashboard de Métricas
      </h1>

      <div className="metrics-row">
        <Conversaciones data={filteredData} days={selectedDays} />
        <Sesiones data={filteredData} days={selectedDays} />
        <TotalTokens data={filteredData} days={selectedDays} />
        <TotalCostRate data={filteredData} days={selectedDays} />
        <CostPerSession data={filteredData} days={selectedDays} />
      </div>

      <div className="graphs-row">
        <div className="graph-card">
          <h3>Estado de Conversaciones Terminadas</h3>
          <div className="donut-graph-wrapper">
            <GraficoDonaSessionStatus
              data={filteredData}
              days={selectedDays}
            />
          </div>
        </div>
        <div className="graph-card">
          <h3>Duración Promedio de Sesiones Por Día</h3>
          <AverageDurationChart
            data={filteredData}
            days={selectedDays}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboards;
