import { useEffect, useState } from "react";
import DATAPRUEBA from "../data/DATAPRUEBA";
import { API_URL } from "../config";

/**
 * Hook para obtener métricas desde la API o desde mock.
 * @param {Object} params
 * @param {string} [params.agentPhoneNumberId] - ID del agente (teléfono).
 * @param {string} [params.conversationId] - ID de la conversación.
 * @param {string} [params.dateFrom] - Fecha ISO de inicio (opcional).
 * @param {string} [params.dateTo] - Fecha ISO de fin (opcional).
 * @param {string} params.token - JWT para autenticación.
 * @param {string} [params.source="mock"] - "mock" o "api"
 * @returns {{ data: Array, loading: boolean }}
 */
export function useMetricData({
  agentPhoneNumberId,
  conversationId,
  dateFrom,
  dateTo,
  token,
  source = "mock",
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

      let url = `${API_URL}/metrics`;

      if (conversationId) {
        url = `${API_URL}/metrics/${encodeURIComponent(conversationId)}`;
      } else if (agentPhoneNumberId) {
        const params = new URLSearchParams();
        params.append("agentPhoneNumberId", agentPhoneNumberId);
        if (dateFrom) params.append("dateFrom", dateFrom);
        if (dateTo) params.append("dateTo", dateTo);
        url = `${API_URL}/metrics?${params.toString()}`;
      } else {
        url = `${API_URL}/metrics/all`;
      }

      console.log("📡 Fetching from:", url);

      fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return res.json();
        })
        .then((apiData) => {
          console.log("📦 Respuesta cruda del backend:", apiData);
          const metricsArray = Array.isArray(apiData) ? apiData : [apiData];

          const adapted = metricsArray.map((metric) => ({
            date: metric.createdAt?.slice(0, 10) ?? "",
            sesiones: 1,
            conversaciones: 1,
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
        })
        .catch((err) => {
          console.error("❌ Error fetching metrics:", err);
          setData([]);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [agentPhoneNumberId, conversationId, dateFrom, dateTo, token, source]);

  return { data, loading };
}
