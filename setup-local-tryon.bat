@echo off
echo 🎨 SitFit Local Try-On Setup
echo ================================
echo.

echo 📁 Creating directory structure...
if not exist "frontend\public\outfit-data" mkdir "frontend\public\outfit-data"
if not exist "frontend\public\outfit-data\models" mkdir "frontend\public\outfit-data\models"
if not exist "frontend\public\outfit-data\outfits" mkdir "frontend\public\outfit-data\outfits"
if not exist "frontend\public\outfit-data\results" mkdir "frontend\public\outfit-data\results"

echo ✅ Directory structure created
echo.

echo 📋 Available helper scripts:
echo.
echo 🔧 Management Scripts:
echo   • add-outfit-combination.js     - Add single combination
echo   • batch-add-images.js          - Add multiple combinations
echo   • validate-combinations.js     - Check for errors
echo   • optimize-images.js           - Analyze/optimize images
echo.
echo 🚀 Startup Scripts:
echo   • start-local-tryon.bat        - Start the application
echo   • start-project.bat            - Start full project
echo.

echo 📖 Quick Start Guide:
echo.
echo 1. Add your images to the folders:
echo    • frontend\public\outfit-data\models\     (model photos)
echo    • frontend\public\outfit-data\outfits\    (outfit photos)
echo    • frontend\public\outfit-data\results\    (result photos)
echo.
echo 2. Add combinations using one of these methods:
echo    • Run: node add-outfit-combination.js
echo    • Run: node batch-add-images.js
echo    • Edit: frontend\public\outfit-data\combinations.json
echo.
echo 3. Validate your setup:
echo    • Run: node validate-combinations.js
echo.
echo 4. Start the application:
echo    • Run: start-local-tryon.bat
echo.

echo 💡 Image Guidelines:
echo   • Format: JPG or PNG
echo   • Size: 400x600px minimum
echo   • Quality: Clear, well-lit photos
echo   • File size: Under 5MB each
echo.

echo 🏷️ Recommended Tags:
echo   • Style: casual, formal, business, party, sport
echo   • Season: summer, winter, spring, fall
echo   • Gender: male, female, unisex
echo   • Type: dress, jeans, shirt, jacket, hoodie
echo.

echo 🎉 Setup complete! Ready to add your outfit combinations.
echo.
pause