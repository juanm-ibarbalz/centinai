# CentinAI

CentinAI is a real-time monitoring and analysis platform for conversational agents. It processes, visualizes, and exports key interaction metrics (response times, token usage, message categories) via a web interface, a REST API, and a batch analysis module.

## Getting Started

These instructions will help you get a copy of the project up and running on your local machine for development and demonstration purposes.

### Prerequisites

- [Docker Engine + Compose v2](https://docs.docker.com/compose/install/)
- [Git](https://git-scm.com/)
- On Windows, use **Git Bash** or **WSL** to run `*.sh` scripts.

### Installing

1. Clone the repository:

   ```bash
   git clone https://github.com/juanm-ibarbalz/centinai.git
   cd centinai
   ```

2. Create environment files in each module folder:

   - `frontend/.env` (e.g., `VITE_API_URL=http://localhost:3001`)
   - `backend/.env` with:

     ```env
     MONGO_URI=<your-mongo-uri>
     PORT=<backend-port>
     JWT_SECRET=<your-jwt-secret>
     JWT_EXPIRES_IN=<token-expiration>
     PYTHON_BIN=python3
     ```

   - `analyzer/.env` with:

     ```env
     MONGO_URI=<your-mongo-uri>
     MONGO_DB_TEST=<your-test-db-name>
     ```

3. Start all services:

   ```bash
   ./start.sh
   ```

This will build and start all containers in detached mode.

## Deployment

To deploy on a live system using Docker Compose:

1. Clone this repository on your server.
2. Install Docker Engine and Compose v2.
3. Place or update the `.env` files with production values.
4. Run:

   ```bash
   ./start.sh
   ```

5. Open ports (3000 for frontend, 3001 for backend) or configure a reverse proxy (e.g., Nginx) to serve multiple services under one domain.

## Built With

- [React](https://reactjs.org/) and [Vite](https://vitejs.dev/) for the frontend
- [Node.js](https://nodejs.org/) and [Express](https://expressjs.com/) for the backend
- [Python](https://www.python.org/) with [Flask](https://flask.palletsprojects.com/) and [Pandas](https://pandas.pydata.org/) for the analysis module
- [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/) and [PyMongo](https://pymongo.readthedocs.io/)
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)

## Authors

- Juan Martín Ibarbalz - Backend
- Franco Monti - Frontend
- Francisco Haro - Analyzer
- Yamileth Cabrera - Frontend Mobile Adaptation ([centinai-mobile](https://github.com/juanm-ibarbalz/centinai-mobile))
- Juan Martín Lamneck - Documentation

## License

No license file included.
