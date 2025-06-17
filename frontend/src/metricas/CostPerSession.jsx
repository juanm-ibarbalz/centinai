import React from "react";
import "./metric.css";

const CostPerSession = ({ data, days }) => {
  const filtered = data.slice(-days);
  const total = filtered.reduce((sum, row) => sum + row.costPerSession, 0);
  const average = total / filtered.length;

  const first = filtered.at(0)?.costPerSession ?? 0;
  const last = filtered.at(-1)?.costPerSession ?? 0;
  const diff = first ? ((last - first) / first) * 100 : 0;

  const trendClass = diff > 0 ? "green" : diff < 0 ? "red" : "gray";
  const arrow = diff > 0 ? "↑" : diff < 0 ? "↓" : "→";
  const formattedDiff = `${arrow} ${Math.abs(diff).toFixed(1)}% últimos ${days} días`;

  return (
    <div className={`metric-card ${trendClass}`}>
      <h3>Cost / Session</h3>
      <p className="value">${average.toFixed(4)}</p>
      <p className={`trend ${trendClass}`}>{formattedDiff}</p>
    </div>
  );
};

export default CostPerSession;
