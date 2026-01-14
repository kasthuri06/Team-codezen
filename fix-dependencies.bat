@echo off
echo 🔧 Fixing dependency issues...

echo Cleaning backend...
cd backend
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
npm install

echo.
echo Cleaning frontend...
cd ../frontend
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
npm install

echo.
echo ✅ Dependencies fixed!
cd ..
pause