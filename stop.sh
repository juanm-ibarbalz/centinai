echo "Stopping CentinAI..."
docker-compose down

echo "Deleting Docker images and containers..."
docker system prune -f

echo "Done. CentinAI has been stopped and cleaned up."