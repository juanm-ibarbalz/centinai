import './App.css';
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from "./pages/Login";
import Register from "./pages/Register";
import Auth from './pages/Auth';

function Dashboard() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3001/api/conversations")
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

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Auth />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
