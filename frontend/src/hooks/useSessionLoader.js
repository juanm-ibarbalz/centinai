import { useState, useEffect, useCallback } from "react";
import { API_URL } from "../config";

let nativeTokenPromise = null;
let resolveNativeTokenPromise = null;
let hasNativeTokenBeenProcessed = false; 

if (typeof window !== "undefined") {

  console.log(
    "useSessionLoader (Global): Configurando nativeTokenPromise y window.handleNativeToken."
  );
  nativeTokenPromise = new Promise((resolve) => {
    resolveNativeTokenPromise = resolve;
  });

  window.handleNativeToken = function (token) {
    console.log(
      "WebView Bridge (window.handleNativeToken): Token recibido de Android:",
      token
    );
    if (resolveNativeTokenPromise) {
      resolveNativeTokenPromise(token);
      resolveNativeTokenPromise = null; 
    } else {
      console.warn(
        "WebView Bridge (window.handleNativeToken): resolveNativeTokenPromise era null, resolviendo directamente nativeTokenPromise."
      );
      nativeTokenPromise = Promise.resolve(token);
    }
    // Opcional: Sincronizar con localStorage inmediatamente
    // if (token) {
    //     console.log("WebView Bridge (window.handleNativeToken): Guardando token_from_native en localStorage:", token);
    //     localStorage.setItem("token_from_native_debug", token); // Usar una clave diferente para depurar esto
    // }
  };


  setTimeout(() => {
    if (resolveNativeTokenPromise) {
      console.log(
        "useSessionLoader (Global): Timeout para nativeTokenPromise, resolviendo con null."
      );
      resolveNativeTokenPromise(null);
      resolveNativeTokenPromise = null; 
    }
  }, 1500); 
}

