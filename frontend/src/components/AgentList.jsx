import React from "react";
import useIsMobile from "../hooks/useIsMobile";

export default function AgentList({ agents, onViewConversations }) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="mobile-agent-list">
        {agents.map((agent) => (
          <div className="agent-card" key={agent.phoneNumberId}>
            <p><strong>Nombre:</strong> {agent.name}</p>
            <p><strong>Teléfono:</strong> {agent.phoneNumberId}</p>
            <p><strong>Descripción:</strong> {agent.description}</p>
            <button onClick={() => onViewConversations(agent.phoneNumberId)}>
              Ver conversaciones
            </button>
          </div>
        ))}
      </div>
    );
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Nombre del Bot</th>
          <th>Teléfono</th>
          <th>Descripción</th>
          <th>Conversaciones</th>
        </tr>
      </thead>
      <tbody>
        {agents.map((agent) => (
          <tr key={agent._id}>
            <td>{agent.name}</td>
            <td>{agent.phoneNumberId}</td>
            <td>{agent.description}</td>
            <td>
              <button
                className="view-button"
                onClick={() => onViewConversations(agent.phoneNumberId)}
              >
                Ver
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
