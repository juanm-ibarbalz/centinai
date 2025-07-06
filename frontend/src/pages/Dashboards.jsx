import React, { useState, useEffect } from "react";
import "./Dashboards.css";

import Sesiones from "../metricas/Sesiones";
import Conversaciones from "../metricas/Conversaciones";
import TotalTokens from "../metricas/TotalTokens";
import TotalCostRate from "../metricas/TotalCostRate";
import CostPerSession from "../metricas/CostPerSession";
import GraficoDonaSessionStatus from "../metricas/GraficoDonaSessionStatus";
import AverageDurationChart from "../metricas/AverageDurationChart";

import { API_URL } from "../config";
import { useSessionLoader } from "../hooks/useSessionLoader";

const dayOptions = [
  { value: 7, label: "Últimos 7 días" },
  { value: 14, label: "Últimos 14 días" },
  { value: 30, label: "Últimos 30 días" },
];

// 🔄 Función para transformar las métricas al formato necesario
const transformMetrics = (data) =>
  data.map((d) => ({
    sesiones: d.messageCount?.total ?? 0,
    conversaciones: 1,
    totalTokens: d.tokenUsage?.totalTokens ?? 0,
    totalCostRate: d.tokenUsage?.cost ?? 0,
    costPerSession:
      d.tokenUsage?.cost && d.messageCount?.total
        ? d.tokenUsage.cost / d.messageCount.total
        : 0,
    avgDurationSeconds: d.durationSeconds ?? 0,
    status: {
      success: d.successful ? 1 : 0,
      fail: d.successful ? 0 : 1,
    },
    date: d.endTime?.slice(0, 10) ?? d.createdAt?.slice(0, 10),
    endTime: d.endTime,
    createdAt: d.createdAt,
  }));

const Dashboards = () => {
  const [selectedDays, setSelectedDays] = useState(7);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);

  const { token } = useSessionLoader();

  const getDateRange = () => {
    const now = new Date();
    const toDate = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        23,
        59,
        59,
        999
      )
    );
    const to = toDate.toISOString();

    const fromDate = new Date(now);
    fromDate.setDate(now.getDate() - selectedDays + 1);
    const fromDateUTC = new Date(
      Date.UTC(
        fromDate.getUTCFullYear(),
        fromDate.getUTCMonth(),
        fromDate.getUTCDate(),
        0,
        0,
        0,
        0
      )
    );
    const from = fromDateUTC.toISOString();

    return { dateFrom: from, dateTo: to };
  };

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/metrics/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Error al obtener métricas");

        const json = await res.json();
        setAllData(json);
        console.log("📊 Datos métricas completos:", json);
      } catch (err) {
        console.error("❌ Error al cargar métricas:", err);
        setAllData([]);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchMetrics();
  }, [token]);

  useEffect(() => {
    const { dateFrom, dateTo } = getDateRange();
    console.log("📆 dateFrom:", dateFrom);
    console.log("📆 dateTo:", dateTo);

    const from = new Date(dateFrom);
    const to = new Date(dateTo);

    const filtered = allData.filter((m) => {
      const refDate = m.endTime ? new Date(m.endTime) : new Date(m.createdAt);
      return refDate >= from && refDate <= to;
    });

    console.log("🔎 Filtro aplicado. Datos resultantes:", filtered);

    const transformed = transformMetrics(filtered);
    setFilteredData(transformed);
  }, [allData, selectedDays]);

  if (!loading && (!filteredData || filteredData.length === 0)) {
    return (
      <div style={{ color: "red", textAlign: "center", marginTop: "2rem" }}>
        No encontramos métricas para este agente.
      </div>
    );
  }

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

      <h1 className="dashboards-title">📊 Dashboard de Métricas</h1>

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
            <GraficoDonaSessionStatus data={filteredData} days={selectedDays} />
          </div>
        </div>
        <div className="graph-card">
          <h3>Duración Promedio de Sesiones Por Día</h3>
          <AverageDurationChart data={filteredData} days={selectedDays} />
        </div>
      </div>
    </div>
  );
};

export default Dashboards;
