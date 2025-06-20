import { useEffect, useState } from "react";
import DATAPRUEBA from "../data/DATAPRUEBA";

/**
 * Hook to fetch metrics data, either from mock data or from the backend API.
 * @param {Object} params
 * @param {string} params.agentPhoneNumberId - The agent's phone number ID (required for API fetch).
 * @param {string} params.source - "mock" (default) or "api".
 * @param {string} params.token - JWT token for API fetch.
 * @returns {{ data: Array, loading: boolean }}
 */
export function useMetricData({ agentPhoneNumberId, source = "mock", token }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  console.log("Lo recibido para metrics: ", agentPhoneNumberId, source, token);

  useEffect(() => {
    if (source === "mock") {
      setData(DATAPRUEBA);
      setLoading(false);
    } else if (source === "api" && agentPhoneNumberId && token) {
      setLoading(true);
      console.log("Intentando fetch con:", {
        agentPhoneNumberId,
        token,
        source,
      });
      fetch(
        `${
          import.meta.env.VITE_API_URL
        }/metrics?agentPhoneNumberId=${agentPhoneNumberId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
        .then((res) => res.json())
        .then((apiData) => {
          console.log("API metrics data:", apiData);
          // Adapt backend Metric format to frontend metric card format
          const adapted = apiData.map((metric) => ({
            date: metric.createdAt?.slice(0, 10) ?? "",
            sesiones: 1, // Each metric is a session
            conversaciones: 1, // Or sum if you group
            totalTokens: metric.tokenUsage?.totalTokens ?? 0,
            totalCostRate: metric.tokenUsage?.cost ?? 0,
            costPerSession: metric.tokenUsage?.cost ?? 0,
            status: {
              success: metric.successful ? 1 : 0,
              fail: metric.successful === false ? 1 : 0,
              indeterminate: metric.successful == null ? 1 : 0,
            },
            avgDurationSeconds: metric.durationSeconds ?? 0,
          }));
          setData(adapted);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching metrics:", err);
          setLoading(false);
        });
    }
  }, [agentPhoneNumberId, source, token]);

  return { data, loading };
}
