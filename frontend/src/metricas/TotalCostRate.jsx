import React from "react";
import "./metric.css";

const TotalCostRate = ({ data, days }) => {
  const filtered = data.slice(-days);
  const total = filtered.reduce((sum, row) => sum + row.totalCostRate, 0);

  const first = filtered.at(0)?.totalCostRate ?? 0;
  const last = filtered.at(-1)?.totalCostRate ?? 0;
  const diff = first ? ((last - first) / first) * 100 : 0;

  const trendClass = diff > 0 ? "green" : diff < 0 ? "red" : "gray";
  const arrow = diff > 0 ? "↑" : diff < 0 ? "↓" : "→";
  const formattedDiff = `${arrow} ${Math.abs(diff).toFixed(1)}% últimos ${days} días`;

  return (
    <div className={`metric-card ${trendClass}`}>
      <h3>Costo Total</h3>
      <p className="value">${total.toFixed(2)}</p>
      <p className={`trend ${trendClass}`}>{formattedDiff}</p>
    </div>
  );
};

export default TotalCostRate;
