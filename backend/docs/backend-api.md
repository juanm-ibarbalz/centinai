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

## Conversations Endpoints

### GET /conversations

Returns all conversations for the authenticated user filtered by agent, with pagination, sorting, and date-range options.

**Query parameters:**

- `agentPhoneNumberId` (required): the identifier of the agent.
- `limit` (optional): maximum number of results to return. Default: 20.
- `offset` (optional): number of results to skip. Default: 0.
- `sortBy` (optional): one of `duration`, `cost`, or `date`. Default: `date`.
- `sortOrder` (optional): `asc` or `desc`. Default: `desc`.
- `dateFrom` (optional): ISO 8601 date string; includes conversations created **on or after** this date.
- `dateTo` (optional): ISO 8601 date string; includes conversations created **on or before** this date.

**Responses:**

- **200 OK** – JSON object with a `conversations` array. Each element includes conversation fields and embedded metrics:
  ```json
  {
    "conversations": [
      {
        "_id": "conv-AAA1",
        "userId": "usr-123",
        "agentPhoneNumberId": "5491111000000",
        "createdAt": "2025-05-03T14:22:00.000Z",
        "lastUpdated": "2025-05-03T14:30:00.000Z",
        "metrics": {
          "durationSeconds": 145,
          "tokenUsage": { "cost": 0.012 }
        }
      },
      {
        "_id": "conv-BBB2",
        "userId": "usr-123",
        "agentPhoneNumberId": "5491111000000",
        "createdAt": "2025-05-05T10:15:00.000Z",
        "lastUpdated": "2025-05-05T10:25:00.000Z",
        "metrics": {
          "durationSeconds": 95,
          "tokenUsage": { "cost": 0.009 }
        }
      }
    ]
  }
  ```

---

## Agent Endpoints

### POST /agents

Creates a new agent.

**Request body:**

```json
{
  "phoneNumberId": "123456",
  "name": "Agent 1",
  "modelName": "gpt-4",
  "payloadFormat": "structured",
  "authMode": "header",
  "description": "optional",
  "fieldMapping": {
    "text": "body.text",
    "from": "body.from",
    "timestamp": "body.timestamp",
    "to": "body.destinatary"
  }
}
```

**Validation rules:**

- If payloadFormat is "structured", fieldMapping must be empty or undefined.
- If "custom", the fieldMapping must include "text", "from", "timestamp" and "to".
- fieldMapping can include "userName" to optimize tagging.

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
    "timestamp": "msg.time",
    "to": "msg.destinatary"
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

### PATCH /agents/:id

Updates general agent information.

**Request body (example):**

```json
{
  "name": "Updated Name",
  "modelName": "gpt-4-turbo",
  "description": "New description",
  "payloadFormat": "custom",
  "fieldMapping": {
    "text": "payload.text",
    "from": "payload.sender",
    "timestamp": "payload.date",
    "to": "payload.destinatary"
  }
}
```

**Responses:**

- 200 OK – Agent updated.
- 400 Bad Request – Invalid update or logical conflict.
- 404 Not Found – Agent not found or not owned by user.

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
- `to`

**Responses:**

- 200 OK – Message processed.
- 400 Bad Request – Invalid message structure or mapping.

---

## User Endpoints

### PATCH /users/me

Updates the authenticated user's profile information.

**Request body:**

```json
{
  "name": "New Name",
  "email": "new@email.com"
}
```

**Responses:**

- 200 OK – User updated.
- 400 Bad Request – Invalid data or email already in use.
- 404 Not Found – User not found.

---

### PATCH /users/me/password

Changes the authenticated user's password.

**Request body:**

```json
{
  "currentPassword": "oldPass123",
  "newPassword": "newSecurePass456"
}
```

**Responses:**

- 200 OK – Password successfully changed.
- 400 Bad Request – Validation error.
- 401 Unauthorized – Current password incorrect.
- 404 Not Found – User not found.

---

### GET /metrics

Returns all metrics for conversations associated with a specific agent belonging to the authenticated user. Supports pagination.

**Query parameters:**

- `agentPhoneNumberId` (required): the identifier of the agent.
- `limit` (optional): number of results to return. Default: 20.
- `offset` (optional): number of results to skip. Default: 0.

**Header required:**

```
Authorization: Bearer <token>
```

**Responses:**

- 200 OK – Metrics successfully returned.
- 400 Bad Request – Missing or invalid parameters.
- 401 Unauthorized – Invalid or missing token.

**Response example:**

```json
[
  {
    "_id": "sess-xxxx",
    "conversationId": "conv-...",
    "userId": "usr-...",
    "agentData": {
      "agentId": "105111000111001",
      "modelLLM": "gpt-4",
      "agentName": "Asistente IA"
    },
    "tokenUsage": { "totalTokens": 550, "cost": 0.015 },
    "messageCount": { "user": 3, "agent": 5, "total": 8 },
    "successful": true
  }
]
```

---

### GET /metrics/:conversationId

Returns the metrics for a specific conversation if it belongs to the authenticated user.

**Path parameters:**

- `conversationId`: the ID of the conversation.

**Header required:**

```
Authorization: Bearer <token>
```

**Responses:**

- 200 OK – Metrics successfully returned.
- 404 Not Found – Metrics not found or conversation does not belong to user.
- 401 Unauthorized – Invalid or missing token.

**Response example:**

```json
{
  "_id": "sess-xxxx",
  "conversationId": "conv-...",
  "userId": "usr-...",
  "agentData": {
    "agentId": "105111000111001",
    "modelLLM": "gpt-4",
    "agentName": "Asistente IA"
  },
  "tokenUsage": { "totalTokens": 550, "cost": 0.015 },
  "messageCount": { "user": 3, "agent": 5, "total": 8 },
  "successful": true,
  "tags": ["consulta", "facturacion"],
  "metadata": {
    "language": "es",
    "channel": "webchat",
    "sentimentTrend": "positive"
  }
}
```

---

## Common Errors

| Code                                       | Description                                               |
| ------------------------------------------ | --------------------------------------------------------- |
| `invalid_payload`                          | Request body does not match expected format.              |
| `agent_not_found`                          | Agent could not be identified.                            |
| `metric_not_found_or_forbidden`            | Metric not found or conversation does not belong to user. |
| `max_agents_reached`                       | User reached the 3-agent limit.                           |
| `mapping_not_allowed_with_structured_mode` | Mapping used with `structured` mode.                      |
| `invalid_mapping_payload`                  | Custom mapping missing required fields.                   |

---

_Last updated: May 2025_
