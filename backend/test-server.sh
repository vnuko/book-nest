#!/bin/bash
cd /mnt/c/Users/T5RT641/dev/projects/book_nest

# Get the PORT from environment or default to 3000
PORT=${PORT:-3000}
SERVER_URL="http://localhost:$PORT"

# Kill any existing processes
pkill -f "node dist" 2>/dev/null || true
sleep 2

# Start server
echo "Starting server..."
node dist/index.js &
SERVER_PID=$!
echo "Server PID: $SERVER_PID"

# Wait for server to start
sleep 5

# Test endpoints
echo "Testing health endpoint..."
curl -s $SERVER_URL/health
echo ""

echo "Testing root endpoint..."
curl -s $SERVER_URL/
echo ""

echo "Testing indexing status..."
curl -s $SERVER_URL/api/indexing/status
echo ""

# Cleanup
echo "Stopping server..."
kill $SERVER_PID 2>/dev/null || true
echo "Done"
