import "./App.css";
import "./components/MenuHamburguesa.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Register from "./pages/Register";
import Dashboard from "./pages/ConversationsDash";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import HamburgerMenu from "./components/MenuHamburguesa";
import Dashboards from "./pages/Dashboards";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

// 👇 Envolvemos App en un componente que puede usar hooks
function AppWrapper() {
  const location = useLocation();
  const navigate = useNavigate();

  const hiddenRoutes = ["/login", "/register"];
  const showMenu = !hiddenRoutes.includes(location.pathname);

  return (
    <>
      {showMenu && <HamburgerMenu onNavigate={navigate} />}{" "}
      {/* 👈 Menú persistente */}
      <Routes>
        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Auth />} />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboards"
          element={
            <ProtectedRoute>
              <Dashboards />
            </ProtectedRoute>
          }
        />

        <Route
          path="/conversationsDash/:phoneNumberId"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        

        {/* Redirección automática de raíz a login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Catch-all para rutas inexistentes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

// 👇 App principal con Router
function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;
