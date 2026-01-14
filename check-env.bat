@echo off
echo 🔍 Checking environment variables...

echo.
echo Backend .env file:
if exist backend\.env (
    echo ✅ backend\.env exists
) else (
    echo ❌ backend\.env missing
    copy backend\.env.example backend\.env
    echo ✅ Created backend\.env from example
)

echo.
echo Frontend .env file:
if exist frontend\.env (
    echo ✅ frontend\.env exists
) else (
    echo ❌ frontend\.env missing
    copy frontend\.env.example frontend\.env
    echo ✅ Created frontend\.env from example
)

echo.
echo ✅ Environment check complete!
pause