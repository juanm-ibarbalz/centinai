#!/bin/sh
# entrypoint.sh

# Exit immediately if a command exits with a non-zero status
set -e

# Find the index.html file in the build directory
# Use `-L` in find to follow symlinks if any
INDEX_FILE=$(find -L /app/dist -name 'index.html')

# Check if the index.html file was found
if [ -z "$INDEX_FILE" ]; then
  echo "Error: Could not find index.html in /app/dist"
  exit 1
fi

# Check if the VITE_API_URL environment variable is set
if [ -z "${VITE_API_URL}" ]; then
  echo "Error: VITE_API_URL environment variable is not set."
  exit 1
fi

# Replace the placeholder in the index.html file
# Use `|` as the delimiter in sed to avoid conflicts if the URL contains `/`
sed -i "s|__VITE_API_URL__|${VITE_API_URL}|g" "$INDEX_FILE"

echo "entrypoint.sh: VITE_API_URL injected into index.html."

# Execute the original command passed to the container (the Dockerfile CMD)
exec "$@" 