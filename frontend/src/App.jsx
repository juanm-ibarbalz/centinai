import './App.css';
import { useEffect, useState } from 'react';

function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/conversations") // Ajustá esta URL si tu backend está en otro puerto
      .then(res => res.json())
      .then(json => setData(json))
      .catch(err => console.error("Error al obtener datos:", err));
  }, []);

  return (
    <div>
      <h1>CentinAI Dashboard</h1>
      <div className="container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Total Msg</th>
              <th>Usuario</th>
              <th>Agente</th>
              <th>Duración (min)</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td>{item.conversationId}</td>
                <td>{item.userName}</td>
                <td>{item.totalMessages}</td>
                <td>{item.userMessages}</td>
                <td>{item.agentMessages}</td>
                <td>{item.durationMinutes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
