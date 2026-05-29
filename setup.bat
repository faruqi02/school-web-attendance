@echo off
title Developer Environment Setup - Sekolah Agama Ayer Hitam Portal
cls
echo =====================================================================
echo    SEKOLAH AGAMA AYER HITAM PORTAL - DEVELOPER ENVIRONMENT SETUP
echo =====================================================================
echo.
echo This script will automate the installation of Node.js dependencies
echo for both the Backend API server and the Frontend React Dashboard.
echo.
echo Press any key to start downloading and configuring modules...
pause > null

:: 1. Verify Node.js installation
echo.
echo [1/3] Verifying Node.js environment...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Node.js is not installed or not added to your system's PATH.
    echo Please download and install Node.js from https://nodejs.org/ before continuing.
    echo.
    pause
    exit /b
)
echo Node.js is verified!
echo.

:: 2. Setup Backend Node Modules
echo [2/3] Installing Backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to install backend dependencies. Please check your internet connection.
    pause
    exit /b
)
cd ..
echo Backend dependencies successfully installed!
echo.

:: 3. Setup Frontend Node Modules
echo [3/3] Installing Frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to install frontend dependencies. Please check your internet connection.
    pause
    exit /b
)
cd ..
echo Frontend dependencies successfully installed!
echo.

echo =====================================================================
echo                     SETUP COMPLETED SUCCESSFULLY!
echo =====================================================================
echo.
echo Both the backend and frontend modules have been configured.
echo You can now launch both servers by running:
echo   runproject.bat
echo.
pause
