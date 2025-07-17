import React from "react";
import "./metric.css";

const Conversaciones = ({ data, days }) => {
  const cantidadPorFecha = {};
  data.forEach((item) => {
    const fecha = item.date;
    cantidadPorFecha[fecha] = (cantidadPorFecha[fecha] || 0) + 1;
  });

  const fechas = [];
  const hoy = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const fecha = new Date(hoy);
    fecha.setDate(hoy.getDate() - i);
    const key = fecha.toISOString().slice(0, 10);
    fechas.push(key);
  }

  const conversacionesPorDia = fechas.map(
    (fecha) => cantidadPorFecha[fecha] || 0
  );

  const variaciones = [];
  for (let i = 0; i < conversacionesPorDia.length - 1; i++) {
    const anterior = conversacionesPorDia[i];
    const actual = conversacionesPorDia[i + 1];

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

  const total = conversacionesPorDia.reduce((acc, val) => acc + val, 0);
  const trendClass = promedio > 0 ? "green" : promedio < 0 ? "red" : "gray";
  const arrow = promedio > 0 ? "↑" : promedio < 0 ? "↓" : "→";
  const formattedDiff = `${arrow} ${Math.abs(promedio).toFixed(1)}% últimos ${days} días`;

  return (
    <div className={`metric-card ${trendClass}`}>
      <h3>Conversaciones</h3>
      <p className="value">{total}</p>
      <p className={`trend ${trendClass}`}>{formattedDiff}</p>
    </div>
  );
};

export default Conversaciones;
