// frontend/src/App.jsx
import "./App.css";
import "./components/MenuHamburguesa.css"; // Asumiendo que este archivo existe y es necesario
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import DashboardPage from "./pages/ConversationsDash"; // Renombrado para claridad
import AuthPage from "./pages/Auth"; // Renombrado para claridad
import HomePage from "./pages/Home"; // Renombrado para claridad
import HamburgerMenu from "./components/MenuHamburguesa"; // Asumiendo que existe
import DashboardsPage from "./pages/Dashboards"; // Renombrado para claridad
import CreateAgent from "./pages/CreateAgent"; // Mantenemos CreateAgent de main
import Mensajes from "./pages/Mensajes";
import MyAgentsPage from "./pages/MyAgent";
import Configuracion from "./pages/configuracion";
import { useSessionLoader } from "./hooks/useSessionLoader";
import { useEffect } from "react";

// Componente para rutas que requieren autenticación
function ProtectedRoute({ isAuthenticated, children }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Componente para rutas que NO deberían ser accesibles si ya está autenticado
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
    clearSession, // Para el logout
    setupSession, // Para el login/registro
    setError: setAuthError, // Para mostrar errores de autenticación
    error: authError, // Para leer el error de autenticación si quieres mostrarlo globalmente
  } = useSessionLoader();

  // Efecto para gestionar la clase del body para el fondo de la home
  useEffect(() => {
    if (location.pathname === "/home") {
      document.body.classList.add("home-background");
    } else {
      document.body.classList.remove("home-background");
    }
    // Cleanup function para cuando el componente se desmonte
    return () => {
      document.body.classList.remove("home-background");
    };
  }, [location.pathname]); // Se ejecuta cada vez que cambia la ruta

  const hiddenMenuRoutes = ["/login", "/register"];
  const showMenu =
    !hiddenMenuRoutes.includes(location.pathname) && isAuthenticated;

  // Lógica para determinar el ancho del sidebar
  const sidebarWidth = showMenu ? "50px" : "0px"; // Ancho por defecto (colapsado) o 0
  const sidebarWidthDesktop = showMenu ? "220px" : "0px"; // Ancho para desktop (abierto)

  const handleLogout = () => {
    console.log("App.jsx: handleLogout llamado");
    clearSession();
    // La navegación a /login ya está implícita por el cambio de isAuthenticated
    // y las redirecciones en las rutas, pero podemos ser explícitos.
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
        {/* Puedes mostrar authError aquí si quieres un mensaje de error global */}
        {/* {authError && <p style={{color: 'red', textAlign: 'center'}}>{authError}</p>} */}
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
