// frontend/src/hooks/useSessionLoader.js
import { useState, useEffect, useCallback } from 'react';

// Variable global para almacenar el token inyectado por Android antes de que el hook esté listo
let nativeTokenPromise = null;
let resolveNativeTokenPromise = null;
let hasNativeTokenBeenProcessed = false; // Para evitar que la promesa se procese múltiples veces si hay re-renders

if (typeof window !== 'undefined') { // Asegurarse que se ejecuta solo en el cliente
    console.log("useSessionLoader (Global): Configurando nativeTokenPromise y window.handleNativeToken.");
    nativeTokenPromise = new Promise((resolve) => {
        resolveNativeTokenPromise = resolve;
    });

    window.handleNativeToken = function(token) {
        console.log("WebView Bridge (window.handleNativeToken): Token recibido de Android:", token);
        if (resolveNativeTokenPromise) {
            resolveNativeTokenPromise(token);
            resolveNativeTokenPromise = null; // Evitar múltiples resoluciones si se llama de nuevo
        } else {
            // Esto es un fallback, pero con la promesa creada globalmente, es menos probable que se necesite.
            console.warn("WebView Bridge (window.handleNativeToken): resolveNativeTokenPromise era null, resolviendo directamente nativeTokenPromise.");
            nativeTokenPromise = Promise.resolve(token);
        }
        // Opcional: Sincronizar con localStorage inmediatamente
        // if (token) {
        //     console.log("WebView Bridge (window.handleNativeToken): Guardando token_from_native en localStorage:", token);
        //     localStorage.setItem("token_from_native_debug", token); // Usar una clave diferente para depurar esto
        // }
    };

    // Si Android no inyecta nada después de un tiempo, resolvemos la promesa con null.
    setTimeout(() => {
        if (resolveNativeTokenPromise) {
            console.log("useSessionLoader (Global): Timeout para nativeTokenPromise, resolviendo con null.");
            resolveNativeTokenPromise(null);
            resolveNativeTokenPromise = null; // Evitar múltiples resoluciones
        }
    }, 1500); // Aumenté un poco el timeout por si acaso el JS de la web es pesado
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
        // localStorage.removeItem("token_from_native_debug"); // Limpiar la de debug si la usas
        if (window.Android && typeof window.Android.clearToken === 'function') {
            console.log("WebView Bridge (clearSession): Llamando a Android.clearToken()");
            window.Android.clearToken();
            console.log("WebView Bridge (clearSession): Android.clearToken() fue llamado.");
        } else {
            console.warn("WebView Bridge (clearSession): window.Android.clearToken no disponible.");
        }
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        setError(null); // Limpiar también errores
        console.log("useSessionLoader (clearSession): Sesión limpiada. isAuthenticated:", false);
    }, []);

    const setupSession = useCallback((userData, userToken) => {
        console.log("useSessionLoader (setupSession): Iniciado con userToken:", userToken, "userData:", userData);

        if (!userToken || !userData) {
            console.error("useSessionLoader (setupSession): userToken o userData es nulo/undefined. No se puede establecer la sesión.");
            setError("Datos de sesión inválidos para setupSession.");
            setIsLoading(false); // Asegurar que no se quede cargando
            return;
        }

        localStorage.setItem("token", userToken);
        console.log("useSessionLoader (setupSession): Token guardado en localStorage:", localStorage.getItem("token"));

        localStorage.setItem("user", JSON.stringify(userData));
        console.log("useSessionLoader (setupSession): Usuario guardado en localStorage:", localStorage.getItem("user"));

        if (window.Android && typeof window.Android.saveToken === 'function') {
            console.log("useSessionLoader (setupSession): Intentando llamar a window.Android.saveToken()...");
            window.Android.saveToken(userToken);
            console.log("useSessionLoader (setupSession): window.Android.saveToken() fue llamado con token:", userToken);
        } else {
            console.warn("useSessionLoader (setupSession): window.Android.saveToken no disponible. No se enviará token a Android.");
        }

        setUser(userData);
        setToken(userToken);
        setIsAuthenticated(true);
        setError(null);
        setIsLoading(false); // Sesión establecida, ya no está cargando
        console.log("useSessionLoader (setupSession): Estados actualizados. isAuthenticated:", true, "isLoading:", false, "Token:", userToken);
    }, []); // No hay dependencias que cambien frecuentemente aquí

    useEffect(() => {
        console.log("useSessionLoader (useEffect - checkInitialSession): Montando o clearSession cambió. isLoading actual:", isLoading);
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
            console.log("useSessionLoader (checkInitialSession): Iniciando chequeo. hasNativeTokenBeenProcessed:", hasNativeTokenBeenProcessed);
            setIsLoading(true); // Asegurar que isLoading sea true al inicio del chequeo
            let sessionToken = null;
            let userFromStorage = null;

            if (!hasNativeTokenBeenProcessed && nativeTokenPromise) {
                console.log("useSessionLoader (checkInitialSession): Esperando token de handleNativeToken...");
                const tokenFromNative = await nativeTokenPromise;
                hasNativeTokenBeenProcessed = true; // Marcar como procesada para evitar múltiples awaits si hay re-renders

                if (tokenFromNative) {
                    console.log("useSessionLoader (checkInitialSession): Token obtenido de handleNativeToken:", tokenFromNative);
                    sessionToken = tokenFromNative;
                    localStorage.setItem("token", tokenFromNative); // Sincronizar con localStorage
                    console.log("useSessionLoader (checkInitialSession): Token de Android guardado en localStorage.");
                } else {
                    console.log("useSessionLoader (checkInitialSession): No se recibió token de handleNativeToken (o timeout).");
                }
            } else if (hasNativeTokenBeenProcessed) {
                 console.log("useSessionLoader (checkInitialSession): nativeTokenPromise ya fue procesada, saltando await.");
            }


            if (!sessionToken) {
                sessionToken = localStorage.getItem("token");
                console.log("useSessionLoader (checkInitialSession): Token de localStorage (como fallback o si no hubo de Android):", sessionToken);
            }

            if (sessionToken) {
                userFromStorage = localStorage.getItem("user");
                console.log("useSessionLoader (checkInitialSession): userFromStorage:", userFromStorage);
            }

            console.log("useSessionLoader (checkInitialSession): sessionToken final para procesar:", sessionToken);

            if (sessionToken) {
                setToken(sessionToken);
                let authentic = false;
                if (userFromStorage) {
                    try {
                        const parsedUser = JSON.parse(userFromStorage);
                        setUser(parsedUser);
                        authentic = true; // Asumir autenticado si tenemos usuario y token
                        console.log("useSessionLoader (checkInitialSession): Usuario parseado de LS. Asumiendo autenticado.", parsedUser);
                    } catch(e) {
                        console.error("useSessionLoader (checkInitialSession): Error parseando user de LS, limpiando sesión.", e);
                        // No llamar a clearSession() aquí directamente para evitar bucle si useEffect se dispara por él
                        localStorage.removeItem("token");
                        localStorage.removeItem("user");
                        if (window.Android?.clearToken) window.Android.clearToken();
                        setUser(null); setToken(null); setIsAuthenticated(false);
                        authentic = false;
                    }
                } else {
                    // Si tenemos token (quizás de Android) pero no usuario en LS,
                    // necesitamos una forma de obtener los datos del usuario o asumir que el token es suficiente.
                    // Para una mejor UX, una llamada a /verify o /profile sería ideal aquí.
                    console.warn("useSessionLoader (checkInitialSession): Token presente pero sin datos de usuario en LS. Asumiendo autenticado solo por token.");
                    authentic = true;
                }
                setIsAuthenticated(authentic);
            } else {
                console.log("useSessionLoader (checkInitialSession): No hay sessionToken, limpiando sesión.");
                // clearSession(); // Cuidado con bucles si clearSession causa re-render y re-ejecución del useEffect
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                if (window.Android?.clearToken) window.Android.clearToken();
                setUser(null); setToken(null); setIsAuthenticated(false);
            }
            console.log("useSessionLoader (checkInitialSession): A punto de llamar a setIsLoading(false). isAuthenticated:", isAuthenticated, "isLoading:", isLoading);
            setIsLoading(false);
            console.log("useSessionLoader (checkInitialSession): Chequeo finalizado. isLoading AHORA:", false, "isAuthenticated AHORA:", isAuthenticated); // isAuthenticated podría no haberse actualizado aún en este mismo ciclo de render
        };

        checkInitialSession();
    }, []); // Ejecutar solo una vez al montar. `clearSession` es estable por useCallback.

    // Log para ver cuándo cambian los estados clave
    useEffect(() => {
        console.log("useSessionLoader (State Change): isAuthenticated:", isAuthenticated, "isLoading:", isLoading, "token:", token, "user:", user);
    }, [isAuthenticated, isLoading, token, user]);

    return { user, token, isAuthenticated, isLoading, error, setupSession, clearSession, setError };
}