#!/bin/bash

# Exit on error
set -e

echo "======================================================="
echo "           OdooHack2026 Setup & Launch Script (Linux)  "
echo "======================================================="
echo ""

echo "[1/5] Installing Backend dependencies..."
cd Backend
npm install
echo ""

echo "[2/5] Generating Prisma Client..."
npx prisma generate
echo ""

echo "[3/5] Setting up database and running seed..."
npx prisma db push
npm run db:seed
echo ""

echo "[4/5] Installing Frontend dependencies..."
cd ../Frontend
npm install
echo ""

echo "[5/5] Launching Backend and Frontend servers..."
cd ..

# Function to stop background tasks on Ctrl+C
cleanup() {
  echo ""
  echo "Stopping servers..."
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
  exit 0
}

# Trap SIGINT (Ctrl+C) and run cleanup
trap cleanup SIGINT

# Start Backend dev server in the background
echo "Starting Backend server..."
cd Backend && npm run dev &
BACKEND_PID=$!
cd ..

# Start Frontend dev server in the background
echo "Starting Frontend server..."
cd Frontend && npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "======================================================="
echo "  Success! OdooHack2026 is setting up and starting!"
echo "  - Frontend: http://localhost:3000"
echo "  - Backend: http://localhost:5000"
echo "  Press Ctrl+C to exit and stop both servers."
echo "======================================================="
echo ""

# Keep shell active to listen for logs and trap exit signals
wait