export function useSessionLoader() {
  console.log("useSessionLoader: Hook ejecutándose / re-renderizándose.");
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const clearSession = useCallback(() => {
    console.log("useSessionLoader (clearSession): Limpiando sesión...");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // localStorage.removeItem("token_from_native_debug"); 
    if (window.Android && typeof window.Android.clearToken === "function") {
      console.log(
        "WebView Bridge (clearSession): Llamando a Android.clearToken()"
      );
      window.Android.clearToken();
      console.log(
        "WebView Bridge (clearSession): Android.clearToken() fue llamado."
      );
    } else {
      console.warn(
        "WebView Bridge (clearSession): window.Android.clearToken no disponible."
      );
    }
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    setError(null); 
    console.log(
      "useSessionLoader (clearSession): Sesión limpiada. isAuthenticated:",
      false
    );
  }, []);

  const setupSession = useCallback((userData, userToken) => {
    console.log(
      "useSessionLoader (setupSession): Iniciado con userToken:",
      userToken,
      "userData:",
      userData
    );

    if (!userToken || !userData) {
      console.error(
        "useSessionLoader (setupSession): userToken o userData es nulo/undefined. No se puede establecer la sesión."
      );
      setError("Datos de sesión inválidos para setupSession.");
      setIsLoading(false); 
      return;
    }

    localStorage.setItem("token", userToken);
    console.log(
      "useSessionLoader (setupSession): Token guardado en localStorage:",
      localStorage.getItem("token")
    );

    localStorage.setItem("user", JSON.stringify(userData));
    console.log(
      "useSessionLoader (setupSession): Usuario guardado en localStorage:",
      localStorage.getItem("user")
    );

    if (window.Android && typeof window.Android.saveToken === "function") {
      console.log(
        "useSessionLoader (setupSession): Intentando llamar a window.Android.saveToken()..."
      );
      window.Android.saveToken(userToken);
      console.log(
        "useSessionLoader (setupSession): window.Android.saveToken() fue llamado con token:",
        userToken
      );
    } else {
      console.warn(
        "useSessionLoader (setupSession): window.Android.saveToken no disponible. No se enviará token a Android."
      );
    }

    setUser(userData);
    setToken(userToken);
    setIsAuthenticated(true);
    setError(null);
    setIsLoading(false); 
    console.log(
      "useSessionLoader (setupSession): Estados actualizados. isAuthenticated:",
      true,
      "isLoading:",
      false,
      "Token:",
      userToken
    );
  }, []); 

  useEffect(() => {
    console.log(
      "useSessionLoader (useEffect - checkInitialSession): Montando o clearSession cambió. isLoading actual:",
      isLoading
    );
    // Evitar que checkInitialSession se ejecute si ya no estamos en el estado de carga inicial
    // o si la sesión ya se estableció/limpió por otra vía (ej. login/logout explícito).
    // if (!isLoading && isAuthenticated) {
    //     console.log("useSessionLoader (useEffect - checkInitialSession): Sesión ya autenticada, saltando check.");
    //     return;
    // }
    // if (!isLoading && !isAuthenticated && token === null) {
    //      console.log("useSessionLoader (useEffect - checkInitialSession): Sesión ya limpia y no cargando, saltando check.");
    //      return;
    // }

    const checkInitialSession = async () => {
      console.log(
        "useSessionLoader (checkInitialSession): Iniciando chequeo. hasNativeTokenBeenProcessed:",
        hasNativeTokenBeenProcessed
      );
      setIsLoading(true); 
      let sessionToken = null;
      let userFromStorage = null;

      if (!hasNativeTokenBeenProcessed && nativeTokenPromise) {
        console.log(
          "useSessionLoader (checkInitialSession): Esperando token de handleNativeToken..."
        );
        const tokenFromNative = await nativeTokenPromise;
        hasNativeTokenBeenProcessed = true;

        if (tokenFromNative) {
          console.log(
            "useSessionLoader (checkInitialSession): Token obtenido de handleNativeToken:",
            tokenFromNative
          );
          sessionToken = tokenFromNative;
          localStorage.setItem("token", tokenFromNative); 
          console.log(
            "useSessionLoader (checkInitialSession): Token de Android guardado en localStorage."
          );
        } else {
          console.log(
            "useSessionLoader (checkInitialSession): No se recibió token de handleNativeToken (o timeout)."
          );
        }
      } else if (hasNativeTokenBeenProcessed) {
        console.log(
          "useSessionLoader (checkInitialSession): nativeTokenPromise ya fue procesada, saltando await."
        );
      }

      if (!sessionToken) {
        sessionToken = localStorage.getItem("token");
        console.log(
          "useSessionLoader (checkInitialSession): Token de localStorage (como fallback o si no hubo de Android):",
          sessionToken
        );
      }

      if (sessionToken) {
        userFromStorage = localStorage.getItem("user");
        console.log(
          "useSessionLoader (checkInitialSession): userFromStorage:",
          userFromStorage
        );
      }

      console.log(
        "useSessionLoader (checkInitialSession): sessionToken final para procesar:",
        sessionToken
      );

      if (sessionToken) {
        setToken(sessionToken);
        let authentic = false;
        if (userFromStorage) {
          try {
            const parsedUser = JSON.parse(userFromStorage);
            setUser(parsedUser);
            authentic = true; 
            console.log(
              "useSessionLoader (checkInitialSession): Usuario parseado de LS. Asumiendo autenticado.",
              parsedUser
            );
          } catch (e) {
            console.error(
              "useSessionLoader (checkInitialSession): Error parseando user de LS, limpiando sesión.",
              e
            );
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            if (window.Android?.clearToken) window.Android.clearToken();
            setUser(null);
            setToken(null);
            setIsAuthenticated(false);
            authentic = false;
          }
        } else {
          console.warn(
            "Token presente pero sin datos de usuario en LS. Intentando validar contra el backend..."
          );
          try {
            const res = await fetch(`${API_URL}/auth/me`, {
              headers: { Authorization: `Bearer ${sessionToken}` },
            });

            if (res.ok) {
              const fetchedUser = await res.json();
              localStorage.setItem("user", JSON.stringify(fetchedUser));
              setUser(fetchedUser);
              authentic = true;
              console.log("Usuario obtenido del backend:", fetchedUser);
            } else if (res.status === 403) {
              console.warn("Token inválido o expirado. Eliminando sesión.");
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              if (window.Android?.clearToken) window.Android.clearToken();
              setUser(null);
              setToken(null);
              authentic = false;
            }
          } catch (err) {
            console.error("Error al validar el token:", err);
            authentic = false;
          }
        }
        setIsAuthenticated(authentic);
      } else {
        console.log(
          "useSessionLoader (checkInitialSession): No hay sessionToken, limpiando sesión."
        );
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        if (window.Android?.clearToken) window.Android.clearToken();
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
      }
      console.log(
        "useSessionLoader (checkInitialSession): A punto de llamar a setIsLoading(false). isAuthenticated:",
        isAuthenticated,
        "isLoading:",
        isLoading
      );
      setIsLoading(false);
      console.log(
        "useSessionLoader (checkInitialSession): Chequeo finalizado. isLoading AHORA:",
        false,
        "isAuthenticated AHORA:",
        isAuthenticated
      ); 
    };

    checkInitialSession();
  }, []); 

  useEffect(() => {
    console.log(
      "useSessionLoader (State Change): isAuthenticated:",
      isAuthenticated,
      "isLoading:",
      isLoading,
      "token:",
      token,
      "user:",
      user
    );
  }, [isAuthenticated, isLoading, token, user]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    setupSession,
    clearSession,
    setError,
  };
}
