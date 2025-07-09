import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import "./metric.css";

const formatSeconds = (sec) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${s < 10 ? "0" : ""}${s}s`;
};

export default function AverageDurationChart({ data, days = 30 }) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="metric-card-plain" style={{ padding: "2rem", textAlign: "center" }}>
        <p style={{ color: "#aaa" }}>Sin datos suficientes para calcular duración promedio</p>
      </div>
    );
  }

  const today = new Date();
  const dateList = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10); 
    dateList.push(key);
  }

  const agrupado = {};
  data.forEach((item) => {
    const fecha = item.date;
    const duracion = item.avgDurationSeconds;
    if (fecha && typeof duracion === "number") {
      if (!agrupado[fecha]) agrupado[fecha] = [];
      agrupado[fecha].push(duracion);
    }
  });

  const final = dateList.map((fecha) => {
    const valores = agrupado[fecha] || [];
    const promedio =
      valores.length > 0
        ? valores.reduce((sum, val) => sum + val, 0) / valores.length
        : 0;
    return {
      date: fecha.slice(5), 
      avgDuration: promedio,
    };
  });

  return (
    <div className="metric-card-plain" style={{ height: 300, padding: "1rem 2rem" }}>
      <ResponsiveContainer width="100%" height="80%">
        <AreaChart data={final} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="durationGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7C4DFF" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#7C4DFF" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid stroke="#333" strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fill: "#E0F7FA", fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "#444" }}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={formatSeconds}
            tick={{ fill: "#E0F7FA", fontSize: 12 }}
            axisLine={{ stroke: "#444" }}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            formatter={(value) => formatSeconds(value)}
            labelFormatter={(label) => `Fecha: ${label}`}
            contentStyle={{ backgroundColor: "#0B0E23", border: "none" }}
            itemStyle={{ color: "#7C4DFF" }}
          />

          <Area
            type="monotone"
            dataKey="avgDuration"
            stroke="#7C4DFF"
            strokeWidth={3}
            fill="url(#durationGradient)"
            dot={{ r: 4, fill: "#7C4DFF", strokeWidth: 0 }}
            activeDot={{ r: 6 }}
            isAnimationActive={false}
          />

          <Area
            type="monotone"
            dataKey="avgDuration"
            stroke="#7C4DFF"
            strokeWidth={3}
            fill="none"
            dot={false}
            isAnimationActive={false}
            className="snake-line"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
