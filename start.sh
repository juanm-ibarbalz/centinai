echo "Cleaning up previous Docker containers and images..."
docker-compose down

echo "Building and starting CentinAI..."
docker-compose up --build -d

echo "Done. CentinAI is now running."