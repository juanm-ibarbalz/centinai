import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import "./metric.css";

const COLORS = ["#00e676", "#ff5252"];

export default function GraficoDonaSessionStatus({ data, days }) {
  const formatNumber = (n) => new Intl.NumberFormat("de-DE").format(n);

  const hoy = new Date();
  const limite = new Date(hoy);
  limite.setDate(hoy.getDate() - days);

  const recent = data.filter((d) => {
    const fecha = new Date(d.date);
    return fecha >= limite && fecha <= hoy;
  });

  const totals = recent.reduce(
    (acc, d) => {
      acc.success += d.status?.success ?? 0;
      acc.fail += d.status?.fail ?? 0;
      return acc;
    },
    { success: 0, fail: 0 }
  );

  const totalConversaciones = totals.success + totals.fail;
  const successPct = totalConversaciones
    ? ((totals.success / totalConversaciones) * 100).toFixed(1)
    : 0;
  const failPct = totalConversaciones
    ? ((totals.fail / totalConversaciones) * 100).toFixed(1)
    : 0;

  const chartData = [
    { name: "Exitosas", value: totals.success },
    { name: "Fallidas", value: totals.fail },
  ];

  const delayMap = {
    Success: 0.5,
    Fail: 1.0,
  };

  if (totals.success === 0 && totals.fail === 0) {
    return (
      <div style={{ width: "100%", textAlign: "center", padding: "2rem 0" }}>
        <span style={{ color: "#888" }}>Sin datos para mostrar</span>
      </div>
    );
  }

  return (
    <div
      className="metric-card-plain"
      style={{
        minHeight: 260,
        padding: "1rem 0.5rem",
        overflow: "visible",
        display: "flex",
        flexDirection: window.innerWidth < 600 ? "column" : "row",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div className="donut-graph-flex">
        <div className="donut-graph-chart">
          <motion.div
            key={days}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            whileHover={{ scale: 1.05, transition: { duration: 0.5 } }}
            style={{ width: "100%", height: "100%" }}
          >
            <ResponsiveContainer width="100%" height="100%">
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
                <text
                  x="50%"
                  y="45%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#E0F7FA"
                  style={{ fontSize: "1.4rem", fontWeight: "600" }}
                >
                  {totals.success >= totals.fail
                    ? `${successPct}%`
                    : `${failPct}%`}
                </text>
                <text
                  x="50%"
                  y="57%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={totals.success >= totals.fail ? "#00e676" : "#ff5252"}
                  style={{ fontSize: "1rem", fontWeight: "500" }}
                >
                  {totals.success >= totals.fail ? "Exitosas" : "Fallidas"}
                </text>
                <Tooltip animationDuration={200} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

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
            key={days}
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
