# CentinAI API Reference

Internal API documentation for the CentinAI backend.  
Defines all available REST endpoints, validation rules, and expected responses.

---

## Authentication Endpoints

All protected endpoints require a JWT token.

**Required header:**

```
Authorization: Bearer <token>
```

---

### POST /auth/register

Registers a new user.

**Request body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Responses:**

- 201 Created – User successfully registered.
  ```json
  {
    "message": "User created",
    "user": {
      "_id": "usr-123",
      "email": "user@example.com",
      "name": "John Doe"
    }
  }
  ```
- 400 Bad Request – Invalid input.
- 409 Conflict – Email already registered.

---

### POST /auth/login

Authenticates a user and returns a JWT token.

**Request body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Responses:**

- 200 OK – Login successful.
  ```json
  {
    "message": "Login successful",
    "token": "jwt-token-here",
    "user": {
      "id": "usr-123",
      "email": "user@example.com",
      "username": "name"
    }
  }
  ```
- 400 Bad Request – Invalid input.
- 401 Unauthorized – Invalid credentials.

---

### GET /auth/protected

A test endpoint to verify JWT authentication.  
Returns the authenticated user's info if the token is valid.

**Required header:**

```
Authorization: Bearer <token>
```

**Responses:**

- 200 OK – Access granted.
  ```json
  {
    "message": "Protected route accessed successfully",
    "user": {
      "id": "usr-123",
      "email": "user@example.com"
    }
  }
  ```
- 401 Unauthorized – Invalid or missing token.

---

## Conversation Endpoints

All conversation-related endpoints require authentication.

**Required header:**

```
Authorization: Bearer <token>
```

---

### GET /conversations

Returns all conversations for the authenticated user filtered by agent, with pagination, sorting, and date-range options.

**Query parameters:**

