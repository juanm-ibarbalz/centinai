# Backend API Reference - CentinAI

This document describes how to interact with the CentinAI backend endpoints. It is intended for frontend developers and testers consuming the API.

---

## Authentication

All protected endpoints require a JWT token in the header:

```http
Authorization: Bearer <your-token>
```

---

## Available Endpoints

### POST /auth/register

Registers a new user account.

- **Auth:** none
- **Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

- **Response:**

```json
{
  "message": "Usuario creado",
  "user": "user@example.com"
}
```

---

### POST /auth/login

Logs in an existing user.

- **Auth:** none
- **Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

- **Response:**

```json
{
  "message": "Login exitoso",
  "token": "JWT_TOKEN",
  "user": {
    "id": "usr-abc123",
    "email": "user@example.com",
    "last_login_at": "2025-05-03T15:00:00Z"
  }
}
```

---

### POST /agents

Registers an agent (authenticated user associates a phone_number_id to their account)

- **Auth:** required
- **Body:**

```json
{
  "phoneNumberId": "105929188465876",
  "name": "Support Bot",
  "description": "Handles support inquiries"
}
```

- **Response:**

```json
{
  "_id": "agt-userId-uuid",
  "phoneNumberId": "105929188465876",
  "userId": "usr_abc123",
  "name": "Support Bot",
  "description": "Handles support inquiries",
  "createdAt": "2025-05-03T20:30:00Z"
}
```

---

### POST /webhook

Receives incoming messages from the WhatsApp API. Does not require authentication.

- **Auth:** none (public endpoint used by Meta)
- **Body:** payload as sent by WhatsApp
- **Logic:**
  - If `phone_number_id` is registered → saves message and updates/creates conversation
  - If not registered → discards the message

---

### GET /conversations?agentPhoneNumberId=xxxx

---

Returns all conversations linked to a specific agent belonging to the authenticated user.

- **Auth:** required
- **Query params:** agentPhoneNumberId
- **Response:**

```json
[
  {
    "_id": "conv-5491111999999-105929188465876-uuid",
    "from": "5491111999999",
    "userName": "Sofía Test",
    "agentPhoneNumberId": "105929188465876",
    "userId": "usr-abc123",
    "status": "open",
    "startTime": "2024-05-01T20:00:00Z",
    "lastUpdated": "2024-05-01T20:03:00Z"
  }
]
```

- **Errors:**
  - 400 – agentPhoneNumberId is required
  - 401 – Unauthorized
  - 500 – Server error

---

### GET /agents

Returns all agents associated with the authenticated user.

- **Auth:** required
- **Response:**

```json
[
  {
    "_id": "agt-userId-uuid",
    "phoneNumberId": "105929188465876",
    "userId": "usr_abc123",
    "name": "Support Bot",
    "description": "Handles support inquiries",
    "createdAt": "2025-05-03T20:30:00Z"
  }
]
```

- **Errors:**
  - 401 – Unauthorized
  - 500 – Server error

---

### DELETE /agents/:id

Deletes an agent and all associated conversations and messages.
Only allowed for the authenticated user who owns the agent.

- **Auth:** required
- **Params:**

  - `:id` → ID of the agent to delete

- **Response:**

```http
204 No Content
```

- **Errors:**
  - 404 – Agent not found or does not belong to user
  - 401 – Unauthorized
  - 500 – Server error

---

## Postman Testing

### 1. Register a user

```http
POST /auth/register
Body:
{
  "email": "user@example.com",
  "password": "123456",
  "name": "John Tester"
}
```

### 2. Register an agent

```http
POST /agents
Authorization: Bearer <token>
Body:
{
  "phoneNumberId": "105929188465876",
  "name": "Support Bot",
  "description": "Handles support inquiries"
}
```

### 3. Simulate incoming message (POST /webhook)

```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "105929188465876",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "6666666666",
              "phone_number_id": "105929188465876"
            },
            "contacts": [
              {
                "profile": { "name": "Sofía Test" },
                "wa_id": "5491111999999"
              }
            ],
            "messages": [
              {
                "from": "5491111999999",
                "id": "wamid.9999",
                "timestamp": "1714694500",
                "text": {
                  "body": "Hola, ¿puedo hacer una consulta sobre el envío?"
                },
                "type": "text"
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}
```

### 4. Get conversations

```http
GET /conversations
Authorization: Bearer <token>
```

---

## Business Rules

- Only messages from registered agents (`phone_number_id`) are stored
- All messages and conversations are linked to a valid `userId`
- Conversations auto-close after a configurable timeout
- Each user can only access their own data
- Each user can create up to 3 agents (limit enforced)
- All custom IDs follow a format: `usr-...`, `agt-...`, `conv-...`, `msg-...`

---

## System Status

- [x] Agent registration
- [x] Message and conversation saving
- [x] Filtering of invalid/unregistered input
- [x] Viewing conversations by user
- [ ] Viewing messages by conversation
- [ ] Agent performance metrics

---

## Author

Juan Martín Ibarbalz
