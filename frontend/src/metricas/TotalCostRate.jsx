import React from "react";
import "./metric.css";

const TotalCostRate = ({ data, days }) => {
  const costosPorFecha = {};
  data.forEach((item) => {
    const key = item.date; 
    const costo = item.totalCostRate || 0;
    costosPorFecha[key] = (costosPorFecha[key] || 0) + costo;
  });

  const fechas = [];
  const hoy = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const fecha = new Date(hoy);
    fecha.setDate(hoy.getDate() - i);
    const key = fecha.toISOString().slice(0, 10);
    fechas.push(key);
  }

  const costosPorDia = fechas.map((fecha) => costosPorFecha[fecha] || 0);

  const variaciones = [];
  for (let i = 0; i < costosPorDia.length - 1; i++) {
    const anterior = costosPorDia[i];
    const actual = costosPorDia[i + 1];

    if (anterior === 0 && actual > 0) {
      variaciones.push(100);
    } else if (anterior === 0 && actual === 0) {
      variaciones.push(0);
    } else {
      const cambio = ((actual - anterior) / anterior) * 100;
      variaciones.push(cambio);
    }
  }

  const promedio =
    variaciones.reduce((acc, val) => acc + val, 0) / variaciones.length;

  const total = costosPorDia.reduce((acc, val) => acc + val, 0);
  const trendClass = promedio > 0 ? "green" : promedio < 0 ? "red" : "gray";
  const arrow = promedio > 0 ? "↑" : promedio < 0 ? "↓" : "→";
  const formattedDiff = `${arrow} ${Math.abs(promedio).toFixed(1)}% últimos ${days} días`;

  return (
    <div className={`metric-card ${trendClass}`}>
      <h3>Costo Total</h3>
      <p className="value">${total.toFixed(4)}</p>
      <p className={`trend ${trendClass}`}>{formattedDiff}</p>
    </div>
  );
};

export default TotalCostRate;
