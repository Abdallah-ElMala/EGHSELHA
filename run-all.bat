@echo off
echo ===================================================
echo Starting EGhselha Project (Backend + Frontend)
echo ===================================================

cd /d "%~dp0"

echo [1/2] Starting ASP.NET Core Web API...
start "EGhselha Backend API" cmd /k "cd WebCarWash\WebCarWash.API && dotnet run"

echo [2/2] Starting React Frontend...
start "EGhselha Frontend (Vite)" cmd /k "cd EGSELHA_Fontend && npm run dev"

echo ===================================================
echo Both services have been started!
echo Frontend: http://localhost:5173
echo Backend Swagger: http://localhost:58300/swagger
echo ===================================================
pause
