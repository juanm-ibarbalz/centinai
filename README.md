# CentinAI

CentinAI is a real-time monitoring and analysis platform for conversational agents. It processes, visualizes, and exports key interaction metrics (response times, token usage, message categories) via a web interface, a REST API, and a batch analysis module.

## Getting Started

These instructions will help you get a copy of the project up and running on your local machine for development and demonstration purposes.

### Prerequisites

- [Docker Engine + Compose v2](https://docs.docker.com/compose/install/)
- [Git](https://git-scm.com/)
- On Windows, use **Git Bash** or **WSL** to run `*.sh` scripts.

### Configuration

1. **Root environment file**  
   In the project root (alongside `docker-compose.yml`) create a `.env` containing port mappings:

   ```env
   BACKEND_HOST_PORT=<your-backend-host-port>
   BACKEND_CONTAINER_PORT=<your-backend-container-port>

   FRONTEND_HOST_PORT=<your-frontend-host-port>
   FRONTEND_CONTAINER_PORT=<your-frontend-container-port>

   APIFLASK_HOST_PORT=<your-apiflask-host-port>
   APIFLASK_CONTAINER_PORT=<your-apiflask-container-port>

   MONGO_HOST_PORT=<your-mongo-host-port>
   MONGO_CONTAINER_PORT=<your-mongo-container-port>
   ```

2. **Module environment files**

   Each module requires its own `.env` file for independent deployment and configuration:

   - frontend/.env:

   ```bash
   # API connection
   VITE_API_URL=http://your-localhost:${BACKEND_HOST_PORT}
   PORT=${FRONTEND_CONTAINER_PORT} # Port where the frontend will be hosted (used by Docker)
   ```

   - backend/.env:

   ```bash
   # Database configuration
   MONGO_URI=<your-mongo-uri>

   # Server configuration
   PORT=${BACKEND_CONTAINER_PORT}

   # Authentication
   JWT_SECRET=<your-jwt-secret>
   JWT_EXPIRES_IN=<token-expiration> # e.g., "1d" for one day

   # Services
   ANALYZER_URL=http://your-localhost:${APIFLASK_HOST_PORT}

   # Conversation management
   TIMEOUT_MINUTES=30 # Minutes of inactivity before a conversation is automatically closed
   CLEANUP_INTERVAL_MINUTES=3 # Interval in minutes for the cleanup job to run
   ```

   - analyzer/.env:

   ```bash
   # Database configuration
   MONGO_URI=<your-mongo-uri>
   MONGO_DB=<your-test-db-name>

   # Server configuration
   PORT=${APIFLASK_CONTAINER_PORT}
   ```

   **Important Notes:**

   - Never commit `.env` files to version control
   - Use strong, unique values for secrets in production
   - Ensure all used ports are available on your system
   - The `${VARIABLE}` syntax refers to variables from the root `.env` file _when using docker-compose_

### Installing

1. Clone the repository:

   ```bash
   git clone https://github.com/juanm-ibarbalz/centinai.git
   cd centinai
   ```

2. Create environment files as shown above.

3. Start all services:

   ```bash
   ./start.sh
   ```

This will build and start all containers in detached mode using the port mappings from the root .env.

## Deployment

To deploy on a live system using Docker Compose:

1. Clone this repository on your server.
2. Install Docker Engine and Compose v2.
3. Place or update the `.env` files with production values.
4. Run:

   ```bash
   ./start.sh
   ```

5. Open ports or configure a reverse proxy to serve multiple services under one domain.

## Built With

- [React](https://reactjs.org/) and [Vite](https://vitejs.dev/) for the frontend
- [Node.js](https://nodejs.org/) and [Express](https://expressjs.com/) for the backend
- [Python](https://www.python.org/) with [Flask](https://flask.palletsprojects.com/) and [Pandas](https://pandas.pydata.org/) for the analysis module
- [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/) and [PyMongo](https://pymongo.readthedocs.io/)
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)

## Authors

- Juan Martín Ibarbalz - Backend / Deployment
- Franco Monti - Frontend
- Francisco Haro - Analyzer
- Yamileth Cabrera - Frontend Mobile Adaptation ([centinai-mobile](https://github.com/juanm-ibarbalz/centinai-mobile))
- Juan Martín Lamneck - Documentation

## License

No license file included.
