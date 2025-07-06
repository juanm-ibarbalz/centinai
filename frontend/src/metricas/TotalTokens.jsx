import React from "react";
import "./metric.css";

const TotalTokens = ({ data, days }) => {
  // Paso 1: agrupar tokens por fecha usando item.date
  const tokensPorFecha = {};
  data.forEach((item) => {
    const key = item.date; // ya viene como "YYYY-MM-DD"
    const tokens = item.totalTokens || 0;
    tokensPorFecha[key] = (tokensPorFecha[key] || 0) + tokens;
  });

  // Paso 2: generar lista de fechas desde hoy hacia atrás
  const fechas = [];
  const hoy = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const fecha = new Date(hoy);
    fecha.setDate(hoy.getDate() - i);
    const key = fecha.toISOString().slice(0, 10);
    fechas.push(key);
  }

  // Paso 3: obtener los tokens por día
  const tokensPorDia = fechas.map((fecha) => tokensPorFecha[fecha] || 0);

  // Paso 4: calcular variaciones porcentuales entre días consecutivos
  const variaciones = [];
  for (let i = 0; i < tokensPorDia.length - 1; i++) {
    const anterior = tokensPorDia[i];
    const actual = tokensPorDia[i + 1];

    if (anterior === 0 && actual > 0) {
      variaciones.push(100);
    } else if (anterior === 0 && actual === 0) {
      variaciones.push(0);
    } else {
      const cambio = ((actual - anterior) / anterior) * 100;
      variaciones.push(cambio);
    }
  }

  // Paso 5: promedio de las variaciones
  const promedio =
    variaciones.reduce((acc, val) => acc + val, 0) / variaciones.length;

  const total = tokensPorDia.reduce((acc, val) => acc + val, 0);
  const trendClass = promedio > 0 ? "green" : promedio < 0 ? "red" : "gray";
  const arrow = promedio > 0 ? "↑" : promedio < 0 ? "↓" : "→";
  const formattedDiff = `${arrow} ${Math.abs(promedio).toFixed(1)}% últimos ${days} días`;

  return (
    <div className={`metric-card ${trendClass}`}>
      <h3>Tokens Totales</h3>
      <p className="value">{total.toLocaleString("es-AR")}</p>
      <p className={`trend ${trendClass}`}>{formattedDiff}</p>
    </div>
  );
};

export default TotalTokens;
