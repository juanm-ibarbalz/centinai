// src/metricas/AverageDurationChart.jsx
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
import DATAPRUEBA from "../data/DATAPRUEBA";
import "./metric.css";

const formatSeconds = (sec) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${s < 10 ? "0" : ""}${s}s`;
};

export default function AverageDurationChart({ data, days = 30}) {
  const numbers = data.slice(-days).map((d) => ({
    date: d.date.slice(5),
    avgDuration: d.avgDurationSeconds,
  }));

  return (
    <div className="metric-card-plain" style={{ height: 300, padding: "1rem 2rem" }}>
      <h3 style={{ marginBottom: "1rem" }}>Average Session Duration</h3>
      <ResponsiveContainer width="100%" height="80%">
        <AreaChart data={numbers} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          {/* Dégradé */}
          <defs>
            <linearGradient id="durationGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7C4DFF" stopOpacity={0.4}/>
              <stop offset="100%" stopColor="#7C4DFF" stopOpacity={0}/>
            </linearGradient>
          </defs>

          <CartesianGrid stroke="#333" strokeDasharray="3 3"/>
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
            labelFormatter={(label) => `Date: ${label}`}
            contentStyle={{ backgroundColor: "#0B0E23", border: "none" }}
            itemStyle={{ color: "#7C4DFF" }}
          />

          {/* 1) Línea base + degradado + puntos */}
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

          {/* 2) Overlay “serpiente” que recorre en bucle */}
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
