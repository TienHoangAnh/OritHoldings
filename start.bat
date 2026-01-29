@echo off
echo Starting TineJobs Application...
echo.

echo [1/2] Starting Backend Server...
start "TineJobs Backend" cmd /k "cd server && npm run dev"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend...
start "TineJobs Frontend" cmd /k "cd client && npm start"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
pause

