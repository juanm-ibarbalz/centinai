# 🧠 CentinAI – Frontend

### Conversational analytics platform with a futuristic interface.

---

## 📌 1. Introduction

**CentinAI** is a platform designed to analyze conversations from intelligent agents (bots) deployed across messaging channels. The frontend serves as a **visual dashboard** for managing users, bots, and key performance metrics — all styled with a modern, futuristic neon aesthetic.

---

## 🎨 2. Visual Design (UI Planning)

The interface follows a **futuristic neon theme** over a dark background, ideal for a "control system for AI" look.

### 🎨 Color Palette:

| Element            | HEX         | Description                    |
|--------------------|-------------|--------------------------------|
| Main background    | `#0B0E23`   | Cosmic night blue              |
| Primary accent     | `#29FFD8`   | Electric turquoise             |
| Secondary accent   | `#00B2FF`   | Vibrant cyan                   |
| Primary text       | `#E0F7FA`   | White with a light blue tint  |
| Secondary text     | `#B0BEC5`   | Soft bluish-gray               |
| Interactive color  | `#A67CFF`   | Bright purple                  |
| Hover alternate    | `#5B91FF`   | Cyan-blue hover effect         |

### 🔤 Fonts:

- **Headings:** [Exo 2](https://fonts.google.com/specimen/Exo+2)  
- **Body text:** [Roboto](https://fonts.google.com/specimen/Roboto)

---

## 🛠️ 3. Core Technologies

- ⚡ **React 19 + Vite 6**
- 🎨 **TailwindCSS**
- 🔁 **React Router v7**
- 📊 **Recharts**
- 🧠 **Framer Motion** (smooth animations)
- 📱 **react-phone-number-input**

---

## 📦 4. Key Dependencies

| Library                  | Purpose                               |
|--------------------------|----------------------------------------|
| `react-router-dom`       | Single-page app navigation             |
| `recharts`               | Metrics visualization                  |
| `framer-motion`          | Animation support                      |
| `tailwindcss`            | Utility-first styling                  |
| `react-phone-input-2`    | Phone input with country code          |
| `simple-statistics`      | Lightweight statistical calculations   |
| `date-fns`               | Date formatting and manipulation       |
| `react-icons`            | Icon set                               |
| `classnames`             | Dynamic class handling                 |

---

## 🧭 5. User Flow Overview

1. **Register an account**
2. **Log in**
3. **Create a bot**
   - Fill in the form with:
     - Agent name
     - International phone number
     - Language model
     - Authentication mode
     - Payload format
   - A **secret token is displayed for 15 seconds only**
   - ⚠️ This token **cannot be retrieved again**
4. **Bot Activation**
   - Once the bot becomes active, backend starts sending session data
5. **Dashboard Access**
   - View usage metrics, durations, costs, and more
6. **Conversations Panel**
   - Filter by date, duration, cost, or agent
7. **User Settings**
   - Update name, email, or password

---

## 📊 6. Key Features

- 🧠 Analytics dashboard for sessions, tokens, cost, and duration
- 📅 Date filter: last 7, 14, 30 days or full history
- 🗂️ Sortable and filterable conversations table
- ✏️ Modal-based bot editing
- 📱 International phone input support
- 🌗 Native dark mode UI
- 🔐 Secret tokens are one-time view only for enhanced security

---

## 🔧 7. Technical Setup

### Installation

Clone the repository and run:

```bash
cd frontend
npm install
# or
yarn install
```

### Development server

```bash
npm run dev
# or
yarn dev
```

The app will be available at [http://localhost:5173](http://localhost:5173) by default.

### Production build

```bash
npm run build
# or
yarn build
```

The generated files will be in the `dist/` folder.

### Environment variables

Create a `.env` file in the root of the frontend if you need to configure the backend URL or other variables. Example:

```
VITE_API_URL=http://localhost:3000/
PORT=5173 # Port where the frontend will be hosted (used by Docker and Dockerfile)
```

**Note:**
Make sure the backend allows the frontend’s origin in its `CORS_ALLOWED_ORIGINS` variable, or browser requests will be blocked by CORS.

### Useful commands

- `npm run lint` — Run ESLint to check code quality
- `npm run format` — Format code with Prettier (if configured)
- `npm test` — Run tests (if configured)

---

## 🧰 8. Project Structure

```plaintext
/src
│
├── components/       → Reusable UI components
├── pages/            → Core screens (Login, Dashboard, Settings, etc.)
├── metricas/         → Charts and metric visualizations
├── hooks/            → Custom hooks like useSessionLoader
├── config.js         → Global constants and settings
├── assets/           → Static images and SVGs
├── data/             → Mocked or development data
├── App.jsx           → Main route setup
├── main.jsx          → Entry point
```

---

## 🚧 9. Limitations and Notes

- The **secret bot token is ephemeral** and cannot be recovered once displayed  
  *(Support for token regeneration is planned)*
- Metrics depend on live backend data
- Requires an active bot to populate dashboard
- No built-in multilingual or push notification support yet

---

## 💡 10. Future Roadmap

- 🧭 Role-based route protection
  <!-- Enables conditional access to views (e.g. admin vs. standard user). -->

- 🌐 Multilanguage support (i18n)
  <!-- Makes the UI adaptable to multiple languages for global use. -->

- 📈 Real-time metrics with WebSockets
  <!-- Live dashboard updates as new data comes in from the backend. -->

- 📥 Export metrics and conversations (CSV, PDF)
  <!-- For data portability and external analysis. -->

---

## 🙌 11. Credits

- **Developed by:** [@FranMonti](https://github.com/FranMonti) — Franco Monti  
- **Contributors:**
  - [@juanm-ibarbalz](https://github.com/juanm-ibarbalz) — Juan Martin  
  - [@cabrerayam](https://github.com/cabrerayam) — Yamileth Cabrera  
  - [@Franmh03](https://github.com/Franmh03) — Francisco Martin Haro  
  - [@jlamnek](https://github.com/jlamnek) - Juan Lamnek

- **UI/UX:** Custom futuristic design tailored for data visualization  
- **Tech Stack:** Fully built using modern open-source technologies


---

## 🤝 Contributing

Want to contribute? Great! Please open an issue or a pull request.
