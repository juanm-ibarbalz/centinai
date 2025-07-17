import React from "react";
import "./metric.css";

const Sesiones = ({ data, days }) => {
  const sesionesPorFecha = {};
  data.forEach((item) => {
    const key = item.date; 
    const sesiones = item.sesiones || 0;
    sesionesPorFecha[key] = (sesionesPorFecha[key] || 0) + sesiones;
  });

  const fechas = [];
  const hoy = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const fecha = new Date(hoy);
    fecha.setDate(hoy.getDate() - i);
    const key = fecha.toISOString().slice(0, 10);
    fechas.push(key);
  }

  const sesionesPorDia = fechas.map((fecha) => sesionesPorFecha[fecha] || 0);

  const variaciones = [];
  for (let i = 0; i < sesionesPorDia.length - 1; i++) {
    const anterior = sesionesPorDia[i];
    const actual = sesionesPorDia[i + 1];

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

  const total = sesionesPorDia.reduce((acc, val) => acc + val, 0);
  const trendClass = promedio > 0 ? "green" : promedio < 0 ? "red" : "gray";
  const arrow = promedio > 0 ? "↑" : promedio < 0 ? "↓" : "→";
  const formattedDiff = `${arrow} ${Math.abs(promedio).toFixed(1)}% últimos ${days} días`;

  return (
    <div className={`metric-card ${trendClass}`}>
      <h3>Mensajes Totales</h3>
      <p className="value">{total}</p>
      <p className={`trend ${trendClass}`}>{formattedDiff}</p>
    </div>
  );
};

export default Sesiones;
