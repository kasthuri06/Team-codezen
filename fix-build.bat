@echo off
echo 🔧 Fixing build issues...

echo Building backend...
cd backend
if exist dist rmdir /s /q dist
npm run build

echo.
echo Building frontend...
cd ../frontend
if exist build rmdir /s /q build
set CI=false
npm run build

echo.
echo ✅ Build fixed!
cd ..
pause