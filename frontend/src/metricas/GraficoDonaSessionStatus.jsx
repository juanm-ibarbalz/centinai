// metricas/GraficoDonaSessionStatus.jsx
import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import "./metric.css";

const COLORS = ["#00e676", "#ff5252", "#FFCA28"]; // Success, Fail, Indeterminate

export default function GraficoDonaSessionStatus({ data, days }) {
  const formatNumber = (n) => new Intl.NumberFormat("de-DE").format(n);
  const recent = data.slice(-days);
  const totals = recent.reduce(
    (acc, d) => {
      acc.success += d.status.success;
      acc.fail += d.status.fail;
      acc.indeterminate += d.status.indeterminate;
      return acc;
    },
    { success: 0, fail: 0, indeterminate: 0 }
  );

  const chartData = [
    { name: "Success", value: totals.success },
    { name: "Fail", value: totals.fail },
    { name: "Indeterminate", value: totals.indeterminate },
  ];

  // asigna el orden de aparición: Success → Indeterminate → Fail
  const delayMap = {
    Success: 0.5,
    Indeterminate: 1.0,
    Fail: 1.5,
  };

  return (
    <div
      className="metric-card-plain"
      style={{ height: 300, padding: "1rem 2rem", overflow: "visible" }}
    >
      <h3 style={{ marginBottom: "1rem" }}>Session End States</h3>
      <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
        <div style={{ flex: 1 }}>
          <motion.div
            key={days}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            whileHover={{ scale: 1.05, transition: { duration: 0.5 } }}
            style={{ width: "100%", height: "100%" }}
          >
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  key={days}
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  isAnimationActive
                  animationDuration={2000}
                  animationEasing="ease-out"
                  labelLine
                  label={({
                    value,
                    cx,
                    cy,
                    midAngle,
                    outerRadius,
                    payload,
                  }) => {
                    const RAD = Math.PI / 180;
                    const r = outerRadius + 30;
                    const x = cx + r * Math.cos(-midAngle * RAD);
                    const y = cy + r * Math.sin(-midAngle * RAD);
                    const delay = delayMap[payload.name] || 0;
                    const color =
                      COLORS[
                        chartData.findIndex((c) => c.name === payload.name)
                      ];
                    return (
                      <motion.text
                        x={x}
                        y={y}
                        fill={color}
                        textAnchor={x > cx ? "start" : "end"}
                        dominantBaseline="central"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay, duration: 0.5 }}
                        style={{ fontWeight: "bold", fontSize: "1rem" }}
                      >
                        {formatNumber(value)}
                      </motion.text>
                    );
                  }}
                  fill="none"
                  stroke="none"
                >
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} className="pie-slice" />
                  ))}
                </Pie>
                <Tooltip animationDuration={200} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Leyenda */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 2.2, duration: 1 }}
          style={{
            display: "flex",
            flexDirection: "column",
            marginLeft: "2rem",
            gap: "0.75rem",
          }}
        >
          <motion.div
            key={days} // ← aquí forzamos remount
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 2.2, duration: 1 }}
            style={{
              display: "flex",
              flexDirection: "column",
              marginLeft: "2rem",
              gap: "0.75rem",
            }}
          >
            {chartData.map((item, idx) => (
              <div
                key={idx}
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    backgroundColor: COLORS[idx],
                  }}
                />
                <motion.span
                  key={days + "-" + item.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    delay: delayMap[item.name] + 0.3,
                    duration: 0.5,
                  }}
                  style={{
                    fontSize: "1rem",
                    color: COLORS[idx],
                    fontWeight: 500,
                  }}
                >
                  {item.name}
                </motion.span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
