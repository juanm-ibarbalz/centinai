# API Interceptor - Manejo Automático de Tokens Expirados

## Descripción

El interceptor API es una solución que detecta automáticamente cuando el token JWT expira (error 403) y redirige al usuario a la página de login, limpiando la sesión local.

## Características

- ✅ Detección automática de tokens expirados (error 403)
- ✅ Limpieza automática de sesión local
- ✅ Redirección automática a `/login`
- ✅ Integración con el hook `useSessionLoader`
- ✅ Funciones helper para GET, POST, PUT, DELETE

## Uso

### 1. Configuración Automática

El interceptor se configura automáticamente en el `useSessionLoader`. No necesitas hacer nada adicional.

### 2. Usar las Funciones Helper

En lugar de usar `fetch` directamente, usa las funciones helper del interceptor:

```javascript
import { apiGet, apiPost, apiPut, apiDelete } from "../utils/apiInterceptor";

// GET request
const response = await apiGet("/conversations");
const data = await response.json();

// POST request
const response = await apiPost("/agents", { name: "Mi Agente" });
const data = await response.json();

// PUT request
const response = await apiPut("/users/me", { name: "Nuevo Nombre" });
const data = await response.json();

// DELETE request
const response = await apiDelete("/agents/123");
```

### 3. Usar la Función General

Si necesitas más control, puedes usar `apiRequest` directamente:

```javascript
import { apiRequest } from "../utils/apiInterceptor";

const response = await apiRequest(`${API_URL}/custom-endpoint`, {
  method: "POST",
  headers: { "Custom-Header": "value" },
  body: JSON.stringify(data),
});
```

## Migración de Código Existente

### Antes (fetch directo):

```javascript
const token = localStorage.getItem("token");
const response = await fetch(`${API_URL}/conversations`, {
  headers: { Authorization: `Bearer ${token}` },
});
```

### Después (con interceptor):

```javascript
import { apiGet } from "../utils/apiInterceptor";

const response = await apiGet("/conversations");
```

## Comportamiento

1. **Token válido**: La petición se ejecuta normalmente
2. **Token expirado (403)**:
   - Se limpia automáticamente el localStorage
   - Se llama a la función de logout del `useSessionLoader`
   - Se redirige automáticamente a `/login`
   - Se lanza un error para que el componente lo maneje

## Ventajas

- **Centralizado**: Todo el manejo de tokens expirados está en un lugar
- **Automático**: No necesitas manejar manualmente los errores 403
- **Consistente**: Mismo comportamiento en toda la aplicación
- **Fácil de mantener**: Un solo lugar para cambiar la lógica

## Ejemplos de Migración

### ConversationTable.jsx

```javascript
// Antes
fetch(`${API_URL}/conversations?${params}`, {
  headers: { Authorization: `Bearer ${token}` },
});

// Después
apiGet(`/conversations?${params}`);
```

### MyAgent.jsx

```javascript
// Antes
const res = await fetch(`${API_URL}/agents`, {
  headers: { Authorization: `Bearer ${token}` },
});

// Después
const res = await apiGet("/agents");
```

## Notas Importantes

- El interceptor solo maneja errores 403 (token expirado)
- Otros errores HTTP se propagan normalmente
- La redirección usa `window.location.href` para asegurar que funcione en todos los casos
- El interceptor se configura automáticamente al usar `useSessionLoader`
