#!/bin/bash

echo "Starting TineJobs Application..."
echo ""

echo "[1/2] Starting Backend Server..."
cd server
npm run dev &
BACKEND_PID=$!
cd ..

sleep 3

echo "[2/2] Starting Frontend..."
cd client
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "Both servers are starting..."
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait

