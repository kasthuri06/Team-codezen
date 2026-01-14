@echo off
echo 🎨 Starting SitFit Local Try-On System...
echo.

echo 📁 Checking outfit-data directory...
if not exist "frontend\public\outfit-data" (
    echo ❌ Error: outfit-data directory not found!
    echo Please run the project setup first.
    pause
    exit /b 1
)

echo ✅ Outfit data directory found
echo.

echo 🚀 Starting development servers...
echo.

echo Starting backend server...
start "Backend Server" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting frontend server...
start "Frontend Server" cmd /k "cd frontend && npm start"

echo.
echo 🎉 Local Try-On system is starting!
echo.
echo 📖 Instructions:
echo 1. Wait for both servers to start (usually 30-60 seconds)
echo 2. Open http://localhost:3000 in your browser
echo 3. Navigate to "Local Try-On" from the menu
echo 4. Add your outfit images to frontend/public/outfit-data/
echo 5. Update combinations.json with your image mappings
echo.
echo 💡 Tip: Use the add-outfit-combination.js script to easily add new combinations!
echo    Run: node add-outfit-combination.js
echo.
pause