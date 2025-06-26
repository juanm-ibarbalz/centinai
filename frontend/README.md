# CentinAI Frontend

This is the frontend for CentinAI, built with React + Vite. It provides a user interface for managing conversations, agents, and metrics, and connects to the backend via REST API.

## Prerequisites

- Node.js >= 18.x
- npm >= 9.x (or yarn)

## Installation

Clone the repository and run:

```bash
cd frontend
npm install
# or
yarn install
```

## Development server

```bash
npm run dev
# or
yarn dev
```

The app will be available at [http://localhost:5173](http://localhost:5173) by default.

## Production build

```bash
npm run build
# or
yarn build
```

The generated files will be in the `dist/` folder.

## Environment variables

Create a `.env` file in the root of the frontend if you need to configure the backend URL or other variables. Example:

```
VITE_API_URL=http://localhost:3000/
PORT=5173 # Port where the frontend will be hosted (used by Docker and Dockerfile)
```

## Project structure

- `src/components/` — UI components such as agent lists, conversation tables, and navigation menus.
- `src/pages/` — Main application views, including dashboards, authentication, agent management, configuration, and message views.
- `src/metricas/` — Metrics and analytics components (charts, summaries, and statistics).
- `src/hooks/` — Custom React hooks for metrics, session loading, and responsive design.
- `src/assets/` — Images, icons, and static resources.
- `src/data/` — Example or mock data for development and testing.

## Useful commands

- `npm run lint` — Run ESLint to check code quality
- `npm run format` — Format code with Prettier (if configured)
- `npm test` — Run tests (if configured)

## Contributing

Want to contribute? Great! Please open an issue or a pull request.
