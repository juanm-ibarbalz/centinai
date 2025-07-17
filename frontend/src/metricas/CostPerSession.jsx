import React from "react";
import "./metric.css";

const CostPerSession = ({ data, days }) => {
  const acumuladoPorFecha = {};
  data.forEach((item) => {
    const fecha = item.date;
    const cost = item.totalCostRate || 0;
    const sesiones = item.sesiones || 0;

    if (!acumuladoPorFecha[fecha]) {
      acumuladoPorFecha[fecha] = { total: 0, sesiones: 0 };
    }

    acumuladoPorFecha[fecha].total += cost;
    acumuladoPorFecha[fecha].sesiones += sesiones;
  });

  const fechas = [];
  const hoy = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const fecha = new Date(hoy);
    fecha.setDate(hoy.getDate() - i);
    const key = fecha.toISOString().slice(0, 10);
    fechas.push(key);
  }

  const costPorDia = fechas.map((fecha) => {
    const { total = 0, sesiones = 0 } = acumuladoPorFecha[fecha] || {};
    return sesiones > 0 ? total / sesiones : 0;
  });

  const variaciones = [];
  for (let i = 0; i < costPorDia.length - 1; i++) {
    const anterior = costPorDia[i];
    const actual = costPorDia[i + 1];

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

  const total = costPorDia.reduce((acc, val) => acc + val, 0);
  const average = costPorDia.length ? total / costPorDia.length : 0;

  const trendClass = promedio > 0 ? "green" : promedio < 0 ? "red" : "gray";
  const arrow = promedio > 0 ? "↑" : promedio < 0 ? "↓" : "→";
  const formattedDiff = `${arrow} ${Math.abs(promedio).toFixed(1)}% últimos ${days} días`;

  return (
    <div className={`metric-card ${trendClass}`}>
      <h3>Costo / Sesión</h3>
      <p className="value">${average.toFixed(7)}</p>
      <p className={`trend ${trendClass}`}>{formattedDiff}</p>
    </div>
  );
};

export default CostPerSession;
