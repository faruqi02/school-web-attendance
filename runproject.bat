@echo off
title Launch Sekolah Agama Ayer Hitam Portal
cls
echo =====================================================================
echo    SEKOLAH AGAMA AYER HITAM PORTAL - SERVER INITIALIZATION
echo =====================================================================
echo.
echo Launching the system servers...
echo.

:: 1. Launch Backend API Server in a new command window
echo [1/2] Starting Backend API Server (Port 5000)...
start "Sekolah Agama Ayer Hitam Backend API" cmd /c "cd backend && npm run dev"
timeout /t 3 >nul

:: 2. Launch Frontend React Dashboard in a new command window
echo [2/2] Starting Frontend React Dashboard (Port 3000)...
start "Sekolah Agama Ayer Hitam Dashboard Panel" cmd /c "cd frontend && npm run dev"
timeout /t 2 >nul

echo.
echo =====================================================================
echo                     SERVERS RUNNING SUCCESSFULLY!
echo =====================================================================
echo.
echo Both servers have been launched in separate windows:
echo   - Backend Server:   http://localhost:5000/api
echo   - React Dashboard:  http://localhost:3000
echo.
echo Close the respective opened windows when you want to stop the servers.
echo.
pause
