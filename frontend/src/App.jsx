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

import DashboardPage from "./pages/ConversationsDash";
import AuthPage from "./pages/Auth";
import HomePage from "./pages/Home";
import HamburgerMenu from "./components/MenuHamburguesa";
import DashboardsPage from "./pages/Dashboards";
import CreateAgent from "./pages/CreateAgent";
import Mensajes from "./pages/Mensajes";
import MyAgentsPage from "./pages/MyAgent";
import Configuracion from "./pages/configuracion";
import { useSessionLoader } from "./hooks/useSessionLoader";
import { useEffect } from "react";

function ProtectedRoute({ isAuthenticated, children }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function PublicRouteOnly({ isAuthenticated, children }) {
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }
  return children;
}

function AppWrapper() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    user,
    isAuthenticated,
    isLoading: isSessionLoading,
    clearSession,
    setupSession,
    setError: setAuthError,
    error: authError,
  } = useSessionLoader();

  useEffect(() => {
    if (location.pathname === "/home") {
      document.body.classList.add("home-background");
    } else {
      document.body.classList.remove("home-background");
    }
    return () => {
      document.body.classList.remove("home-background");
    };
  }, [location.pathname]);

  const hiddenMenuRoutes = ["/login", "/register"];
  const showMenu =
    !hiddenMenuRoutes.includes(location.pathname) && isAuthenticated;

  const sidebarWidth = showMenu ? "50px" : "0px";
  const sidebarWidthDesktop = showMenu ? "220px" : "0px";

  const handleLogout = () => {
    console.log("App.jsx: handleLogout llamado");
    clearSession();

    navigate("/login", { replace: true });
  };

  if (isSessionLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          color: "white",
        }}
      >
        Cargando sesión...
      </div>
    );
  }

  return (
    <div
      style={{
        "--sidebar-width": sidebarWidth,
        "--sidebar-width-desktop": sidebarWidthDesktop,
      }}
    >
      {showMenu && (
        <HamburgerMenu
          onLogout={handleLogout}
          onNavigate={navigate}
          user={user}
        />
      )}
      <div className={`main-content ${showMenu ? "with-sidebar" : ""}`}>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRouteOnly isAuthenticated={isAuthenticated}>
                <AuthPage
                  onAuthSuccess={setupSession}
                  setAuthError={setAuthError}
                  isLoginMode={true}
                />
              </PublicRouteOnly>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRouteOnly isAuthenticated={isAuthenticated}>
                <AuthPage
                  onAuthSuccess={setupSession}
                  setAuthError={setAuthError}
                  isLoginMode={false}
                />
              </PublicRouteOnly>
            }
          />

          <Route
            path="/home"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <HomePage user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboards"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <DashboardsPage user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/conversationsDash/:phoneNumberId"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <DashboardPage user={user} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/createAgent"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <CreateAgent />
              </ProtectedRoute>
            }
          />

          <Route
            path="/myAgents"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <MyAgentsPage user={user} />
              </ProtectedRoute>
            }
          />

          <Route path="/mensajes/:id" element={<Mensajes />} />

          <Route
            path="/configuracion"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Configuracion />
              </ProtectedRoute>
            }
          />

          <Route
            path="/"
            element={
              <Navigate to={isAuthenticated ? "/home" : "/login"} replace />
            }
          />
          <Route
            path="*"
            element={
              <Navigate to={isAuthenticated ? "/home" : "/login"} replace />
            }
          />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;
