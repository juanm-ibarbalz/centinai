import { useEffect, useState } from "react";
import ConversationList from "./ConversationList";
import { API_URL } from "../config";

const sortByOptions = [
  { value: "date", label: "Fecha" },
  { value: "duration", label: "Duración" },
  { value: "cost", label: "Costo" },
];
const sortOrderOptions = [
  { value: "desc", label: "Descendente" },
  { value: "asc", label: "Ascendente" },
];
const limitOptions = [10, 20, 50, 100];
const dayOptions = [
  { value: 7, label: "Últimos 7 días" },
  { value: 14, label: "Últimos 14 días" },
  { value: 30, label: "Últimos 30 días" },
  { value: 0, label: "Todos" },
];

const ConversationTable = ({ phoneNumberId }) => {
  const [data, setData] = useState([]);
  const [limit, setLimit] = useState(20);
  const [offset, setOffset] = useState(0);
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedDays, setSelectedDays] = useState(7);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showLoading, setShowLoading] = useState(false);

  const getDateRange = () => {
    if (selectedDays === 0) return { dateFrom: "", dateTo: "" };
    const now = new Date();
    const to = now.toISOString().slice(0, 10);
    const fromDate = new Date(now);
    fromDate.setDate(now.getDate() - selectedDays + 1);
    const from = fromDate.toISOString().slice(0, 10);
    return { dateFrom: from, dateTo: to };
  };
  const { dateFrom, dateTo } = getDateRange();

  useEffect(() => {
    if (!phoneNumberId) return;
    setShowLoading(false);
    const loadingTimeout = setTimeout(() => setShowLoading(true), 300);
    const token = localStorage.getItem("token");
    const params = new URLSearchParams({
      agentPhoneNumberId: phoneNumberId,
      limit,
      offset,
      sortBy,
      sortOrder,
    });
    if (dateFrom) params.append("dateFrom", dateFrom);
    if (dateTo) params.append("dateTo", dateTo);

    fetch(`${API_URL}/conversations?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.conversations) {
          setData(result.conversations);
        } else {
          setData(result);
        }
      })
      .catch((err) => console.error("Error:", err))
      .finally(() => {
        clearTimeout(loadingTimeout);
        setShowLoading(false);
      });
    return () => clearTimeout(loadingTimeout);
  }, [phoneNumberId, limit, offset, sortBy, sortOrder, dateFrom, dateTo]);

  const handlePrev = () => setOffset((o) => Math.max(0, o - limit));
  const handleNext = () => setOffset((o) => o + limit);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>📊 Conversaciones del usuario {phoneNumberId}</h2>
      <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap", marginBottom: 0 }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <div
            className="custom-filter-trigger"
            onClick={() => setIsFilterOpen((v) => !v)}
            tabIndex={0}
          >
            {dayOptions.find((o) => o.value === selectedDays)?.label}
          </div>
          {isFilterOpen && (
            <div className="custom-filter-options">
              {dayOptions.map((option) => (
                <div
                  key={option.value}
                  className={`custom-filter-option ${selectedDays === option.value ? "selected" : ""}`}
                  onClick={() => {
                    setSelectedDays(option.value);
                    setIsFilterOpen(false);
                    setOffset(0);
                  }}
                >
                  {selectedDays === option.value && "✓ "}
                  {option.label}
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <label>Mostrar: </label>
          <select className="filtro-select" value={limit} onChange={e => { setLimit(Number(e.target.value)); setOffset(0); }}>
            {limitOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        <div>
          <label>Ordenar por: </label>
          <select className="filtro-select" value={sortBy} onChange={e => { setSortBy(e.target.value); setOffset(0); }}>
            {sortByOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
        <div>
          <label>Orden: </label>
          <select className="filtro-select" value={sortOrder} onChange={e => { setSortOrder(e.target.value); setOffset(0); }}>
            {sortOrderOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
      </div>
      {showLoading ? (
        <p style={{ color: "#B0BEC5", textAlign: "center" }}>Cargando...</p>
      ) : data.length > 0 ? (
        <>
          <ConversationList conversations={data} />
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 28, marginBottom: 8 }}>
            <button className="paginado-btn" onClick={handlePrev} disabled={offset === 0}>Anterior</button>
            <span style={{ minWidth: 60, textAlign: "center" }}>Página {Math.floor(offset / limit) + 1}</span>
            <button className="paginado-btn" onClick={handleNext} disabled={data.length < limit}>Siguiente</button>
          </div>
        </>
      ) : (
        <p style={{ color: "#B0BEC5", textAlign: "center" }}>
          Este bot aún no tiene conversaciones registradas.
        </p>
      )}
    </div>
  );
};

export default ConversationTable;
