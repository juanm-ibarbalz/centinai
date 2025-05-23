# CentinAI API Reference

Internal API documentation for the CentinAI backend.  
Defines all available REST endpoints, validation rules, and expected responses.

---

## Authentication

All protected endpoints require a JWT token.

**Header required:**

```
Authorization: Bearer <token>
```

---

## Auth Endpoints

### POST /auth/register

Registers a new user.

**Request body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "Juan Martín"
}
```

**Responses:**

- 201 Created – User successfully registered.
- 400 Bad Request – Invalid input.

---

### POST /auth/login

Authenticates a user and returns a JWT.

**Request body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Responses:**

- 200 OK – Returns a JWT token.
- 401 Unauthorized – Invalid credentials.

---

## Agent Endpoints

### POST /agents

Creates a new agent.

**Request body:**

```json
{
  "phoneNumberId": "123456",
  "name": "Agent 1",
  "payloadFormat": "structured",
  "authMode": "header",
  "description": "optional",
  "fieldMapping": {
    "text": "body.text",
    "from": "body.from",
    "timestamp": "body.timestamp"
  }
}
```

**Validation rules:**

- If payloadFormat is "structured", fieldMapping must be empty or undefined.
- If "custom", the fieldMapping must include "text", "from", and "timestamp".

**Responses:**

- 201 Created – Agent successfully created.
- 400 Bad Request – Invalid data or agent limit reached.

---

### GET /agents

Returns all agents for the authenticated user.

**Response:**

```json
[
  {
    "id": "agt_123",
    "name": "Agent 1",
    "phoneNumberId": "123456",
    "payloadFormat": "structured",
    "authMode": "header",
    "secretToken": "abcd-1234"
  }
]
```

---

### PATCH /agents/:id/mapping

Updates an agent's `fieldMapping`.

**Request body:**

```json
{
  "fieldMapping": {
    "text": "msg.text",
    "from": "msg.user",
    "timestamp": "msg.time"
  }
}
```

**Restrictions:**

- Only allowed for agents with payloadFormat: "custom".

**Responses:**

- 200 OK – Mapping successfully updated.
- 400 Bad Request – Invalid or disallowed mapping.
- 404 Not Found – Agent not found.

---

### DELETE /agents/:id

Deletes an agent and all associated data.

**Responses:**

- 204 No Content – Agent deleted.
- 404 Not Found – Agent not found or not owned by user.

---

### POST /agents/:id/rotate-secret

Regenerates an agent's `secretToken`.

**Response:**

```json
{
  "message": "Secret token regenerated successfully",
  "secretToken": "new-token-generated"
}
```

---

## Webhook

### POST /webhook

Receives incoming messages from platforms like WhatsApp.

**Agent identification:**

Can be done via `secretToken` in:

- Query string: `?secret=...`
- Header: `x-agent-secret: ...`
- Body: `{ "agentSecret": "..." }`

**Mapping behavior:**

- structured: Uses default message mapping.
- custom: Uses user-defined fieldMapping.

**Expected mapped fields:**

- `text`
- `from`
- `timestamp`

**Responses:**

- 200 OK – Message processed.
- 400 Bad Request – Invalid message structure or mapping.

---

## Common Errors

| Code                                       | Description                                  |
| ------------------------------------------ | -------------------------------------------- |
| `invalid_payload`                          | Request body does not match expected format. |
| `agent_not_found`                          | Agent could not be identified.               |
| `max_agents_reached`                       | User reached the 3-agent limit.              |
| `mapping_not_allowed_with_structured_mode` | Mapping used with `structured` mode.         |
| `invalid_mapping_payload`                  | Custom mapping missing required fields.      |

---

_Last updated: May 2025_
