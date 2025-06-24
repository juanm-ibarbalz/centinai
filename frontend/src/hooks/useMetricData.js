import { useEffect, useState } from "react";
import DATAPRUEBA from "../data/DATAPRUEBA";

/**
 * Hook to fetch metrics data, either from mock data or from the backend API.
 * Fetches by user, agent, or conversation based on provided IDs.
 * @param {Object} params
 * @param {string} [params.agentPhoneNumberId] - The agent's phone number ID.
 * @param {string} [params.conversationId] - The conversation ID.
 * @param {string} params.source - "mock" (default) or "api".
 * @param {string} params.token - JWT token for API fetch.
 * @returns {{ data: Array, loading: boolean }}
 */
export function useMetricData({
  agentPhoneNumberId,
  conversationId,
  source = "mock",
  token,
}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (source === "mock") {
      setData(DATAPRUEBA);
      setLoading(false);
      return;
    }

    if (source === "api" && token) {
      setLoading(true);

      let url;
      if (conversationId) {
        url = `${import.meta.env.VITE_API_URL}/metrics/${encodeURIComponent(
          conversationId
        )}`;
      } else if (agentPhoneNumberId) {
        url = `${
          import.meta.env.VITE_API_URL
        }/metrics?agentPhoneNumberId=${encodeURIComponent(agentPhoneNumberId)}`;
      } else {
        url = `${import.meta.env.VITE_API_URL}/metrics/all`;
      }

      fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return res.json();
        })
        .then((apiData) => {
          // Ensure apiData is always an array for consistent processing
          const metricsArray = Array.isArray(apiData) ? apiData : [apiData];

          const adapted = metricsArray.map((metric) => ({
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
          setData([]); // Clear data on error
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [agentPhoneNumberId, conversationId, source, token]);

  return { data, loading };
}