- `agentPhoneNumberId` (required): the identifier of the agent.  
  **See [Phone Number Query Parameter Normalization](#phone-number-query-parameter-normalization) for accepted formats.**
- `limit` (optional): maximum number of results to return. Default: 20.
- `offset` (optional): number of results to skip. Default: 0.
- `sortBy` (optional): one of `duration`, `cost`, or `date`. Default: `date`.
- `sortOrder` (optional): `asc` or `desc`. Default: `desc`.
- `dateFrom` (optional): ISO 8601 date string; includes conversations created **on or after** this date.
- `dateTo` (optional): ISO 8601 date string; includes conversations created **on or before** this date.

**Responses:**

- 200 OK – List of conversations with embedded metrics.
  ```json
  {
    "conversations": [
      {
        "_id": "conv-AAA1",
        "userName": "ordinaryUser",
        "from": "+5491111000000",
        "status": "open",
        "createdAt": "2025-05-03T14:22:00.000Z",
        "updatedAt": "2025-05-03T14:30:00.000Z",
        "metrics": {
          "durationSeconds": 145,
          "tokenUsage": { "cost": 0.012 }
        }
      },
      {
        "_id": "conv-BBB2",
        "userName": "extraordinaryUser",
        "from": "+5491111000000",
        "status": "closed",
        "createdAt": "2025-05-05T10:15:00.000Z",
        "updatedAt": "2025-05-05T10:25:00.000Z",
        "endTime": "2025-05-05T10:25:00.000Z",
        "metrics": {
          "durationSeconds": 95,
          "tokenUsage": { "cost": 0.009 }
        }
      }
    ]
  }
  ```
- 400 Bad Request – Invalid or missing parameters.
- 404 Not Found – Agent not found or not owned by user.
- 401 Unauthorized – Invalid or missing token.

---

## Agent Endpoints

All agent-related endpoints require authentication.

**Required header:**

```
Authorization: Bearer <token>
```

---

### POST /agents

Creates a new agent for the authenticated user.

**Request body:**

```json
{
  "phoneNumberId": "123456",
  "name": "Agent 1",
  "modelName": "gpt-4",
  "payloadFormat": "custom",
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

- If `payloadFormat` is "structured", `fieldMapping` must be empty or undefined.
- If `payloadFormat` is "custom", `fieldMapping` must include "text", "from", "timestamp", and "to".
- `fieldMapping` can include "userName" to optimize tagging.

**Responses:**

- 201 Created – Agent successfully created.
  ```json
  {
    "id": "agt_123",
    "name": "Agent 1",
    "phoneNumberId": "123456",
    "payloadFormat": "structured",
    "authMode": "header",
    "secretToken": "abcd-1234",
    "modelName": "gpt-4"
  }
  ```
- 400 Bad Request – Invalid data or agent limit reached.
- 409 Conflict – Agent with this phoneNumberId already exists.

---

### GET /agents

Returns all agents for the authenticated user.

**Responses:**

- 200 OK – List of agents.
  ```json
  [
    {
      "id": "agt_123",
      "name": "Agent 1",
      "phoneNumberId": "123456",
      "payloadFormat": "structured",
      "authMode": "header",
      "secretToken": "abcd-1234",
      "modelName": "gpt-4"
    }
  ]
  ```

---

### PATCH /agents/:id

Updates general information for an agent.

**Path parameter:**

- `id`: Agent ID

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
  ```json
  {
    "message": "Agent updated successfully",
    "agent": {
      "id": "agt_123",
      "name": "Updated Name",
      "phoneNumberId": "123456",
      "payloadFormat": "custom",
      "authMode": "header",
      "description": "New description",
      "fieldMapping": {
        "text": "payload.text",
        "from": "payload.sender",
        "timestamp": "payload.date",
        "to": "payload.destinatary"
      },
      "modelName": "gpt-4-turbo"
    }
  }
  ```
- 400 Bad Request – Invalid update or logical conflict.
- 404 Not Found – Agent not found or not owned by user.

---

### PATCH /agents/:id/mapping

Updates the `fieldMapping` of an agent. Only allowed for agents with `payloadFormat: custom`.

**Path parameter:**

- `id`: Agent ID

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

**Responses:**

- 200 OK – Mapping successfully updated.
  ```json
  {
    "message": "Mapping updated successfully",
    "fieldMapping": {
      "text": "msg.text",
      "from": "msg.user",
      "timestamp": "msg.time",
      "to": "msg.destinatary"
    }
  }
  ```
- 400 Bad Request – Invalid or disallowed mapping.
- 404 Not Found – Agent not found.

---

### POST /agents/:id/rotate-secret

Regenerates an agent's `secretToken`.

**Path parameter:**

- `id`: Agent ID

**Responses:**

- 200 OK – Secret token regenerated.
  ```json
  {
    "message": "Secret token regenerated successfully",
    "secretToken": "new-token-generated"
  }
  ```
- 404 Not Found – Agent not found.

---

### DELETE /agents/:id

Deletes an agent and all associated data.

**Path parameter:**

- `id`: Agent ID

**Responses:**

- 204 No Content – Agent deleted.
- 404 Not Found – Agent not found or not owned by user.

---

## User Endpoints

All user-related endpoints require authentication.

**Required header:**

```
Authorization: Bearer <token>
```

---

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
  ```json
  {
    "message": "User updated successfully",
    "user": {
      "id": "usr-123",
      "email": "new@email.com",
      "name": "New Name"
    }
  }
  ```
- 400 Bad Request – Invalid data or email already in use.
- 404 Not Found – User not found.
- 401 Unauthorized – Invalid or missing token.

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
  ```json
  {
    "message": "Password updated successfully"
  }
  ```
- 400 Bad Request – Validation error.
- 401 Unauthorized – Current password incorrect or invalid/missing token.
- 404 Not Found – User not found.

---

## Webhook Endpoints

All webhook-related endpoints require agent identification (see below).

---

### POST /webhook

Receives incoming messages from platforms like WhatsApp.

**Agent identification:**
Can be done via `secretToken` in:

- Query string: `?secret=...`
- Header: `x-agent-secret: ...`
- Body: `{ "agentSecret": "..." }`

**Mapping behavior:**

- `structured`: Uses default message mapping.
- `custom`: Uses user-defined fieldMapping.

**Expected mapped fields:**

- `text`
- `from`
- `timestamp`
- `to` (when sending "agent echo's")
- `userName` (optional)

**Timestamp Format and Normalization:**

- The `timestamp` field must be provided in one of the following formats:
  - **String:** ISO 8601 format (e.g., `"2025-06-23T10:34:00Z"`, `"2025-06-23T10:34:00-06:00"`).
    - If the string does **not** include a timezone (e.g., `"2025-06-23T10:34:00"`), it will be interpreted as UTC.
  - **Number:** Must be in **milliseconds** since the Unix epoch (e.g., `1720000000000`).
    - Numeric values in seconds (e.g., `1720000000`) will be rejected.
- Any other format will be rejected with an error.
- All timestamps are normalized and stored in UTC in the database.

**Phone Number Query Parameter Normalization:**

- All endpoints that accept phone numbers via query parameters (e.g., `agentPhoneNumberId`) will:
  - Accept numbers in E.164 format (with `+`).
  - Accept numbers with a leading space, which will be interpreted as `+` (e.g., `" 5491123456789"` becomes `+5491123456789`).
  - Recommend URL-encoding the `+` as `%2B` when sending via query string.
  - If sent without a `+` or space, the number will be used as-is.
  - **Example:**
    - `/conversations?agentPhoneNumberId=%2B5491123456789`
    - `/conversations?agentPhoneNumberId= 5491123456789` (will be interpreted as `+5491123456789`)

**Responses:**

- 200 OK – Message processed.
- 400 Bad Request – Invalid message structure or mapping.
- 404 Not Found – Agent not found.

---

## Metrics Endpoints

### GET /metrics

Returns all metrics for conversations associated with a specific agent belonging to the authenticated user. Supports pagination.

**Query parameters:**

- `agentPhoneNumberId` (required): the agent's identifier.  
  **See [Phone Number Query Parameter Normalization](#phone-number-query-parameter-normalization) for accepted formats.**
- `limit` (optional): maximum number of results to return. Default: 20.
- `offset` (optional): number of results to skip. Default: 0.

**Required header:**

```
Authorization: Bearer <token>
```

**Responses:**

- 200 OK – Metrics successfully returned.
- 400 Bad Request – Missing or invalid parameters.
- 401 Unauthorized – Invalid or missing token.

**Example response:**

```json
[
  {
    "_id": "sess-xxxx",
    "conversationId": "conv-...",
    "userId": "usr-...",
    "agentData": {
      "agentId": "105111000111001",
      "modelLLM": "gpt-4",
      "agentName": "AI Assistant"
    },
    "tokenUsage": { "totalTokens": 550, "cost": 0.015 },
    "messageCount": { "user": 3, "agent": 5, "total": 8 },
    "successful": true,
    "createdAt": "2025-05-03T14:22:00.000Z",
    "endTime": "2025-05-03T14:30:00.000Z",
    "durationSeconds": 145,
    "tags": ["inquiry", "billing"],
    "metadata": {
      "language": "en",
      "channel": "webchat",
      "sentimentTrend": "positive"
    }
  }
]
```

---

### GET /metrics/all

Returns all metrics for the authenticated user, regardless of the agent. Supports pagination.

**Query parameters:**

- `limit` (optional): maximum number of results to return. Default: 20.
- `offset` (optional): number of results to skip. Default: 0.

**Required header:**

```
Authorization: Bearer <token>
```

**Responses:**

- 200 OK – Metrics successfully returned.
- 400 Bad Request – Invalid parameters.
- 401 Unauthorized – Invalid or missing token.

**Example response:**

The response format is the same as for `GET /metrics`.

---

### GET /metrics/:conversationId

Returns the metrics for a specific conversation if it belongs to the authenticated user.

**Path parameters:**

- `conversationId`: ID of the conversation.

**Required header:**

```
Authorization: Bearer <token>
```

**Responses:**

- 200 OK – Metrics successfully returned.
- 404 Not Found – Metrics not found or conversation does not belong to user.
- 401 Unauthorized – Invalid or missing token.

**Example response:**

```json
{
  "_id": "sess-xxxx",
  "conversationId": "conv-...",
  "userId": "usr-...",
  "agentData": {
    "agentId": "105111000111001",
    "modelLLM": "gpt-4",
    "agentName": "AI Assistant"
  },
  "tokenUsage": { "totalTokens": 550, "cost": 0.015 },
  "messageCount": { "user": 3, "agent": 5, "total": 8 },
  "successful": true,
  "tags": ["inquiry", "billing"],
  "metadata": {
    "language": "en",
    "channel": "webchat",
    "sentimentTrend": "positive"
  },
  "createdAt": "2025-05-03T14:22:00.000Z",
  "endTime": "2025-05-03T14:30:00.000Z",
  "durationSeconds": 145
}
```

---

## Message Endpoints

All message-related endpoints require authentication.

**Required header:**

```
Authorization: Bearer <token>
```

---

### GET /messages

Returns all messages for a specific conversation, with pagination. The conversation must belong to the authenticated user.

**Query parameters:**

- `conversationId` (required): the ID of the conversation.
- `limit` (optional): maximum number of results to return. Default: 20.
- `offset` (optional): number of results to skip. Default: 0.

**Responses:**

- 200 OK – List of messages.
  ```json
  {
    "messages": [
      {
        "_id": "msg-001",
        "conversationId": "conv-AAA1",
        "sender": "user",
        "text": "Hello!",
        "timestamp": "2025-05-03T14:22:01.000Z"
      },
      {
        "_id": "msg-002",
        "conversationId": "conv-AAA1",
        "sender": "agent",
        "text": "Hi, how can I help you?",
        "timestamp": "2025-05-03T14:22:05.000Z"
      }
    ]
  }
  ```
- 400 Bad Request – Invalid or missing parameters.
- 404 Not Found – Conversation not found or not owned by user.
- 401 Unauthorized – Invalid or missing token.

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

_Last updated: June 2025_
