#!/bin/bash
cd /mnt/c/Users/T5RT641/dev/projects/book_nest

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
curl -s http://localhost:3000/health
echo ""

echo "Testing root endpoint..."
curl -s http://localhost:3000/
echo ""

echo "Testing indexing status..."
curl -s http://localhost:3000/api/indexing/status
echo ""

# Cleanup
echo "Stopping server..."
kill $SERVER_PID 2>/dev/null || true
echo "Done"
