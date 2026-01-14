@echo off
echo 🚀 Starting SitFit Project...

echo Starting backend server...
start "SitFit Backend" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting frontend server...
start "SitFit Frontend" cmd /k "cd frontend && npm start"

echo.
echo ✅ Both servers starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to close this window...
pause >nul