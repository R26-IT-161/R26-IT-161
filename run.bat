@echo off
echo Starting backend...
start "Backend" cmd /k "cd backend && npm run dev"

echo Starting frontend...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo Both servers are running!
